"""Custom middleware for the FastAPI application"""

import time
import uuid
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

logger = structlog.get_logger()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests and responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log request
        start_time = time.time()
        logger.info(
            "request_started",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            client_host=request.client.host if request.client else None
        )
        
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log response
            logger.info(
                "request_completed",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=round(duration * 1000, 2)
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                "request_failed",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                error=str(e),
                duration_ms=round(duration * 1000, 2)
            )
            raise


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware to handle uncaught exceptions"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except Exception as e:
            logger.error(
                "unhandled_exception",
                error=str(e),
                error_type=type(e).__name__,
                path=request.url.path,
                method=request.method
            )
            
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred"
                    },
                    "meta": {
                        "request_id": getattr(request.state, "request_id", None)
                    }
                }
            )
