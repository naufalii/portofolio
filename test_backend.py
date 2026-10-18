import os
import time
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
test_user = f"Petualang_{int(time.time())}"
unique_ip = f"10.0.0.{int(time.time()) % 250}"
res = client.post("/api/guestbook", json={"name": test_user, "message": "Semangat praktikumnya!"}, headers={"X-Forwarded-For": unique_ip})
assert res.status_code == 200
# Unapproved must NOT appear in public GET /api/guestbook
res = client.get("/api/guestbook")
assert res.status_code == 200
entries = res.json()["entries"]
found = any(e["name"] == test_user for e in entries)
assert not found, "Unapproved message must NOT appear publicly"
print(f"OK: New guestbook message from {test_user} is unapproved and does not appear on public board")

print("\n--- TEST 5: Admin approve guestbook ---")
with get_db() as conn:
    cur = conn.cursor()
    cur.execute(f"SELECT id FROM guestbook WHERE name = '{test_user}' AND approved = 0")
    row = cur.fetchone()
    entry_id = row[0]

res = client.post(f"/api/admin/guestbook/{entry_id}/approve", headers={"X-Admin-Token": "change_this_admin_secret_token"})
assert res.status_code == 200
# Now verify it DOES appear in public GET /api/guestbook
res = client.get("/api/guestbook")
entries = res.json()["entries"]
found = any(e["name"] == test_user for e in entries)
assert found, "Approved message MUST appear on public board"
print(f"OK: Approved guestbook message from {test_user} now appears on public board")

print("\n--- TEST 6: Rate Limiting Enforcement ---")
# Send 4 requests from unique test IP to test rate limiting
headers = {"X-Forwarded-For": f"192.168.1.{int(time.time()) % 250}"}
r1 = client.post("/api/contact", json={"name": "RateTest", "email": "r1@test.com", "message": "M1"}, headers=headers)
assert r1.status_code == 200
r2 = client.post("/api/contact", json={"name": "RateTest", "email": "r2@test.com", "message": "M2"}, headers=headers)
assert r2.status_code == 200
r3 = client.post("/api/contact", json={"name": "RateTest", "email": "r3@test.com", "message": "M3"}, headers=headers)
assert r3.status_code == 200
r4 = client.post("/api/contact", json={"name": "RateTest", "email": "r4@test.com", "message": "M4"}, headers=headers)
assert r4.status_code == 429, f"Expected 429 but got {r4.status_code}"
print("OK: Rate limiting enforced (4th attempt rejected with 429 Too Many Requests)")

print("\nALL BACKEND ACCEPTANCE CRITERIA PASSED!")
