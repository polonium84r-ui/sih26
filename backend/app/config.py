import os

class Settings:
    PROJECT_NAME: str = "AI Railway Block Planner"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./railway_planner.db")

settings = Settings()

