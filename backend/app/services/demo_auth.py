"""Explicitly enabled passwordless access for a dedicated demo installation."""
import os

DEMO_EMAIL = 'demo-admin@clustersense.invalid'


def demo_login_enabled():
    return os.getenv('DEMO_LOGIN_ENABLED', 'false').strip().lower() == 'true'
