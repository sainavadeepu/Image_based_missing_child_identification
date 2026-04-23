#!/usr/bin/env python3
"""
Evaluation Script for Face Recognition System
Computes: Accuracy, Precision, Recall, F1, Confusion Matrix

Prerequisite: Run prepare_lfw_sample.py first to generate dataset/data/

Usage:
    # Make sure backend is running (or import services directly)
    python evaluate.py
"""
import sys
import json
import numpy as np
from pathlib import Path
from collections import defaultdict

# Add backend to path so we can use the same services
BACKEND_DIR = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

DATA_DIR = Path(__file__).parent / "data"
REG_DIR = DATA_DIR / "registration"
TEST_DIR = DATA_DIR / "test"
SIMILARITY_THRESHOLD = 0.55


def load_embeddings_for_directory(directory: Path):
    """Generate embeddings for all images in directory tree."""
    import cv2
    from services.face_detection import detect_face
    from services.face_recognition import generate_embedding

    embeddings = {}  # { identity_name: [embedding, ...] }
    for identity_dir in sorted(directory.iterdir()):
        if not identity_dir.is_dir():
            continue
        name = identity_dir.name
        embeddings[name] = []
        for img_path in sorted(identity_dir.glob("*.jpg")):
            image_bytes = img_path.read_bytes()
            face = detect_face(image_bytes)
            if face is None:
                print(f"  ⚠ No face in {img_path.name} — skipping")
                continue
            emb = generate_embedding(face)
            if emb is not None:
                embeddings[name].append(np.array(emb))
    return embeddings


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


def evaluate():
    print("=" * 60)
    print("Face Recognition Evaluation on LFW Samples")
    print("=" * 60)

    if not REG_DIR.exists() or not TEST_DIR.exists():
        print("❌ Dataset not found. Run: python prepare_lfw_sample.py")
        sys.exit(1)

    print("\n📥 Generating registration embeddings...")
    reg_embeddings = load_embeddings_for_directory(REG_DIR)

    print("📥 Generating test embeddings...")
    test_embeddings = load_embeddings_for_directory(TEST_DIR)

    identities = list(reg_embeddings.keys())
    print(f"\n👥 Identities: {identities}")

    # Build a "database" of average embeddings per identity
    db = {}
    for name, embs in reg_embeddings.items():
        if embs:
            db[name] = np.mean(embs, axis=0)

    # Evaluate each test image
    y_true = []
    y_pred = []

    for true_identity in identities:
        for test_emb in test_embeddings.get(true_identity, []):
            best_match = None
            best_sim = -1.0
            for db_name, db_emb in db.items():
                sim = cosine_similarity(test_emb, db_emb)
                if sim > best_sim:
                    best_sim = sim
                    best_match = db_name

            # Predict: match if similarity > threshold
            if best_sim >= (1.0 - SIMILARITY_THRESHOLD):
                predicted = best_match
            else:
                predicted = "UNKNOWN"

            y_true.append(true_identity)
            y_pred.append(predicted)

    # Metrics
    total = len(y_true)
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    accuracy = correct / total if total > 0 else 0.0

    # Per-class precision and recall
    precision_per_class = {}
    recall_per_class = {}
    for cls in identities:
        tp = sum(1 for t, p in zip(y_true, y_pred) if t == cls and p == cls)
        fp = sum(1 for t, p in zip(y_true, y_pred) if t != cls and p == cls)
        fn = sum(1 for t, p in zip(y_true, y_pred) if t == cls and p != cls)
        precision_per_class[cls] = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall_per_class[cls] = tp / (tp + fn) if (tp + fn) > 0 else 0.0

    macro_precision = np.mean(list(precision_per_class.values()))
    macro_recall = np.mean(list(recall_per_class.values()))
    f1 = 2 * macro_precision * macro_recall / (macro_precision + macro_recall) if (macro_precision + macro_recall) > 0 else 0.0

    print("\n" + "=" * 60)
    print("EVALUATION RESULTS")
    print("=" * 60)
    print(f"Total test samples : {total}")
    print(f"Correct predictions: {correct}")
    print(f"\nAccuracy  : {accuracy * 100:.2f}%")
    print(f"Precision : {macro_precision * 100:.2f}% (macro)")
    print(f"Recall    : {macro_recall * 100:.2f}% (macro)")
    print(f"F1 Score  : {f1 * 100:.2f}% (macro)")

    # Confusion matrix
    try:
        from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
        import matplotlib.pyplot as plt
        all_labels = identities + (["UNKNOWN"] if "UNKNOWN" in y_pred else [])
        cm = confusion_matrix(y_true, y_pred, labels=all_labels)
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=all_labels)
        fig, ax = plt.subplots(figsize=(12, 10))
        disp.plot(ax=ax, xticks_rotation=45)
        plt.title("Face Recognition Confusion Matrix — MCIS")
        plt.tight_layout()
        out_path = DATA_DIR / "confusion_matrix.png"
        plt.savefig(out_path, dpi=150)
        print(f"\n📊 Confusion matrix saved to: {out_path}")
        plt.show()
    except ImportError:
        print("\n(Install matplotlib + sklearn for confusion matrix plot)")

    # Save results
    results = {
        "accuracy": round(accuracy * 100, 2),
        "precision": round(macro_precision * 100, 2),
        "recall": round(macro_recall * 100, 2),
        "f1": round(f1 * 100, 2),
        "total_samples": total,
        "similarity_threshold": SIMILARITY_THRESHOLD,
        "per_class": {
            name: {
                "precision": round(precision_per_class[name] * 100, 2),
                "recall": round(recall_per_class[name] * 100, 2),
            }
            for name in identities
        },
    }
    (DATA_DIR / "evaluation_results.json").write_text(json.dumps(results, indent=2))
    print(f"\n✅ Results saved to: {DATA_DIR / 'evaluation_results.json'}")


if __name__ == "__main__":
    evaluate()
