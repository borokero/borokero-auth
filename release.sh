#!/bin/bash -e

DIR="$PWD"
VERSION=`./get-version.sh`
echo "Version: $VERSION"

echo "------------------------------------------------------------------------------------------------------------"
echo "Building:"
echo ""

npm install


echo "------------------------------------------------------------------------------------------------------------"
echo "NPM public:"
echo ""

npm publish


echo "------------------------------------------------------------------------------------------------------------"
echo "Done"
echo "------------------------------------------------------------------------------------------------------------"