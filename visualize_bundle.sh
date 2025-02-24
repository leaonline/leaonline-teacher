#!/usr/bin/env bash

PACKAGE_DIRS="../lib:../liboauth"
RUN_FLAG="1" METEOR_PACKAGE_DIRS=${PACKAGE_DIRS}  meteor  --production --extra-packages bundle-visualizer,dynamic-import --port=5555 --settings=settings.json
