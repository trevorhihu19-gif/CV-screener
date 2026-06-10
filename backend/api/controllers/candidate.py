from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from api.models.candidate import Candidate
from api.models.job import Job
from api.models.user import User
from rag.pipeline import screen_cv
import uuid
import os

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def upload_and_screen_cv(
        job_id: str,
        name: str,
        email: str,
        file: UploadFile,
        current_user: User,
        db: Session
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.created_by == current_user.id
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"cv-{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    candidate_id = str(uuid.uuid4())

    #Screen CV with Langgraph agent + RAG pipeline
    result = screen_cv(
        candidate_id = candidate_id,
        job_id = str(job.id),
        cv_path = file_path,
        job_title = job.title,
        job_description = job.description,
        requirements = job.requirements or [],
        candidate_name = name,
        candidate_email = email,
    )

    candidate = Candidate(
        id = candidate_id,
        job_id = job_id,
        name = name,
        email = email,
        cv_path = file_path,
        match_score = result.get("matchScore", 0),
        skill_breakdown = result.get("skillBreakdown", []),
        ai_summary = result.get("aiSummary", ""),
        status = result.get("status", "pending")
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    return {
        "success": True,
        "message": "CV uploaded and screened successfully",
        "data": {
            "id": str(candidate.id),
            "job_id": str(candidate.job_id),
            "name": candidate.name,
            "email": candidate.email,
            "match_score": candidate.match_score,
            "skill_breakdown": candidate.skill_breakdown,
            "ai_summary": candidate.ai_summary,
            "status": candidate.status,
            "created_at": candidate.created_at
        }
    }

def get_candidates_by_job(
        job_id: str,
        current_user: User,
        db: Session
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.created_by == current_user.id
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    candidates = db.query(Candidate).filter(
        Candidate.job_id == job_id
    ).order_by(Candidate.match_score.desc()).all()

    return {
        "success": True,
        "message": "Candidates fetched successfully",
        "data": [
            {
                "id": str(c.id),
                "job_id": str(c.job_id),
                "name": c.name,
                "email": c.email,
                "match_score": c.match_score,
                "skill_breakdown": c.skill_breakdown,
                "ai_summary": c.ai_summary,
                "status": c.status,
                "created_at": c.created_at
            }
            for c in candidates
        ]
    }

def get_candidate_by_id(
        candidate_id: str,
        current_user: User,
        db: Session
):
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    return {
        "success": True,
        "message": "Candidate fetched successfully",
        "data": {
            "id": str(candidate.id),
            "job_id": str(candidate.job_id),
            "name": candidate.name,
            "email": candidate.email,
            "match_score": candidate.match_score,
            "skill_breakdown": candidate.skill_breakdown,
            "ai_summary": candidate.ai_summary,
            "status": candidate.status,
            "created_at": candidate.created_at
        }
    }

def update_candidate_status(
        candidate_id: str,
        new_status: str,
        current_user: User,
        db: Session
):
    valid_statuses = ["pending", "shortlisted", "reviewing", "rejected"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status value"
        )
    
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    candidate.status = new_status
    db.commit()
    db.refresh()

    return {
        "success": True,
        "message": "Candidate status updated successfully",
        "data": {
            "id": str(candidate.id),
            "status": candidate.status
        }
    }

def delete_candidate(
        candidate_id: str,
        current_user: User,
        db: Session
): 
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
   
    
    