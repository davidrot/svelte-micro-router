#!/bin/bash

rm -rf out

cd test

npx tsc --project tsconfig.spec.json
node out/test/run.js
# node ../public/test/src/router/Router.node.spec.js | tap-spec