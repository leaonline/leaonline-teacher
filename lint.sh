#!/usr/bin/env bash

set -e

meteor npm run lint:code
meteor npm run lint:style
metepr npm run lint:markdown
