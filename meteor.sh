#!/usr/bin/env bash

PACKAGE_DIRS="../lib:../liboauth:../libext:../meteor-collection2/package"
METEOR_PACKAGE_DIRS=${PACKAGE_DIRS}  meteor "$@"
