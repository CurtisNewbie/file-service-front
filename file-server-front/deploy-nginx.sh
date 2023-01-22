#!/bin/bash

remote="alphaboi@curtisnewbie.com"
remote_path="/home/alphaboi/services/nginx/html/file-service-web/"

ng build --prod;
scp -r ./dist/file-server/* "${remote}:${remote_path}"




