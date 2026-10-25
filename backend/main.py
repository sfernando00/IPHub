from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import User
from security import create_access_token, hash_password, verify_password


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


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9._-]+$")
    email: EmailStr
    # bcrypt only accepts up to 72 bytes.
    password: str = Field(min_length=8, max_length=72)


class RegisterResponse(BaseModel):
    username: str


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


@app.post("/api/auth/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.scalar(select(User).where(User.username == body.username)):
        raise HTTPException(status.HTTP_409_CONFLICT, "That username is already taken.")
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with that email already exists.")

    db.add(
        User(
            username=body.username,
            full_name=body.full_name.strip(),
            email=email,
            password_hash=hash_password(body.password),
        )
    )
    db.commit()
    return RegisterResponse(username=body.username)
