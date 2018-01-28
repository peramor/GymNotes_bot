#!/bin/sh

max=1
for tag in `docker images $ACR_HOST/"$(cat NAME)":"$(cat VERSION)" | awk '{print $2}' | grep '"$(cat VERSION)"-pre'`; do 
  cur=$(echo $tag | cut -d'-' -f 2 | cut -c 4-)
  max=$((cur+1))
done
echo "${max}" > "PRE_VERSION"