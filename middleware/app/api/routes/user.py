from fastapi import APIRouter
from database.db import DynamoDBManager
from pydantic import BaseModel, Field
import utils.logger as logger
from dotenv import load_dotenv
import resend
import os

router = APIRouter()

# Logger instance
log = logger.get_logger()

# Load Environment variables
load_dotenv()

# Resend
resend.api_key = str(os.getenv("RESEND_API_KEY"))

# DynamoDB
user_table_name = "byteshare-user"
user_dynamodb = DynamoDBManager(user_table_name)


class AddUser(BaseModel):
    id: str = Field(..., alias="$id")
    name: str
    registration: str
    email: str


@router.post("/")
def webhook_post_user_send_email(body: AddUser):
    """
    Add new user to DB
    sends a welcome email to the user

    Parameters:
    - name: name of the user
    - registration: registeration date
    - email: email address of user

    Returns:
    - Sends a welcome email to the user.
    """
    FUNCTION_NAME = "webhook_post_user_send_email()"
    log.info("Entering {}".format(FUNCTION_NAME))

    user = {
        "user_id": body.id,
        "name": body.name,
        "email": body.email,
        "created_at": body.registration,
    }
    user_dynamodb.create_item(user)

    params = {
        "from": "ByteShare <hello@byteshare.io>",
        "to": [body.email],
        "subject": "Welcome to ByteShare",
        "html": """
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
  <p>Hey {},</p>

  <p style="font-size: 18px;"></p>

  <p>I'm Ambuj, the founder of ByteShare.io, and I'd like to personally thank you for signing up to our service.</p>

  <p>We established ByteShare to make file sharing easy, hassle-free and secure.</p>

  <p>I’d love to hear what you think of our product. Is there anything we should work on or improve? <a href="https://byteshare.io" style="color: #007bff; text-decoration: none;">Let us know</a>.</p>
  <p>You can also <a href="https://github.com/ambujraj/ByteShare" style="color: #007bff; text-decoration: none;">star us on Github</a></p>

  <p>I'm always happy to help and read our customers' suggestions.</p>
  
  <p>Thanks</p>
  <p>Ambuj Raj<br>
  ByteShare.io</p>

</body>
""".format(
            body.name.split(" ")[0]
        ),
    }

    resend.Emails.send(params)

    log.info("Exiting {}".format(FUNCTION_NAME))
