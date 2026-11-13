from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.models import User
from app.security import verify_password, create_access_token, decode_token

from app.services.demo_auth import DEMO_EMAIL, demo_login_enabled

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class LoginRequest(BaseModel):
    email: str
    password: str


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    if not user or not user.is_active or (user.email == DEMO_EMAIL and not demo_login_enabled()):
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/demo")
def demo_options():
    return {"enabled": demo_login_enabled(), "roles": ["admin"] if demo_login_enabled() else []}


@router.post("/demo-login")
def demo_login(db: Session = Depends(get_db)):
    if not demo_login_enabled():
        raise HTTPException(status_code=403, detail="Demo login is disabled on this installation")
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if not user or not user.is_active or user.role != "admin":
        raise HTTPException(status_code=503, detail="Demo account unavailable. Restart the demo backend to provision it.")
    token = create_access_token({"sub": user.email, "demo": True}, expires_delta=timedelta(hours=1))
    return {
        "access_token": token, "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.is_active or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {
        "access_token": token, "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}
    }


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email,
            "full_name": current_user.full_name, "role": current_user.role}


async def require_admin(current_user: User = Depends(get_current_user)):
    """All infrastructure records belong to the administrator workspace."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Administrator role required")
    return current_user
