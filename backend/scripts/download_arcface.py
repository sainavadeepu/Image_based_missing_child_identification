import os
import shutil
import glob

# Ensure we are wiping out any potential corrupted file
weights_dir_1 = "/root/.deepface/weights"
weights_dir_2 = "/app/models/.deepface/weights"

for d in [weights_dir_1, weights_dir_2]:
    if os.path.exists(d):
        print(f"Directory exists: {d}")
        # explicit remove of h5 files
        files = glob.glob(f"{d}/*.h5")
        for f in files:
            print(f"Removing {f}")
            try:
                os.remove(f)
            except Exception as e:
                print(f"Failed to remove {f}: {e}")

print("Cleared existing corrupted weights. Triggering DeepFace auto-download...")

from deepface import DeepFace
# This will default to downloading to ~/.deepface/weights/ which is /root/.deepface/weights/
DeepFace.build_model("ArcFace")
print("Successfully downloaded ArcFace weights.")
