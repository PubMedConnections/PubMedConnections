#!/bin/bash
set -e

source activate pubmed-connections
exec "$@"
