from starlette.testclient import TestClient

from app.main import app, DynamoDBManager, CloudflareR2Manager
from unittest.mock import MagicMock

client = TestClient(app)


def test_health(test_app):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "details": "Service is running"}


def test_subscribe(test_app, mocker):
    mock_db = MagicMock(spec=DynamoDBManager)
    mocker.patch("main.subscriber_dynamodb", mock_db)

    mock_db.create_item.return_value = None

    client = TestClient(app)
    response = client.post("/subscribe", json={"email": "test@example.com"})
    assert response.status_code == 200
    assert response.json() == {"status": "Done"}


# def test_initiate_upload(test_app, mocker):
#     mock_db = MagicMock(spec=DynamoDBManager)
#     mock_storage = MagicMock(spec=CloudflareR2Manager)
#     mocker.patch("main.subscriber_dynamodb", mock_db)
#     mocker.patch("main.storage", mock_storage)
#     mocker.patch("main._authenticate", return_value=None)

#     mock_db.create_item.return_value = None
#     mock_storage.generate_upload_url.return_value = "https://byteshare.io"

#     client = TestClient(app)

#     headers = {
#         "Authorization": "Bearer valid_token",
#         "Content-Type": "application/json",
#         "x-forwarded-for": "127.0.0.1",
#         "File-Length": "1024",
#     }
#     response = client.post(
#         "/initiateUpload",
#         headers=headers,
#         json={
#             "file_name": "abc.txt",
#             "creator_id": "1",
#             "creator_email": "test@example.com",
#             "creator_ip": "127.0.0.1",
#             "share_email_as_source": True,
#         },
#     )
#     assert response.status_code == 200
