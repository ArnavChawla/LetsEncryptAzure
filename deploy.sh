eval $(docker-machine env LetsEncryptSSL)

docker-compose -f docker-compose.yml up -d --build