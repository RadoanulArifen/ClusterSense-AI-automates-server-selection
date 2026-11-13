"""Demo authentication checks use a mocked session; no database is contacted."""
import os
import unittest
from unittest.mock import Mock, patch
from test_authorization import app
from fastapi import HTTPException
from app.api.auth import demo_options, demo_login, get_current_user
from app.models.models import User
from app.security import decode_token
from app.services.demo_auth import DEMO_EMAIL


class DemoLoginTests(unittest.TestCase):
    def setUp(self):
        self.db = Mock()
        self.user = User(id=42, email=DEMO_EMAIL, full_name='Demo Administrator', role='admin', is_active=True)
        self.db.query.return_value.filter.return_value.first.return_value = self.user

    def test_disabled_by_default(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(demo_options(), {'enabled': False, 'roles': []})
            with self.assertRaises(HTTPException) as caught:
                demo_login(self.db)
            self.assertEqual(caught.exception.status_code, 403)
        self.db.query.assert_not_called()

    def test_one_click_admin_login_and_session_revocation(self):
        with patch.dict(os.environ, {'DEMO_LOGIN_ENABLED': 'true'}):
            self.assertEqual(demo_options()['roles'], ['admin'])
            data = demo_login(self.db)
            self.assertEqual(data['user']['role'], 'admin')
            self.assertNotIn('hashed_password', data['user'])
            claims = decode_token(data['access_token'])
            self.assertEqual(claims['sub'], DEMO_EMAIL)
            self.assertTrue(claims['demo'])
            self.assertIs(get_current_user(data['access_token'], self.db), self.user)
        with patch.dict(os.environ, {'DEMO_LOGIN_ENABLED': 'false'}):
            with self.assertRaises(HTTPException) as caught:
                get_current_user(data['access_token'], self.db)
            self.assertEqual(caught.exception.status_code, 401)

    def test_unavailable_inactive_or_wrong_role_account_rejected(self):
        with patch.dict(os.environ, {'DEMO_LOGIN_ENABLED': 'true'}):
            for user in [None, User(role='viewer', is_active=True), User(role='admin', is_active=False)]:
                self.db.query.return_value.filter.return_value.first.return_value = user
                with self.assertRaises(HTTPException) as caught:
                    demo_login(self.db)
                self.assertEqual(caught.exception.status_code, 503)
