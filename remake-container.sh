#!/bin/sh
export ENV="$1"

docker compose -f docker-compose.$ENV.yaml down
docker compose -f docker-compose.$ENV.yaml build
docker compose -f docker-compose.$ENV.yaml up -d
