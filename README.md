# hacker-probing

Suite to allow visualization of probe requests from devices

## Background

Everytime you connect to a new WiFi network, and hit "remember network" (often by default), your device will subsequently send out probe requests with ALL the SSID names it has connected to previously, in case they are nearby.

This is information leakage for an attacker - if captured, they can either create a fake network with an SSID your device will connect to, or they can read the SSIDs and learn that, for example, you stay in particular Hotels, or connect to particular WiFi airport hotspots.

## Architecture

There are 3 components to this suite:

### 1. Shell scripts to collect the Probe Requests

In `shell-scripts` you will find two shell scripts to collect the probe requests using a WiFi network card that is able to go into monitor mode.

### 2. Node API

To store the probe requests through a RESTful API (so you could, for example, leave the sniffing device on a Raspberry Pi), there is a node.js backend.

`npm install`

`npm start`

* `GET /api/` is an endpoint which points to other available endpoints:
  * `POST /api/` will process the data sent from the shellscripts
  * `DELETE /api/` will clear currently stored data
  * `GET /api/ssids/` will return a list of SSIDs by count requested
  * `GET /api/users/` will return a list of MACs with SSIDs requested per MAC

### 3. Frontend for visualization

To visualize the API data for social profiling:

* `GET /` contains a single page view of SSIDs, which you can double click on to reveal users, which you can double click on to visualize SSIDs.


## Usage

1. Start the node API using `npm install && npm start`
2. Update `upload.sh` with the URL of your node API instance and check other params
3. Run the `./upload.sh` shell script on your sniffing device, which will need two network interfaces - one for sniffing, and one for posting the data to the API
4. View `/` in the browser to see a breakdown of access points requested.
