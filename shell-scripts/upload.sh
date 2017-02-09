#!/bin/bash

# Reads in MAC SSID from sniff.sh and prepares for upload
# Stores all_output.log in case curls fail for manual retrieval

# Interface
interface="wlan0"

# Where the API sits
server="http://YOURIP:5000/api/"

# Pass in any certificate details as needed
#curl_opts="-E ~/cert-with-password.p12:password"
#curl_opts="-E ~/cert-without-password.p12"
curl_opts=""

# Get us into monitor mode
ifconfig $interface down
iwconfig $interface mode monitor
ifconfig $interface up

# temporary storage file
echo -n > all_output.log

echo "Starting loop - CTRL-C to stop"

while true; do
  for channel in `seq 1 13`; do
    echo "Listening to channel " $channel
    ./sniff.sh $interface $channel | sed -e 's/ /,/' > output.log
    cat output.log >> all_output.log
    curl $curl_opts -F data=@output.log $server
  done
done
