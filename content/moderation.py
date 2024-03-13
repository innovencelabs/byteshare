import pyclamd
import pika
import os
import boto3
from dotenv import load_dotenv
import logger
load_dotenv()


def get_file_stream_from_r2(file_name):
    s3_object = r2.get_object(Bucket=bucket_name, Key=f"{file_name}")
    streaming_data = s3_object["Body"]
    
    return streaming_data


def scan_file(file_stream):
    result = cd.scan_stream(file_stream)

    if result:
        return False

    return True


def scan_upload(ch, method, properties, body):
    try:
        upload_id = str(body.decode("utf-8"))

        files_in_folder = [
            obj["Key"]
            for obj in r2.list_objects(
                Bucket=bucket_name, Prefix=upload_id
            ).get("Contents", [])
        ]
        for file_name in files_in_folder:
            log.info(f"Scanning file: {file_name}")
            file_stream = get_file_stream_from_r2(file_name)
            passed = scan_file(file_stream)
            if(not passed):
                log.info("Failed")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return

        log.info("Passed")

    except Exception as e:
        log.error(str(e))
    finally:
        ch.basic_ack(delivery_tag=method.delivery_tag)


if __name__ == "__main__":
    log = logger.get_logger()

    cd = pyclamd.ClamdNetworkSocket("clamav", 3310)

    endpoint_url = f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com"
    bucket_name = os.getenv("R2_BUCKET_NAME")
    r2 = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
        region_name="auto",
    )

    
    params = pika.URLParameters(os.getenv("RABBITMQ_URL"))

    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=os.getenv("RABBITMQ_QUEUE"))
    channel.basic_consume(
        queue=os.getenv("RABBITMQ_QUEUE"),
        on_message_callback=scan_upload,
        auto_ack=False,
    )
    channel.basic_qos(prefetch_count=2)

    log.info("Content Management Started...")
    channel.start_consuming()
