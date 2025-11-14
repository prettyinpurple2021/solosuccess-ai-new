"""Pydantic models for agent operations"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AgentMessage(BaseModel):
    """Agent message model"""
    role: str = Field(..., description="Message role: system, user, or assistant")
    content: str = Field(..., description="Message content")
    timestamp: Optional[str] = Field(None, description="Message timestamp")


class AgentProcessRequest(BaseModel):
    """Request model for agent message processing"""
    agent_id: str = Field(..., description="ID of the agent to use")
    message: str = Field(..., description="User message")
    context_id: Optional[str] = Field(
        default=None,
        description="Optional context ID for conversation continuity"
    )
    max_history: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Maximum conversation history to maintain"
    )
    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="LLM temperature override"
    )


class AgentUsageInfo(BaseModel):
    """Token usage information"""
    input_tokens: int
    output_tokens: int
    total_tokens: int


class AgentMetadata(BaseModel):
    """Agent response metadata"""
    model: str
    provider: str
    usage: AgentUsageInfo
    personality: str
    context_length: int


class AgentProcessResponse(BaseModel):
    """Response model for agent message processing"""
    agent_id: str = Field(..., description="Agent ID")
    agent_name: str = Field(..., description="Agent name")
    role: str = Field(..., description="Agent role")
    content: str = Field(..., description="Agent response content")
    timestamp: str = Field(..., description="Response timestamp")
    metadata: AgentMetadata = Field(..., description="Response metadata")


class AgentInfo(BaseModel):
    """Agent information model"""
    agent_id: str
    name: str
    role: str
    personality: str
    available_templates: List[str]


class AgentListItem(BaseModel):
    """Agent list item model"""
    agent_id: str
    name: str
    role: str
    personality: str


class MissionContributionRequest(BaseModel):
    """Request model for mission contribution"""
    agent_id: str = Field(..., description="ID of the agent")
    objective: str = Field(..., description="Mission objective")
    context: Dict[str, Any] = Field(
        default_factory=dict,
        description="Mission context"
    )


class MissionContributionResponse(BaseModel):
    """Response model for mission contribution"""
    agent_id: str
    contribution: Dict[str, Any]
    timestamp: str
