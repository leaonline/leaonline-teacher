#!/usr/bin/env bash

meteor npm install

PACKAGE_DIRS="../lib:../liboauth"
RUN_FLAG="1" METEOR_PACKAGE_DIRS=${PACKAGE_DIRS}  meteor npm run visualize
