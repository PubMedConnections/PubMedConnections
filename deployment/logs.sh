#!/bin/bash

echoerr() { echo "$@" 1>&2; }

CONTAINER_NAME=$1

if [ -z "$CONTAINER_NAME" ];
then
  echoerr "Usage: $0 <container-name>"
  echoerr ""
  echoerr "Container Names:"
  echoerr " - pmc-frontend: Access the logs of the frontend"
  echoerr " - pmc-backend: Access the logs of the backend"
  echoerr " - pmc-neo4j: Access the logs of Neo4J"
  exit 1
fi

docker logs -f "$CONTAINER_NAME"
