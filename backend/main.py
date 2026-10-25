from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import User
from security import create_access_token, verify_password


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Creates any missing tables in iphub_db on startup; existing tables and data are left alone.
    Base.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    full_name: str


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    return {"database": db.execute(text("SELECT current_database()")).scalar()}


@app.post("/api/auth/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == body.username))
    if user is None or not user.is_active or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    return LoginResponse(access_token=create_access_token(user.username), full_name=user.full_name)
