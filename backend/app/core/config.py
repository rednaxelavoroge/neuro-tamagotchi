from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "NeuroTamagotchi"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "change-me-in-production"

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/neuro_tamagotchi"
    database_pool_size: int = 5
    database_max_overflow: int = 10

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Stable Diffusion
    sd_api_url: str = "https://api.stability.ai"
    sd_api_key: str = ""

    # InWorld AI
    inworld_api_key: str = ""
    inworld_workspace_id: str = ""
    inworld_character_id: str = ""

    # Stripe
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id_basic: str = ""
    stripe_price_id_pro: str = ""
    stripe_price_id_ultimate: str = ""

    # Frontend
    frontend_url: str = "http://localhost:3000"

    # Email
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    from_email: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.app_env.lower() == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

