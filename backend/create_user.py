"""Add a user who can sign in: python create_user.py <username> "<full name>" """

import sys
from getpass import getpass

from sqlalchemy import select

from database import Base, SessionLocal, engine
from models import User
from security import hash_password


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    username, full_name = sys.argv[1], sys.argv[2]

    password = getpass("Password: ")
    if len(password) < 8:
        sys.exit("Password must be at least 8 characters.")
    if password != getpass("Confirm password: "):
        sys.exit("Passwords do not match.")

    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.username == username)):
            sys.exit(f"User '{username}' already exists.")
        db.add(User(username=username, full_name=full_name, password_hash=hash_password(password)))
        db.commit()
    print(f"Created user '{username}'.")


if __name__ == "__main__":
    main()
