"""
Image validation utilities.
"""
import io
import logging
from fastapi import HTTPException, status
from PIL import Image
from config import settings

logger = logging.getLogger(__name__)

MAX_IMAGE_BYTES = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024


def validate_image(content: bytes, filename: str) -> None:
    """
    Validate uploaded image:
    - Check file size
    - Check extension
    - Verify it's a valid image
    Raises HTTPException on failure.
    """
    # Size check
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image too large. Maximum size is {settings.MAX_IMAGE_SIZE_MB} MB.",
        )

    # Extension check
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    # Validate it's actually an image
    try:
        img = Image.open(io.BytesIO(content))
        img.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File is not a valid image.",
        )
