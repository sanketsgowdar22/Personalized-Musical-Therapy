import os
import zipfile
import subprocess
import sys

def download_fer2013(base_path):
    """
    Downloads FER-2013 from Kaggle using the Kaggle API.
    Requires kaggle package and ~/.kaggle/kaggle.json credentials.
    """
    print("Downloading FER-2013 dataset...")
    raw_dir = os.path.join(base_path, 'datasets', 'raw')
    os.makedirs(raw_dir, exist_ok=True)
    
    zip_path = os.path.join(raw_dir, 'fer2013.zip')
    
    # Check if kaggle is installed
    try:
        import kaggle
    except ImportError:
        print("Error: 'kaggle' package is not installed. Please run 'pip install kaggle'.")
        print("You also need to have your Kaggle API key at ~/.kaggle/kaggle.json")
        sys.exit(1)
        
    try:
        # Download dataset using Kaggle API
        subprocess.run(['kaggle', 'datasets', 'download', '-d', 'msambare/fer2013', '-p', raw_dir], check=True)
        print("Download successful. Extracting...")
        
        # Extract
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(os.path.join(base_path, 'datasets', 'processed', 'face'))
            
        print("Extraction complete. Dataset is ready at datasets/processed/face/")
    except subprocess.CalledProcessError as e:
        print(f"Failed to download dataset: {e}")
        print("Please ensure your Kaggle API credentials are correct.")

def main():
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    print("AI Musical Therapy Platform - Dataset Downloader")
    print("------------------------------------------------")
    print("1. Face Emotion (FER-2013)")
    print("2. Text Emotion (GoEmotions) - Coming soon")
    print("3. Voice Emotion (RAVDESS) - Coming soon")
    
    # For automated execution in CI/CD or setup scripts
    if len(sys.argv) > 1 and sys.argv[1] == '--all':
        download_fer2013(base_path)
    else:
        choice = input("\nEnter choice (1/2/3): ")
        if choice == '1':
            download_fer2013(base_path)
        else:
            print("Not implemented yet or invalid choice.")

if __name__ == "__main__":
    main()
