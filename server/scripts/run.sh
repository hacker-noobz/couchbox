#!/bin/bash

docker container rm -f couchbox-server
docker run --name couchbox-server --rm -p 8000:8000 -v $(pwd):/server -it couchbox-server