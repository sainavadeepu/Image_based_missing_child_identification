#!/usr/bin/env python3
"""
InsightFace Model Pre-Download Script
Downloads the buffalo_l model (SCRFD face detector + ArcFace recognizer)
to models/.insightface/models/buffalo_l/

Run this once on your host machine before building Docker:
    python models/download_models.py

The docker-compose.yml mounts this directory into the container:
    ./models/.insightface → /root/.insightface
So the container never needs to re-download.
"""
import os
import sys
from pathlib import Path

# Target directory: models/.insightface  (same folder as this script's parent)
INSIGHTFACE_DIR = Path(__file__).parent / ".insightface"


def download_buffalo_l():
    """
    Downloads InsightFace buffalo_l model using the insightface package.
    Files saved to INSIGHTFACE_DIR/models/buffalo_l/
    """
    print("=" * 60)
    print("  InsightFace buffalo_l Model Pre-Downloader")
    print("=" * 60)

    model_dir = INSIGHTFACE_DIR / "models" / "buffalo_l"

    # Check if already downloaded
    expected_files = ["det_10g.onnx", "w600k_r50.onnx"]
    if all((model_dir / f).exists() for f in expected_files):
        print(f"\n✅ Model already downloaded at: {model_dir}")
        for f in expected_files:
            size_mb = (model_dir / f).stat().st_size / (1024 * 1024)
            print(f"   {f}: {size_mb:.1f} MB")
        print("\n🚀 Ready for Docker build — no internet needed at runtime!")
        return True

    print(f"\n📥 Downloading buffalo_l model to: {model_dir}")
    print("   Files: det_10g.onnx (~16 MB), w600k_r50.onnx (~260 MB)")
    print("   This is a one-time download...\n")

    try:
        import insightface
        from insightface.app import FaceAnalysis

        # Set the home directory so InsightFace downloads to our target
        os.environ["INSIGHTFACE_HOME"] = str(INSIGHTFACE_DIR.parent / ".insightface_tmp")

        # Override root path directly
        INSIGHTFACE_DIR.mkdir(parents=True, exist_ok=True)

        # Use insightface's built-in download mechanism
        # It will download to ~/.insightface/models/buffalo_l/ by default
        # We set a custom home
        import insightface.utils.storage as storage
        
        # Patch the model home to our directory
        original_home = os.environ.get("HOME", str(Path.home()))
        
        # Create a symlink-friendly approach: set HOME to point to our models dir parent
        # Actually, easiest: just let it download to default and copy, OR use the env var

        # insightface respects ~/.insightface - we'll set HOME temporarily
        # Better: use the get_model_dir utility
        custom_home = str(INSIGHTFACE_DIR.parent)
        os.environ["HOME"] = custom_home  # Unix
        os.environ["USERPROFILE"] = custom_home  # Windows

        print("Initializing FaceAnalysis with buffalo_l (this triggers download)...")
        face_app = FaceAnalysis(
            name="buffalo_l",
            root=str(INSIGHTFACE_DIR),  # Direct root override
        )
        face_app.prepare(ctx_id=-1)  # CPU

        print(f"\n✅ buffalo_l model downloaded successfully!")

    except Exception as e:
        print(f"\n⚠ Automatic download failed: {e}")
        print("\n📋 Manual download instructions:")
        print("   1. Download from:")
        print("      https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip")
        print(f"   2. Extract to: {model_dir}")
        print(f"      Expected files:")
        for f in expected_files:
            print(f"        - {f}")
        return False

    # Verify files exist
    model_dir = INSIGHTFACE_DIR / "models" / "buffalo_l"
    found = [f for f in expected_files if (model_dir / f).exists()]
    if found:
        print(f"\n✅ Verified {len(found)}/{len(expected_files)} model files:")
        for f in found:
            size_mb = (model_dir / f).stat().st_size / (1024 * 1024)
            print(f"   {f}: {size_mb:.1f} MB")
        return True
    else:
        print(f"\n⚠ Model files not found at expected location: {model_dir}")
        print("   Check if InsightFace downloaded them elsewhere.")
        return False


def check_docker_volume_mount():
    """Verifies the docker-compose volume mount path is correct."""
    print("\n🐳 Docker Volume Mount Check")
    print("-" * 40)
    mount_src = Path(__file__).parent / ".insightface"
    mount_dst = "/root/.insightface"
    print(f"   Host path:      {mount_src}")
    print(f"   Container path: {mount_dst}")

    model_files = list(mount_src.glob("models/**/*.onnx")) if mount_src.exists() else []
    if model_files:
        print(f"   ✅ {len(model_files)} .onnx model file(s) found — ready for Docker!")
    else:
        print("   ⚠ No .onnx files found — run this script to download first.")


if __name__ == "__main__":
    success = download_buffalo_l()
    check_docker_volume_mount()

    print("\n" + "=" * 60)
    if success:
        print("✅ All done! Run: docker-compose up --build")
    else:
        print("❌ Download incomplete. See manual instructions above.")
    print("=" * 60)
