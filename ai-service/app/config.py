"""Application configuration management"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    debug: bool = True
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:3000"
    
    # OpenAI Configuration
    openai_api_key: str
    openai_model: str = "gpt-4"
    openai_max_tokens: int = 2000
    openai_temperature: float = 0.7
    
    # Anthropic Configuration
    anthropic_api_key: str
    anthropic_model: str = "claude-3-sonnet-20240229"
    anthropic_max_tokens: int = 2000
    
    # Pinecone Configuration
    pinecone_api_key: str
    pinecone_environment: str
    pinecone_index_name: str = "solosuccess-embeddings"
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379/0"
    
    # Monitoring
    sentry_dsn: str = ""
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000
    
    # Cost Tracking
    enable_cost_tracking: bool = True
    cost_alert_threshold: float = 100.0
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.environment.lower() == "production"


# Global settings instance
settings = Settings()
