#!/bin/sh

export REMOTE_HOST=$1
export BASE_URL=$2
export RETRY_COUNT=$3
export SELENIUM_ADDRESS=$4

node index.js
