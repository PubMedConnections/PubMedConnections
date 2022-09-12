#!/bin/bash
set -e

# Start Neo4J
printf "\nStarting Neo4j...\n\n"
startup/docker-entrypoint.sh printf "\nNeo4J Setup Completed.\n\n"
neo4j start

# Wait for Neo4J to start.
ELAPSED=0
while true; do
  ELAPSED=$((ELAPSED + 5))

  if [[ "$(curl -s -I http://localhost:7474)" =~ "200 OK" ]]; then
    printf "Neo4J is available after $ELAPSED seconds\n\n"
    break
  else
    printf "Waiting for Neo4J... [${ELAPSED}s]\n"
    sleep 5
    continue
  fi
done

# Start PubMed Connections.
source activate pubmed-connections
python3 -m run wait

# Stop Neo4J.
echo "Stopping Neo4J..."
export NEO4J_SHUTDOWN_TIMEOUT=60

if [[ ! "${bin/neo4j stop}" ]]; then
  while [[ "${bin/neo4j status}" ]]; do
    echo "Still waiting for Neo4J to shutdown..."
    sleep 10
  done;
fi

echo "Done"
