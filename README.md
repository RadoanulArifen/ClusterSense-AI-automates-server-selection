# ClusterSense AI

> **AI-Powered Infrastructure Management Platform for Hosting Providers**
> Trained on 3 real infrastructure datasets — 65,000 total rows

ClusterSense AI is an internal AI platform used by **HostNova Cloud** to automate
server selection, predict infrastructure failures, and optimise costs — powered
by machine learning models trained on real production infrastructure data.

---

## ✅ Core Workflow

```
Landing Page  →  Demo Order Portal  →  Submit Deployment Request
  →  Incoming Requests  →  Open Request
  →  Smart Scheduling AI  →  Recommended Server  →  Deploy
  →  Dashboard Live Update  →  Predictive Operations
  →  Cost Optimization  →  AI Copilot  →  What-if Simulator
```

---

## 📊 Real Datasets

| File | Rows | Model | Accuracy | Target |
|---|---|---|---|---|
| `failure_prediction.csv` | 25,000 | GradientBoosting | **98.6%** | Low / Medium / High risk |
| `smart_scheduling.csv`   | 20,000 | RandomForest      | **92.6%** | Node suitability score |
| `cost_optimization.csv`  | 20,000 | GradientBoosting  | **99.9%** | Keep Running / Sleep Mode / Shutdown |

### Column schemas (real data — not synthetic)

**failure_prediction.csv**
```
node_id, cpu_usage_percent, ram_usage_percent, disk_usage_percent,
network_usage_percent, active_jobs, idle_time_minutes,
power_consumption_watts, temperature_celsius, failure_risk
```

**smart_scheduling.csv**
```
job_type, cpu_required, memory_required_gb, estimated_runtime_minutes,
priority, current_node_load, available_cpu_cores, available_memory_gb,
recommended_node
```

**cost_optimization.csv**
```
cpu_usage_percent, ram_usage_percent, active_jobs, idle_time_minutes,
power_consumption_watts, utilization_score, monthly_cost_usd, recommendation
```

> **Note on Smart Scheduling:** the raw dataset maps 100 node identities to
> ~200 rows each, too sparse for direct multi-class classification. The
> training pipeline instead builds a **binary node-suitability scorer**:
> it learns whether a given (job requirements, node state) pair is a good
> match, using the real assignments as positive examples and resource-mismatched
> permutations as negative examples. At inference time, every live node in the
> cluster is scored and the highest-scoring node is recommended — this is what
> "Smart Scheduling AI" does in the app.

---

## 🛠️ Tech Stack

| Layer      | Technologies                                                       |
|------------|--------------------------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router, React Query, Recharts  |
| Backend    | FastAPI, Python 3.11, Uvicorn, SQLAlchemy                          |
| Database   | PostgreSQL 15                                                       |
| AI / ML    | Scikit-learn, Joblib, Pandas, NumPy                                 |
| LLM        | Google Gemini 1.5 Flash (optional — falls back gracefully)          |

---

## 📋 Prerequisites

| Tool        | Version | Install                          |
|-------------|---------|-----------------------------------|
| Python      | 3.10+   | https://python.org               |
| Node.js     | 18+     | https://nodejs.org                |
| PostgreSQL  | 13+     | https://postgresql.org            |

```bash
# macOS
brew install postgresql@15 && brew services start postgresql@15

# Ubuntu / Debian
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql && sudo systemctl enable postgresql
```

---

## 🚀 Setup & Run

### Step 1 — One-time setup

```bash
cd clustersense-ai
bash setup.sh
```

This will:
- ✅ Create the PostgreSQL user and database
- ✅ Create a Python virtual environment (`backend/venv/`)
- ✅ Install all Python dependencies
- ✅ Train the 3 ML models on the real CSV datasets (already included in `backend/data/`)
- ✅ Install all Node.js dependencies

### Step 2 — Start the app

```bash
bash start.sh
```

Open **http://localhost:5173**

### Stopping

```bash
bash stop.sh
```

---

## 🔧 Manual Setup (alternative)

```bash
# Database
psql -U postgres
CREATE USER clustersense WITH PASSWORD 'clustersense123';
CREATE DATABASE clustersense_db OWNER clustersense;
GRANT ALL PRIVILEGES ON DATABASE clustersense_db TO clustersense;
\q

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python ../train_models.py       # trains on the real CSVs already in backend/data/
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🔐 Login

```
Email:    admin@hostnova.com
Password: password123
```

---

## 🤖 AI Copilot — Optional Gemini Setup

1. Get a free key at https://aistudio.google.com
2. In `backend/.env`, set `GEMINI_API_KEY=AQ.Ab8RN6Ik9QXmeeiI46EDHpJrbpSVuT5XXGKtzOh94umUMeKWnQ`
3. Restart the backend.

Without a key, Copilot uses the built-in cluster-aware rule-based engine.

---

## 📁 Project Structure

```
clustersense-ai/
├── setup.sh / start.sh / stop.sh / reset_db.sh
├── train_models.py           ← Trains all 3 models from real CSVs
│
├── backend/
│   ├── .env
│   ├── requirements.txt
│   ├── data/                          ← REAL uploaded datasets
│   │   ├── failure_prediction.csv     (25,000 rows)
│   │   ├── smart_scheduling.csv       (20,000 rows)
│   │   └── cost_optimization.csv      (20,000 rows)
│   ├── ml_models/                     ← Trained models
│   │   ├── failure_model.pkl          (98.6% accuracy)
│   │   ├── scheduling_model.pkl       (92.6% accuracy)
│   │   └── cost_model.pkl             (99.9% accuracy)
│   └── app/
│       ├── main.py / database.py / security.py
│       ├── api/            (10 route modules)
│       ├── ml/ml_service.py  (inference layer for all 3 models)
│       ├── models/models.py  (9 SQLAlchemy tables)
│       └── services/seed_service.py
│
└── frontend/
    ├── .env / package.json / vite.config.js
    └── src/
        ├── App.jsx / main.jsx / index.css
        ├── pages/       (11 pages)
        ├── components/  (layout, ui)
        ├── context/AuthContext.jsx
        └── services/api.js
```

---

## 📡 API Reference (21 endpoints)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate |
| GET | `/api/dashboard/stats` | Live cluster stats |
| GET | `/api/dashboard/nodes` | All node metrics |
| GET | `/api/dashboard/metrics/trends` | Chart data |
| GET | `/api/nodes/` | List nodes |
| GET/POST | `/api/deployment-requests/` | List / create requests |
| POST | `/api/deployments/schedule` | Run Smart Scheduling AI |
| POST | `/api/deployments/deploy` | Execute deployment |
| GET | `/api/predictions/failure` | Predict all node failures |
| GET | `/api/alerts/` | List alerts |
| GET | `/api/cost/recommendations` | Cost analysis |
| POST | `/api/simulation/whatif` | Capacity planning |
| POST | `/api/copilot/chat` | AI Copilot chat |

Full docs: **http://localhost:8000/docs**

---

## 🗄️ Database Tables

```
users · nodes · deployment_requests · deployments · node_metrics
predictions · alerts · cost_recommendations · audit_logs
```

---

## 📄 License

MIT
