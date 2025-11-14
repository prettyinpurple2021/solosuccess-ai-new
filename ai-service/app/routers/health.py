"""Health check endpoints"""

from datetime import datetime
from fastapi import APIRouter, status
from pydantic import BaseModel
import structlog

from app.config import settings

logger = structlog.get_logger()

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: str
    environment: str
    version: str


class DetailedHealthResponse(BaseModel):
    """Detailed health check response model"""
    status: str
    timestamp: str
    environment: str
    version: str
    services: dict


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Basic health check",
    description="Returns basic health status of the service"
)
async def health_check():
    """Basic health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        environment=settings.environment,
        version="0.1.0"
    )


@router.get(
    "/health/detailed",
    response_model=DetailedHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Detailed health check",
    description="Returns detailed health status including service dependencies"
)
async def detailed_health_check():
    """Detailed health check endpoint with service status"""
    
    services = {
        "api": "healthy",
        "openai": "not_checked",
        "anthropic": "not_checked",
        "pinecone": "not_checked",
        "redis": "not_checked"
    }
    
    # TODO: Add actual service health checks in future tasks
    
    return DetailedHealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        environment=settings.environment,
        version="0.1.0",
        services=services
    )


@router.get(
    "/health/ready",
    status_code=status.HTTP_200_OK,
    summary="Readiness check",
    description="Returns whether the service is ready to accept requests"
)
async def readiness_check():
    """Readiness check for Kubernetes/container orchestration"""
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get(
    "/health/live",
    status_code=status.HTTP_200_OK,
    summary="Liveness check",
    description="Returns whether the service is alive"
)
async def liveness_check():
    """Liveness check for Kubernetes/container orchestration"""
    return {
        "alive": True,
        "timestamp": datetime.utcnow().isoformat()
    }
