# Deploy frontend on Vercel, backend and PostgreSQL on Render

These files prepare deployment; they do not create services in your accounts.
Use the same Git repository for both providers. The Render build context must
remain the repository root because training uses the root train_models.py.

## 1. Prepare the GitHub repository

Commit the application source, render.yaml, frontend/vercel.json and Dockerfile
changes. Keep secrets outside Git. This legacy repository may already track
local .env files, dependencies or caches; .gitignore does not untrack them.
Inspect tracked files before pushing. For a new clean repository, extract
clustersense-ai-source.zip into an empty directory and initialize Git there.
Rotate any credentials previously exposed in source/history.

## 2. Create the frontend project on Vercel

Import the GitHub repository, choose root directory `frontend`, framework Vite,
build command `npm run build`, output directory `dist`. Record the stable
production domain, for example https://your-project.vercel.app. Use this exact
origin for CORS on Render; preview deployment domains are separate origins.
The initial frontend deployment can load its UI, but its API will not work until
the Render URL is configured in step 4.

frontend/vercel.json includes React SPA rewrites so refreshing /login or
/app/dashboard serves index.html.

## 3. Deploy Render Blueprint

In Render choose New > Blueprint and connect the same repository. Render reads
the root render.yaml and proposes a Docker web service and PostgreSQL database.
Review the proposed resources and charges in the dashboard before creating them.
The provided configuration selects free demo tiers.

Supply the prompted variables:

| Variable | Value |
| --- | --- |
| ADMIN_EMAIL | Your administrator login email |
| ADMIN_PASSWORD | A unique password of at least 12 characters |
| CORS_ORIGINS | Your exact Vercel production origin, e.g. https://your-project.vercel.app, without a trailing slash |

Render generates SECRET_KEY and connects DATABASE_URL to the database's internal
connection string. No root/backend .env upload is needed. Optionally add your
own GEMINI_API_KEY in the Render service's environment settings; without it the
Copilot uses its built-in fallback.

Render builds backend/Dockerfile using the repository root as its Docker context.
Model training runs during image build. The server binds to 0.0.0.0 and Render's
PORT variable. First startup creates the schema and seeds demo data and the
configured admin. Environment credentials provision a first account only;
changing them later does not reset an existing account.

Wait until the web service is live. Copy its URL and open:

```text
https://your-api.onrender.com/health
```

Expected response: {"status":"healthy"}. Check Render logs if startup fails.
Use the automatically assigned URL, not the illustrative URL in this document.

Manual alternative: create Render Postgres first, then a Docker Web Service;
leave Root Directory blank, Dockerfile Path `./backend/Dockerfile`, Docker Build
Context `.` and Docker Command blank. Set DATABASE_URL to the database's Internal
Database URL, a random 32+ character SECRET_KEY, and the admin/CORS values above.
Set Health Check Path to `/health`.

## 4. Connect the frontend

In Vercel > Project > Settings > Environment Variables add:

```text
VITE_API_URL=https://your-api.onrender.com
```

Use the backend origin only, without `/api` or a trailing slash. Set it for
Production; also set it for Preview only if you intend to allow preview origins.
Redeploy Vercel after setting it: Vite embeds this public value at build time.
Never put SECRET_KEY, database credentials or ADMIN_PASSWORD in Vercel frontend
variables.

If the production frontend domain changes, update Render CORS_ORIGINS too.
For multiple approved origins use a comma-separated list, not a wildcard.

## 5. Verify

- Refresh /login and /app/dashboard directly to test SPA routing.
- Log in with the administrator configured on Render.
- Create an order, schedule it and execute the simulated deployment.
- Check dashboard, predictions, Copilot, outcomes and plan comparison.
- Confirm anonymous calls to /api/nodes/ return 401.
- If requests fail, check browser Network for the actual backend URL and inspect
  Render logs. CORS_ORIGINS must match the browser origin exactly.

## Demo limitations

Render free web services can sleep after inactivity, so the first API request
can exceed the frontend's 30-second timeout; wait for /health and retry login.
Free Postgres expires after 30 days under the current documented policy. Review
the dashboard's current limits and upgrade for a persistent reviewer demo.
An ML service can exceed free-tier memory; if logs show an out-of-memory error,
select a larger instance rather than assuming a successful frontend deploy proves
the backend works.

The JSON outcome/plan records live on Render's ephemeral container filesystem;
they reset on redeployment/restart. Relational records are in PostgreSQL. Durable
outcome/plan history requires moving those records into PostgreSQL or adding
supported persistent storage. This configuration does not claim that durability.

Official references:
- https://render.com/docs/blueprint-spec
- https://render.com/docs/docker
- https://render.com/docs/free
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/environment-variables
