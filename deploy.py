import boto3
import os
import mimetypes

# 1. Configuration
BUCKET_NAME = 'aws-buckettest-first' 
DIRECTORY_TO_UPLOAD = '.' # The dot means "the current folder"

# 2. Initialize the S3 client
s3_client = boto3.client('s3')

def deploy_website():
    print(f"Starting deployment to S3 bucket: {BUCKET_NAME}")
    
    # 3. Walk through all files in your local folder
    for root, dirs, files in os.walk(DIRECTORY_TO_UPLOAD):
        
        # Safety check: Don't upload the virtual environment or git folders!
        if 'venv' in root or '.git' in root:
            continue

        for file in files:
            # Skip the deployment script itself and hidden system files
            if file == 'deploy.py' or file.startswith('.'):
                continue

            # Get the full local path of the file
            local_path = os.path.join(root, file)
            
            # S3 needs a clean path without the './' at the beginning
            s3_key = os.path.relpath(local_path, DIRECTORY_TO_UPLOAD)
            s3_key = s3_key.replace('\\', '/') # Fixes slash directions

            # 4. Guess the MIME type so the browser reads the file correctly
            content_type, _ = mimetypes.guess_type(local_path)
            if content_type is None:
                content_type = 'binary/octet-stream' # Default fallback

            print(f"Uploading {s3_key} (Type: {content_type})...")

            # 5. Upload the file to S3
            s3_client.upload_file(
                local_path,
                BUCKET_NAME,
                s3_key,
                ExtraArgs={'ContentType': content_type}
            )
            
    print("Deployment successful! Your website is live.")

if __name__ == '__main__':
    deploy_website()