import uuid

import utils.logger as logger
from database.db import DynamoDBManager
from pydantic import BaseModel

# Logger instance
log = logger.get_logger()

# DynamoDB
feedback_table_name = "byteshare-feedback"
feedback_dynamodb = DynamoDBManager(feedback_table_name)


class Feedback(BaseModel):
    name: str
    email: str
    message: str


def post_feedback_return_none(body: Feedback):
    FUNCTION_NAME = "post_feedback_return_none()"
    log.info("Entering {}".format(FUNCTION_NAME))

    feedback = {
        "feedback_id": uuid.uuid4().hex,
        "email": body.email,
        "name": body.name,
        "message": body.message,
    }
    feedback_dynamodb.create_item(feedback)

    log.info("Exiting {}".format(FUNCTION_NAME))
