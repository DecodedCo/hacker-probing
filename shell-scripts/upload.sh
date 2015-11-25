#!/bin/bash

# Reads in MAC SSID from sniff.sh and prepares for upload
# Stores all_output.log in case curls fail for manual retrieval

# Interface
interface="wlan0"

# Where the API sits
server="YOURIP:5000/api/data/"

# Get us into monitor mode
ifconfig $interface down
iwconfig $interface mode monitor
ifconfig $interface up

# temporary storage file
echo -n > all_output.log

echo "Starting loop - CTRL-C to stop"

while true; do
  for channel in `seq 1 13`; do
    ./sniff.sh $interface $channel | sed -e 's/ /,/' > output.log
    cat output.log >> all_output.log
    curl -F data=@output.log $server
  done
done
