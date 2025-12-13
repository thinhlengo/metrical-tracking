#!/bin/bash

IMAGE_NAME="metrical-tracking"
CONTAINER_NAME="metrical-tracking-container"
PORT=3005

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting build and run process for $IMAGE_NAME...${NC}"

if [ -f .env.docker ]; then
    echo -e "${GREEN}Found .env.docker file.${NC}"
else
    echo "Warning: .env.docker file not found. Copying from .env.example..."
    if [ -f .env.docker.example ]; then
        cp .env.example .env.docker
        echo -e "${GREEN}Created .env.docker from .env.example.${NC}"
    else
        echo "Error: Neither .env.docker nor .env.example found."
        exit 1
    fi
fi

echo -e "${GREEN}Building Docker image...${NC}"
docker build -t $IMAGE_NAME .

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo -e "${GREEN}Stopping existing container...${NC}"
    docker stop $CONTAINER_NAME
fi

if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo -e "${GREEN}Removing existing container...${NC}"
    docker rm $CONTAINER_NAME
fi

echo -e "${GREEN}Running new container...${NC}"
docker run -d \
  -p $PORT:$PORT \
  --env-file .env.docker \
  --name $CONTAINER_NAME \
  $IMAGE_NAME

echo -e "${GREEN}Container started!${NC}"
echo "You can check logs with: docker logs -f $CONTAINER_NAME"
