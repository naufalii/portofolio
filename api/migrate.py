"""
Database Migration Script for Naufal Ali Hilmi Portfolio (Section 9.3)
Idempotent execution using `CREATE TABLE IF NOT EXISTS`.
"""
import os
import sys

def run_migration():
    database_url = os.getenv("DATABASE_URL")
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")

    if not os.path.exists(schema_path):
        print(f"Error: Schema file not found at {schema_path}")
        sys.exit(1)

    with open(schema_path, "r", encoding="utf-8") as f:
        sql_commands = f.read()

    print("Running database migrations...")

    if database_url:
        import psycopg
        print("Connecting to Neon Postgres...")
        with psycopg.connect(database_url) as conn:
            with conn.cursor() as cur:
                cur.execute(sql_commands)
            conn.commit()
        print("Postgres database migration completed successfully!")
    else:
        import sqlite3
        db_path = os.path.join(os.path.dirname(__file__), "dev_local.db")
        print(f"No DATABASE_URL found. Initializing local sqlite database at {db_path}...")
        # Adapt postgres types for sqlite in local dev
        sqlite_sql = sql_commands.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
        sqlite_sql = sqlite_sql.replace("TIMESTAMPTZ DEFAULT NOW()", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        sqlite_sql = sqlite_sql.replace("BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0")
        sqlite_sql = sqlite_sql.replace("BOOLEAN DEFAULT TRUE", "BOOLEAN DEFAULT 1")
        with sqlite3.connect(db_path) as conn:
            conn.executescript(sqlite_sql)
            conn.commit()
        print("Local dev database migration completed successfully!")

if __name__ == "__main__":
    run_migration()
