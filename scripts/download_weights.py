"""
download_weights.py – Downloads pre-trained ML model weights for the AI Musical Therapy Platform.

Usage:
    python scripts/download_weights.py

The script downloads model weights from Hugging Face Hub (or a configured URL) and
places them at the expected path: ml/models/face/best_model.pth

Set the environment variable MODEL_WEIGHTS_URL to override the default download source.
"""

import hashlib
import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT_DIR / "ml" / "models" / "face"
MODEL_PATH = MODEL_DIR / "best_model.pth"

# Replace with actual Hugging Face model URL or cloud storage URL once weights are trained.
DEFAULT_MODEL_URL = os.getenv(
    "MODEL_WEIGHTS_URL", "https://huggingface.co/your-org/ai-musical-therapy-face-emotion/resolve/main/best_model.pth"
)

# SHA-256 checksum of the expected weights file (update after first real training run)
EXPECTED_CHECKSUM = os.getenv("MODEL_WEIGHTS_CHECKSUM", "")  # Set this after first training


def download_file(url: str, dest: Path) -> None:
    """Download a file from a URL with progress reporting."""
    try:
        import urllib.request

        def reporthook(block_num, block_size, total_size):
            read_so_far = block_num * block_size
            if total_size > 0:
                percent = read_so_far * 1e2 / total_size
                sys.stdout.write(f"\r  Progress: {percent:.1f}%  ({read_so_far}/{total_size} bytes)")
            else:
                sys.stdout.write(f"\r  Downloaded {read_so_far} bytes")
            sys.stdout.flush()

        print(f"Downloading weights from:\n  {url}")
        dest.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(url, dest, reporthook)
        print()  # Newline after progress
        print(f"Saved to: {dest}")
    except Exception as exc:
        print(f"\n[ERROR] Download failed: {exc}")
        sys.exit(1)


def verify_checksum(path: Path, expected: str) -> bool:
    """Verify SHA-256 checksum of a file."""
    if not expected:
        print("  [WARN] No checksum configured — skipping verification.")
        return True
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    actual = sha256.hexdigest()
    if actual == expected:
        print(f"  [OK] Checksum verified: {actual}")
        return True
    else:
        print("  [FAIL] Checksum mismatch!")
        print(f"    Expected: {expected}")
        print(f"    Got:      {actual}")
        return False


def main():  # noqa: D103
    print("=" * 60)
    print("AI Musical Therapy — Model Weights Downloader")
    print("=" * 60)

    if MODEL_PATH.exists():
        print(f"[INFO] Weights already exist at: {MODEL_PATH}")
        if not verify_checksum(MODEL_PATH, EXPECTED_CHECKSUM):
            print("[WARN] Existing weights failed checksum. Re-downloading...")
        else:
            print("[INFO] Weights are up to date. Nothing to do.")
            return

    download_file(DEFAULT_MODEL_URL, MODEL_PATH)

    if not verify_checksum(MODEL_PATH, EXPECTED_CHECKSUM):
        print("[ERROR] Downloaded weights are corrupted. Removing file.")
        MODEL_PATH.unlink(missing_ok=True)
        sys.exit(1)

    print("\n[SUCCESS] Model weights ready.")
    print(f"  Path: {MODEL_PATH}")


if __name__ == "__main__":
    main()
