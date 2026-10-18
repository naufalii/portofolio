import os
from fastapi.testclient import TestClient
from api.index import app
from api.db import get_db

client = TestClient(app)

print("--- TEST 1: Health check ---")
res = client.get("/api/health")
assert res.status_code == 200, res.text
print("OK:", res.json())

print("\n--- TEST 2: Contact Form Validation (Invalid input) ---")
# Empty name
res = client.post("/api/contact", json={"name": "   ", "email": "test@example.com", "message": "Hello"})
assert res.status_code == 422, "Should reject empty name"
# Invalid email
res = client.post("/api/contact", json={"name": "Budi", "email": "not-an-email", "message": "Hello"})
assert res.status_code == 422, "Should reject invalid email"
print("OK: Invalid input rejected with 422")

print("\n--- TEST 3: Honeypot Test ---")
res = client.post("/api/contact", json={"name": "Bot", "email": "bot@spam.com", "message": "Buy cheap meds", "website": "http://spam.com"})
assert res.status_code == 200
assert res.json()["success"] == True
with get_db() as conn:
    cur = conn.cursor()
    cur.execute("SELECT COUNT(id) FROM contact_messages WHERE email = 'bot@spam.com'")
    count = cur.fetchone()[0]
    assert count == 0, "Honeypot entry should NOT be saved in DB"
print("OK: Honeypot silently dropped and not stored in DB")

print("\n--- TEST 4: Guestbook Submission & Moderation ---")
res = client.post("/api/guestbook", json={"name": "Petualang 1", "message": "Semangat praktikumnya!"})
assert res.status_code == 200
# Unapproved must NOT appear in public GET /api/guestbook
res = client.get("/api/guestbook")
assert res.status_code == 200
entries = res.json()["entries"]
found = any(e["name"] == "Petualang 1" for e in entries)
assert not found, "Unapproved message must NOT appear publicly"
print("OK: New guestbook message is unapproved and does not appear on public board")

print("\n--- TEST 5: Admin approve guestbook ---")
with get_db() as conn:
    cur = conn.cursor()
    cur.execute("SELECT id FROM guestbook WHERE name = 'Petualang 1' AND approved = 0")
    row = cur.fetchone()
    entry_id = row[0]

res = client.post(f"/api/admin/guestbook/{entry_id}/approve", headers={"X-Admin-Token": "change_this_admin_secret_token"})
assert res.status_code == 200
# Now verify it DOES appear in public GET /api/guestbook
res = client.get("/api/guestbook")
entries = res.json()["entries"]
found = any(e["name"] == "Petualang 1" for e in entries)
assert found, "Approved message MUST appear on public board"
print("OK: Approved guestbook message now appears on public board")

print("\n--- TEST 6: Rate Limiting (4th request in 1h rejected) ---")
res1 = client.post("/api/contact", json={"name": "Test User", "email": "user1@example.com", "message": "Msg 1"})
assert res1.status_code == 200
res2 = client.post("/api/contact", json={"name": "Test User", "email": "user2@example.com", "message": "Msg 2"})
assert res2.status_code == 200
res3 = client.post("/api/contact", json={"name": "Test User", "email": "user3@example.com", "message": "Msg 3"})
assert res3.status_code == 200
# 4th request must be rejected with 429
res4 = client.post("/api/contact", json={"name": "Test User", "email": "user4@example.com", "message": "Msg 4"})
assert res4.status_code == 429, f"Expected 429 but got {res4.status_code}"
print("OK: Rate limiting enforced (4th attempt rejected with 429 Too Many Requests)")

print("\nALL BACKEND ACCEPTANCE CRITERIA PASSED!")
