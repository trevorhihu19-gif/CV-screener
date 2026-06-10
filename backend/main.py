from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.config.env import settings
from api.config.db import engine, Base
import api.models 
from api.routes.auth import router as auth_router
from api.routes.job import router as job_router
from api.routes.candidate import router as candidate_router

app = FastAPI(
    title="RecruitBot",
    description="AI-powered CV screener",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    print("Database connected and tables created")

app.include_router(auth_router)
app.include_router(job_router)
app.include_router(candidate_router)

@app.get("/")
def root():
    return {"message": "RecruitBot is running"}

@app.get("/health")
def health():
    return {"status": "healthy", "environment": settings.environment}
