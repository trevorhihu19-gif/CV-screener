from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from api.models.candidate import Candidate
from api.models.job import Job
from api.models.user import User
from api.cache import agent_cache
from rag.pipeline import screen_cv, screen_multiple_cvs
from typing import List
import uuid 
from uuid import UUID as PyUUID
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

    result = screen_cv(
        candidate_id = candidate_id,
        job_id = str(job.id),
        cv_path = file_path,
        job_title = job.title,
        job_description = job.description,
        requirements = (job.requirements or []),
        candidate_name = name,
        candidate_email = email,
    )

    candidate = Candidate(
        id =PyUUID(candidate_id),
        job_id =PyUUID(job_id),
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
    agent_cache.invalidate_job(job_id)
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
    
async def bulk_upload_and_screen(
    job_id: str,
    files: List[UploadFile],
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

    if len(files) > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 20 files per upload"
        )

    allowed_extensions = [".pdf", ".docx", ".doc"]
    saved_paths = []

    for file in files:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            print(f"Skipping invalid file: {file.filename}")
            continue

        unique_filename = f"cv-{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        content = await file.read()

        with open(file_path, "wb") as f:
            f.write(content)

        saved_paths.append(file_path)
        print(f"Saved: {file_path}")

    print(f"Total saved: {len(saved_paths)} files")

    if not saved_paths:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid PDF or DOCX files found"
        )

    screening_results = screen_multiple_cvs(
        job_id=str(job.id),
        job_title=job.title,
        job_description=job.description,
        requirements=job.requirements or [],
        file_paths=saved_paths  
    )

    print(f"Screening returned {len(screening_results)} results")

    saved_candidates = []

    for result in screening_results:
        try:
            candidate = Candidate(
                id=PyUUID(result["candidate_id"]),
                job_id=PyUUID(job_id),
                name=result["name"],
                email=result["email"] or f"{result['name'].lower().replace(' ','.')}@unknown.com",
                cv_path=result.get("cv_path", ""),
                match_score=result["match_score"],
                skill_breakdown=result["skill_breakdown"],
                ai_summary=result["ai_summary"],
                status=result["status"]
            )
            db.add(candidate)

            saved_candidates.append({
                "id": result["candidate_id"],
                "name": result["name"],
                "email": result["email"],
                "match_score": result["match_score"],
                "status": result["status"],
                "ai_summary": result["ai_summary"],
                "recommendation": result["recommendation"],
                "skill_breakdown": result["skill_breakdown"]
            })

            print(f"Saved to DB: {result['name']}")

        except Exception as e:
            print(f"Failed to save {result['name']} to DB: {e}")
            continue

    db.commit()
    agent_cache.invalidate_job(job_id)
    print(f"Committed {len(saved_candidates)} candidates to DB")

    saved_candidates.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return {
        "success": True,
        "message": f"Successfully screened {len(saved_candidates)} candidates",
        "data": {
            "total": len(saved_candidates),
            "candidates": saved_candidates
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
    
   
    
    