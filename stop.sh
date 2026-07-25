#!/bin/bash
CYAN='\033[0;36m'; GREEN='\033[0;32m'; NC='\033[0m'; BOLD='\033[1m'
echo -e "\n${BOLD}Stopping ClusterSense AI...${NC}"
for PID_FILE in /tmp/clustersense_backend.pid /tmp/clustersense_frontend.pid; do
  [ -f "$PID_FILE" ] && { PID=$(cat "$PID_FILE"); kill "$PID" 2>/dev/null && echo -e "  ${GREEN}✅ Stopped PID $PID${NC}"; rm -f "$PID_FILE"; }
done
fuser -k 8000/tcp 2>/dev/null && echo -e "  ${GREEN}✅ Port 8000 freed${NC}" || true
fuser -k 5173/tcp 2>/dev/null && echo -e "  ${GREEN}✅ Port 5173 freed${NC}" || true
echo -e "${GREEN}Done.${NC}\n"
