#!/bin/bash
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
echo -e "\n${BOLD}${RED}⚠️  This will DROP and RECREATE the database.${NC}"
read -p "Are you sure? (yes/no): " CONFIRM
[ "$CONFIRM" != "yes" ] && echo "Aborted." && exit 0
psql postgres -c "DROP DATABASE IF EXISTS clustersense_db;" > /dev/null
psql postgres -c "CREATE DATABASE clustersense_db OWNER clustersense;" > /dev/null
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE clustersense_db TO clustersense;" > /dev/null
echo -e "${GREEN}✅ Database recreated${NC}"
echo -e "Run ${CYAN}bash start.sh${NC} to restart and re-seed.\n"
