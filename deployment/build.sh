#!/bin/bash
set -e

docker build -t pmc-neo4j ./neo4j/
docker build -t pmc-backend ../app
docker build -t pmc-frontend ../web
docker build -t pmc ./
