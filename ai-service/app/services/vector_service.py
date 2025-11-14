"""Vector database service for embeddings and semantic search"""

from typing import List, Dict, Any, Optional
import hashlib
import structlog
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI

from app.config import settings

logger = structlog.get_logger()


class VectorService:
    """Service for vector database operations using Pinecone"""
    
    def __init__(self):
        self.pinecone_client = Pinecone(api_key=settings.pinecone_api_key)
        self.openai_client = OpenAI(api_key=settings.openai_api_key)
        self.index_name = settings.pinecone_index_name
        self.index = None
        
        self._initialize_index()
        
        logger.info(
            "vector_service_initialized",
            index_name=self.index_name
        )
    
    def _initialize_index(self):
        """Initialize or connect to Pinecone index"""
        try:
            # Check if index exists
            existing_indexes = self.pinecone_client.list_indexes()
            index_names = [idx.name for idx in existing_indexes]
            
            if self.index_name not in index_names:
                logger.info(
                    "creating_pinecone_index",
                    index_name=self.index_name
                )
                
                # Create index with OpenAI embedding dimensions (1536 for text-embedding-ada-002)
                self.pinecone_client.create_index(
                    name=self.index_name,
                    dimension=1536,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region=settings.pinecone_environment
                    )
                )
                
                logger.info(
                    "pinecone_index_created",
                    index_name=self.index_name
                )
            
            # Connect to index
            self.index = self.pinecone_client.Index(self.index_name)
            
            logger.info(
                "connected_to_pinecone_index",
                index_name=self.index_name
            )
            
        except Exception as e:
            logger.error(
                "pinecone_initialization_failed",
                error=str(e),
                index_name=self.index_name
            )
            raise
    
    async def generate_embedding(
        self,
        text: str,
        model: str = "text-embedding-ada-002"
    ) -> List[float]:
        """
        Generate embedding vector for text using OpenAI
        
        Args:
            text: Text to embed
            model: OpenAI embedding model to use
        
        Returns:
            List of floats representing the embedding vector
        """
        try:
            logger.debug(
                "generating_embedding",
                text_length=len(text),
                model=model
            )
            
            response = self.openai_client.embeddings.create(
                input=text,
                model=model
            )
            
            embedding = response.data[0].embedding
            
            logger.debug(
                "embedding_generated",
                dimension=len(embedding)
            )
            
            return embedding
            
        except Exception as e:
            logger.error(
                "embedding_generation_failed",
                error=str(e),
                model=model
            )
            raise
    
    async def upsert_vectors(
        self,
        vectors: List[Dict[str, Any]],
        namespace: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Store vectors in Pinecone
        
        Args:
            vectors: List of vector dictionaries with 'id', 'values', and optional 'metadata'
            namespace: Optional namespace for organizing vectors
        
        Returns:
            Dictionary with upsert results
        """
        try:
            logger.info(
                "upserting_vectors",
                count=len(vectors),
                namespace=namespace
            )
            
            result = self.index.upsert(
                vectors=vectors,
                namespace=namespace or ""
            )
            
            logger.info(
                "vectors_upserted",
                upserted_count=result.upserted_count
            )
            
            return {
                "upserted_count": result.upserted_count,
                "namespace": namespace
            }
            
        except Exception as e:
            logger.error(
                "vector_upsert_failed",
                error=str(e),
                namespace=namespace
            )
            raise
    
    async def store_text(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        namespace: Optional[str] = None,
        vector_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate embedding and store text in vector database
        
        Args:
            text: Text to store
            metadata: Optional metadata to attach to the vector
            namespace: Optional namespace for organizing vectors
            vector_id: Optional custom ID (auto-generated if not provided)
        
        Returns:
            Dictionary with storage results including vector ID
        """
        try:
            # Generate embedding
            embedding = await self.generate_embedding(text)
            
            # Generate ID if not provided
            if not vector_id:
                vector_id = hashlib.sha256(text.encode()).hexdigest()[:16]
            
            # Prepare vector
            vector = {
                "id": vector_id,
                "values": embedding,
                "metadata": metadata or {}
            }
            
            # Store in Pinecone
            result = await self.upsert_vectors([vector], namespace)
            
            return {
                "vector_id": vector_id,
                "namespace": namespace,
                "upserted": result["upserted_count"] > 0
            }
            
        except Exception as e:
            logger.error(
                "text_storage_failed",
                error=str(e)
            )
            raise
    
    async def semantic_search(
        self,
        query: str,
        top_k: int = 5,
        namespace: Optional[str] = None,
        filter_metadata: Optional[Dict[str, Any]] = None,
        include_metadata: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic search using query text
        
        Args:
            query: Search query text
            top_k: Number of results to return
            namespace: Optional namespace to search within
            filter_metadata: Optional metadata filters
            include_metadata: Whether to include metadata in results
        
        Returns:
            List of matching results with scores and metadata
        """
        try:
            logger.info(
                "semantic_search_started",
                query_length=len(query),
                top_k=top_k,
                namespace=namespace
            )
            
            # Generate query embedding
            query_embedding = await self.generate_embedding(query)
            
            # Search in Pinecone
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                namespace=namespace or "",
                filter=filter_metadata,
                include_metadata=include_metadata
            )
            
            # Format results
            matches = []
            for match in results.matches:
                matches.append({
                    "id": match.id,
                    "score": match.score,
                    "metadata": match.metadata if include_metadata else None
                })
            
            logger.info(
                "semantic_search_completed",
                results_count=len(matches)
            )
            
            return matches
            
        except Exception as e:
            logger.error(
                "semantic_search_failed",
                error=str(e)
            )
            raise
    
    async def delete_vectors(
        self,
        vector_ids: List[str],
        namespace: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Delete vectors from Pinecone
        
        Args:
            vector_ids: List of vector IDs to delete
            namespace: Optional namespace
        
        Returns:
            Dictionary with deletion results
        """
        try:
            logger.info(
                "deleting_vectors",
                count=len(vector_ids),
                namespace=namespace
            )
            
            self.index.delete(
                ids=vector_ids,
                namespace=namespace or ""
            )
            
            logger.info(
                "vectors_deleted",
                count=len(vector_ids)
            )
            
            return {
                "deleted_count": len(vector_ids),
                "namespace": namespace
            }
            
        except Exception as e:
            logger.error(
                "vector_deletion_failed",
                error=str(e)
            )
            raise
    
    async def get_index_stats(self) -> Dict[str, Any]:
        """Get statistics about the Pinecone index"""
        try:
            stats = self.index.describe_index_stats()
            
            return {
                "total_vector_count": stats.total_vector_count,
                "dimension": stats.dimension,
                "index_fullness": stats.index_fullness,
                "namespaces": stats.namespaces
            }
            
        except Exception as e:
            logger.error(
                "index_stats_failed",
                error=str(e)
            )
            raise


# Global vector service instance
vector_service = VectorService()
