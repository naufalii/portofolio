from fastapi import APIRouter, Header, HTTPException, status
from api.db import get_db
from api.security import verify_admin_token

router = APIRouter()

@router.get("/api/admin/messages")
@router.get("/admin/messages")
def get_admin_messages(x_admin_token: str | None = Header(default=None, alias="X-Admin-Token")):
    """
    Retrieves pending contact messages and pending guestbook submissions.
    Protected by constant-time X-Admin-Token check per Section 9.1 & 9.2.
    """
    if not verify_admin_token(x_admin_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token admin tidak valid atau tidak disertakan."
        )

    with get_db() as conn:
        cursor = conn.cursor()
        is_sqlite = "sqlite" in type(conn).__module__

        # Fetch recent contact messages
        cursor.execute("SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 50")
        contact_rows = cursor.fetchall()
        contacts = []
        for r in contact_rows:
            if isinstance(r, dict) or hasattr(r, "keys"):
                contacts.append({
                    "id": r["id"], "name": r["name"], "email": r["email"],
                    "message": r["message"], "created_at": str(r["created_at"])
                })
            else:
                contacts.append({
                    "id": r[0], "name": r[1], "email": r[2], "message": r[3], "created_at": str(r[4])
                })

        # Fetch unapproved guestbook entries
        if is_sqlite:
            cursor.execute("SELECT id, name, message, created_at FROM guestbook WHERE approved = 0 ORDER BY created_at DESC")
        else:
            cursor.execute("SELECT id, name, message, created_at FROM guestbook WHERE approved = FALSE ORDER BY created_at DESC")

        guestbook_rows = cursor.fetchall()
        pending_guestbook = []
        for r in guestbook_rows:
            if isinstance(r, dict) or hasattr(r, "keys"):
                pending_guestbook.append({
                    "id": r["id"], "name": r["name"], "message": r["message"], "created_at": str(r["created_at"])
                })
            else:
                pending_guestbook.append({
                    "id": r[0], "name": r[1], "message": r[2], "created_at": str(r[3])
                })

    return {
        "success": True,
        "contacts": contacts,
        "pending_guestbook": pending_guestbook
    }

@router.post("/api/admin/guestbook/{entry_id}/approve")
@router.post("/admin/guestbook/{entry_id}/approve")
def approve_guestbook_entry(entry_id: int, x_admin_token: str | None = Header(default=None, alias="X-Admin-Token")):
    """
    Approves a guestbook entry so it appears on the public board.
    Protected by constant-time X-Admin-Token check.
    """
    if not verify_admin_token(x_admin_token):
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
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pesan tidak ditemukan.")

    return {
        "success": True,
        "message": f"Pesan #{entry_id} berhasil disetujui untuk ditampilkan."
    }
