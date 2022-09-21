#!/bin/bash
set -e

if [ ! -f ./deployment-config.py ]; then
  cp ../config.py ./deployment-config.py
fi

docker build -t pmc-neo4j ./neo4j/
docker build -t pmc ../
