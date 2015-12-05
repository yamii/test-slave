#!/bin/sh

echo "Process Id:" $3
echo "Running testcase"
echo $1
echo "-----------------"
cd ./test/ && npm run protractor -- --params.template=$1 --params.templateId=$2
