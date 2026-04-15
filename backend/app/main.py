from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import entries

app = FastAPI(title="Internal Time Tracker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(entries.router, prefix="/api/v1")
