import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

DATABASE_URL = "postgresql+asyncpg://mcis_user:mcis_password@db:5432/mcis_db"
engine = create_async_engine(DATABASE_URL)

async def main():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT id, name, status FROM children"))
        rows = result.fetchall()
        print("DATABASE ROWS:")
        for r in rows:
            print(f"- ID: {r.id} | Name: {r.name} | Status: {r.status}")
        if not rows:
            print("No rows found!")

asyncio.run(main())
