#!/bin/bash

STORAGE_DIR=$1

if [ -z "$STORAGE_DIR" ]
then
  echo "Usage: $0 <storage-directory>"
  exit 1
fi

mkdir -p "$STORAGE_DIR"


# Start Neo4J.
docker rm pmc-neo4j
docker run \
  --name=pmc-neo4j \
  -d \
  --publish=7474:7474 --publish=7473:7473 --publish=7687:7687 \
  "--volume=$STORAGE_DIR/data:/data" \
  "--volume=$STORAGE_DIR/logs:/logs" \
  "--volume=$STORAGE_DIR/plugins:/plugins" \
  pmc-neo4j


# Wait for Neo4J to start.
ELAPSED=0
while true; do
  ELAPSED=$((ELAPSED + 5))

  if [[ "$(curl -s -I http://0.0.0.0:7474)" =~ "200 OK" ]]; then
    printf "Neo4J is available after $ELAPSED seconds\n\n"
    sleep 5
    break
  else
    printf "Waiting for Neo4J... [${ELAPSED}s]\n"
    sleep 5
    continue
  fi
done


# Start PubMed Connections.
docker rm pmc
docker run \
  --name=pmc \
  "--volume=$STORAGE_DIR/data:/data" \
  "--volume=$STORAGE_DIR/logs:/logs" \
  --add-host=host.docker.internal:host-gateway \
  pmc
