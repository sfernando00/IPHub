# IPHub

**Where Every IP Finds Its Place.** An IP Management System with a FastAPI + PostgreSQL backend and a React + TypeScript frontend.

## Backend (`backend/`)

Requires Python 3.12+ and PostgreSQL with a database named `iphub_db`.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then fill in your database password and a random JWT_SECRET
uvicorn main:app --reload   # http://127.0.0.1:8000  (API docs at /docs)
```

Tables are created automatically on startup. Add a user who can sign in:

```bash
python create_user.py admin "Administrator"
```

## Frontend (`frontend/`)

Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

In development, requests to `/api` are forwarded to the backend on port 8000, so start the backend first.
