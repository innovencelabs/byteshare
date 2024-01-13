# ByteShare

### File sharing app that can share large files to N number of people


## Local Setup
1. Clone the repository
```bash
git clone https://github.com/ambujraj/ByteShare.git 
```
2. Install UI dependencies
```bash
cd ui
npm install
cd ..
```
3. Install Middleware(Backend) dependencies
```bash
cd middleware
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
cd ..
```
4. Run the application
```bash
cd ui
npm start

--new tab--
cd middleware
uvicorn main:app --reload
```

### By default, UI runs on port **3000** and Middleware runs on port **8000**