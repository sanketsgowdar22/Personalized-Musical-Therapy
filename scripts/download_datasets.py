"""Download FER-2013 and other emotion datasets for training."""

import os
import subprocess
import sys
import zipfile


def download_fer2013(base_path):
    """Download FER-2013 from Kaggle and extract it into datasets/.

    Requires the ``kaggle`` package and a valid API key at
    ``~/.kaggle/kaggle.json``.

    Args:
        base_path: Absolute path to the project root directory.
    """
    print("Downloading FER-2013 dataset...")
    raw_dir = os.path.join(base_path, "datasets", "raw")
    os.makedirs(raw_dir, exist_ok=True)

    zip_path = os.path.join(raw_dir, "fer2013.zip")

    # Check if kaggle CLI is available
    try:
        subprocess.run(
            ["kaggle", "--version"],
            check=True,
            capture_output=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(
            "Error: 'kaggle' CLI not found. "
            "Run 'pip install kaggle' and place your API key at "
            "~/.kaggle/kaggle.json"
        )
        sys.exit(1)

    try:
        # Download dataset using Kaggle CLI
        subprocess.run(
            [
                "kaggle",
                "datasets",
                "download",
                "-d",
                "msambare/fer2013",
                "-p",
                raw_dir,
            ],
            check=True,
        )
        print("Download successful. Extracting...")

        # Extract
        out_dir = os.path.join(base_path, "datasets", "processed", "face")
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(out_dir)

        print("Extraction complete. " "Dataset is ready at datasets/processed/face/")
    except subprocess.CalledProcessError as e:
        print(f"Failed to download dataset: {e}")
        print("Ensure your Kaggle API credentials are correct.")


def main():
    """Entry point: select and download a dataset interactively or via CLI."""
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    print("AI Musical Therapy Platform — Dataset Downloader")
    print("-------------------------------------------------")
    print("1. Face Emotion (FER-2013)")
    print("2. Text Emotion (GoEmotions)  — Coming soon")
    print("3. Voice Emotion (RAVDESS)    — Coming soon")

    # Allow headless execution: python download_datasets.py --all
    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        download_fer2013(base_path)
    else:
        choice = input("\nEnter choice (1/2/3): ")
        if choice == "1":
            download_fer2013(base_path)
        else:
            print("Not implemented yet or invalid choice.")


if __name__ == "__main__":
    main()
