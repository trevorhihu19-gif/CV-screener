from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.config.db import get_db
from api.middleware.auth import get_current_user
from api.models.user import User

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "success": True,
        "message": "User fetched successfully",
        "data": {
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email,
            "clerk_id": current_user.clerk_id,
            "created_at": current_user.created_at
        }
    }