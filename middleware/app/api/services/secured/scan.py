from datetime import datetime, timezone

import resend
import utils.logger as logger
from database.db import DynamoDBManager
from fastapi import HTTPException
from pydantic import BaseModel

# Logger instance
log = logger.get_logger()

# DynamoDB
table_name = "byteshare-upload-metadata"
dynamodb = DynamoDBManager(table_name)


class CompleteScan(BaseModel):
    safe: bool


def finalise_scan_return_none(body: CompleteScan, upload_id: str):
    FUNCTION_NAME = "finalise_scan_return_none()"
    log.info("Entering {}".format(FUNCTION_NAME))

    safe = body.safe

    try:
        upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    except Exception as e:
        log.error("EXCEPTION occurred connecting to DB.\nERROR: {}".format(str(e)))
        raise HTTPException(status_code=500, detail="Cannot connect to DB")
    if not upload_metadata:
        log.warning(
            "BAD REQUEST for UploadID: {} ERROR: {}".format(
                upload_id, "Upload ID not valid."
            )
        )
        raise HTTPException(status_code=400, detail="Upload ID not valid")

    if safe:
        time_now = datetime.now(timezone.utc).isoformat()
        keys = {"upload_id": upload_id}
        update_data = {
            "scanned": True,
            "updated_at": time_now,
        }
        dynamodb.update_item(keys, update_data)
    else:
        keys = {"upload_id": upload_id}
        dynamodb.delete_item(keys)

        user_email = upload_metadata["creator_email"]
        params = {
            "from": "ByteShare <security@byteshare.io>",
            "to": [user_email],
            "subject": "Important: Security Alert Regarding Your Uploaded File",
            "html": """
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
    <p>Hey,</p>

    <p style="font-size: 18px;"></p>

    <p>We hope this email finds you well.</p>

    <p>We regret to inform you that upon scanning the upload(Upload ID: {}) you recently uploaded, our system has detected several issues that require immediate attention. As a security measure, we have taken the necessary steps to remove the file from our servers to prevent any potential risks or threats to our system and users.</p>

    <p>We kindly request your cooperation in resolving the identified issues. We understand that this might inconvenience you, and we apologize for any disruption this may cause.</p>
    <p>To ensure the safety and integrity of our platform, we advise you to review the content of the file and address any issues or vulnerabilities it may contain. Once resolved, you are welcome to re-upload the file for further processing.</p>

    <p>If you require any assistance or have any questions regarding this matter, please do not hesitate to contact our support team.</p>
    
    <p>Thank you for your prompt attention to this matter.</p>
    <p>Best regards,<br>
    ByteShare Team</p>

    </body>
    """.format(
                upload_id
            ),
        }

        resend.Emails.send(params)

    log.info("Exiting {}".format(FUNCTION_NAME))
