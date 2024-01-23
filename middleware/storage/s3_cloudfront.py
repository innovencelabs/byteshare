from storage.storage import BaseStorage
from fastapi import HTTPException
import boto3


class S3CloudfrontManager(BaseStorage):
    def __init__(self, bucket_name: str):
        self.bucket_name = bucket_name
        self.s3 = boto3.client("s3")

    def health_check(self):
        try:
            response = self.s3.list_objects_v2(Bucket=self.bucket_name)
        except Exception as e:
            print(f"S3 connection failed: {str(e)}")
            raise HTTPException(status_code=503, detail="S3 connection failed")

    def generate_upload_url(self, file_path: str, expirations_seconds: int):
        try:
            return self.s3.generate_presigned_url(
                "put_object",
                Params={"Bucket": self.bucket_name, "Key": file_path},
                ExpiresIn=expirations_seconds,
                HttpMethod="PUT",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.message)

    def generate_download_url(self, file_path: str, expirations_seconds: int):
        try:
            return self.s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": file_path},
                ExpiresIn=expirations_seconds,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.message)

    def upload_file(self, localpath: str, file_path: str):
        try:
            self.s3.upload_file(localpath, self.bucket_name, file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.message)

    def is_file_present(self, file_path: str):
        try:
            response = self.s3.head_object(Bucket=self.bucket_name, Key=file_path)
        except self.s3.exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "404":
                print(
                    f"File '{file_path}' does not exist in bucket '{self.bucket_name}'"
                )
                return False
            else:
                print("Error in checking availability in S3: " + e)
                raise HTTPException(status_code=500, detail=e.message)

        return True
