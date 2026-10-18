import os
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import contact, guestbook, github, admin

app = FastAPI(
    title="Naufal Ali Hilmi Portfolio API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS setup per Section 9.2
allowed_origins_env = os.getenv("ALLOWED_ORIGIN", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(contact.router)
app.include_router(guestbook.router)
app.include_router(github.router)
app.include_router(admin.router)

@app.get("/api/health")
@app.get("/health")
def health_check():
    """Health check endpoint to verify backend operational status."""
    return {
        "status": "ok",
        "service": "portfolio-api",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
