#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env
python3.11 -m venv backend/venv
backend/venv/bin/python -m pip install -r backend/requirements.txt
backend/venv/bin/python train_models.py
(cd frontend && npm ci && npm run build)
printf '%s\n' 'Dependencies installed. Configure backend/.env and PostgreSQL using HowToSetup.md, then run bash start.sh.'
