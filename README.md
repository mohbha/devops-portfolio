# Serverless DevOps Portfolio 🚀

A personal portfolio website built to demonstrate cloud-native hosting, Infrastructure as Code (IaC) principles, and an automated CI/CD deployment pipeline using AWS, Python, and GitHub Actions.

**Live Site:** [Mohan Jha's Portfolio](https://d84o05v9b2k31.cloudfront.net)

## 🏗️ Architecture & Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (Responsive Design)
* **Cloud Provider:** Amazon Web Services (AWS)
* **Storage:** Amazon S3 (Private Bucket)
* **Content Delivery Network (CDN):** AWS CloudFront (Global edge caching & HTTPS)
* **CI/CD Pipeline:** GitHub Actions
* **Deployment Automation:** Python 3, Boto3 (AWS SDK)
* **Security:** AWS IAM (Least-Privilege), CloudFront Origin Access Control (OAC)

## ⚙️ Key DevOps Features

### 1. Fully Automated CI/CD Pipeline (GitHub Actions)
Deployments are entirely hands-off. Pushing code to the `main` branch automatically triggers a GitHub Actions workflow (`deploy.yml`). 
* The pipeline spins up an Ubuntu runner, sets up Python 3.11, configures AWS credentials, and executes the deployment script.

### 2. Global CDN & Automated Cache Invalidation
The website is served globally via **AWS CloudFront** for low-latency delivery and SSL/TLS encryption (`https://`). 
* As the final step in the CI/CD pipeline, GitHub Actions securely triggers a CloudFront cache invalidation, ensuring edge locations worldwide instantly serve the latest code updates without manual intervention.

### 3. Python/Boto3 Deployment Logic
The heavy lifting of the deployment is handled by a custom `deploy.py` script executed by the pipeline.
* It utilizes the `mimetypes` library to dynamically assign the correct `ContentType` to each file before uploading them to S3.
* It intelligently ignores development artifacts to keep the cloud storage clean.

### 4. Zero-Trust Security Model
The architecture follows strict security best practices:
* **S3 Public Access Blocked:** The S3 bucket is completely locked down from the public internet. It only allows traffic from the specific CloudFront distribution using Origin Access Control (OAC).
* **IAM Least Privilege:** The GitHub Actions IAM user is restricted to specific `s3:PutObject` actions and the `cloudfront:CreateInvalidation` permission necessary for the pipeline.

## 🚀 How to Deploy

Because of the CI/CD pipeline, deploying updates is incredibly simple. Manual execution is no longer required.

```bash
# 1. Stage your changes
git add .

# 2. Commit the updates
git commit -m "feat: added new portfolio project"

# 3. Push to trigger the automated deployment pipeline
git push origin main