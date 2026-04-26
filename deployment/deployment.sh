#! /bin/bash
# NOTE: The Pickbazar mock API (api/rest, api/graphql) has been removed.
# The Kolshi Spring Boot backend is managed separately via Docker.
# This script now only uploads the deployment scripts to the server.

echo "Enter your server username (ex: ubuntu)"
read username

echo "Enter server ip address (ex: 11.111.111.11)"
read ip_address

echo "########### connecting to server... ###########"
echo "${username}"
echo "${ip_address}"
ssh -o StrictHostKeyChecking=no -l "${username}" "${ip_address}" "sudo mkdir -p /var/www/pickbazar-react; sudo chown -R \$USER:\$USER /var/www; sudo apt install zip unzip";

if [ -d "./deployment" ]; then
  echo 'Zipping deployment folder'
  zip -r ./deployment.zip ./deployment
fi

if [ -f "./deployment.zip" ]; then
    echo 'Uploading deployment.zip to server...'
    scp "./deployment.zip" "${username}@${ip_address}:/var/www/pickbazar-react"
    echo 'uploaded deployment.zip to server'
    ssh -o StrictHostKeyChecking=no -l "${username}" "${ip_address}" "unzip /var/www/pickbazar-react/deployment.zip -d /var/www/pickbazar-react";
else
  echo "deployment.zip missing — cannot upload"
fi

echo "installing google zx for further script"
npm i -g zx
