import boto3
from fastapi import HTTPException


class DynamoDBManager:
    def __init__(self, table_name):
        self.table_name = table_name
        self.dynamodb = boto3.resource("dynamodb")
        self.table = self.dynamodb.Table(table_name)

    def health_check(self):
        try:
            response = self.table.scan()

            if "Items" not in response:
                raise HTTPException(
                    status_code=503, detail="Database connection failed"
                )
        except Exception as e:
            print(f"Database connection failed: {str(e)}")
            raise HTTPException(status_code=503, detail="Database connection failed")

    def create_item(self, item):
        try:
            response = self.table.put_item(Item=item)
            print(f"Item created successfully: {response}")
        except Exception as e:
            print(f"Error in adding new row for item: {item}\nError: {e}")

    def read_item(self, key):
        try:
            response = self.table.get_item(Key=key)
            item = response.get("Item")
            if item:
                return item
            else:
                print("Item not found.")
                return None
        except Exception as e:
            print(f"Error in reading row for key: {key}\nError: {e}")

    def read_items(self, key_name, key_value):
        try:
            response = self.table.query(
                IndexName="userid-gsi",
                KeyConditionExpression=key_name + " = :key_value",
                ExpressionAttributeValues={":key_value": key_value},
            )
            items = response.get("Items", [])
            if items:
                return items
            else:
                print("Items not found.")
                return []
        except Exception as e:
            print(f"Error: {key_name}={key_value}\nError: {e}")

    def update_item(self, key, update_data):
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
            print(f"Item updated successfully: {response}")
        except Exception as e:
            print(
                f"Error in updating row for key: {key} and update_date: {update_data}\nError: {e}"
            )

    def delete_item(self, key):
        try:
            response = self.table.delete_item(Key=key)
            print(f"Item deleted successfully: {response}")
        except Exception as e:
            print(f"Error in deleting row for key {key}\nError: {e}")
