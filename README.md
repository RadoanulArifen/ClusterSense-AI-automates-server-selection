# ClusterSense AI

ClusterSense AI is an infrastructure management demo for hosting providers and
infrastructure administrators. It combines a React dashboard, FastAPI API and
PostgreSQL database with scheduling, failure prediction and cost recommendations.
The interface uses HostNova Cloud as its example brand.

## Features

- Infrastructure overview with node utilization and alerts.
- Administrator order portal and deployment request management.
- ML-assisted node selection and simulated deployments.
- Failure risk estimates, cost suggestions and capacity simulation.
- AI Copilot with an optional Gemini integration and built-in fallback.
- Outcome history, trust indicators and plan comparisons.

All infrastructure APIs require an active administrator. This is a single
administrator workspace, not a multi-tenant customer portal. Deployments and
metrics represent demo infrastructure; the application does not provision real servers.

## Run

Follow [HowToSetup.md](HowToSetup.md) for Docker and Ubuntu/VPS installation,
database initialization, first administrator login and branding changes.
No API key is required for the built-in Copilot fallback.

## Source map

| Path | Purpose |
| --- | --- |
| `frontend/src` | React pages, components, authentication and API client |
| `backend/app` | FastAPI routes, SQLAlchemy models, security and ML inference |
| `backend/data` | Included CSV training inputs and demo trust data |
| `backend/mock` | File-backed demo outcomes and plan comparisons |
| `train_models.py` | Rebuilds all three ML models from included CSVs |
| `database/schema.sql` | PostgreSQL DDL generated from ORM models |
| `database/seed.sql` | Optional repeatable synthetic demo fixtures |
| `deploy` | Nginx reverse proxy configuration |
| `scripts` | Schema export and source ZIP packaging |
| `tests` | Authorization regression checks |

Python 3.11, PostgreSQL 15 and Node.js 22 are the documented setup targets.
Frontend packages are resolved by `frontend/package-lock.json`; Python direct
dependencies are pinned in `backend/requirements.txt`. Transitive Python
packages are not yet locked. A current vulnerability audit remains required
before publishing; this repository does not claim a clean CVE report.

## Screenshots and demo

Screenshots are not yet included. After starting the application, capture the
Dashboard, Smart Scheduling and Predictive Operations pages under `docs/` and
link the images here. A public live demo has not been provisioned. For submission,
provide a reachable HTTPS URL and the separately shared reviewer login, then
verify the full login/order/deployment flow there.

Local web: http://localhost:5173 (native) or http://localhost:8080 (Docker).
Native API reference: http://localhost:8000/docs.

## Source archive

Run `python3 scripts/package_release.py` from the repository root. It creates
`clustersense-ai-source.zip` with source, data, setup files and documentation at
the ZIP root. Models are rebuilt from source. Local `.env`, virtual environments,
node_modules, caches, build output and Git history are excluded by an allowlist,
even when those files are tracked in Git. Inspect the ZIP before uploading.

## License

See [LICENSE-NOTE.md](LICENSE-NOTE.md) for code, dependency and dataset licensing
notes. See [CHANGELOG.md](CHANGELOG.md) for release history.

## One-click reviewer login

The login page includes **Continue as Demo Admin** for the application's only
supported role, administrator. It opens the full dashboard and simulated
order/deployment workflows without entering credentials. Normal administrator
login remains available.

On a **dedicated demo installation** with an isolated PostgreSQL database, set
`DEMO_LOGIN_ENABLED=true` in the backend environment and restart the backend
(or recreate it with `docker compose up -d --build`). Startup provisions a
separate demo administrator with a random, undisclosed password, including when
nodes have already been seeded. Visitors receive a normal bearer token valid
for one hour. No administrator credentials are bundled into the frontend.

Demo visitors share the demo workspace and can change its records; use only
sample data there. The flag defaults to `false`. Setting it back to `false`
disables passwordless login and rejects existing demo sessions on their next
API request. Do not enable it on an installation containing private records.
