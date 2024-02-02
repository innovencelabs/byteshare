
<h1 align="center">ByteShare</h1>

<p align="center">
    An open-source file sharing app.
</p>
<p align="center">
    <img alt="GitHub License" src="https://img.shields.io/github/license/ambujraj/ByteShare">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/ambujraj/byteShare/deploy-backend.yaml">
    <img alt="GitHub closed pull requests" src="https://img.shields.io/github/issues-pr-closed/ambujraj/ByteShare">
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/t/ambujraj/ByteShare">
    <img alt="Static Badge" src="https://img.shields.io/badge/Pricing-Free-green">
    <img alt="Static Badge" src="https://img.shields.io/badge/Join_Us-Contribute-red">
</p>


## Overview
Meet ByteShare, your go-to platform for seamless and secure file sharing. Designed for simplicity, ByteShare offers easy generation of shareable links and QR codes, making file sharing a breeze. Whether it's a single document or a collection of files, ByteShare streamlines the process, ensuring a user-friendly experience for all.

## Repo Beat
![Alt](https://repobeats.axiom.co/api/embed/2e1732e935eda7db6a2af19f0ac29b6f6aa6fc88.svg "Repobeats analytics image")
  
## Local Setup
1. Clone the repository
```bash
git clone https://github.com/ambujraj/ByteShare.git
cd ByteShare
```
2. Install Terraform
3. Configure your AWS account
```bash
aws configure
```
4. Setup Cloudflare R2
5. Add variable file for terraform and enter your credentials.
```bash
cp terraform.tfvars.example terraform.tfvars
```
6. Create AWS resource using Terraform
```bash
cd ByteShare
terraform init
terraform plan
terraform apply
```
7. Setup your Appwrite account [HERE](https://appwrite.io/)
8. Create your Organisation and Project in Appwrite [TUTORIAL](https://youtu.be/pk92hS_d_ns?t=11&si=emSqp8Mdra_iF-dc)
9. Enable only Magic URL and JWT in Appwrite [SEE WHERE](https://github.com/ambujraj/ByteShare/assets/29935993/7a023290-01ca-43ff-b3a2-0962433ccb75)
10. Install UI dependencies and add .env file
```bash
cd ui
npm install
cp .env.example .env
cd ..
```
11. Fill the values in .env file for backend url and Appwrite creds
12.  Install Middleware(Backend) dependencies and add .env file
```bash
cd middleware
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
cp .env.example .env
cd ..
```
13.   Run the application
```bash
cd ui
npm run dev

--new tab--
cd middleware
uvicorn main:app --reload
```

#### By default, UI runs on port **3000** and Middleware runs on port **8000**

## Architecture
![architecture](https://github.com/ambujraj/ByteShare/assets/29935993/cc41b0e0-4ab4-4f56-b7be-013ae9f14018)


## Built with
- NextJS
- ShadCN (TailwindCSS)
- FastAPI
- AWS DynamoDB
- Cloudflare R2
- AWS Cloudwatch
- Appwrite

## Deployment
- Vercel
- AWS API Gateway and Lambda via SAM deployment
- Github actions

## Deployed version
### Frontend - https://byteshare-ui.vercel.app
