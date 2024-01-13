# ByteShare

##### File sharing app that can share large files to N number of people

## Highlights
- Large files can be shared seamlessly
- User will get a QR and a sharing link which they can share
- Active link expiry time
- File security
  
## Local Setup
1. Clone the repository
```bash
git clone https://github.com/ambujraj/ByteShare.git
```
2. Install Terraform
3. Configure your AWS account
```bash
aws configure
```
4. Create AWS resource using Terraform
```bash
cd ByteShare
terraform init
terraform plan
terraform apply
```
5. Install UI dependencies
```bash
cd ui
npm install
cd ..
```
6. Install Middleware(Backend) dependencies
```bash
cd middleware
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
cd ..
```
7. Run the application
```bash
cd ui
npm start

--new tab--
cd middleware
uvicorn main:app --reload
```

#### By default, UI runs on port **3000** and Middleware runs on port **8000**

## Tech stack
- 🖥️ **UI**: ReactJS
- ⚙️ **Middleware**: FastAPI
- 💾 **DB**: AWS DynamoDB
- 📦 **Storage**: AWS S3
- 📒 **Logging**: AWS Cloudwatch

## Deployment
- **UI**: Vercel
- **Middleware**: AWS API Gateway and Lambda via SAM deployment
- **CI/CD**: Github actions

## Deployed version
### Frontend - https://byteshare-ui.vercel.app/