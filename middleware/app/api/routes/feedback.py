from fastapi import APIRouter
from database.db import DynamoDBManager
from pydantic import BaseModel
import uuid

router = APIRouter()

# DynamoDB
feedback_table_name = "byteshare-feedback"
feedback_dynamodb = DynamoDBManager(feedback_table_name)


class Feedback(BaseModel):
    name: str
    email: str
    message: str


@router.post("/")
def post_feedback_return_none(body: Feedback):
    """
    Add feedback received from users to DB

    Parameters:
    - name: name of the user
    - email: email address of user
    - message: feedback


    Returns:
    - None
    """

    feedback = {
        "feedback_id": uuid.uuid4().hex,
        "email": body.email,
        "name": body.name,
        "message": body.message,
    }
    feedback_dynamodb.create_item(feedback)
