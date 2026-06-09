from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class JobCreate(BaseModel):
    title: str
    description: str
    requirements: List[str] = []

class JobResponse(BaseModel):
    id: UUID
    title: str
    description: str
    requirements: List[str]
    created_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True