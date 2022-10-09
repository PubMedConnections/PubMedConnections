#!/bin/bash


STORAGE_DIR=$1
RUN_MODE=$2

if [ -z "$STORAGE_DIR" ];
then
  echo "Usage: $0 <storage-directory> [run-mode]"
  exit 1
fi

mkdir -p "$STORAGE_DIR"


# Start.
docker rm pmc
docker run \
  --name=pmc \
  -ti \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --add-host=host.docker.internal:host-gateway \
  pmc "$STORAGE_DIR" "$RUN_MODE"
