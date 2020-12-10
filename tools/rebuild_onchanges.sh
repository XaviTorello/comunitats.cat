#!/bin/bash
# Detect changes to trigger a new rebuild

something_changed=`git diff-index --exit-code --ignore-submodules HEAD`
if [ -n "$something_changed" ]
then
    echo >&2 "Something changed in $local_ref, rebuilding app"
    yarn && yarn build
fi
