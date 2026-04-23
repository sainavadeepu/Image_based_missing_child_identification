import sys
import os
import cv2
import asyncio

# Ensure that we can import backend packages
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import AsyncSessionLocal
from sqlalchemy import select
from models import Child
from services.face_recognition import extract_embeddings

async def backfill():
    print("Starting InsightFace backfill script...")
    async with AsyncSessionLocal() as db:
        # Check all children, regardless of explicit None, just to be safe.
        # But for optimization, we can filter for missing embeddings. However, since we switched from DeepFace to InsightFace, 
        # we need to RE-GENERATE EVERY EMBEDDING because the model is slightly different (even if both are ArcFace, ONNX vs TF might differ).
        result = await db.execute(select(Child))
        children = result.scalars().all()
        
        print(f"Total children in database: {len(children)}")
        
        for child in children:
            print(f"Generating InsightFace embedding for: {child.name}")
            try:
                img_path = child.image_path
                if not img_path or not os.path.exists(img_path):
                    print(f"❌ Image path not found: {img_path}")
                    continue
                
                img = cv2.imread(img_path)
                if img is None:
                    print(f"❌ Failed to read image: {img_path}")
                    continue

                embeddings = extract_embeddings(img)
                
                if len(embeddings) == 0:
                    print(f"❌ No face detected: {child.name}")
                    continue
                
                # Update DB with first embedding (most prominent face)
                child.arcface_embedding = embeddings[0]
                print(f"✅ Success: {child.name}")
                
            except Exception as e:
                print(f"❌ Error on {child.name}: {e}")
                
        await db.commit()
    print("Backfill workflow finished.")

if __name__ == "__main__":
    asyncio.run(backfill())
