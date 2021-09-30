#!/usr/bin/env bash

function print () {
    echo "[install]: $1"
}

PROJECT_PATH=$(pwd)

# create private library paths
mkdir -p ../lib

# clone private dependencies into lib

function install_dependencies () {
   DEP_PATH=$1
   REPO_PATH=$2

   if [ ! -d "$DEP_PATH" ];
    then
        print "missing $DEP_PATH, install from source"
        git clone ${REPO_PATH} ${DEP_PATH}
    else
        print "skip installing already existing dependency $DEP_PATH"
    fi
}

print "install dependencies"
install_dependencies "../lib/corelib" "https://github.com/leaonline/corelib"
install_dependencies "../lib/utils" "https://github.com/leaonline/utils"
install_dependencies "../lib/theme" "https://github.com/leaonline/theme"
install_dependencies "../lib/testing" "https://github.com/leaonline/testing"
