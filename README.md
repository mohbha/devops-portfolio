# Serverless DevOps Portfolio 🚀

A personal portfolio website built to demonstrate cloud-native hosting, Infrastructure as Code (IaC) principles, and automated deployment using AWS and Python.

**Live Site:** [Mohan Jha's Portfolio](http://aws-buckettest-first.s3-website.eu-north-1.amazonaws.com)

## 🏗️ Architecture & Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (Responsive Design)
* **Cloud Provider:** Amazon Web Services (AWS)
* **Hosting:** Amazon S3 (Static Website Hosting)
* **Automation / Deployment:** Python 3, Boto3 (AWS SDK)
* **Security:** AWS IAM (Strict Least-Privilege Policies)
* **Version Control:** Git & GitHub

## ⚙️ Key DevOps Features

### 1. Automated Boto3 Deployment Pipeline
Instead of manually uploading files via the AWS Management Console, this project utilizes a custom Python script (`deploy.py`) to automate the deployment process. 
* The script scans the local directory and utilizes the `mimetypes` library to dynamically assign the correct `ContentType` to each file (e.g., `text/html`, `text/css`) before uploading.
* It safely ignores local development artifacts like `venv/`, `.git/`, and `.DS_Store`.

### 2. IAM Least Privilege Security
The deployment script runs locally and authenticates using an AWS CLI profile. To ensure maximum security, the IAM user executing the deployment is restricted by a custom inline JSON policy. 
* **Allowed:** `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`
* **Restricted:** The policy is strictly locked to the specific `aws-buckettest-first` bucket ARN, preventing access to any other cloud resources.

## 🚀 How to Run the Deployment

To deploy updates to the website, the following workflow is used:

```bash
# 1. Activate the Python virtual environment
source venv/bin/activate

# 2. Run the deployment script
python deploy.py