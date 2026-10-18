from typing import Optional
from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from api.db import get_db
from api.security import get_client_ip, hash_ip, check_rate_limit

router = APIRouter()

class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=40)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=500)
    # Honeypot field per Section 9.2: must be empty
    website: Optional[str] = None

    @field_validator("name", "message")
    @classmethod
    def strip_and_validate(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Field tidak boleh hanya berisi spasi kosong.")
        return trimmed

@router.post("/api/contact")
@router.post("/contact")
def submit_contact_message(payload: ContactMessageCreate, request: Request):
    # 1. Honeypot check: If bot filled `website`, return fake success without saving
    if payload.website and payload.website.strip():
        return {
            "success": True,
            "message": "Pesan berhasil dikirim."
        }

    # 2. Extract and hash IP
    client_ip = get_client_ip(request)
    client_ip_hash = hash_ip(client_ip)

    # 3. Rate limiting (max 3/hour per ip_hash per Section 9.2)
    check_rate_limit("contact_messages", client_ip_hash, max_requests=3)

    # 4. Save to database
    with get_db() as conn:
        cursor = conn.cursor()
        is_sqlite = "sqlite" in type(conn).__module__

        if is_sqlite:
            cursor.execute(
                """
                INSERT INTO contact_messages (name, email, message, ip_hash)
                VALUES (?, ?, ?, ?)
                """,
                (payload.name, str(payload.email), payload.message, client_ip_hash)
            )
        else:
            cursor.execute(
                """
                INSERT INTO contact_messages (name, email, message, ip_hash)
                VALUES (%s, %s, %s, %s)
                """,
                (payload.name, str(payload.email), payload.message, client_ip_hash)
            )

    return {
        "success": True,
        "message": "Pesan berhasil dikirim ke kotak pos Naufal!"
    }
