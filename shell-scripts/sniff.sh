#!/bin/bash

interface="wlan0"

ifconfig $interface down
iwconfig $interface mode monitor
ifconfig $interface up

for channel in $(seq 1 13); do
  iwconfig $interface channel $channel
  # disable mac name resolution by giving -n
  tshark -a duration:10 -i $interface subtype probereq 2>/dev/null \
  | grep -v "SSID=Broadcast" \
  | awk '{print $3 " " $13 " " $14 " " $15 " " $16 " " $17 " " $18 " " $19}' \
  | sed -e 's/SSID\=//g'
done
