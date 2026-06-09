from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.config.db import get_db
from api.schemas.user import UserRegister, UserLogin
from api.controllers.auth import register_user, login_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    return register_user(data, db)

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    return login_user(data, db)