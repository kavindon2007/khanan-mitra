from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings

# Import routers
from app.routers import (
    auth, dashboard, workers, completions,
    analytics, devices, audit, verify
)

app = FastAPI(
    title="Khanan Mitra API",
    description="Backend API for Khanan Mitra industrial safety training compliance dashboard",
    version="1.0.0"
)

# CORS Setup
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health/db")
def database_health(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    return {
        "database": "connected",
        "result": result.scalar()
    }

# Register routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(workers.router)
app.include_router(completions.router)
app.include_router(analytics.router)
app.include_router(devices.router)
app.include_router(audit.router)
app.include_router(verify.router)