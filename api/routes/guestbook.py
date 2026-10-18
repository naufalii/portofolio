from typing import Optional, List
from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from api.db import get_db
from api.security import get_client_ip, hash_ip, check_rate_limit

router = APIRouter()

class GuestbookEntryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=40)
    message: str = Field(..., min_length=1, max_length=500)
    # Honeypot field per Section 9.2
    website: Optional[str] = None

    @field_validator("name", "message")
    @classmethod
    def strip_and_validate(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Field tidak boleh hanya berisi spasi kosong.")
        return trimmed

@router.get("/api/guestbook")
@router.get("/guestbook")
def get_approved_guestbook():
    """
    Returns only approved guestbook messages, newest first, max 50 items.
    Follows Section 9.1 & 9.2.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        is_sqlite = "sqlite" in type(conn).__module__

        if is_sqlite:
            cursor.execute(
                """
                SELECT id, name, message, created_at
                FROM guestbook
                WHERE approved = 1
                ORDER BY created_at DESC
                LIMIT 50
                """
            )
        else:
            cursor.execute(
                """
                SELECT id, name, message, created_at
                FROM guestbook
                WHERE approved = TRUE
                ORDER BY created_at DESC
                LIMIT 50
                """
            )

        rows = cursor.fetchall()
        entries = []
        for r in rows:
            if isinstance(r, dict) or hasattr(r, "keys"):
                entries.append({
                    "id": r["id"],
                    "name": r["name"],
                    "message": r["message"],
                    "created_at": str(r["created_at"])
                })
            else:
                entries.append({
                    "id": r[0],
                    "name": r[1],
                    "message": r[2],
                    "created_at": str(r[3])
                })

    return {
        "success": True,
        "entries": entries
    }

@router.post("/api/guestbook")
@router.post("/guestbook")
def submit_guestbook_entry(payload: GuestbookEntryCreate, request: Request):
    """
    Submits a guestbook entry with approved = false pending admin moderation.
    Follows Section 9.1 & 9.2.
    """
    # 1. Honeypot check
    if payload.website and payload.website.strip():
        return {
            "success": True,
            "message": "Pesan berhasil dikirim dan menunggu moderasi."
        }

    # 2. Extract and hash IP
    client_ip = get_client_ip(request)
    client_ip_hash = hash_ip(client_ip)

    # 3. Rate limiting (max 3/hour per ip_hash per Section 9.2)
    check_rate_limit("guestbook", client_ip_hash, max_requests=3)

    # 4. Save to database with approved = FALSE
    with get_db() as conn:
        cursor = conn.cursor()
        is_sqlite = "sqlite" in type(conn).__module__

        if is_sqlite:
            cursor.execute(
                """
                INSERT INTO guestbook (name, message, approved, ip_hash)
                VALUES (?, ?, 0, ?)
                """,
                (payload.name, payload.message, client_ip_hash)
            )
        else:
            cursor.execute(
                """
                INSERT INTO guestbook (name, message, approved, ip_hash)
                VALUES (%s, %s, FALSE, %s)
                """,
                (payload.name, payload.message, client_ip_hash)
            )

    return {
        "success": True,
        "message": "Pesan telah ditempel di papan dan akan tampil setelah disetujui moderator!"
    }

import os
from fastapi import Header

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "naufalali21")

@router.patch("/api/guestbook/{entry_id}/approve")
@router.patch("/guestbook/{entry_id}/approve")
def approve_guestbook_entry(entry_id: int, x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token")):
    """
    Approves a guestbook entry by ID using admin token.
    """
    if not x_admin_token or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token admin tidak valid atau tidak disertakan."
        )

    with get_db() as conn:
        cursor = conn.cursor()
        is_sqlite = "sqlite" in type(conn).__module__

        if is_sqlite:
            cursor.execute("UPDATE guestbook SET approved = 1 WHERE id = ?", (entry_id,))
        else:
            cursor.execute("UPDATE guestbook SET approved = TRUE WHERE id = %s", (entry_id,))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pesan guestbook dengan id {entry_id} tidak ditemukan."
            )

    return {
        "success": True,
        "message": f"Pesan guestbook #{entry_id} berhasil disetujui!"
    }