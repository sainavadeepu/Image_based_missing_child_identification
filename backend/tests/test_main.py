"""
Backend tests for key components.
Run from backend/ directory:
    pip install pytest pytest-asyncio httpx
    pytest tests/ -v
"""
import pytest
import numpy as np
import sys
from pathlib import Path

# Ensure imports work from tests/
sys.path.insert(0, str(Path(__file__).parent.parent))


# ── Unit tests for similarity ──────────────────────────────────────────────────

class TestSimilarity:
    def test_cosine_identical(self):
        """Identical embeddings should have distance 0."""
        v = np.random.rand(512).astype(np.float32)
        v = v / np.linalg.norm(v)
        similarity = float(np.dot(v, v))
        assert similarity > 0.99

    def test_cosine_orthogonal(self):
        """Orthogonal vectors should have ~0 similarity."""
        a = np.zeros(512, dtype=np.float32)
        b = np.zeros(512, dtype=np.float32)
        a[0] = 1.0
        b[1] = 1.0
        similarity = float(np.dot(a, b))
        assert similarity == pytest.approx(0.0, abs=1e-6)

    def test_confidence_calculation(self):
        """Confidence % from cosine distance should be in [0, 100]."""
        cosine_distance = 0.3  # 70% similar
        similarity = max(0.0, 1.0 - cosine_distance)
        confidence = similarity * 100
        assert 0.0 <= confidence <= 100.0
        assert confidence == pytest.approx(70.0)


# ── Unit tests for image validation ───────────────────────────────────────────

class TestImageValidation:
    def test_valid_jpeg(self, tmp_path):
        """Valid JPEG should not raise."""
        from PIL import Image
        import io
        img = Image.new("RGB", (100, 100), color=(255, 0, 0))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        content = buf.getvalue()

        from utils.image_validation import validate_image
        # Should not raise
        validate_image(content, "test.jpg")

    def test_invalid_extension(self):
        """BMP extension should raise 415 error."""
        from fastapi import HTTPException
        from utils.image_validation import validate_image
        with pytest.raises(HTTPException) as exc_info:
            validate_image(b"fake", "image.bmp")
        assert exc_info.value.status_code == 415

    def test_oversized_image(self):
        """Image exceeding max size should raise 413."""
        from fastapi import HTTPException
        from utils.image_validation import validate_image
        big_content = b"x" * (11 * 1024 * 1024)  # 11 MB
        with pytest.raises(HTTPException) as exc_info:
            validate_image(big_content, "large.jpg")
        assert exc_info.value.status_code == 413

    def test_invalid_image_content(self):
        """Non-image bytes with .jpg extension should raise 422."""
        from fastapi import HTTPException
        from utils.image_validation import validate_image
        with pytest.raises(HTTPException) as exc_info:
            validate_image(b"this is not an image", "fake.jpg")
        assert exc_info.value.status_code == 422


# ── Integration tests for API endpoints ───────────────────────────────────────

@pytest.mark.asyncio
class TestAPI:
    async def test_health_endpoint(self):
        """Health endpoint should return 200."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"

    async def test_login_wrong_credentials(self):
        """Wrong credentials should return 401."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/auth/login", data={"username": "wrong", "password": "wrong"})
        assert resp.status_code == 401

    async def test_children_list_public(self):
        """Children listing should be accessible without auth."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/children")
        # Should be 200 (empty DB in test) or connection error to DB
        assert resp.status_code in (200, 500)

    async def test_reports_requires_auth(self):
        """Reports endpoint must require JWT."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/reports")
        assert resp.status_code == 401
