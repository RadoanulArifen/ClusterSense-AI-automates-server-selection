#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info(){ echo -e "${CYAN}[INFO]${NC}  $1"; }
ok(){ echo -e "${GREEN}[OK]${NC}    $1"; }
error(){ echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
step(){ echo -e "\n${BOLD}${BLUE}━━━ $1 ━━━${NC}"; }

echo -e "\n${BOLD}${BLUE}  ClusterSense AI — Setup${NC}"
echo "  AI-Powered Infrastructure Management — HostNova Cloud"
echo

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON_BIN="python3.11"

##############################################################################
# CHECK REQUIREMENTS
##############################################################################

step "Checking Prerequisites"

command -v "$PYTHON_BIN" >/dev/null || error "Python 3.11 is required"

ok "Python $($PYTHON_BIN -c 'import sys;print(f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")') found"

command -v node >/dev/null || error "Node.js required"
ok "Node.js $(node --version) found"

command -v psql >/dev/null || error "PostgreSQL required"
ok "PostgreSQL $(psql --version | awk '{print $3}') found"

##############################################################################
# DATABASE
##############################################################################

step "Setting Up PostgreSQL Database"

DB_NAME="clustersense_db"
DB_USER="clustersense"
DB_PASS="clustersense123"

psql postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 \
|| psql postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"

ok "User '$DB_USER' ready"

psql postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
|| psql postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

ok "Database '$DB_NAME' ready"

psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" >/dev/null

ok "Privileges granted"

##############################################################################
# BACKEND
##############################################################################

step "Setting Up Backend"

cd "$SCRIPT_DIR/backend"

if [ -d venv ]; then
    info "Removing old virtual environment..."
    rm -rf venv
fi

info "Creating Python 3.11 virtual environment..."

$PYTHON_BIN -m venv venv

source venv/bin/activate

python --version

info "Upgrading pip..."

python -m pip install --upgrade pip setuptools wheel

info "Cleaning pip cache..."

python -m pip cache purge || true

info "Installing Python dependencies..."

python -m pip install -r requirements.txt

info "Installing compatible bcrypt..."

python -m pip uninstall -y bcrypt || true
python -m pip install bcrypt==4.1.3

ok "Python dependencies installed"

##############################################################################
# DATASETS
##############################################################################

if [ ! -f data/failure_prediction.csv ]; then
    error "Dataset missing.

backend/data must contain:

failure_prediction.csv
smart_scheduling.csv
cost_optimization.csv"
fi

ok "Datasets found"

##############################################################################
# TRAIN MODELS
##############################################################################

if [ ! -f ml_models/failure_model.pkl ]; then

    step "Training AI Models"

    python "$SCRIPT_DIR/train_models.py"

    ok "ML models generated"

else

    ok "ML models already exist"

fi

deactivate

##############################################################################
# FRONTEND
##############################################################################

step "Setting Up Frontend"

cd "$SCRIPT_DIR/frontend"

npm install

ok "Frontend dependencies installed"

##############################################################################
# DONE
##############################################################################

step "Setup Complete"

echo
echo -e "${GREEN}${BOLD}ClusterSense AI is Ready!${NC}"
echo
echo "Run:"
echo "    bash start.sh"
echo
echo "Frontend : http://localhost:5173"
echo "Backend  : http://localhost:8000"
echo "API Docs : http://localhost:8000/docs"
echo
echo "Login"
echo "Email    : admin@hostnova.com"
echo "Password : password123"
echo