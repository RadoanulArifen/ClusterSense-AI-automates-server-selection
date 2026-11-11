#!/bin/bash
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "\n${BOLD}${CYAN}  ClusterSense AI — Starting Services${NC}\n"

[ -d "$SCRIPT_DIR/backend/venv" ] || { echo -e "${RED}[ERROR]${NC} Run 'bash setup.sh' first."; exit 1; }


echo -e "${GREEN}[1/2]${NC} Starting Backend  (http://localhost:8000)..."
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/clustersense_backend.log 2>&1 &
BACKEND_PID=$!
deactivate

echo -e "${GREEN}[2/2]${NC} Starting Frontend (http://localhost:5173)..."
cd "$SCRIPT_DIR/frontend"
npm run dev > /tmp/clustersense_frontend.log 2>&1 &
FRONTEND_PID=$!

echo "$BACKEND_PID"  > /tmp/clustersense_backend.pid
echo "$FRONTEND_PID" > /tmp/clustersense_frontend.pid

echo -n "  Waiting for backend"
for i in $(seq 1 20); do
  sleep 1; echo -n "."
  curl -s http://localhost:8000/health > /dev/null 2>&1 && { echo -e "\n  ${GREEN}✅ Backend ready${NC}"; break; }
done

echo -e "\n${BOLD}${GREEN}✅ ClusterSense AI is running!${NC}\n"
echo -e "  ${CYAN}${BOLD}http://localhost:5173${NC}  ← Open in browser"
echo -e "  ${CYAN}http://localhost:8000/docs${NC}  ← API Docs\n"
echo -e "  Login: use ADMIN_EMAIL and ADMIN_PASSWORD from backend/.env\n"
echo -e "  Press Ctrl+C or run 'bash stop.sh' to stop.\n"

trap "bash $SCRIPT_DIR/stop.sh; exit 0" INT TERM
wait $BACKEND_PID $FRONTEND_PID
