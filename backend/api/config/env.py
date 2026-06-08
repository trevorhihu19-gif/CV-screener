from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080
    groq_api_key: str
    arcjet_key: str
    arcjet_env: str = "development"
    langsmith_api_key: str = ""
    langsmith_project: str = "recruit_bot"
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()