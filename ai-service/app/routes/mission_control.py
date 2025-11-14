"""
Mission Control API Routes

Handles AI orchestration for Mission Control feature
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from app.services.mission_control_service import (
    analyze_objective,
    get_agent_contribution,
    synthesize_mission_results
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/mission-control", tags=["mission-control"])


class AnalyzeObjectiveRequest(BaseModel):
    objective: str
    context: Optional[Dict[str, Any]] = None


class AgentContributionRequest(BaseModel):
    objective: str
    context: Optional[Dict[str, Any]] = None
    analysis: Optional[Dict[str, Any]] = None


class SynthesizeRequest(BaseModel):
    objective: str
    context: Optional[Dict[str, Any]] = None
    analysis: Optional[Dict[str, Any]] = None
    contributions: List[Dict[str, Any]]


@router.post("/analyze")
async def analyze_mission_objective(request: AnalyzeObjectiveRequest):
    """
    Analyze a mission objective to determine scope, complexity, and requirements
    """
    try:
        result = await analyze_objective(
            objective=request.objective,
            context=request.context or {}
        )
        return result
    except Exception as e:
        logger.error(f"Error analyzing objective: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/synthesize")
async def synthesize_mission(request: SynthesizeRequest):
    """
    Synthesize agent contributions into a comprehensive mission plan
    """
    try:
        result = await synthesize_mission_results(
            objective=request.objective,
            context=request.context or {},
            analysis=request.analysis or {},
            contributions=request.contributions
        )
        return result
    except Exception as e:
        logger.error(f"Error synthesizing mission results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
