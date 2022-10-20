#!/bin/bash
set -e

docker stop pmc-backend || echo "Could not stop the backend"
docker stop pmc-frontend || echo "Could not stop the frontend"
docker stop pmc-neo4j || echo "Could not stop Neo4J"
docker stop pmc || echo "Could not stop the PMC controller"
