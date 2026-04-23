import cv2
import numpy as np
import sys
import os

# Ensure backend imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.face_recognition import extract_embeddings
from services.similarity import find_similar_children_hybrid
from database import AsyncSessionLocal
import asyncio

def cosine_distance(a, b):
    # a and b are lists of floats
    a_arr = np.array(a)
    b_arr = np.array(b)
    return 1 - np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr))

async def test_search():
    # Grab two images from uploads (or queries)
    import glob
    uploads = glob.glob("/app/uploads/*.*")
    if not uploads:
        print("No images found for testing.")
        return
        
    img_path = uploads[0]
    print(f"Testing with image: {img_path}")
    img = cv2.imread(img_path)
    if img is None:
        print(f"Failed to read {img_path}")
        return
        
    embeddings = extract_embeddings(img)
    if not embeddings:
        print("No face detected in test image.")
        return
        
    query_emb = embeddings[0]
    
    async with AsyncSessionLocal() as db:
        matches = await find_similar_children_hybrid(db, query_emb, top_k=5)
        print("\n--- DB Match Results ---")
        for m in matches:
            print(f"Name: {m['name']} | Distance: {m['cosine_distance']:.4f} | Confidence: {m['confidence']}%")

if __name__ == "__main__":
    asyncio.run(test_search())
