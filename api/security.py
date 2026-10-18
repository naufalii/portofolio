import os
import hashlib
import hmac
from datetime import datetime, timezone, timedelta
from fastapi import Request, HTTPException, status
from api.db import get_db

IP_SALT = os.getenv("IP_SALT", "default_portfolio_ip_salt_change_in_production")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "change_this_admin_secret_token")

def get_client_ip(request: Request) -> str:
    """Extract client IP from request, prioritizing X-Forwarded-For (Vercel)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"

def hash_ip(ip: str) -> str:
    """Hash IP using SHA-256 with salt per Section 9.2."""
    raw = f"{ip}:{IP_SALT}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def verify_admin_token(token: str | None) -> bool:
    """Constant-time token verification using hmac.compare_digest."""
    if not token:
        return False
    return hmac.compare_digest(token.strip(), ADMIN_TOKEN.strip())

def check_rate_limit(table_name: str, ip_hash: str, max_requests: int = 3) -> None:
    """
    Stateless database rate limiter.
    Counts rows for this ip_hash created within the last 1 hour.
    If count >= max_requests, raises HTTP 429 Too Many Requests.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check database engine (Postgres vs sqlite)
        is_sqlite = "sqlite" in type(conn).__module__
        
        if is_sqlite:
            query = f"""
                SELECT COUNT(*) FROM {table_name}
                WHERE ip_hash = ? AND created_at >= datetime('now', '-1 hour')
            """
            cursor.execute(query, (ip_hash,))
        else:
            query = f"""
                SELECT COUNT(*) FROM {table_name}
                WHERE ip_hash = %s AND created_at >= (NOW() - INTERVAL '1 hour')
            """
            cursor.execute(query, (ip_hash,))
            
        row = cursor.fetchone()
        count = row[0] if isinstance(row, (tuple, list)) else row["count"] if "count" in row else row[0]
        
        if count >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Batas pengiriman tercapai. Silakan coba kembali dalam 1 jam."
            )
