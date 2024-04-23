import boto3
import os
from fastapi import HTTPException
import utils.logger as logger

# Logger instance
log = logger.get_logger()


class DynamoDBManager:
    def __init__(self, table_name):
        self.table_name = table_name
        self.dynamodb = boto3.resource(
            "dynamodb",
            aws_access_key_id=os.getenv("AWS_APP_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("AWS_APP_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_APP_REGION"),
        )
        self.table = self.dynamodb.Table(table_name)

    def health_check(self):
        FUNCTION_NAME = "health_check()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            response = self.table.scan()
            if "Items" not in response:
                log.error(
                    "EXCEPTION occurred connecting to DB.\nERROR: {}".format(
                        "Database connection failed."
                    )
                )
                raise HTTPException(
                    status_code=503, detail="Database connection failed"
                )
        except Exception as e:
            log.error("EXCEPTION occurred connecting to DB.\nERROR: {}".format(str(e)))
            raise HTTPException(status_code=503, detail="Database connection failed")

        log.info("Exiting {}".format(FUNCTION_NAME))

    def create_item(self, item):
        FUNCTION_NAME = "create_item()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            response = self.table.put_item(Item=item)
            log.info("Added to DB.")
        except Exception as e:
            log.error(
                "EXCEPTION occurred adding new row to DB.\nItem: {}\nERROR: {}".format(
                    item, str(e)
                )
            )
            return

        log.info("Exiting {}".format(FUNCTION_NAME))

    def read_item(self, key):
        FUNCTION_NAME = "read_item()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            response = self.table.get_item(Key=key)
            item = response.get("Item")
            if item:
                log.info("Exiting {}".format(FUNCTION_NAME))
                return item
            else:
                log.warning(
                    "BAD REQUEST for Key: {}\nERROR: {}".format(key, "Item not found.")
                )
                return None
        except Exception as e:
            log.error(
                "EXCEPTION occurred in reading row to DB for Key:{}\nERROR: {}".format(
                    key, str(e)
                )
            )

    def read_items(self, key_name, key_value):
        FUNCTION_NAME = "read_items()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            response = self.table.query(
                IndexName="userid-gsi",
                KeyConditionExpression=key_name + " = :key_value",
                ExpressionAttributeValues={":key_value": key_value},
            )
            items = response.get("Items", [])
            if items:
                log.info("Exiting {}".format(FUNCTION_NAME))
                return items
            else:
                log.warning(
                    "BAD REQUEST for Key: {}\nERROR: {}".format(
                        key_name, "Item not found."
                    )
                )
                return []
        except Exception as e:
            log.error(
                "EXCEPTION occurred in reading row to DB for Key:{}\nERROR: {}".format(
                    key_name, str(e)
                )
            )
            print(f"Error: {key_name}={key_value}\nError: {e}")

    def update_item(self, key, update_data):
        FUNCTION_NAME = "update_item()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            update_expression = "SET " + ", ".join(
                [f"#{field} = :{field}" for field in update_data.keys()]
            )
            expression_attribute_values = {
                f":{field}": value for field, value in update_data.items()
            }
            expression_attribute_names = {
                f"#{field}": field for field in update_data.keys()
            }

            response = self.table.update_item(
                Key=key,
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_attribute_values,
                ExpressionAttributeNames=expression_attribute_names,
                ReturnValues="UPDATED_NEW",
            )
            log.info("Updated to DB.")
        except Exception as e:
            log.error(
                "EXCEPTION occurred in updating row to DB for Key:{}\nUpdate Data: {}\nERROR: {}".format(
                    key, update_data, str(e)
                )
            )
        log.info("Exiting {}".format(FUNCTION_NAME))

    def delete_item(self, key):
        FUNCTION_NAME = "delete_item()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            response = self.table.delete_item(Key=key)
            log.info("Deleted from DB.")
        except Exception as e:
            log.error(
                "EXCEPTION occurred in deleting row to DB for Key:{}\nERROR: {}".format(
                    key, str(e)
                )
            )

        log.info("Exiting {}".format(FUNCTION_NAME))
