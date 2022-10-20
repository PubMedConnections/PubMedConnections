#!/bin/bash
set -e

RUN_MODE=$1

if [ -z "$RUN_MODE" ];
then
  echo "Usage: $0 <run-mode>"
  exit 1
fi

# Start PubMed Connections.
echo "Running in $RUN_MODE mode"
source activate pubmed-connections
python3 -m run "$RUN_MODE"
