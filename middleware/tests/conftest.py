import pytest
from starlette.testclient import TestClient
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "app"))

from app.main import app

@pytest.fixture(scope="module")
def test_app():
    client = TestClient(app)
    yield client
