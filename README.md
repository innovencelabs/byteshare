#

<div align="center">
    <img src="https://github.com/ambujraj/ByteShare/assets/29935993/94a01fc5-a75f-4e46-a163-a0443f234da3" alt="logo">
</div>

#

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
5. Setup your Appwrite account [HERE](https://appwrite.io/)
6. Create your Organisation and Project in Appwrite [TUTORIAL](https://youtu.be/pk92hS_d_ns?t=11&si=emSqp8Mdra_iF-dc)
7. Install UI dependencies and add .env file
```bash
cd ui
npm install
cp sample.env .env
cd ..
```
8. Fill the values in .env file for backend url and Appwrite creds
9. Install Middleware(Backend) dependencies and add .env file
```bash
cd middleware
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
cp sample.env .env
cd ..
```
10. Run the application
```bash
cd ui
npm run dev

--new tab--
cd middleware
uvicorn main:app --reload
```

#### By default, UI runs on port **3000** and Middleware runs on port **8000**

## Architecture
![architecture](https://github.com/ambujraj/ByteShare/assets/29935993/24672635-edc3-4cf1-beb8-76a4c3f70001)


## Technologies
- 🖥️ **UI**: NextJS
- ⚙️ **Middleware**: FastAPI
- 💾 **DB**: AWS DynamoDB
- 📦 **Storage**: AWS S3
- 📒 **Logging**: AWS Cloudwatch
- 🔐 **Auth**: Appwrite

## Deployment
- **UI**: Vercel
- **Middleware**: AWS API Gateway and Lambda via SAM deployment
- **CI/CD**: Github actions

## Deployed version
### Frontend - https://byteshare-ui.vercel.app/