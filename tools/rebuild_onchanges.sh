#!/bin/bash
# Detect changes to trigger a new rebuild

# something_changed=`git diff-index --exit-code --ignore-submodules HEAD`
echo `git status --porcelain | wc -l`
git status
something_changed=`git status --porcelain | wc -l`
if [ "$something_changed" -gt 0 ]; then
    echo >&2 "Something changed in $local_ref, rebuilding app"
    yarn && yarn build
fi
