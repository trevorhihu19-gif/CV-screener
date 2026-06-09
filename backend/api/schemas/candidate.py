from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class SkillScore(BaseModel):
    skill: str
    score: float

class CandidateResponse(BaseModel):
    job: UUID
    job_id: UUID
    name: str
    email: str
    cv_path: str
    match_score: float
    skill_breakdown: List[SkillScore]
    ai_summary: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str