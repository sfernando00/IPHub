from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db

app = FastAPI()


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    return {"database": db.execute(text("SELECT current_database()")).scalar()}
