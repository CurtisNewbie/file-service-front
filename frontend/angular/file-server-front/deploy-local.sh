#!/bin/bash

ng build;
if [ $? -eq 0 ]; then
    cp -r ./dist/file-server/* "/usr/share/nginx/html/file-server/"
fi




