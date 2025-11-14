"""LLM API endpoints"""

from fastapi import APIRouter, HTTPException, status
import structlog

from app.models.llm_models import (
    CompletionRequest,
    CompletionResponse,
    CostStats
)
from app.services.llm_service import llm_service, LLMProvider

logger = structlog.get_logger()

router = APIRouter()


@router.post(
    "/completions",
    response_model=CompletionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate LLM completion",
    description="Generate text completion using OpenAI or Anthropic with automatic fallback"
)
async def create_completion(request: CompletionRequest):
    """Generate completion from LLM"""
    try:
        # Convert Pydantic messages to dict format
        messages = [msg.model_dump() for msg in request.messages]
        
        # Determine provider
        provider = LLMProvider(request.provider.lower())
        
        # Generate completion
        result = await llm_service.generate_completion(
            messages=messages,
            provider=provider,
            fallback=request.fallback,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        return CompletionResponse(**result)
        
    except ValueError as e:
        logger.error("invalid_request", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("completion_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate completion"
        )


@router.get(
    "/costs",
    response_model=CostStats,
    status_code=status.HTTP_200_OK,
    summary="Get cost statistics",
    description="Retrieve LLM API cost tracking statistics"
)
async def get_cost_stats():
    """Get cost tracking statistics"""
    stats = llm_service.get_cost_stats()
    
    if stats is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cost tracking is not enabled"
        )
    
    return CostStats(**stats)
