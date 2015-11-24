#!/bin/bash

# Reads in MAC SSID from sniff.sh and prepares for upload

./sniff.sh | sed -e 's/ /=/' -e 's/$/&/' \
  | tr -d '\n'
