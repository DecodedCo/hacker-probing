//var req = new XMLHttpRequest();
//req.open("GET", "binned.js");
//req.overrideMimeType("application/json");
//req.send(null);

//require(["underscore"]);

var JSON;
var JSONlist;

var data = {"networks":[]};
var binneddata = {"networks":[]};
var uniqueJSON = {"networks":[]};


$(window).on('JSONready', function(){
 		var toWrite = '';
 		
    /*
    //separate keys and values into separate arrays
 		var binnedkeys = _.keys(JSON);
 		var binnedvalues = _.values(JSON);

 		//recombine into JSON object
 		for(i=0; i < binnedkeys.length; i++){
 			binneddata.networks[i] = {"ssid":binnedkeys[i],"hits":binnedvalues[i]};
 		}
    */

	 	//builds a list of networks with number of hits and added type property to display on webapge
    maxLength = (data.networks.length > 30) ? 30 : data.networks.length;

	 	for(i=0; i < maxLength; i++){
	 		//toWrite += '{"name":"'+data.networks[i].name+'","hits":'+data.networks[i].hits+',"type":"'+data.networks[i].type+'","index":'+data.networks[i].index+'},<br>';
      toWrite += '<p><img src="wifi-favicon.png"><span class="networkname">'+data.networks[i].name+'</span> ('+data.networks[i].hits+')</p>';
	 	};

	 	//writes the list to the div with id of focus
	 	//document.getElementById("focus").innerHTML = toWrite;

});















$(window).on('JSONlistready', function(){

  var toWrite = '';
  var data = {'networks':[]};
  // mac addresses
  var keys = _.keys(JSONlist);
  // ssids
  var values = _.values(JSONlist);
  // unique array of ssids
  var uniquevalues = _.uniq(_.flatten(_.values(JSONlist)));
  //console.log(uniquevalues);

  //unique JSON of ssids, then macs
  for(i=0; i < uniquevalues.length; i++){
  	uniqueJSON.networks[i] = {"ssid":uniquevalues[i], "macs":[]};
  }  
  
  //separate keys and values of JSON file (for hits) into separate arrays
  var binnedkeys = _.keys(JSON);
  var binnedvalues = _.values(JSON);

  //recombine into JSON object for hits
  for(i=0; i < binnedkeys.length; i++){
    binneddata.networks[i] = {"ssid":binnedkeys[i],"hits":binnedvalues[i]};
    }

  // converts the JSON into an array of ["mac", ["ssid"s]]
	for(i=0; i < keys.length; i++){
		data.networks[i] = {"mac":keys[i],"ssids":values[i]};
	}

	// adds mac names to list of ssids
  	for(i=0; i < uniqueJSON.networks.length; i++){
  		for(j=0; j < data.networks.length; j++){
  			for(k=0; k < data.networks[j].ssids.length; k++){
  				if(data.networks[j].ssids[k] == uniqueJSON.networks[i].ssid){
  					uniqueJSON.networks[i].macs.push({"macname":data.networks[j].mac,"ssids":[]});
  				}
  			}
  		}
  	}

	// adds list of ssids connected to for each mac name
	for (i=0; i < uniqueJSON.networks.length; i++){
		for(j=0; j < uniqueJSON.networks[i].macs.length; j++){
			for(k=0; k < data.networks.length; k++){
				if(data.networks[k].mac === uniqueJSON.networks[i].macs[j].macname){
					uniqueJSON.networks[i].macs[j].ssids = data.networks[k].ssids;
				}
			}
		}	
	}

	// add number of hits from binned
	for(i=0; i < uniqueJSON.networks.length; i++){
		for(j=0; j < binneddata.networks.length; j++){
			if(uniqueJSON.networks[i].ssid == binneddata.networks[j].ssid){
				uniqueJSON.networks[i].hits = binneddata.networks[j].hits;
			}
		}
	}

  // sort uniqueJSON list by hits
  uniqueJSON.networks = _.sortBy(uniqueJSON.networks, 'hits').reverse();


  // build content for webpage
  toWrite += '<ul>'; 

  for(i=0; i < uniqueJSON.networks.length; i++){
    toWrite += '<a name="' + uniqueJSON.networks[i].ssid + '"></a><li data-jstree=\'{"icon":"none"}\'><div class="li"><img src="img/wifi-favicon-black.png" class="wifi"> ' + uniqueJSON.networks[i].ssid + ' (' + uniqueJSON.networks[i].hits + ')</div>';
    toWrite += '<ul>';

    for(j=0; j < uniqueJSON.networks[i].macs.length; j++){
      toWrite += '<li data-jstree=\'{"icon":"none"}\'><div class="li"><img src="img/mobile-favicon.png" class="mobile"> ' + uniqueJSON.networks[i].macs[j].macname + ' [' + uniqueJSON.networks[i].macs[j].ssids.length + ']</div>';
        toWrite += '<ul>';

      	for(k=0; k < uniqueJSON.networks[i].macs[j].ssids.length; k++){
      		toWrite += '<li data-jstree=\'{"icon":"none"}\'><a href="#' + uniqueJSON.networks[i].macs[j].ssids[k] + '"><div class="li"><img src="img/wifi-favicon-black.png" class="wifi"> ' + uniqueJSON.networks[i].macs[j].ssids[k] + '</div></a></li>';
      	}

        toWrite += '</ul>';
        toWrite += '</li>';
    } 

    toWrite += '</ul>';
    toWrite += '</li>';
  };

  toWrite += '</ul>';

  console.log(toWrite);
  console.log(uniqueJSON);

  document.getElementById("network").innerHTML = toWrite;

    $(function() {
      $('#network').jstree();
      //$('#network').fancytree({checkbox: true});
    });
});


$.when(
  $.getJSON('api/users/', function(response){
  //$.getJSON('raw.js', function(response){
    JSONlist = response;
  }),
  $.getJSON('api/ssids/', function(response){
  //$.getJSON('binned.js', function(response){
    JSON = response;
  })
).then(function(){
  if(JSONlist && JSON){
    $(window).trigger('JSONlistready');
    $(window).trigger('JSONready');
  } else {
  }
});

/*
//$.getJSON('api/users/', function(response){
$.getJSON('raw.js', function(response){
       JSONlist = response;
       $(window).trigger('JSONlistready');
});

//$.getJSON('api/ssids/', function(response){
$.getJSON('binned.js', function(response){
       JSON = response;
       $(window).trigger('JSONready');
});*/


