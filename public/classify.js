//var req = new XMLHttpRequest();
//req.open("GET", "binned.js");
//req.overrideMimeType("application/json");
//req.send(null);

//require(["underscore"]);

var JSON;
var JSONlist;

//a dictionary for words to find in SSID names
var dictionary = {
	"list":[
		{"title":"home","type":"home"},
		{"title":"public","type":"public"},
		{"title":"office","type":"office"},
		{"title":"hotel","type":"hotel"},
		{"title":"food","type":"food"},
		{"title":"Decoded","type":"office"},
		{"title":"We Work","type":"office"},
		{"title":"Buzzfeed","type":"office"},
		{"title":"Wall Street","type":"office"},
		{"title":"NYPL","type":"public"},
		{"title":"Sheraton","type":"hotel"},
		{"title":"GuyGallard","type":"food"},
		{"title":"Javits","type":"public"},
		{"title":"Starbucks","type":"public"}
	]
}

//collect the various categories into a deduplicated array
var categories = [];
for(i=0; i<dictionary.list.length; i++){
	categories.push(dictionary.list[i].type);
}
categories = _.uniq(categories);
//add a category for unclassified networks
categories.push("unknown");

var data = {"networks":[]};

$(window).on('JSONready', function(){
 		var toWrite = '';
 		//separate keys and values into separate arrays
 		var keys = _.keys(JSON);
 		var values = _.values(JSON);

 		//recombine into JSON object
 		for(i=0; i < keys.length; i++){
 			data.networks[i] = {"name":keys[i],"hits":values[i]};
 		}

	 	for(i=0; i < data.networks.length; i++){
	 		for(j=0; j < dictionary.list.length; j++){
	 			//makes a new regular expression from the dictionary list to test against the networks list and removes spaces
	 			var match = new RegExp(dictionary.list[j].title.replace(" ",""),"i");
	 			
	 			//tests the network names against the dictionary and appends the type of network to the network list if found
	 			if(match.test(data.networks[i].name.replace(" ", ""))===true){
	 				data.networks[i].type = dictionary.list[j].type;
	 			}
	 		}
	 		//if the network type isn't matched against the dictionary, set type to unknown
	 		if(data.networks[i].type === undefined){
	 			data.networks[i].type = "unknown";
	 		}

	 		//gives a numerical value to each type of network - useful for d3 visualization later
	 		for(k=0; k < categories.length; k++){
	 			if(data.networks[i].type == categories[k]){
	 				data.networks[i].index = k+1;
	 			}
	 		}
	 	};

	 	//sorts the array according to the index value
	 	data.networks = _.sortBy(data.networks, "index");

	 	//build the JSON object for sunburst visualization
	 	var root = {"name": "root", "children": []};
	 	var parentcount = 0;
	 	var childcount = 0;
	 	for(i=0; i < data.networks.length; i++){
	 		if(i==0){
	 			root.children[parentcount] = {"name":data.networks[i].type, "children":[]};
	 			root.children[parentcount].children[childcount] = {"name":data.networks[i].name,"size":data.networks[i].hits};
	 			childcount++;
	 		} else {
	 			if(data.networks[i].index == data.networks[i-1].index){
	 				root.children[parentcount].children[childcount] = {"name":data.networks[i].name,"size":data.networks[i].hits};
	 				childcount++;
	 			} else {
	 				parentcount++;
	 				childcount = 0;
	 				root.children[parentcount] = {"name":data.networks[i].type, "children":[]};
	 				root.children[parentcount].children[childcount] = {"name":data.networks[i].name,"size":data.networks[i].hits};
	 				childcount++;
	 			}
	 		}
	 	}
	 	//console.log(root);

		/*fs.writeFile('message.txt', 'Hello Node.js', function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		});*/

	 	//builds a list of networks with number of hits and added type property to display on webapge
	 	for(i=0; i < data.networks.length; i++){
	 		toWrite += '{"name":"'+data.networks[i].name+'","hits":'+data.networks[i].hits+',"type":"'+data.networks[i].type+'","index":'+data.networks[i].index+'},<br>';
	 	};
	 	
	 	//writes the list to the div with id of focus
	 	document.getElementById("focus").innerHTML = toWrite;
 });

$(window).on('JSONlistready', function(){
 	var data = {"nodes":[], "links":[]};
 	var keys = _.keys(JSONlist);
 	var values = _.values(JSONlist);
 	
 	//remake raw data into better JSON
 	var raw = {};
 	for(i=0; i < keys.length; i++){
 		raw[i] = {"name":keys[i],"networks":values[i]};
 	}

 	//produces a list of unique ssids from the nested list
 	var uniquevalues = _.uniq(_.flatten(_.values(JSONlist)));
 	
 	//produces nodes from mac list
 	for(i=0; i < keys.length; i++){
 		data.nodes[i] = {"name":keys[i], "group":1};
 	}
 	 	
 	//produces links list
 	for(i=0; i < keys.length; i++){
 		for(j=0; j < raw[i].networks.length; j++){
 			for(k=0; k < keys.length; k++){
 				for(l=0; l < raw[k].networks.length; l++){
 					if(raw[i].networks[j] == raw[k].networks[l] && i !== k){
 						data.links.push({"source": _.indexOf(keys,raw[i].name),"target": _.indexOf(keys,raw[k].name),"value":1});
 					}
 				}
 			}
 		}
 	}

 	//console.log(data);
});

$.getJSON('raw.js', function(response){
       JSONlist = response;
       $(window).trigger('JSONlistready');
});
$.getJSON('binned.js', function(response){
       JSON = response;
       $(window).trigger('JSONready');
});
