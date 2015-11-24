# hacker-probing

Suite to allow visualization of probe requests from devices

## Background

Everytime you connect to a new WiFi network, and hit "remember network" (often by default), your device will subsequently send out probe requests with ALL the SSID names it has connected to previously, in case they are nearby.

This is information leakage for an attacker - if captured, they can either create a fake network with an SSID your device will connect to, or they can read the SSIDs and learn that, for example, you stay in particular Hotels, or connect to particular WiFi airport hotspots.

## Architecture

There are 2 main components to this suite:

### Shell scripts to collect the Probe Requests

In `shell-scripts` you will find two shell scripts to collect the probe requests using a WiFi network card that is able to go into monitor mode.

### Node API and Frontend

To store and visualize the probe requests through a web frontend (so you could, for example, leave the sniffing device on a Raspberry Pi), there is a node.js frontend.

`npm install`

`npm start`

* `/` contains a POST endpoint for storing probe requests, sent from the shell scripts
* `/api/` is a GET request for visualizing the JSON of SSIDs requested
* `/delete/` is a GET endpoint for clearing all requests

## Usage

1. Run `./upload.sh` shell script on your sniffing device, which will need two network interfaces - one for sniffing, and one for posting the data to the API
2. Run the API to store data
3. View `/` in the browser to see a breakdown of access points requested.
