"""
Search router — POST /search
Upload a found child's photo, detect face, generate embedding, search for matches.
"""
import uuid
import logging
import aiofiles
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import SearchLog, Child

from schemas import SearchResult, SearchMatch, ChildOut
from services.face_recognition import extract_embeddings
from services.similarity import find_similar_children_hybrid
from utils.image_validation import validate_image
from config import settings
import cv2
import numpy as np
from utils.notifications import send_email_alert, send_sms_alert

router = APIRouter(prefix="/search", tags=["Search"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=SearchResult)
async def search_child(
    request: Request,
    image: UploadFile = File(...),
    finder_name: str = Form(..., min_length=2),
    finder_phone: str = Form(..., min_length=5),
    finder_email: str = Form(..., min_length=5),
    db: AsyncSession = Depends(get_db),
):
    """
    Search for a missing child by uploading a found child's image.
    No authentication required (public endpoint).
    """
    # Read and validate image
    image_bytes = await image.read()
    validate_image(image_bytes, image.filename)

    # Generate 512-dim ArcFace embedding via InsightFace
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_cv is None:
        return SearchResult(match_found=False, matches=[], message="Invalid image format.")
    
    embeddings = extract_embeddings(img_cv)
    
    if len(embeddings) == 0:
        return SearchResult(
            match_found=False, 
            matches=[], 
            message="No face detected. Please use a clear front-face image."
        )
    if len(embeddings) > 1:
        return SearchResult(
            match_found=False, 
            matches=[], 
            message="Multiple faces detected. Please use an image with only the missing child."
        )
        
    arcface_embedding = embeddings[0]

    # Save query image
    upload_dir = Path(settings.UPLOAD_DIR) / "queries"
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_ext = image.filename.rsplit(".", 1)[-1].lower()
    query_file = upload_dir / f"query_{uuid.uuid4().hex}.{file_ext}"
    async with aiofiles.open(query_file, "wb") as f:
        await f.write(image_bytes)

    # Search database (ArcFace only)
    matches_data: list[dict] = await find_similar_children_hybrid(db, arcface_embedding)

    # Build response
    match_found = len(matches_data) > 0
    matches = []
    matched_child_id = None
    best_confidence = None

    for m in matches_data:
        child_out = ChildOut.model_validate(m)
        matches.append(SearchMatch(
            child=child_out,
            confidence=m["confidence"],
            similarity_score=m["similarity_score"],
            match_source=m["match_source"]
        ))
        if matched_child_id is None:
            matched_child_id = m["id"]
            best_confidence = m["confidence"]

    # Log search
    ip_address = request.client.host if request.client else None
    log_entry = SearchLog(
        query_image_path=str(query_file),
        matched_child_id=matched_child_id,
        confidence_score=best_confidence,
        match_found=match_found,
        ip_address=ip_address,
    )
    db.add(log_entry)

    # Automated Alert System (Trigger if match >= 80%)
    if match_found and matches[0].confidence >= 80:
        # Fetch the child again to check/update alert_sent
        result = await db.execute(select(Child).where(Child.id == matched_child_id))
        child = result.scalar_one_or_none()
        
        if child and not child.alert_sent:
            # Send Email
            if child.contact_email:
                send_email_alert(
                    child.contact_email, 
                    child.name,
                    finder_name,
                    finder_phone,
                    finder_email
                )
            
            # Send SMS
            if child.contact_number:
                send_sms_alert(child.contact_number)
            
            # Update flag to prevent duplicate alerts
            child.alert_sent = True
            db.add(child)

    await db.commit()

    if match_found:
        best_match = matches[0]
        logger.info(f"MATCH FOUND: {best_match.child.name} | Distance: {best_match.similarity_score:.4f} | Confidence: {best_match.confidence}%")
        message = f"Found {len(matches)} potential match(es). Best match: {matches[0].child.name} ({matches[0].confidence:.1f}% confidence)"
    else:
        logger.info("NO MATCH FOUND above similarity threshold.")
        message = "No matching child found in the database. Please report to local authorities."

    return SearchResult(match_found=match_found, matches=matches, message=message)
