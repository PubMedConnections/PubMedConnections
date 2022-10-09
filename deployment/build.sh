#!/bin/bash
set -e

# Copy the default config for the backend config.
if [ ! -f ./backend-config.py ]; then
  cp ../config.py ./backend-config.py
fi

docker build -t pmc-neo4j ./neo4j/
docker build -t pmc-backend ../app
docker build -t pmc-frontend ../web
docker build -t pmc ./
