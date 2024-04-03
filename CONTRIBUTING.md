<!--  _   _                                                    -->
<!-- | | | | __ _ _ __  _ __  _   _                            -->
<!-- | |_| |/ _` | '_ \| '_ \| | | |                           -->
<!-- |  _  | (_| | |_) | |_) | |_| |                           -->
<!-- |_| |_|\__,_| .__/| .__/ \__, |                           -->
<!--   ____      |_|   |_|    |___/         _   _              -->
<!--  / ___|___  _ __ | |_ _ __| |__  _   _| |_(_)_ __   __ _  -->
<!-- | |   / _ \| '_ \| __| '__| '_ \| | | | __| | '_ \ / _` | -->
<!-- | |__| (_) | | | | |_| |  | |_) | |_| | |_| | | | | (_| | -->
<!--  \____\___/|_| |_|\__|_|  |_.__/ \__,_|\__|_|_| |_|\__, | -->
<!--                                                    |___/  -->


# Contributing to ByteShare.io
Welcome to ByteShare! ❤️

Your contributions are invaluable to our open-source community. Whether you're a seasoned developer or a newcomer, your input is greatly appreciated. Thank you for considering contributing. **Let's build something amazing together**!

## How to get started?
- Before creating a new issue or PR, check if that [Issues](https://github.com/ambujraj/byteshare/issues) or [PRs](https://github.com/ambujraj/byteshare/pulls) already exists.
- Prerequisites
  - Python v3.10
  - Node v20.11
  - Terraform
  - AWS CLI configured with your AWS account
  - [Cloudflare account](https://www.cloudflare.com/)
  - [Appwrite account](https://appwrite.io/)
- Steps to run locally
  1. Fork this repository to your Github account and clone to local machine using **git clone**.
  2. Take a pull from the origin
  ```bash
  git pull
  ```
  3. Create the branch from *master* after creating the Issue like: ***ISSUE_ID-DESCRIPTION***
  ```bash
  git checkout -b [new_branch_name]
  ```
  4. Create resources using terraform
  ```bash
  cd ByteShare/infrastructure/cloud
  cp terraform.tfvars.example terraform.tfvars
  # Add your credentials in terraform.tfvars
  terraform init
  terraform plan
  terraform apply
  cd ../..
  ```
  5. Create your Organisation and Project in Appwrite [TUTORIAL](https://youtu.be/pk92hS_d_ns?t=11&si=emSqp8Mdra_iF-dc)
  6. Install UI dependencies and add .env file
  ```bash
  cd ui
  npm install
  cp .env.example .env
  # Add your credentials in .env
  cd ..
  ```
  7. Install Middleware(Backend) dependencies and add .env file
  ```bash
  cd middleware
  python3 -m venv .venv
  source .venv/bin/activate
  pip3 install -r requirements.txt
  cd app
  cp .env.example .env
  # Add your credentials in .env
  cd ../..
  ```
  8. Run the application
  ```bash
  cd ui
  npm run dev

  --new tab--
  cd middleware/app
  uvicorn main:app --reload
  ```

#### By default, UI runs on port **3000** and Middleware runs on port **8000**

## Submit a Pull Request
Always create an Issue before making any contribution.<br>
Branch can be created from Issue page directly as per the convention

Branch naming convention:<br>
***ISSUE_ID-DESCRIPTION***

Example:
```
106-add-password-support-for-sharing-files
```

**For creating a pull request**:
- After you are done with your changes, push the code and create a pull request for master of the ByteShare repository.
- Get the code reviewed, approved and merged to ***master*** branch.
- Once merged, the CI/CD pipelines will be automatically triggered and the changes will be reflected in the app.

Instructions:<br>
- **All pull requests must include a commit message detailing the changes made.**
- Always take a pull from origin before making any new branch and pushing the code
```bash
git pull
```

## File structure
```
├── ui                      # Frontend application
│   └── src                 # Source code
|       ├── app
│       ├── authentication
│       ├── components
│       ├── conf
|       ├── context
│       └── lib
├── middeware               # Backend application
|       ├── app             # Source code
|       ├── scripts         # Automation scripts
│       └── tests           # Test scripts
└── infrastructure          # Terraform scripts for cloud and local(docker version)
    ├── cloud               # For clouds
    └── local               # For docker containers

```

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
- Resend

