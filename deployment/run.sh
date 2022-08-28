#!/bin/bash
docker rm pubmed-connections
docker run \
  --name=pubmed-connections \
  --publish=7474:7474 --publish=7687:7687 \
  pubmed-connections
