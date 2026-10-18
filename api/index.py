import os
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Naufal Ali Hilmi Portfolio API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS setup
allowed_origins_env = os.getenv("ALLOWED_ORIGIN", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/api/health")
@app.get("/health")
def health_check():
    """Health check endpoint to verify backend operational status."""
    return {
        "status": "ok",
        "service": "portfolio-api",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
