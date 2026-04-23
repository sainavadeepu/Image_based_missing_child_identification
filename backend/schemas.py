"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import uuid


# ── Child ──────────────────────────────────────────────────────────────────────

class ChildCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, example="Ravi Kumar")
    age: int = Field(..., ge=0, le=18, example=8)
    gender: str = Field(..., example="male")
    last_seen_location: str = Field(..., min_length=3, max_length=500, example="Delhi, India")
    contact_number: str = Field(..., min_length=7, max_length=20, example="+91-9876543210")
    contact_email: Optional[str] = Field(None, example="parent@example.com")


    @validator("gender")
    def validate_gender(cls, v):
        if v.lower() not in ("male", "female", "other"):
            raise ValueError("gender must be 'male', 'female', or 'other'")
        return v.lower()


class ChildOut(BaseModel):
    id: uuid.UUID
    name: str
    age: int
    gender: str
    last_seen_location: str
    contact_number: str
    contact_email: Optional[str] = None

    image_path: Optional[str]
    status: str
    created_at: datetime
    warning: Optional[str] = None

    class Config:
        from_attributes = True


class ChildStatusUpdate(BaseModel):
    status: str = Field(..., example="found")

    @validator("status")
    def validate_status(cls, v):
        if v not in ("missing", "found"):
            raise ValueError("status must be 'missing' or 'found'")
        return v


# ── Search ─────────────────────────────────────────────────────────────────────

class SearchMatch(BaseModel):
    child: ChildOut
    confidence: float = Field(..., description="Confidence percentage (0–100)")
    similarity_score: float = Field(..., description="Raw cosine similarity (0–1)")
    match_source: str = Field(..., description="The model that produced the match (custom/arcface)")


class SearchResult(BaseModel):
    match_found: bool
    matches: list[SearchMatch] = []
    message: str


# ── Auth ───────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# ── Reports ────────────────────────────────────────────────────────────────────

class SearchLogOut(BaseModel):
    id: uuid.UUID
    matched_child_id: Optional[uuid.UUID]
    confidence_score: Optional[float]
    match_found: bool
    searched_at: datetime
    ip_address: Optional[str]

    class Config:
        from_attributes = True


class ReportsResponse(BaseModel):
    total_children: int
    missing_count: int
    found_count: int
    total_searches: int
    matches_found: int
    recent_searches: list[SearchLogOut]
    children: list[ChildOut]
