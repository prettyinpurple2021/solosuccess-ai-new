"""Pydantic models for vector database operations"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class EmbeddingRequest(BaseModel):
    """Request model for generating embeddings"""
    text: str = Field(..., description="Text to generate embedding for")
    model: Optional[str] = Field(
        default="text-embedding-ada-002",
        description="Embedding model to use"
    )


class EmbeddingResponse(BaseModel):
    """Response model for embedding generation"""
    embedding: List[float] = Field(..., description="Generated embedding vector")
    dimension: int = Field(..., description="Dimension of the embedding")
    model: str = Field(..., description="Model used for generation")


class StoreTextRequest(BaseModel):
    """Request model for storing text with embeddings"""
    text: str = Field(..., description="Text to store")
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional metadata to attach"
    )
    namespace: Optional[str] = Field(
        default=None,
        description="Optional namespace for organization"
    )
    vector_id: Optional[str] = Field(
        default=None,
        description="Optional custom vector ID"
    )


class StoreTextResponse(BaseModel):
    """Response model for text storage"""
    vector_id: str = Field(..., description="ID of the stored vector")
    namespace: Optional[str] = Field(None, description="Namespace used")
    upserted: bool = Field(..., description="Whether the vector was successfully stored")


class SearchRequest(BaseModel):
    """Request model for semantic search"""
    query: str = Field(..., description="Search query text")
    top_k: int = Field(
        default=5,
        ge=1,
        le=100,
        description="Number of results to return"
    )
    namespace: Optional[str] = Field(
        default=None,
        description="Optional namespace to search within"
    )
    filter_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional metadata filters"
    )
    include_metadata: bool = Field(
        default=True,
        description="Whether to include metadata in results"
    )


class SearchMatch(BaseModel):
    """Individual search result match"""
    id: str = Field(..., description="Vector ID")
    score: float = Field(..., description="Similarity score")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Associated metadata")


class SearchResponse(BaseModel):
    """Response model for semantic search"""
    matches: List[SearchMatch] = Field(..., description="List of matching results")
    query: str = Field(..., description="Original query")


class DeleteVectorsRequest(BaseModel):
    """Request model for deleting vectors"""
    vector_ids: List[str] = Field(..., description="List of vector IDs to delete")
    namespace: Optional[str] = Field(
        default=None,
        description="Optional namespace"
    )


class DeleteVectorsResponse(BaseModel):
    """Response model for vector deletion"""
    deleted_count: int = Field(..., description="Number of vectors deleted")
    namespace: Optional[str] = Field(None, description="Namespace used")


class IndexStats(BaseModel):
    """Index statistics model"""
    total_vector_count: int
    dimension: int
    index_fullness: float
    namespaces: Dict[str, Any]
