"""
Vector similarity search using pgvector cosine distance operator (<=>).
Standardized on ArcFace 512-dim embeddings.
"""
import logging
import math
from typing import Optional, List
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from config import settings

logger = logging.getLogger(__name__)

async def find_similar_children_hybrid(
    db: AsyncSession,
    arcface_embedding: List[float],
    top_k: Optional[int] = None,
) -> List[dict]:
    """
    Search children in DB using only ArcFace 512-dim cosine similarity.
    """
    if top_k is None:
        top_k = settings.TOP_K_RESULTS
        
    threshold = settings.ARCFACE_THRESHOLD
    
    # pgvector <=> is cosine distance. 
    # Similarity = 1 - distance.
    # We use a raw SQL query for performance and simplicity with pgvector.
    
    vec_str = "[" + ",".join(str(v) for v in arcface_embedding) + "]"
    
    sql = text("""
        SELECT
            id, name, age, gender, last_seen_location, contact_number,
            image_path, status, contact_email, created_at,
            (arcface_embedding <=> CAST(:embedding AS vector)) AS cosine_distance
        FROM children
        WHERE
            arcface_embedding IS NOT NULL
            AND status = 'missing'
            AND (arcface_embedding <=> CAST(:embedding AS vector)) < :threshold
        ORDER BY cosine_distance ASC
        LIMIT :top_k
    """)

    try:
        result = await db.execute(
            sql, 
            {
                "embedding": vec_str, 
                "threshold": threshold, 
                "top_k": top_k
            }
        )
        rows = result.mappings().all()
        return _process_rows(rows, "arcface")
    except Exception as e:
        logger.error(f"Similarity search failed: {e}")
        return []

def _process_rows(rows, source: str) -> List[dict]:
    """Process database rows into a standard match dictionary."""
    matches = []
    for row in rows:
        cosine_distance = float(row["cosine_distance"])
        # Cosine similarity is 1 - distance
        similarity = float(max(0.0, 1.0 - cosine_distance))
        
        # Proper scaling for ArcFace embedding space (Threshold ~0.40)
        # Shifted the center of the sigmoid to 0.40 with steepness 20.
        confidence = round(100 / (1 + math.exp(20 * (cosine_distance - 0.40))), 2)

        logger.info(f"Match [{row['id']}]: Distance={cosine_distance:.4f}, Confidence={confidence}%")

        matches.append({
            "id": row["id"],
            "name": row["name"],
            "age": row["age"],
            "gender": row["gender"],
            "last_seen_location": row["last_seen_location"],
            "contact_number": row["contact_number"],
            "image_path": row["image_path"],
            "status": row["status"],
            "contact_email": row["contact_email"],
            "created_at": row["created_at"],
            "cosine_distance": cosine_distance,
            "similarity_score": similarity,
            "confidence": confidence,
            "match_source": source
        })
    return matches
