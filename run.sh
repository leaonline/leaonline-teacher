#!/bin/sh
meteor npm install

PACKAGE_DIRS="../lib:../liboauth"
METEOR_PACKAGE_DIRS=${PACKAGE_DIRS}  meteor --port=5555 --settings=settings.json
