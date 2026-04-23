#!/usr/bin/env python3
"""
Database initialization script.
Run this once to create all tables: python init_db.py
"""
import asyncio
import asyncpg
import os
from pathlib import Path

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://mcis_user:mcis_password@localhost:5432/mcis_db"
)

SCHEMA_FILE = Path(__file__).parent / "schema.sql"


async def init_database():
    print("Connecting to PostgreSQL...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    print("Reading schema...")
    schema_sql = SCHEMA_FILE.read_text()
    
    print("Executing schema...")
    await conn.execute(schema_sql)
    
    print("✅ Database initialized successfully!")
    await conn.close()


if __name__ == "__main__":
    asyncio.run(init_database())
