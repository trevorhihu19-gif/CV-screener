from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from api.models.job import Job
from api.models.user import User
from api.schemas.job import JobCreate

def create_job(data: JobCreate, current_user: User, db: Session):
    job = Job(
        title = data.title,
        description = data.description,
        requirements = data.requirements,
        created_by = current_user.id
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "success": True,
        "message": "Job created successfully",
        "data": {
            "id": str(job.id),
            "title": job.title,
            "description": job.description,
            "requirements": job.requirements,
            "created_by": str(job.created_by),
            "created_at": job.created_at
        }
    }

def get_jobs(current_user: User, db: Session):
    jobs = db.query(Job).filter(
        Job.created_by == current_user.id
        ).order_by(Job.created_at.desc()).all()
    
    return {
        "success": True,
        "message": "Jobs fetched successfully",
        "data": [
            {
                "id": str(job.id),
                "title": job.title,
                "description": job.requirements,
                "created_by": str(job.created_by),
                "created_at": job.created_at
            }
            for job in jobs
        ]
    }

def get_job_by_id(job_id: str, current_user: User, db: Session):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.created_by == current_user.id
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return {
        "success": True,
        "message": "Job fetched successfully",
        "data": {
            "id": str(job.id),
            "title": job.title,
            "description": job.description,
            "requirements": job.requirements,
            "created_by": str(job.created_by),
            "created__at": job.created_at
        }
    }

def delete_job(job_id: str, current_user: User, db: Session):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.created_by == current_user.id
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    db.delete(job)
    db.commit()

    return {
        "success": True,
        "message": "Job deleted successfully"
    }

