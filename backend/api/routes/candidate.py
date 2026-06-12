from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from api.config.db import get_db
from api.middleware.auth import get_current_user
from api.models.user import User
from api.schemas.candidate import StatusUpdate, AgentMessage
from api.controllers.candidate import (
    upload_and_screen_cv,
    get_candidates_by_job,
    get_candidate_by_id,
    update_candidate_status,
    delete_candidate
)
from rag.pipeline import search_candidates
from rag.agent import run_agent, get_recruiter_memory

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])

@router.post("/upload/{job_id}")
async def upload_cv(
    job_id: str,
    name: str = Form(...),
    email: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await upload_and_screen_cv(
        job_id, name, email, file, current_user, db
    )

@router.post("agent/chat")
def chat_with_agent(
    body: AgentMessage,
    current_user: User = Depends(get_current_user)
):
    message = body.message
    if body.job_id:
        message = f"[Job ID: {body.job_id} {body.message}]"

        response = run_agent(
            message=message,
            recruiter_id=str(current_user.id)
        )
        return {
            "success": True,
            "response": response,
            "thread_id": f"recruiter_{current_user.id}"
        }

@router.get("/{job_id}")
def list_candidates(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_candidates_by_job(job_id, current_user, db)

@router.get("/single/{candidate_id}")
def get_one(
    candidate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_candidate_by_id(candidate_id, current_user, db)

@router.get("/candidates/search")
def semantic_search(
    query: str,
    job_id: str = None,
    top_n : int = 5,
    current_user: User = Depends(get_current_user)
):
    results = search_candidates(query, job_id, top_n, current_user)
    return {
        "success": True,
        "query": query,
        "results": results
    }

@router.get("/agent/memory")
def get_memory(
    current_user: User = Depends(get_current_user)
):
    """Check recruiter's conversation memory stats"""
    memory = get_recruiter_memory(str(current_user.id))
    return {"success": True, "data": memory}


@router.patch("/{candidate_id}/status")
def update_status(
    candidate_id: str,
    data: StatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_candidate_status(
        candidate_id, data, current_user, db
    )

@router.delete("/{candidate_id}")
def remove_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_candidate(candidate_id, current_user, db)