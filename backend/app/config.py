from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    secret_key: str = "local-development-secret-change-before-sharing"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite:///./stylehub.db"
    frontend_origin: str = "http://localhost:5173"
    stripe_secret_key: str = ""
    stripe_currency: str = "inr"
    jwt_algorithm: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()
