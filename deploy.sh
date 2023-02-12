git pull
docker network create -d bridge proxy_network
docker-compose up -d --build --remove-orphans