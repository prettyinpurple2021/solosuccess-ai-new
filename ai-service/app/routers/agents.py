"""Agent API endpoints"""

from typing import List
from fastapi import APIRouter, HTTPException, status
import structlog

from app.models.agent_models import (
    AgentProcessRequest,
    AgentProcessResponse,
    AgentInfo,
    AgentListItem,
    AgentUsageInfo,
    AgentMetadata
)
from app.agents.agent_registry import agent_registry
from app.services.context_storage import context_storage

logger = structlog.get_logger()

router = APIRouter()


@router.get(
    "/",
    response_model=List[AgentListItem],
    status_code=status.HTTP_200_OK,
    summary="List all agents",
    description="Get a list of all available AI agents"
)
async def list_agents():
    """List all available agents"""
    agents = agent_registry.list_agents()
    return [AgentListItem(**agent) for agent in agents]


@router.get(
    "/{agent_id}",
    response_model=AgentInfo,
    status_code=status.HTTP_200_OK,
    summary="Get agent info",
    description="Get detailed information about a specific agent"
)
async def get_agent_info(agent_id: str):
    """Get agent information"""
    agent = agent_registry.get(agent_id)
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent '{agent_id}' not found"
        )
    
    info = agent.get_info()
    return AgentInfo(**info)


@router.post(
    "/process",
    response_model=AgentProcessResponse,
    status_code=status.HTTP_200_OK,
    summary="Process message with agent",
    description="Send a message to an AI agent and get a response"
)
async def process_message(request: AgentProcessRequest):
    """Process a message with an agent"""
    try:
        # Get agent
        agent = agent_registry.get(request.agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent '{request.agent_id}' not found"
            )
        
        # Load or create context from Redis
        context_id = request.context_id or "default"
        context = await context_storage.load_context(request.agent_id, context_id)
        
        if not context:
            # Create new context if not found
            context = agent.create_context(max_history=request.max_history)
            logger.info(
                "new_context_created",
                agent_id=request.agent_id,
                context_id=context_id
            )
        
        # Process message
        kwargs = {}
        if request.temperature is not None:
            kwargs["temperature"] = request.temperature
        
        result = await agent.process_message(
            message=request.message,
            context=context,
            **kwargs
        )
        
        # Save updated context to Redis
        await context_storage.save_context(
            request.agent_id,
            context_id,
            context
        )
        
        # Convert to response model
        return AgentProcessResponse(
            agent_id=result["agent_id"],
            agent_name=result["agent_name"],
            role=result["role"],
            content=result["content"],
            timestamp=result["timestamp"],
            metadata=AgentMetadata(
                model=result["metadata"]["model"],
                provider=result["metadata"]["provider"],
                usage=AgentUsageInfo(**result["metadata"]["usage"]),
                personality=result["metadata"]["personality"],
                context_length=result["metadata"]["context_length"]
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("message_processing_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process message"
        )


@router.delete(
    "/context/{agent_id}/{context_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Clear conversation context",
    description="Clear the conversation context for an agent"
)
async def clear_context(agent_id: str, context_id: str = "default"):
    """Clear conversation context from Redis"""
    await context_storage.delete_context(agent_id, context_id)
    return None


@router.get(
    "/contexts",
    status_code=status.HTTP_200_OK,
    summary="List all contexts",
    description="List all conversation contexts, optionally filtered by agent"
)
async def list_contexts(agent_id: str = None):
    """List all conversation contexts"""
    contexts = await context_storage.list_contexts(agent_id)
    return {"contexts": contexts, "count": len(contexts)}


@router.delete(
    "/contexts",
    status_code=status.HTTP_200_OK,
    summary="Clear all contexts",
    description="Clear all conversation contexts, optionally filtered by agent"
)
async def clear_all_contexts(agent_id: str = None):
    """Clear all conversation contexts"""
    deleted = await context_storage.clear_all_contexts(agent_id)
    return {"deleted": deleted}
