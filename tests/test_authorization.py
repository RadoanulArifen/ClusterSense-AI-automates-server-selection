"""Authorization checks use dependency overrides; no production DB is contacted."""
import os
import asyncio
import httpx
import sys
import unittest
from pathlib import Path
os.environ['DATABASE_URL'] = 'postgresql://placeholder:placeholder@localhost/placeholder'
os.environ['SECRET_KEY'] = 'test-only-signing-value-that-is-at-least-32-characters'
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from fastapi import HTTPException
from app.main import app
from app.api.auth import get_current_user, require_admin
from app.models.models import User


def request(method, path, **kwargs):
    async def run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.request(method, path, **kwargs)
    return asyncio.run(run())


class AuthorizationTests(unittest.TestCase):
    def tearDown(self):
        app.dependency_overrides.clear()

    def test_every_infrastructure_endpoint_requires_admin(self):
        public = {'/api/auth/login', '/api/auth/me'}
        paths = [r for r in app.routes if r.path.startswith('/api/') and r.path not in public]
        self.assertTrue(paths)
        for route in paths:
            self.assertIn(require_admin, [d.call for d in route.dependant.dependencies], route.path)

    def test_anonymous_requests_rejected(self):
        # No context manager: avoid startup seeding and database connections.
        for method, path, body in [
            ('GET', '/api/nodes/', None),
            ('POST', '/api/deployment-requests/', {}),
            ('POST', '/api/deployments/deploy', {}),
            ('PATCH', '/api/alerts/example/acknowledge', None),
        ]:
            response = request(method, path, json=body)
            self.assertEqual(response.status_code, 401, path)

    def test_non_admin_rejected(self):
        async def viewer():
            return User(role='viewer', is_active=True)
        app.dependency_overrides[get_current_user] = viewer
        response = request('GET', '/api/nodes/')
        self.assertEqual(response.status_code, 403)

    def test_admin_dependency_accepts_admin(self):
        user = User(role='admin', is_active=True)
        self.assertIs(asyncio.run(require_admin(user)), user)

    def test_viewer_dependency_rejected(self):
        with self.assertRaises(HTTPException) as caught:
            asyncio.run(require_admin(User(role='viewer', is_active=True)))
        self.assertEqual(caught.exception.status_code, 403)


if __name__ == '__main__':
    unittest.main()
