// Read the data.
//d3.json("data/raw_data.json", function(error, json) {
d3.json("../api/users/", function(error, json) {

    if (error) throw error;

    var dataObj = {
        'nodes': [],
        'links': []
    };

    console.log('Read the data, ready to go!');

    // data is built up by devices and their associated networks.
    // {
    //     "Apple_20:2f:d2": ["TGC_PUBLIC_INTERNET", "Scandi Kitchen Wi-Fi", "Bertie's Wifi", "Free Range Guest", "Engine-Guest", "TCIGUEST", "malmaison", "BTHub3-CRNX", "notSofriendlyCoffeeShop", "www.hoxtonhotels.com Free Wifi", "NETGEAR08", "WHITE", "Centro Barsha Guest", "Digital_Guest", "YoungsWifi-BTWifi", "Kettners", "Fr33 Public WiFi"],
    //     "4a:6c:b4:43:95:c3": ["BTWiFi", "RCCL-CR-ITRF", "JOA-Guest", "SOLEIL"],
    // }

    // We need to create a dictionary with wifi-networks (to avoid duplicity)
    // Add each device as a node and each network when its not present in the dictionary.
    // Dictionary with wifi networks maps to their node-id.

    var ssids = {};

    // Loop over all devices.
    Object.keys(json).forEach( function (device, d) {
        // Get the device and then loop over all networks.
        var deviceIx = dataObj.nodes.length;
        dataObj.nodes.push({ "group": 1, "name": device });
        json[device].forEach( function (ssid, s) {
            // Check if this ssid has already been added to the dictionary.
            if ( !(ssid in ssids) ) {
                ssids[ssid] = dataObj.nodes.length;
                dataObj.nodes.push({
                    "group": 2,
                    "name": ssid
                });
            }
            // retrieve the node index and add the link.
            var ssidIx = ssids[ssid];
            dataObj.links.push({ "source": deviceIx, "target": ssidIx, "value": 1 });
        });
    });

    drawGraph(dataObj);

});
