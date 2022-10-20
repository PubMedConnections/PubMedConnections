#!/bin/bash
set -e


STORAGE_DIR=$1
RUN_MODE=$2

if [ -z "$STORAGE_DIR" ];
then
  echo "Usage: $0 <storage-directory> [run-mode]"
  exit 1
fi

if [ -z "$RUN_MODE" ];
then
  RUN_MODE="prod"
fi


# Start Neo4J.
echo "Starting Neo4J..."
if [ "$( docker container inspect -f '{{.State.Running}}' pmc-neo4j )" == "true" ]; then
  echo "Neo4J is already running"
else
  docker rm pmc-neo4j || echo ""
  docker run \
    --name=pmc-neo4j \
    -d \
    --publish=7474:7474 --publish=7473:7473 --publish=7687:7687 \
    "--volume=$STORAGE_DIR/data:/data" \
    "--volume=$STORAGE_DIR/logs:/logs" \
    "--volume=$STORAGE_DIR/plugins:/plugins" \
    pmc-neo4j
fi


# Wait for Neo4J to start.
ELAPSED=0
while true; do
  if [[ "$(curl -s -I http://host.docker.internal:7474)" =~ "200 OK" ]]; then
    printf "Neo4J is available after $ELAPSED seconds\n\n"
    break
  else
    printf "Waiting for Neo4J... [${ELAPSED}s]\n"
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    continue
  fi
done


# Start the frontend.
echo ""
echo "Starting frontend..."
if [ "$( docker container inspect -f '{{.State.Running}}' pmc-frontend )" == "true" ]; then
  docker stop pmc-frontend
fi
docker rm pmc-frontend || echo ""
docker run \
  --name=pmc-frontend \
  -d \
  --publish=18878:80 \
  "--volume=$STORAGE_DIR/data:/data" \
  "--volume=$STORAGE_DIR/logs:/logs" \
  --add-host=host.docker.internal:host-gateway \
  pmc-frontend


# Start the backend.
echo ""
echo "Starting backend..."
if [ "$( docker container inspect -f '{{.State.Running}}' pmc-backend )" == "true" ]; then
  docker stop pmc-backend
fi
docker rm pmc-backend || echo ""
docker run \
  --name=pmc-backend \
  -d \
  --publish=18877:8080 \
  "--volume=$STORAGE_DIR/data:/data" \
  "--volume=$STORAGE_DIR/logs:/logs" \
  --add-host=host.docker.internal:host-gateway \
  pmc-backend "$RUN_MODE"


function ctrl_c() {
  echo "Stopping..."

  # Stop the sibling containers.
  docker stop pmc-backend || echo "Could not stop the backend"
  docker stop pmc-frontend || echo "Could not stop the frontend"
  docker stop pmc-neo4j || echo "Could not stop Neo4J"

  # Stop this container.
  exit 0
}


# Wait for a CTRL-C and then stop the sibling containers.
echo ""
echo "Containers have been successfully started."
echo "Press CTRL-C to stop."
trap ctrl_c INT
sleep 99999d

