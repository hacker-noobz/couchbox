#!/bin/bash

docker container rm -f couchbox-client
docker run --name couchbox-client --rm -p 3000:3000 -v $(pwd)/src:/client/src -it couchbox-client

