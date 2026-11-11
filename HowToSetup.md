# ClusterSense AI setup

Run commands from the extracted project root unless another directory is shown.
Two targets are supported: Docker Compose and an Ubuntu VPS/native installation.
Use Python 3.11, Node.js 22, PostgreSQL 15, or Docker Engine with Compose v2.
Internet access is needed to download dependencies and container base images.

## 1. Docker Compose

1. Copy the root environment template:

   ```sh
   cp .env.example .env
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

2. Edit `.env`. Replace `SECRET_KEY` with the generated value, set a unique
   `ADMIN_PASSWORD` of at least 12 characters and your `ADMIN_EMAIL`. Set
   `POSTGRES_PASSWORD` to a randomly generated alphanumeric value. Compose builds
   `DATABASE_URL` using the PostgreSQL variables; its root template value is for
   native use. Alphanumeric passwords avoid URL interpolation/encoding issues.
   Leave `GEMINI_API_KEY` blank unless you have your own optional key.

3. Build and start:

   ```sh
   docker compose up --build -d
   docker compose ps
   docker compose logs backend
   curl -f http://localhost:8080/health
   ```

   Model training occurs during the backend image build and can take several
   minutes. PostgreSQL data persists in a named volume. The backend creates all
   nine tables and seeds the first administrator, 20 nodes, metrics, requests
   and alerts on first startup. Do not launch multiple seed workers concurrently.

4. Open http://localhost:8080/login and use your configured administrator login.
   For a remote VPS use an SSH tunnel:

   ```sh
   ssh -L 8080:127.0.0.1:8080 your-user@your-vps
   ```

5. Stop with `docker compose down`. Do not add `-v` unless intentionally deleting
   the database. Changing PostgreSQL initialization variables does not change
   existing volume passwords. Changing `ADMIN_PASSWORD` does not reset an existing
   account; those variables provision a new, empty users table only.

## 2. Ubuntu VPS / native installation

1. Install PostgreSQL 15, Python 3.11 with its venv module, Node.js 22 and npm
   using your OS's supported packages. Start PostgreSQL. Create a database user:

   ```sh
   sudo -u postgres createuser --pwprompt clustersense
   sudo -u postgres createdb --owner=clustersense clustersense_db
   ```

   Enter a unique database password at the prompt. Do not reuse a public demo
   password or put credentials into shell history.

2. Create configuration before starting:

   ```sh
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

   Edit `backend/.env`: set `DATABASE_URL` to your PostgreSQL connection, set
   `SECRET_KEY` to the generated value and supply `ADMIN_EMAIL` and a unique
   `ADMIN_PASSWORD` (12+ characters). URL-encode special characters in the database
   connection password. `CORS_ORIGINS` must list your exact browser origins.
   `POSTGRES_*` and `WEB_PORT` variables are only used by Compose.
   Keep `frontend/.env`'s `VITE_API_URL` blank for the Vite `/api` proxy.
   Frontend environment variables are public; never put secrets in them.

3. Restore dependencies, train models and build the frontend:

   ```sh
   bash setup.sh
   ```

   This preserves existing configuration/virtual environments, uses `npm ci`
   with the committed lockfile, and regenerates models from included CSVs.

4. Start locally:

   ```sh
   bash start.sh
   ```

   Open http://localhost:5173/login. API docs: http://localhost:8000/docs.
   Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env`.
   To stop, use Ctrl+C or `bash stop.sh`. Startup logs are in
   `/tmp/clustersense_backend.log` and `/tmp/clustersense_frontend.log`.

5. For a persistent VPS deployment, run the backend under a process manager as
   a dedicated unprivileged user, from the absolute `backend` directory:

   ```sh
   /absolute/project/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

   Serve `frontend/dist` using Nginx, use `try_files $uri $uri/ /index.html` for
   React navigation, and proxy `/api/` and `/health` to `http://127.0.0.1:8000`.
   `deploy/nginx.conf` is the Docker equivalent; change its upstream from
   `backend:8000` to `127.0.0.1:8000` for native hosting. Configure your DNS,
   trusted TLS certificate, HTTPS listener and HTTP-to-HTTPS redirect. Run the
   backend through systemd or your existing process manager with automatic
   restart. Expose only the reverse proxy publicly, keeping database/API private.
   Do not use the Vite development server as the public production server.

## Database scripts and demo data

Normal startup uses the ORM schema and Python seeder; no SQL import is needed.
For an explicit SQL restore on an **empty database**, use:

```sh
psql -h localhost -U clustersense -d clustersense_db -W -v ON_ERROR_STOP=1 -f database/schema.sql
psql -h localhost -U clustersense -d clustersense_db -W -v ON_ERROR_STOP=1 -f database/seed.sql
```

Then start the backend. It provisions the administrator from environment values
and preserves the SQL fixtures. This alternative contains 20 nodes and one
pending request; the default Python seeder adds richer historical demo data.
`seed.sql` can be repeated safely; `schema.sql` targets an empty database and is
not an incremental migration. For future schema changes, introduce versioned
migrations. Regenerate the schema after changing models:

```sh
backend/venv/bin/python scripts/export_schema.py
```

`reset_db.sh` is an interactive destructive local-development helper for the
hardcoded `clustersense_db` database. Do not run it against an existing deployment.
Back up the database before upgrades. File-backed outcome/plan demo data in
`backend/mock` is not a database migration or production audit trail.

## First login and reviewer walkthrough

1. Sign in using the administrator configured at setup.
2. Open the order portal, submit a request and find it in Incoming Requests.
3. Run Smart Scheduling, choose a node and execute a simulated deployment.
4. Check the dashboard, predictions, cost suggestions, Copilot and simulator.
5. Confirm a request without a token returns 401 and a non-admin token returns
   403 for infrastructure APIs. Customer/non-admin use is not supported.

## Branding

Update page text in `frontend/src/pages/Landing.jsx`, `Login.jsx` and the layout
components in `frontend/src/components/layout`. Change colors in
`frontend/tailwind.config.js` and `frontend/src/index.css`, title in
`frontend/index.html`, icons in `frontend/public`, and API title in
`backend/app/main.py`. Search `HostNova` across source for remaining demo labels.
Rebuild with `cd frontend && npm run build` or rebuild the Compose images.

## Verification and release

```sh
backend/venv/bin/python -m unittest discover -s tests -v
cd frontend
npm run build
npm audit --omit=dev
cd ..
python3 scripts/package_release.py
```

Also audit Python dependencies using your security scanner (for example
`pip-audit -r backend/requirements.txt` in an isolated audit environment).
Python transitive dependencies are not yet fully locked, and the legacy Gemini
SDK needs a maintenance review. Do not advertise a CVE-free release without
checking current advisory databases. Update affected packages and regenerate
lockfiles after compatibility testing.

Before submission, inspect the source ZIP, add actual UI screenshots and provide
an externally reachable HTTPS demo URL. Share its reviewer credentials separately;
keep them outside the source ZIP. Verify the same credentials work on that URL.
No public deployment is provisioned by these setup files.

Any credentials previously committed to source or Git history must be rotated
at their provider. Removing them from the release ZIP does not revoke them.
