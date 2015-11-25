#!/bin/bash

# Monitors for probe requests on specified channel
# Usage: sniff.sh interface channel
# e.g. sniff.sh wlan0 1

if [ -z $2 ]; then
  echo "Usage: " `basename "$0"` " interface channel"
  exit 1
fi

interface=$1
channel=$2

iwconfig $interface channel $channel

# disable mac name resolution by passing -n to tshark
tshark -a duration:10 -i $interface subtype probereq 2>/dev/null \
| grep -v "SSID=Broadcast" \
| awk '{print $3 " " $13 " " $14 " " $15 " " $16 " " $17 " " $18 " " $19}' \
| sed -e 's/ *$//g' \
| sed -e 's/SSID\=//g'
