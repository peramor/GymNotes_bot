#!/bin/sh

docker rm -f bot nosql session
docker network create testnetwork
docker build -t testimage .
docker run -d --name nosql --network=testnetwork mongo
docker run -d --name session --network=testnetwork redis
docker run --name bot -e MONGO_HOST=nosql -e TELEGRAM_SESSION_HOST=session -e TG_BOT_TOKEN=$TG_BOT_TOKEN testimage