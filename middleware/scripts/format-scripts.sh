#!/bin/sh -e
set -x

isort --recursive  --force-single-line-imports --apply app
sh ./scripts/format.sh