from datetime import datetime, timezone

import utils.logger as logger
from database.db import DynamoDBManager
from pydantic import BaseModel

# Logger instance
log = logger.get_logger()

# DynamoDB
subscriber_table_name = "byteshare-subscriber"
subscriber_dynamodb = DynamoDBManager(subscriber_table_name)


class Subscribe(BaseModel):
    email: str


def add_subscriber_return_done(body: Subscribe):
    FUNCTION_NAME = "add_subscriber_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    subscriber = {
        "email": body.email,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    subscriber_dynamodb.create_item(subscriber)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"status": "Done"}
