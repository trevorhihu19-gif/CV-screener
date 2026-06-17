from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080
    groq_api_key: str
    arcjet_key: str
    arcjet_env: str = "development"
    environment: str = "development"
    langchain_api_key: str = ""
    langchain_tracing_v2: str = "true"
    langchain_project: str = "RecruitAI"
    langchain_callbacks_background: str = "false"

    class Config:
        env_file = ".env"

settings = Settings()