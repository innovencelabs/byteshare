import os

import boto3
import utils.logger as logger
from dotenv import load_dotenv
from fastapi import HTTPException
from storage.storage import BaseStorage

load_dotenv()

# Logger instance
log = logger.get_logger()


class CloudflareR2Manager(BaseStorage):
    def __init__(self, bucket_name: str):
        endpoint_url = f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com"
        self.bucket_name = bucket_name
        self.r2 = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
            region_name="auto",
        )

    def health_check(self):
        FUNCTION_NAME = "health_check()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            response = self.r2.list_objects_v2(Bucket=self.bucket_name)
        except Exception as e:
            log.error("EXCEPTION occurred connecting to R2.\nERROR: {}".format(str(e)))
            raise HTTPException(status_code=503, detail="R2 connection failed")

        log.info("Exiting {}".format(FUNCTION_NAME))

    def generate_upload_url(self, file_path: str, expirations_seconds: int):
        FUNCTION_NAME = "generate_upload_url()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            log.info("Exiting {}".format(FUNCTION_NAME))
            return self.r2.generate_presigned_url(
                "put_object",
                Params={"Bucket": self.bucket_name, "Key": file_path},
                ExpiresIn=expirations_seconds,
                HttpMethod="PUT",
            )
        except Exception as e:
            log.error(
                "EXCEPTION occurred genering upload url to R2.\nERROR: {}".format(
                    str(e)
                )
            )
            raise HTTPException(status_code=500, detail=str(e))

    def generate_download_url(self, file_path: str, expirations_seconds: int):
        FUNCTION_NAME = "generate_download_url()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            log.info("Exiting {}".format(FUNCTION_NAME))
            return self.r2.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": file_path},
                ExpiresIn=expirations_seconds,
            )
        except Exception as e:
            log.error(
                "EXCEPTION occurred genering download url to R2.\nERROR: {}".format(
                    str(e)
                )
            )
            raise HTTPException(status_code=500, detail=str(e))

    def upload_file(self, localpath: str, file_path: str):
        FUNCTION_NAME = "upload_file()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            self.r2.upload_file(localpath, self.bucket_name, file_path)
        except Exception as e:
            log.error(
                "EXCEPTION occurred uploading file to R2.\nERROR: {}".format(str(e))
            )
            raise HTTPException(status_code=500, detail=str(e))

        log.info("Exiting {}".format(FUNCTION_NAME))

    def is_file_present(self, file_path: str):
        FUNCTION_NAME = "is_file_present()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            response = self.r2.head_object(Bucket=self.bucket_name, Key=file_path)
        except self.r2.exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "404":
                log.warning(
                    "BAD REQUEST file does not exists: {} in Bucket: {}".format(
                        file_path, self.bucket_name
                    )
                )
                return False
            else:
                log.error(
                    "EXCEPTION occurred in checking availability in R2.\nERROR: {}".format(
                        str(e)
                    )
                )
                raise HTTPException(status_code=500, detail=str(e))

        log.info("Exiting {}".format(FUNCTION_NAME))
        return True

    def get_file_info(self, file_path: str):
        FUNCTION_NAME = "get_file_info()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            response = self.r2.head_object(Bucket=self.bucket_name, Key=file_path)

            file_size = response["ContentLength"]

            log.info("Exiting {}".format(FUNCTION_NAME))
            return file_size
        except Exception as e:
            log.error(
                "EXCEPTION occurred in getting file info in R2.\nERROR: {}".format(
                    str(e)
                )
            )
            raise HTTPException(status_code=500, detail=str(e))
    
    def delete_folder(self, folder_name: str):
        FUNCTION_NAME = "delete_folder()"
        log.info("Entering {}".format(FUNCTION_NAME))

        try:
            response = self.r2.list_objects_v2(Bucket=self.bucket_name, Prefix=folder_name)
            if "Contents" in response:
                for obj in response["Contents"]:
                    self.r2.delete_object(Bucket=self.bucket_name, Key=obj["Key"])
        except Exception as e:
            log.error(
                "EXCEPTION occurred deleting folder in R2.\nERROR: {}".format(
                    str(e)
                )
            )
            raise HTTPException(status_code=500, detail=str(e))

        log.info("Exiting {}".format(FUNCTION_NAME))

    def _get_exact_format(self, file_format):
        return file_format.split("/")[-1]
