"""
Register router — POST /register
Accepts child info + face image, detects face, generates embedding, stores to DB.
"""
import uuid
import logging
print("DEBUG: Importing routers/register.py")
import cv2
import numpy as np
import aiofiles
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Child
from schemas import ChildOut
from auth import get_current_user
from services.face_recognition import extract_embeddings
from utils.image_validation import validate_image
from config import settings

router = APIRouter(prefix="/register", tags=["Registration"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=ChildOut, status_code=status.HTTP_201_CREATED)
async def register_child(
    name: str = Form(..., min_length=2, max_length=255),
    age: int = Form(..., ge=0, le=18),
    gender: str = Form(...),
    location: str = Form(..., min_length=1),
    phone: str = Form(..., min_length=1),
    email: str | None = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    print("🔥 REGISTER API HIT")
    """
    Register a missing child with a face image.
    Public endpoint — no authentication required.
    """
    # Validate gender
    gender = gender.lower()
    if gender not in ("male", "female", "other"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="gender must be 'male', 'female', or 'other'",
        )

    # Read and validate image
    # Read and validate image
    image_bytes = await file.read()
    validate_image(image_bytes, file.filename)

    # Generate 512-dim ArcFace embedding via InsightFace
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_cv is None:
        raise HTTPException(status_code=400, detail="Could not decode image.")
    
    embeddings = extract_embeddings(img_cv)
    
    if len(embeddings) == 0:
        raise HTTPException(status_code=400, detail="No face detected in the image.")
    if len(embeddings) > 1:
        raise HTTPException(status_code=400, detail="Multiple faces detected. Please provide an image with only the missing child.")
        
    arcface_embedding = embeddings[0]
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_ext = file.filename.rsplit(".", 1)[-1].lower()
    file_id = uuid.uuid4().hex
    file_path = upload_dir / f"{file_id}.{file_ext}"
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(image_bytes)

    # Save to database
    child = Child(
        name=name,
        age=age,
        gender=gender,
        last_seen_location=location,
        contact_number=phone,
        contact_email=email,
        image_path=str(file_path),
        arcface_embedding=arcface_embedding,
        status="missing",
    )
    db.add(child)
    await db.commit()
    await db.refresh(child)

    # Return child data
    child_data = ChildOut.model_validate(child).model_dump()
    return child_data


@router.patch("/{child_id}/status", response_model=ChildOut)
async def update_child_status(
    child_id: uuid.UUID,
    new_status: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Update a child's status (missing/found)."""
    if new_status not in ("missing", "found"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="status must be 'missing' or 'found'",
        )

    result = await db.execute(select(Child).where(Child.id == child_id))
    child = result.scalar_one_or_none()
    if child is None:
        raise HTTPException(status_code=404, detail="Child not found")

    child.status = new_status
    await db.commit()
    await db.refresh(child)
    return child


@router.delete("/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_child_case(
    child_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    Delete a child's registration case entirely. 
    Only authorized administrators can perform this action.
    """
    result = await db.execute(select(Child).where(Child.id == child_id))
    child = result.scalar_one_or_none()
    
    if child is None:
        raise HTTPException(status_code=404, detail="Child not found")
        
    # Delete the record
    await db.delete(child)
    await db.commit()
    
    # Optionally: delete the image file from the disk (upload_dir)
    # Using Path(child.image_path).unlink(missing_ok=True)
    import os
    try:
        if child.image_path and os.path.exists(child.image_path):
            os.remove(child.image_path)
    except Exception as e:
        logger.warning(f"Could not delete image file for child {child_id}: {e}")
        
    return None
