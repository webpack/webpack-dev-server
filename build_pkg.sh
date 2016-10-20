#!/bin/bash

# This is the script run by buildbot
# (not by any of eventshopper or eventshopper-pull-requests instances)
# It produces an outdeploy-able package, and does not runs tests.

# START Common expectations for all build scripts.
PACKAGE=$1
BRANCH=$2
TAG=$3
RELEASETYPE=$4

if [ -z "$PACKAGE" ] || [ -z "$BRANCH" ] || [ -z "$TAG" ] || [ -z "$RELEASETYPE" ]; then
  echo "Usage: $0 package branch tag releasetype"
  echo "where:"
  echo " - 'package' is the name of the GitHub project. Ex: 'eventshopper'"
  echo " - 'branch' is the branch of the GitHub project. Ex: 'master'"
  echo " - 'tag' is the release tag. Ex: '1.2.3'"
  echo " - 'releasetype' is either 'release', 'prerelease', or 'push'"
  exit 1
fi

echo "Parameters: $PACKAGE $BRANCH $TAG $RELEASETYPE"
echo "Packaging $PACKAGE-$TAG for Outlaunch"

set -x

# We use node version manager to use the right version of node depending on
# the version specified in .nvmrc
NVM_DIR="/home/buildbot/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
nvm install
NVM_RESULTS=$?
set -e

rm -rf ./node_modules
RM_RESULTS=$?

# gyp requires Python >= 2.4, and the default on our build machine is only 2.4
npm cache clean
npm install --python="/opt/outbox/python2.7/bin/python"
INSTALL_RESULTS=$?

# build the project files
npm run prepublish
BUILD_RESULTS=$?

# move project files as specified by project.json to prepare for compression
mkdir -p build
cp lib ssl client bin build

# Matching structure of regular `setup.py`ed Python packages, having a root
# folder level describing package-version.
tar cvfz "$PACKAGE-$TAG.tar.gz" build
COMPRESS_RESULTS=$?

# cleanup
rm -rf build

# put package in dist
mkdir -p dist
mv "$PACKAGE-$TAG.tar.gz" dist

exit $((NVM_RESULTS || INSTALL_RESULTS || RM_RESULTS || BUILD_RESULTS || COMPRESS_RESULTS))
