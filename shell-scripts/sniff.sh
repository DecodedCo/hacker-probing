#!/bin/bash
ifconfig wlan0 down
iwconfig wlan0 mode monitor
ifconfig wlan0 up
for j in seq `1 10`; do
  for n in seq `1 14`; do
    iwconfig wlan0 channel $n
    # disable mac name resolution by giving -n
    tshark -a duration:10 -i wlan0 subtype probereq 2>/dev/null \
    | grep -v "SSID=Broadcast" \
    | awk '{print $3 " " $13}'
  done
done
