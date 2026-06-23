import httpx
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from api.config.env import settings
from api.config.db import get_db
from api.models.user import User

security = HTTPBearer()

CLERK_ISSUER = settings.clerk_issuer
CLERK_JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"

def verify_clerk_token(token: str) -> dict:
    try:
        jwks_client = PyJWKClient(CLERK_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"verify_exp": True}
        )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = verify_clerk_token(token)

    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user = db.query(User).filter(User.clerk_id == clerk_user_id).first()

    if not user:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.clerk.com/v1/users/{clerk_user_id}",
                headers={"Authorization": f"Bearer {settings.clerk_secret_key}"}
            )
            clerk_data = response.json()

        first_name = clerk_data.get("first_name") or ""
        last_name = clerk_data.get("last_name") or ""
        full_name = f"{first_name} {last_name}".strip()
        emails = clerk_data.get("email_addresses", [])
        email = emails[0].get("email_address", "") if emails else ""

        user = User(
            clerk_id=clerk_user_id,
            name=full_name or email,
            email=email,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user