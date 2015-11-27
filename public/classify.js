/*var req = new XMLHttpRequest();
req.open("GET", "binned.js");
req.overrideMimeType("application/json");
req.send(null);*/

var JSON;

//a dictionary for words to find in SSID names
var dictionary = {
	"list":[
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



$(window).on('JSONready', function(){
 		var toWrite = '';
	 	for(i=0; i < JSON.networks.length; i++){
	 		for(j=0; j < dictionary.list.length; j++){
	 			//makes a new regular expression from the dictionary list to test against the networks list and removes spaces
	 			var match = new RegExp(dictionary.list[j].title.replace(" ",""),"i");
	 			
	 			//tests the network names against the dictionary and appends the type of network to the network list if found
	 			if(match.test(JSON.networks[i].name.replace(" ", ""))===true){
	 				JSON.networks[i].type = dictionary.list[j].type;
	 			}
	 		}
	 		//if the network type isn't matched against the dictionary, set type to unknown
	 		if(JSON.networks[i].type === undefined){
	 			JSON.networks[i].type = "unknown";
	 		}

	 		//gives a numerical value to each type of network - useful for d3 visualization later
	 		for(k=0; k < categories.length; k++){
	 			if(JSON.networks[i].type == categories[k]){
	 				JSON.networks[i].index = k+1;
	 			}
	 		}

	 		//builds a list of networks with number of hits and added type property to display on webapge
	 		toWrite += JSON.networks[i].name+': '+JSON.networks[i].hits+' - '+JSON.networks[i].type+' ('+JSON.networks[i].index+')<br>';
	 	};
	 	
	 	//writes the list to the div with id of focus
	 	document.getElementById("focus").innerHTML = toWrite;
 });

 $.getJSON('binned-modified.js', function(response){
       JSON = response;
       $(window).trigger('JSONready');
 });