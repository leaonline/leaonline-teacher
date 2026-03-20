#!/bin/sh
meteor npm install

PACKAGE_DIRS="../lib:../liboauth"
RUN_FLAG="1" METEOR_PACKAGE_DIRS=${PACKAGE_DIRS}  meteor --port=5555 --settings=settings.json
