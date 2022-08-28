#!/bin/bash

STORAGE_DIR=$1

if [ -z "$STORAGE_DIR" ]
then
  echo "Usage: $0 <storage-directory>"
  exit 1
fi

mkdir -p "$STORAGE_DIR"

# This should use docker start for production use.
docker rm pubmed-connections
docker run \
  --name=pubmed-connections \
  --publish=7474:7474 --publish=7687:7687 \
  "--volume=$STORAGE_DIR/data:/data" \
  "--volume=$STORAGE_DIR/logs:/logs" \
  pubmed-connections
