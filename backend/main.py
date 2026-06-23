from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.config.env import settings
from api.config.db import engine, Base
from api.routes.job import router as job_router
from api.routes.candidate import router as candidate_router
from api.routes.chat import router as chat_router
from api.routes.user import router as user_router
import time
app = FastAPI(
    title="RecruitBot",
    description="AI-powered CV screener",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url = None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = (
        ["http://localhost:5173"]
        if settings.environment == "development"
        else [settings.frontend_url]
        ),
    allow_credentials = True,
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers = ["Authorization", "Content-Type"]
)

async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"

    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    return response

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    max_size = 10 * 1024 * 1024  
    content_length = request.headers.get("content-length")

    if content_length and int(content_length) > max_size:
        return JSONResponse(
            status_code=413,
            content={"error": "Request too large. Max 10MB."}
        )
    return await call_next(request)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    print("Database connected and tables created")


app.include_router(job_router)
app.include_router(candidate_router)
app.include_router(chat_router)
app.include_router(user_router)

@app.get("/")
def root():
    return {"message": "RecruitBot is running"}

@app.get("/health")
def health():
    return {"status": "healthy", "environment": settings.environment}
