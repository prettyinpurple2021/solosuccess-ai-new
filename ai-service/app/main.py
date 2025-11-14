"""Main FastAPI application entry point"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

from app.config import settings
from app.middleware import RequestLoggingMiddleware, ErrorHandlingMiddleware
from app.routers import health

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(
        "application_starting",
        environment=settings.environment,
        debug=settings.debug
    )
    
    # Initialize Sentry if DSN is provided
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.environment,
            integrations=[FastApiIntegration()],
            traces_sample_rate=1.0 if settings.debug else 0.1
        )
        logger.info("sentry_initialized")
    
    yield
    
    # Shutdown
    logger.info("application_shutting_down")


# Create FastAPI application
app = FastAPI(
    title="SoloSuccess AI Service",
    description="AI Agent Orchestration Platform for Solo Founders",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])

# Import and include other routers
from app.routers import llm, vectors, agents
app.include_router(llm.router, prefix="/api/llm", tags=["llm"])
app.include_router(vectors.router, prefix="/api/vectors", tags=["vectors"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "SoloSuccess AI Service",
        "version": "0.1.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
