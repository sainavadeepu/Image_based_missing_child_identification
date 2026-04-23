#!/usr/bin/env python3
"""
Dataset Preparation Script
Prepares LFW (Labeled Faces in the Wild) samples for system evaluation.

Usage:
    pip install scikit-learn requests sklearn matplotlib seaborn
    python prepare_lfw_sample.py
"""
import os
import json
import shutil
from pathlib import Path
import numpy as np

try:
    from sklearn.datasets import fetch_lfw_people
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Install scikit-learn: pip install scikit-learn")


from PIL import Image

OUTPUT_DIR = Path(__file__).parent / "data"
REGISTRATION_DIR = OUTPUT_DIR / "registration"
TEST_DIR = OUTPUT_DIR / "test"
N_IDENTITIES = 10
MIN_IMAGES = 4  # Need at least 2 for registration + 2 for testing


def prepare_lfw_dataset():
    print("=" * 60)
    print("LFW Dataset Preparation")
    print("=" * 60)

    if not SKLEARN_AVAILABLE:
        print("❌ scikit-learn is required. Install it with: pip install scikit-learn")
        return

    print("\n📥 Downloading LFW dataset (first run may take a few minutes)...")
    lfw = fetch_lfw_people(
        min_faces_per_person=MIN_IMAGES,
        resize=0.5,
        color=True,
        download_if_missing=True,
    )

    print(f"✅ LFW loaded: {lfw.images.shape[0]} images, {len(lfw.target_names)} identities")

    # Select N_IDENTITIES with most images
    from collections import Counter
    counts = Counter(lfw.target)
    top_identities = [idx for idx, _ in counts.most_common(N_IDENTITIES)]
    identity_names = [lfw.target_names[i] for i in top_identities]

    print(f"\n👥 Selected {N_IDENTITIES} identities:")
    for name in identity_names:
        count = counts[identity_names.index(name) if name in identity_names else 0]
        print(f"   - {name} ({count} images)")

    # Create output directories
    for identity in identity_names:
        (REGISTRATION_DIR / identity.replace(" ", "_")).mkdir(parents=True, exist_ok=True)
        (TEST_DIR / identity.replace(" ", "_")).mkdir(parents=True, exist_ok=True)

    # Save images
    from PIL import Image
    split_info = []
    saved = 0

    for idx in top_identities:
        mask = lfw.target == idx
        images = lfw.images[mask]
        name = lfw.target_names[idx]
        safe_name = name.replace(" ", "_")

        # Split: first half for registration, second half for testing
        mid = max(1, len(images) // 2)
        reg_imgs = images[:mid]
        test_imgs = images[mid:]

        for i, img_array in enumerate(reg_imgs):
            img = Image.fromarray((img_array * 255).astype(np.uint8))
            path = REGISTRATION_DIR / safe_name / f"reg_{i:03d}.jpg"
            img.save(path)
            saved += 1

        for i, img_array in enumerate(test_imgs):
            img = Image.fromarray((img_array * 255).astype(np.uint8))
            path = TEST_DIR / safe_name / f"test_{i:03d}.jpg"
            img.save(path)
            saved += 1

        split_info.append({
            "name": name,
            "registration_count": len(reg_imgs),
            "test_count": len(test_imgs),
        })

    # Save metadata
    meta = {
        "dataset": "LFW (Labeled Faces in the Wild)",
        "n_identities": N_IDENTITIES,
        "identities": split_info,
        "registration_dir": str(REGISTRATION_DIR),
        "test_dir": str(TEST_DIR),
    }
    (OUTPUT_DIR / "metadata.json").write_text(json.dumps(meta, indent=2))

    print(f"\n✅ Saved {saved} images to {OUTPUT_DIR}")
    print(f"   Registration: {REGISTRATION_DIR}")
    print(f"   Testing:      {TEST_DIR}")
    print(f"   Metadata:     {OUTPUT_DIR / 'metadata.json'}")
    print("\n▶  Next: run `python evaluate.py` to measure accuracy")


if __name__ == "__main__":
    prepare_lfw_dataset()
