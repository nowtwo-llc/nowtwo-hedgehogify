#!/bin/bash
set -e

rm -rf ./umd/main**

mkdir -p ./dist
mv ./umd/** ./dist

rm -rf umd
