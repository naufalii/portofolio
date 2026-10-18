-- Database Schema for Naufal Ali Hilmi Portfolio (Section 9.3)

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guestbook (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS highscores (
    id SERIAL PRIMARY KEY,
    nickname TEXT NOT NULL,
    score INT NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance and rate limiting lookups
CREATE INDEX IF NOT EXISTS idx_contact_ip_hash_time ON contact_messages (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_guestbook_ip_hash_time ON guestbook (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_guestbook_approved ON guestbook (approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_highscores_score ON highscores (score DESC, created_at ASC);
