"""
Face Recognition / Embedding Service
Uses InsightFace (ONNX Runtime) with the 'buffalo_l' model (SCRFD + ArcFace)
to generate high-accuracy 512-dim face embeddings.
"""
import logging
import numpy as np
from insightface.app import FaceAnalysis

import cv2

logger = logging.getLogger(__name__)

# Initialize InsightFace once on startup
logger.info("Initializing InsightFace FaceAnalysis (buffalo_l)...")
try:
    face_app = FaceAnalysis(name="buffalo_l")
    face_app.prepare(ctx_id=-1)  # CPU execution
    logger.info("InsightFace initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize InsightFace: {e}")
    face_app = None

def preprocess_image(image: np.ndarray, max_size=640) -> np.ndarray:
    """Resize image to max dimension while maintaining aspect ratio and ensuring BGR format."""
    # Ensure 3 channels (convert grayscale/BGRA to BGR if needed)
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
        
    h, w = image.shape[:2]
    if max(h, w) > max_size:
        scale = max_size / float(max(h, w))
        new_w, new_h = int(w * scale), int(h * scale)
        image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        logger.info(f"Resized image from {w}x{h} to {new_w}x{new_h}")
    return image

def extract_embeddings(image: np.ndarray) -> list:
    """
    Returns a list containing the 512-d embedding for exactly the LARGEST eligible face.
    Enforces quality filtering and strict L2 Normalization.
    """
    if face_app is None:
        logger.error("InsightFace app not initialized.")
        return []

    try:
        image = preprocess_image(image, max_size=640)
        faces = face_app.get(image)
    except Exception as e:
        logger.error(f"InsightFace detection error: {e}")
        return []

    if len(faces) == 0:
        logger.warning("No faces detected in the image.")
        return []

    valid_faces = []
    # 1. Face Quality Filtering
    for face in faces:
        bbox = face.bbox
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        logger.info(f"Detected face size: {width:.1f}x{height:.1f}")
        if width >= 80 and height >= 80:
            area = width * height
            valid_faces.append((area, face))
        else:
            logger.warning(f"Face rejected: Size {width:.1f}x{height:.1f} is smaller than minimum 80x80 threshold.")

    if not valid_faces:
        logger.warning("No valid faces found after applying size thresholds.")
        return []

    # 2. Select Largest Face
    valid_faces.sort(key=lambda x: x[0], reverse=True)
    largest_face = valid_faces[0][1]
    logger.info("Selected the largest face in the image for embedding extraction.")

    # 3. Embedding Consistency
    emb = largest_face.embedding
    if emb is None or len(emb) != 512:
        logger.error("Failed to extract valid 512-d embedding.")
        return []

    norm = np.linalg.norm(emb)
    if norm > 0:
        emb = emb / norm  # Ensure exact L2 normalization once
    else:
        logger.error("Embedding normalization failed (zero norm).")
        return []
        
    return [emb.tolist()]
