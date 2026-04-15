# Internal Time Tracker HTML MVP

This repository contains a minimal internal time tracker backend implemented with **FastAPI** and an in-memory store. A simple HTML/JS frontend will be added in a separate task.

## Backend stack

- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic v2
- uv as the package/dependency manager

## Running the backend with uv (recommended)

```bash
cd backend
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with the base path `http://localhost:8000/api/v1` for versioned routes.

## Running with Docker

```bash
docker compose up --build
```

This will start:
- `backend` on http://localhost:8000
- `frontend` placeholder on http://localhost:3000

## Health check

The backend exposes a health endpoint used by Railway:

```http
GET /health
```

Response:

```json
{"status": "ok"}
```

## Time entries API (summary)

Base URL: `http://localhost:8000/api/v1`

- `GET /entries` – list all time entries
- `POST /entries` – create a new time entry
- `DELETE /entries/{id}` – delete an existing time entry
