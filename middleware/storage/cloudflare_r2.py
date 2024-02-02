from storage.storage import BaseStorage
from fastapi import HTTPException
from dotenv import load_dotenv
import boto3
import os

load_dotenv()


class CloudflareR2Manager(BaseStorage):
    def __init__(self, bucket_name: str):
        endpoint_url = f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com"
        self.bucket_name = bucket_name
        self.r2 = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
            region_name="auto"
        )

    def health_check(self):
        try:
            response = self.r2.list_objects_v2(Bucket=self.bucket_name)
        except Exception as e:
            print(f"R2 connection failed: {str(e)}")
            raise HTTPException(status_code=503, detail="R2 connection failed")

    def generate_upload_url(self, file_path: str, expirations_seconds: int):
        try:
            return self.r2.generate_presigned_url(
                "put_object",
                Params={"Bucket": self.bucket_name, "Key": file_path},
                ExpiresIn=expirations_seconds,
                HttpMethod="PUT",
            )
        except Exception as e:
            print("Generate upload url failed: " + str(e))
            raise HTTPException(status_code=500, detail=str(e))

    def generate_download_url(self, file_path: str, expirations_seconds: int):
        try:
            return self.r2.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": file_path},
                ExpiresIn=expirations_seconds,
            )
        except Exception as e:
            print("Generate download url failed: " + str(e))
            raise HTTPException(status_code=500, detail=str(e))

    def upload_file(self, localpath: str, file_path: str):
        try:
            self.r2.upload_file(localpath, self.bucket_name, file_path)
        except Exception as e:
            print("Upload file failed: " + str(e))
            raise HTTPException(status_code=500, detail=str(e))

    def is_file_present(self, file_path: str):
        try:
            response = self.r2.head_object(Bucket=self.bucket_name, Key=file_path)
        except self.r2.exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "404":
                print(
                    f"File '{file_path}' does not exist in bucket '{self.bucket_name}'"
                )
                return False
            else:
                print("Error in checking availability in R2: " + str(e))
                raise HTTPException(status_code=500, detail=str(e))

        return True

    def get_file_info(self, file_path: str):
        try:
            response = self.r2.head_object(Bucket=self.bucket_name, Key=file_path)

            file_size = response["ContentLength"]

            return file_size
        except Exception as e:
            print("Error in getting file info in R2: " + str(e))
            raise HTTPException(status_code=500, detail=str(e))

    def _get_exact_format(self, file_format):
        return file_format.split("/")[-1]
