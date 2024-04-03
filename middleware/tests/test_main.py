from starlette.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health(test_app):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "details": "Service is running"}