#!/bin/bash

# Reads in MAC SSID from sniff.sh and prepares for upload

# Where the API sits
server="amadeus:5000"

echo "Starting loop - CTRL-C to stop"

while true; do
  ./sniff.sh | sed -e 's/ /,/' > output.log
  curl -F data=@output.log $server
done
