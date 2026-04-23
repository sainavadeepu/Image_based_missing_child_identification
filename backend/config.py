"""
Configuration management using Pydantic Settings.
All values are loaded from environment variables or .env file.
"""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Missing Child Identification System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://mcis_user:mcis_password@localhost:5432/mcis_db"

    # Security / JWT
    SECRET_KEY: str = "change-this-to-a-secure-random-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Admin credentials (single admin for demo)
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"

    # File storage
    UPLOAD_DIR: str = "uploads"
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: list[str] = ["jpg", "jpeg", "png", "webp"]

    # Face recognition
    ARCFACE_THRESHOLD: float = 0.60     # ArcFace model (Cosine distance - increased to allow fuzzy DB search)
    TOP_K_RESULTS: int = 5
    EMBEDDING_DIM: int = 512

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 30
    
    # Notifications
    EMAIL_USER: str = ""
    EMAIL_PASS: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

# Ensure upload directory exists
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
