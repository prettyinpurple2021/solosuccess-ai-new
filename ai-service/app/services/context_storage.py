"""Production-ready conversation context storage service using Redis"""

import json
from typing import Optional, Dict, Any
from datetime import timedelta
import structlog
import redis.asyncio as redis
from redis.asyncio import Redis

from app.config import settings
from app.agents.base_agent import ConversationContext

logger = structlog.get_logger()


class ContextStorageService:
    """
    Production-ready context storage using Redis
    
    Features:
    - Persistent storage across service restarts
    - Automatic expiration of old contexts
    - Efficient serialization/deserialization
    - Connection pooling
    - Error handling and fallback
    """
    
    def __init__(self):
        self._redis: Optional[Redis] = None
        self._default_ttl = timedelta(hours=24)  # Contexts expire after 24 hours
        logger.info("context_storage_service_initialized")
    
    async def connect(self):
        """Initialize Redis connection pool"""
        try:
            self._redis = await redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=10
            )
            # Test connection
            await self._redis.ping()
            logger.info("redis_connected", url=settings.redis_url)
        except Exception as e:
            logger.error("redis_connection_failed", error=str(e))
            raise
    
    async def disconnect(self):
        """Close Redis connection"""
        if self._redis:
            await self._redis.close()
            logger.info("redis_disconnected")
    
    def _get_key(self, agent_id: str, context_id: str) -> str:
        """Generate Redis key for context"""
        return f"context:{agent_id}:{context_id}"
    
    def _serialize_context(self, context: ConversationContext) -> str:
        """Serialize context to JSON string"""
        data = {
            "messages": context.messages,
            "metadata": context.metadata,
            "max_history": context.max_history
        }
        return json.dumps(data)
    
    def _deserialize_context(self, data: str) -> ConversationContext:
        """Deserialize context from JSON string"""
        parsed = json.loads(data)
        context = ConversationContext(max_history=parsed.get("max_history", 10))
        context.messages = parsed.get("messages", [])
        context.metadata = parsed.get("metadata", {})
        return context
    
    async def save_context(
        self,
        agent_id: str,
        context_id: str,
        context: ConversationContext,
        ttl: Optional[timedelta] = None
    ) -> bool:
        """
        Save conversation context to Redis
        
        Args:
            agent_id: Agent identifier
            context_id: Context identifier (e.g., user_id or session_id)
            context: ConversationContext to save
            ttl: Time to live (default: 24 hours)
        
        Returns:
            True if saved successfully
        """
        if not self._redis:
            logger.error("redis_not_connected")
            return False
        
        try:
            key = self._get_key(agent_id, context_id)
            data = self._serialize_context(context)
            ttl = ttl or self._default_ttl
            
            await self._redis.setex(
                key,
                int(ttl.total_seconds()),
                data
            )
            
            logger.info(
                "context_saved",
                agent_id=agent_id,
                context_id=context_id,
                message_count=len(context.messages),
                ttl_hours=ttl.total_seconds() / 3600
            )
            return True
            
        except Exception as e:
            logger.error(
                "context_save_failed",
                agent_id=agent_id,
                context_id=context_id,
                error=str(e)
            )
            return False
    
    async def load_context(
        self,
        agent_id: str,
        context_id: str
    ) -> Optional[ConversationContext]:
        """
        Load conversation context from Redis
        
        Args:
            agent_id: Agent identifier
            context_id: Context identifier
        
        Returns:
            ConversationContext if found, None otherwise
        """
        if not self._redis:
            logger.error("redis_not_connected")
            return None
        
        try:
            key = self._get_key(agent_id, context_id)
            data = await self._redis.get(key)
            
            if not data:
                logger.debug(
                    "context_not_found",
                    agent_id=agent_id,
                    context_id=context_id
                )
                return None
            
            context = self._deserialize_context(data)
            
            logger.info(
                "context_loaded",
                agent_id=agent_id,
                context_id=context_id,
                message_count=len(context.messages)
            )
            return context
            
        except Exception as e:
            logger.error(
                "context_load_failed",
                agent_id=agent_id,
                context_id=context_id,
                error=str(e)
            )
            return None
    
    async def delete_context(
        self,
        agent_id: str,
        context_id: str
    ) -> bool:
        """
        Delete conversation context from Redis
        
        Args:
            agent_id: Agent identifier
            context_id: Context identifier
        
        Returns:
            True if deleted successfully
        """
        if not self._redis:
            logger.error("redis_not_connected")
            return False
        
        try:
            key = self._get_key(agent_id, context_id)
            deleted = await self._redis.delete(key)
            
            logger.info(
                "context_deleted",
                agent_id=agent_id,
                context_id=context_id,
                existed=bool(deleted)
            )
            return True
            
        except Exception as e:
            logger.error(
                "context_delete_failed",
                agent_id=agent_id,
                context_id=context_id,
                error=str(e)
            )
            return False
    
    async def exists(
        self,
        agent_id: str,
        context_id: str
    ) -> bool:
        """
        Check if context exists in Redis
        
        Args:
            agent_id: Agent identifier
            context_id: Context identifier
        
        Returns:
            True if context exists
        """
        if not self._redis:
            return False
        
        try:
            key = self._get_key(agent_id, context_id)
            return bool(await self._redis.exists(key))
        except Exception as e:
            logger.error(
                "context_exists_check_failed",
                agent_id=agent_id,
                context_id=context_id,
                error=str(e)
            )
            return False
    
    async def extend_ttl(
        self,
        agent_id: str,
        context_id: str,
        ttl: Optional[timedelta] = None
    ) -> bool:
        """
        Extend the TTL of an existing context
        
        Args:
            agent_id: Agent identifier
            context_id: Context identifier
            ttl: New time to live (default: 24 hours)
        
        Returns:
            True if TTL extended successfully
        """
        if not self._redis:
            return False
        
        try:
            key = self._get_key(agent_id, context_id)
            ttl = ttl or self._default_ttl
            
            await self._redis.expire(key, int(ttl.total_seconds()))
            
            logger.info(
                "context_ttl_extended",
                agent_id=agent_id,
                context_id=context_id,
                ttl_hours=ttl.total_seconds() / 3600
            )
            return True
            
        except Exception as e:
            logger.error(
                "context_ttl_extend_failed",
                agent_id=agent_id,
                context_id=context_id,
                error=str(e)
            )
            return False
    
    async def list_contexts(
        self,
        agent_id: Optional[str] = None
    ) -> list[Dict[str, str]]:
        """
        List all contexts, optionally filtered by agent
        
        Args:
            agent_id: Optional agent identifier to filter by
        
        Returns:
            List of context information dictionaries
        """
        if not self._redis:
            return []
        
        try:
            pattern = f"context:{agent_id}:*" if agent_id else "context:*"
            keys = []
            
            async for key in self._redis.scan_iter(match=pattern, count=100):
                keys.append(key)
            
            contexts = []
            for key in keys:
                parts = key.split(":")
                if len(parts) >= 3:
                    contexts.append({
                        "agent_id": parts[1],
                        "context_id": parts[2],
                        "key": key
                    })
            
            logger.info(
                "contexts_listed",
                agent_id=agent_id,
                count=len(contexts)
            )
            return contexts
            
        except Exception as e:
            logger.error(
                "context_list_failed",
                agent_id=agent_id,
                error=str(e)
            )
            return []
    
    async def clear_all_contexts(self, agent_id: Optional[str] = None) -> int:
        """
        Clear all contexts, optionally filtered by agent
        
        Args:
            agent_id: Optional agent identifier to filter by
        
        Returns:
            Number of contexts deleted
        """
        if not self._redis:
            return 0
        
        try:
            pattern = f"context:{agent_id}:*" if agent_id else "context:*"
            keys = []
            
            async for key in self._redis.scan_iter(match=pattern, count=100):
                keys.append(key)
            
            if keys:
                deleted = await self._redis.delete(*keys)
            else:
                deleted = 0
            
            logger.info(
                "contexts_cleared",
                agent_id=agent_id,
                count=deleted
            )
            return deleted
            
        except Exception as e:
            logger.error(
                "context_clear_failed",
                agent_id=agent_id,
                error=str(e)
            )
            return 0


# Global context storage service instance
context_storage = ContextStorageService()
