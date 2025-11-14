"""LLM service for OpenAI and Anthropic integration"""

from typing import Optional, Dict, Any, List
from enum import Enum
import time
from datetime import datetime
import structlog
from openai import OpenAI, OpenAIError
from anthropic import Anthropic, AnthropicError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

from app.config import settings

logger = structlog.get_logger()


class LLMProvider(str, Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class CostTracker:
    """Track LLM API costs"""
    
    # Pricing per 1K tokens (as of 2024)
    PRICING = {
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        "claude-3-opus": {"input": 0.015, "output": 0.075},
        "claude-3-sonnet": {"input": 0.003, "output": 0.015},
        "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
    }
    
    def __init__(self):
        self.total_cost = 0.0
        self.requests = []
    
    def track_usage(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        provider: LLMProvider
    ) -> float:
        """Calculate and track cost for a request"""
        # Normalize model name for pricing lookup
        model_key = model.lower()
        for key in self.PRICING.keys():
            if key in model_key:
                model_key = key
                break
        
        pricing = self.PRICING.get(model_key, {"input": 0.01, "output": 0.03})
        
        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (output_tokens / 1000) * pricing["output"]
        total_cost = input_cost + output_cost
        
        self.total_cost += total_cost
        self.requests.append({
            "timestamp": datetime.utcnow().isoformat(),
            "model": model,
            "provider": provider.value,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost": total_cost
        })
        
        logger.info(
            "llm_cost_tracked",
            model=model,
            provider=provider.value,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=round(total_cost, 4),
            total_cost=round(self.total_cost, 4)
        )
        
        # Alert if threshold exceeded
        if (settings.enable_cost_tracking and 
            self.total_cost > settings.cost_alert_threshold):
            logger.warning(
                "cost_threshold_exceeded",
                total_cost=round(self.total_cost, 4),
                threshold=settings.cost_alert_threshold
            )
        
        return total_cost
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cost tracking statistics"""
        return {
            "total_cost": round(self.total_cost, 4),
            "total_requests": len(self.requests),
            "recent_requests": self.requests[-10:]  # Last 10 requests
        }


class LLMService:
    """Service for interacting with LLM providers"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.openai_api_key)
        self.anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
        self.cost_tracker = CostTracker() if settings.enable_cost_tracking else None
        
        logger.info("llm_service_initialized")
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((OpenAIError, AnthropicError)),
        reraise=True
    )
    async def generate_completion_openai(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate completion using OpenAI"""
        start_time = time.time()
        
        model = model or settings.openai_model
        temperature = temperature if temperature is not None else settings.openai_temperature
        max_tokens = max_tokens or settings.openai_max_tokens
        
        try:
            logger.info(
                "openai_request_started",
                model=model,
                message_count=len(messages)
            )
            
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            
            duration = time.time() - start_time
            
            # Extract response data
            completion = response.choices[0].message.content
            usage = response.usage
            
            # Track costs
            if self.cost_tracker and usage:
                self.cost_tracker.track_usage(
                    model=model,
                    input_tokens=usage.prompt_tokens,
                    output_tokens=usage.completion_tokens,
                    provider=LLMProvider.OPENAI
                )
            
            logger.info(
                "openai_request_completed",
                model=model,
                duration_ms=round(duration * 1000, 2),
                input_tokens=usage.prompt_tokens if usage else 0,
                output_tokens=usage.completion_tokens if usage else 0
            )
            
            return {
                "content": completion,
                "model": model,
                "provider": LLMProvider.OPENAI.value,
                "usage": {
                    "input_tokens": usage.prompt_tokens if usage else 0,
                    "output_tokens": usage.completion_tokens if usage else 0,
                    "total_tokens": usage.total_tokens if usage else 0
                },
                "metadata": {
                    "finish_reason": response.choices[0].finish_reason,
                    "duration_ms": round(duration * 1000, 2)
                }
            }
            
        except OpenAIError as e:
            logger.error(
                "openai_request_failed",
                error=str(e),
                model=model
            )
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(AnthropicError),
        reraise=True
    )
    async def generate_completion_anthropic(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        system: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate completion using Anthropic Claude"""
        start_time = time.time()
        
        model = model or settings.anthropic_model
        max_tokens = max_tokens or settings.anthropic_max_tokens
        
        try:
            logger.info(
                "anthropic_request_started",
                model=model,
                message_count=len(messages)
            )
            
            # Anthropic requires system message separately
            api_messages = [msg for msg in messages if msg["role"] != "system"]
            if not system:
                system_msgs = [msg["content"] for msg in messages if msg["role"] == "system"]
                system = system_msgs[0] if system_msgs else None
            
            response = self.anthropic_client.messages.create(
                model=model,
                messages=api_messages,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system,
                **kwargs
            )
            
            duration = time.time() - start_time
            
            # Extract response data
            completion = response.content[0].text
            
            # Track costs
            if self.cost_tracker:
                self.cost_tracker.track_usage(
                    model=model,
                    input_tokens=response.usage.input_tokens,
                    output_tokens=response.usage.output_tokens,
                    provider=LLMProvider.ANTHROPIC
                )
            
            logger.info(
                "anthropic_request_completed",
                model=model,
                duration_ms=round(duration * 1000, 2),
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens
            )
            
            return {
                "content": completion,
                "model": model,
                "provider": LLMProvider.ANTHROPIC.value,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens
                },
                "metadata": {
                    "stop_reason": response.stop_reason,
                    "duration_ms": round(duration * 1000, 2)
                }
            }
            
        except AnthropicError as e:
            logger.error(
                "anthropic_request_failed",
                error=str(e),
                model=model
            )
            raise
    
    async def generate_completion(
        self,
        messages: List[Dict[str, str]],
        provider: LLMProvider = LLMProvider.OPENAI,
        fallback: bool = True,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate completion with automatic fallback
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            provider: Primary LLM provider to use
            fallback: Whether to fallback to alternative provider on failure
            **kwargs: Additional arguments passed to the provider
        
        Returns:
            Dictionary containing completion and metadata
        """
        try:
            if provider == LLMProvider.OPENAI:
                return await self.generate_completion_openai(messages, **kwargs)
            else:
                return await self.generate_completion_anthropic(messages, **kwargs)
                
        except Exception as e:
            if fallback:
                logger.warning(
                    "llm_fallback_triggered",
                    primary_provider=provider.value,
                    error=str(e)
                )
                
                # Try alternative provider
                fallback_provider = (
                    LLMProvider.ANTHROPIC if provider == LLMProvider.OPENAI
                    else LLMProvider.OPENAI
                )
                
                try:
                    if fallback_provider == LLMProvider.OPENAI:
                        return await self.generate_completion_openai(messages, **kwargs)
                    else:
                        return await self.generate_completion_anthropic(messages, **kwargs)
                except Exception as fallback_error:
                    logger.error(
                        "llm_fallback_failed",
                        fallback_provider=fallback_provider.value,
                        error=str(fallback_error)
                    )
                    raise
            else:
                raise
    
    def get_cost_stats(self) -> Optional[Dict[str, Any]]:
        """Get cost tracking statistics"""
        if self.cost_tracker:
            return self.cost_tracker.get_stats()
        return None


# Global LLM service instance
llm_service = LLMService()
