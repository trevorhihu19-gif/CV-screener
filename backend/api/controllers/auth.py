from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from api.models.user import User
from api.schemas.user import UserRegister, UserLogin
from api.middleware.auth import hash_password, verify_password, create_token

def register_user(data: UserRegister, db: Session):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists with this email"
        )
    
    user = User(
        name = data.name,
        email = data.email,
        password = hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(str(user.id), user.email)
    return {
        "success": True,
        "message": "Account created successfully",
        "data": {
            "token": token,
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at
            }
        }
    }

def login_user(data: UserLogin, db: Session):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_token(str(user.id), user.email)
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "token": token,
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at
            }
        }
    }