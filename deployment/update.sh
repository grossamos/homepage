#! /bin/bash

cd /home/amos/Downloads/setup/homepage/
hugo

cd /home/amos/Downloads/setup 
docker-compose up -d --build
