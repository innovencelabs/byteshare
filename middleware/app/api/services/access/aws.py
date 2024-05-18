import os

import boto3
import utils.logger as logger
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.credentials import Credentials
from dotenv import load_dotenv
from pydantic import BaseModel
from requests.structures import CaseInsensitiveDict

# Logger instance
log = logger.get_logger()

load_dotenv()


class Options(BaseModel):
    apiURL: str
    method: str
    jwtToken: str


REGION = os.getenv("AWS_API_ACCESS_REGION")
ROLE_ARN = os.getenv("AWS_API_ACCESS_ROLE_ARN")

sts_client = boto3.client(
    "sts",
    region_name=REGION,
    aws_access_key_id=os.getenv("AWS_API_ACCESS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_API_ACCESS_SECRET_ACCESS_KEY"),
)


def post_secured_access_aws_return_header(body: Options):
    FUNCTION_NAME = "post_secured_access_aws_return_header()"
    log.info("Entering {}".format(FUNCTION_NAME))

    access_key, secret_key, session_token = _get_token()
    api_key = os.getenv("AWS_API_KEY")

    headers = CaseInsensitiveDict()
    headers["Content-Type"] = "application/json"
    headers["X-API-Key"] = api_key
    headers["X-Amz-Security-Token"] = session_token
    headers["X-Auth-Token"] = "Bearer " + body.jwtToken

    signed_request = _create_signed_request(
        url=body.apiURL,
        method=body.method,
        headers=headers,
        region=REGION,
        service="execute-api",
        access_key=access_key,
        secret_key=secret_key,
        session_token=session_token,
    )

    signed_headers = dict(signed_request.headers.items())

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"headers": signed_headers}


def _get_token():
    assume_role_response = sts_client.assume_role(
        RoleArn=ROLE_ARN, RoleSessionName="AssumeRoleSession", DurationSeconds=3600
    )

    credentials = assume_role_response["Credentials"]
    access_key = credentials["AccessKeyId"]
    secret_key = credentials["SecretAccessKey"]
    session_token = credentials["SessionToken"]

    return access_key, secret_key, session_token


def _create_signed_request(
    url, method, headers, region, service, access_key, secret_key, session_token
):
    request = AWSRequest(method=method, url=url, headers=headers)
    credentials = Credentials(access_key, secret_key, session_token)
    SigV4Auth(credentials, service, region).add_auth(request)
    return request
