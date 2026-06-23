from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from api.middleware.auth import get_current_user
from api.models.user import User
from api.schemas.candidate import ChatMessage
from api.security.arcjet import protect_chat
from rag.agent import run_agent, stream_agent, get_recruiter_memory, clear_recruiter_memory

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/")
def chat(
    request: Request, 
    data: ChatMessage,
    _: None = Depends(protect_chat),
    current_user: User = Depends(get_current_user)
):
    message = data.message
    if data.job_id:
        message = f"[Job ID: {data.job_id}] {data.message}"

    response = run_agent(
        message=message,
        recruiter_id=str(current_user.id)
    )
    return {
        "success": True,
        "data": {"response": response},
        "thread_id": f"recruiter_{current_user.id}"
    }

@router.post("/stream")
def chat_stream(
    data: ChatMessage,
    current_user: User = Depends(get_current_user)
):
    def generate():
        for chunk in stream_agent(
            message=data.message,
            recruiter_id=str(current_user.id)
        ):
            yield f"data: {chunk}\n\n"
        yield StreamingResponse(
            generate(),
            media_type="text/event-stream"
        )

@router.get("/memory")
def get_memory(
    current_user: User = Depends(get_current_user)
):
    memory = get_recruiter_memory(str(current_user.id))
    return {
        "success": True,
        "message": "Memory fetched",
        "data": memory
    }

@router.delete("/memory")
def clear_memory(
    current_user: User = Depends(get_current_user)
):
    result = clear_recruiter_memory(str(current_user.id))
    return {
        "success": True,
        "message": result
    }