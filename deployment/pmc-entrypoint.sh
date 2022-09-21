#!/bin/bash
set -e

# Start PubMed Connections.
source activate pubmed-connections
python3 -m run extract
