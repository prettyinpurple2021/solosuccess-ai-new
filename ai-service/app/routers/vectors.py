"""Vector database API endpoints"""

from fastapi import APIRouter, HTTPException, status
import structlog

from app.models.vector_models import (
    EmbeddingRequest,
    EmbeddingResponse,
    StoreTextRequest,
    StoreTextResponse,
    SearchRequest,
    SearchResponse,
    SearchMatch,
    DeleteVectorsRequest,
    DeleteVectorsResponse,
    IndexStats
)
from app.services.vector_service import vector_service

logger = structlog.get_logger()

router = APIRouter()


@router.post(
    "/embeddings",
    response_model=EmbeddingResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate embedding",
    description="Generate embedding vector for text using OpenAI"
)
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for text"""
    try:
        embedding = await vector_service.generate_embedding(
            text=request.text,
            model=request.model
        )
        
        return EmbeddingResponse(
            embedding=embedding,
            dimension=len(embedding),
            model=request.model
        )
        
    except Exception as e:
        logger.error("embedding_generation_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate embedding"
        )


@router.post(
    "/store",
    response_model=StoreTextResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Store text with embedding",
    description="Generate embedding and store text in vector database"
)
async def store_text(request: StoreTextRequest):
    """Store text with generated embedding"""
    try:
        result = await vector_service.store_text(
            text=request.text,
            metadata=request.metadata,
            namespace=request.namespace,
            vector_id=request.vector_id
        )
        
        return StoreTextResponse(**result)
        
    except Exception as e:
        logger.error("text_storage_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store text"
        )


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Semantic search",
    description="Perform semantic search using query text"
)
async def semantic_search(request: SearchRequest):
    """Perform semantic search"""
    try:
        matches = await vector_service.semantic_search(
            query=request.query,
            top_k=request.top_k,
            namespace=request.namespace,
            filter_metadata=request.filter_metadata,
            include_metadata=request.include_metadata
        )
        
        return SearchResponse(
            matches=[SearchMatch(**match) for match in matches],
            query=request.query
        )
        
    except Exception as e:
        logger.error("semantic_search_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform search"
        )


@router.delete(
    "/vectors",
    response_model=DeleteVectorsResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete vectors",
    description="Delete vectors from the database"
)
async def delete_vectors(request: DeleteVectorsRequest):
    """Delete vectors by IDs"""
    try:
        result = await vector_service.delete_vectors(
            vector_ids=request.vector_ids,
            namespace=request.namespace
        )
        
        return DeleteVectorsResponse(**result)
        
    except Exception as e:
        logger.error("vector_deletion_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete vectors"
        )


@router.get(
    "/stats",
    response_model=IndexStats,
    status_code=status.HTTP_200_OK,
    summary="Get index statistics",
    description="Retrieve statistics about the vector database index"
)
async def get_index_stats():
    """Get index statistics"""
    try:
        stats = await vector_service.get_index_stats()
        return IndexStats(**stats)
        
    except Exception as e:
        logger.error("index_stats_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve index statistics"
        )
