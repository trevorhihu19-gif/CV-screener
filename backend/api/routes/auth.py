from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.config.db import get_db
from api.controllers.auth import login_user, register_user
from api.schemas.user import UserLogin, UserRegister
from api.security.arcjet import protect_auth

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", dependencies=[Depends(protect_auth)])
def register(data: UserRegister, db: Session = Depends(get_db)):
    return register_user(data, db)

@router.post("/login", dependencies=[Depends(protect_auth)])
def login(data: UserLogin, db: Session = Depends(get_db)):
    return login_user(data, db)