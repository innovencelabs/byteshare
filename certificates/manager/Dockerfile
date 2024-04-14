FROM python:3.10-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY cert_manager.py .
CMD ["python", "cert_manager.py"]
