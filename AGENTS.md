# Contributor guide

## Architecture

React/Vite/Tailwind frontend in `frontend/src`; FastAPI routes in
`backend/app/api`; SQLAlchemy entities in `backend/app/models/models.py`;
ML inference in `backend/app/ml/ml_service.py`; demo services in
`backend/app/services`. PostgreSQL is the relational source of truth; outcome
and plan comparison services also use JSON demo fixtures. This is a single
administrator workspace: every infrastructure router must require `require_admin`.
Only login and health/status endpoints are public.

## Conventions

Keep HTTP validation in route/schema modules, shared work in services and
parameterized queries in SQLAlchemy. Do not concatenate user input into SQL.
Use the existing React API client so requests attach bearer tokens. Do not add
customer access to administrator records without an explicit ownership model.
Never commit local environment files, tokens, generated models, dependencies
or build output. Configuration examples contain placeholders only.

## Checks

From the root, with dependencies installed:

```sh
backend/venv/bin/python -m unittest discover -s tests -v
backend/venv/bin/python scripts/export_schema.py
cd frontend && npm run build
```

Use an isolated PostgreSQL database for integration checks; app startup creates
tables and seeds demo data. Never run reset_db.sh against a shared database.
Rebuild models with `backend/venv/bin/python train_models.py`. Do not load
untrusted pickle/joblib artifacts. Generate releases using
`python3 scripts/package_release.py`, not git archive: legacy tracked artifacts
may include local environment/dependency files.
