"""Pydantic models for LLM requests and responses"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class Message(BaseModel):
    """Chat message model"""
    role: str = Field(..., description="Message role: system, user, or assistant")
    content: str = Field(..., description="Message content")


class CompletionRequest(BaseModel):
    """Request model for LLM completion"""
    messages: List[Message] = Field(..., description="List of conversation messages")
    provider: Optional[str] = Field(
        default="openai",
        description="LLM provider: openai or anthropic"
    )
    model: Optional[str] = Field(
        default=None,
        description="Specific model to use (overrides default)"
    )
    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="Sampling temperature"
    )
    max_tokens: Optional[int] = Field(
        default=None,
        gt=0,
        description="Maximum tokens to generate"
    )
    fallback: bool = Field(
        default=True,
        description="Enable automatic fallback to alternative provider"
    )


class UsageInfo(BaseModel):
    """Token usage information"""
    input_tokens: int
    output_tokens: int
    total_tokens: int


class CompletionMetadata(BaseModel):
    """Metadata about the completion"""
    finish_reason: Optional[str] = None
    stop_reason: Optional[str] = None
    duration_ms: float


class CompletionResponse(BaseModel):
    """Response model for LLM completion"""
    content: str = Field(..., description="Generated completion text")
    model: str = Field(..., description="Model used for generation")
    provider: str = Field(..., description="Provider used")
    usage: UsageInfo = Field(..., description="Token usage information")
    metadata: CompletionMetadata = Field(..., description="Additional metadata")


class CostStats(BaseModel):
    """Cost tracking statistics"""
    total_cost: float
    total_requests: int
    recent_requests: List[Dict[str, Any]]
