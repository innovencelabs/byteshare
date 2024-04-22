from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.main import api_router
from mangum import Mangum

app = FastAPI()

# CORS (Cross Origin Resource Sharing) (for local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# Create a Handler from FastAPI for lambda.
handler = Mangum(app)
