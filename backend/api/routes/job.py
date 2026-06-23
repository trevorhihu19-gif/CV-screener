from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from api.config.db import get_db
from api.middleware.auth import get_current_user
from api.models.user import User
from api.schemas.job import JobCreate
from api.security.arcjet import protect_jobs
from api.controllers.job import create_job, get_jobs, get_job_by_id, delete_job

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("/", dependencies=[Depends(protect_jobs)])
def create(
    request: Request,
    data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_job(data, current_user, db)

@router.get("/")
def list_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_jobs(current_user, db)

@router.get("/{job_id}")
def get_one(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_job_by_id(job_id, current_user, db)

@router.delete("/{job_id}")
def delete(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_job(job_id, current_user, db)
