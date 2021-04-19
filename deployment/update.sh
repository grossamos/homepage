#! /bin/bash

cd /home/amos/Downloads/setup/homepage/
hugo
docker build -t homepage .

cd /home/amos/Downloads/setup 
docker-compose up -d 
