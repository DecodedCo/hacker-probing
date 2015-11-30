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
	 	//data.networks = _.sortBy(data.networks, "hits");
    data.networks = data.networks.sort( function( a, b ) { return b.hits - a.hits; } )
    //data.networks = data.networks.reverse;

	 	//build the JSON object for sunburst visualization
	 	/*var root = {"name": "root", "children": []};
	 	var parentcount = 0;
	 	var childcount = 0;
	 	for(i=0; i < data.networks.length; i++){
	 		if(i==0){
	 			root.children[parentcount] = {"name":data.networks[i].type, "children":[]};
	 			root.children[parentcount].children[childcount] = {"name":data.networks[i].type,"size":data.networks[i].hits,"label":data.networks[i].name};
	 			childcount++;
	 		} else {
	 			if(data.networks[i].index == data.networks[i-1].index){
	 				root.children[parentcount].children[childcount] = {"name":data.networks[i].type,"size":data.networks[i].hits,"label":data.networks[i].name};
	 				childcount++;
	 			} else {
	 				parentcount++;
	 				childcount = 0;
	 				root.children[parentcount] = {"name":data.networks[i].type, "children":[]};
	 				root.children[parentcount].children[childcount] = {"name":data.networks[i].type,"size":data.networks[i].hits,"label":data.networks[i].name};
	 				childcount++;
	 			}
	 		}
	 	}*/
	 	//console.log(root);

		/*fs.writeFile('message.txt', 'Hello Node.js', function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		});*/

	 	//builds a list of networks with number of hits and added type property to display on webapge
    maxLength = (data.networks.length > 30) ? 30 : data.networks.length;

	 	for(i=0; i < maxLength; i++){
	 		//toWrite += '{"name":"'+data.networks[i].name+'","hits":'+data.networks[i].hits+',"type":"'+data.networks[i].type+'","index":'+data.networks[i].index+'},<br>';
      toWrite += '<p><img src="wifi-favicon.png"><span class="networkname">'+data.networks[i].name+'</span> ('+data.networks[i].hits+')</p>';
	 	};

	 	//writes the list to the div with id of focus
	 	document.getElementById("focus").innerHTML = toWrite;

/*
// Dimensions of sunburst.
var width = 750;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
  "home": "#5687d1",
  "public": "#7b615c",
  "office": "#de783b",
  "food": "#6ab975",
  "hotel": "#a173d1",
  "unknown": "#bbbbbb"
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

var json = root;
createVisualization(json);

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  drawLegend();
  d3.select("#togglelegend").on("click", toggleLegend);

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition.nodes(json)
      .filter(function(d) {
      return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.name]; })
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.node().__data__.value;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  d3.select("#percentage")
      .text(percentageString);

  d3.select("#explanation")
      .style("visibility", "");

  var sequenceArray = getAncestors(d);
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .style("visibility", "hidden");
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.name + d.depth; });

  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return colors[d.name]; });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.name; });

  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");

}

function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 75, h: 30, s: 3, r: 3
  };

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(colors).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });
}

function toggleLegend() {
  var legend = d3.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}
*/

});
















$(window).on('JSONlistready', function(){
 	var data = {"nodes":[], "links":[]};
 	var keys = _.keys(JSONlist);
 	var values = _.values(JSONlist);
  var newkeys = [];
  var newvalues = [];

  //remove keys and values for which there are no common ssids
  //console.log(keys);
  //console.log(values);
  for(i=0; i < keys.length; i++){
    var keep = 0;
    for(j=0; j < keys.length-i; j++){
      for(k=0; k < values[i].length; k++){
        for(l=0; l < values[j].length; l++){
          if(values[i][k] == values[j][l]){
            keep = 1;
          }
        }
      }
    }
    if(keep == 1){
      newkeys.push(keys[i]);
      newvalues.push(values[i]);
    }
  }

  keys = newkeys;
  values = newvalues;

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

	//d3 network visualization of machines which have connected to a common ssid
	var width = 800,
	    height = 800;

	var svg = d3.select("#network").append("svg")
	    .attr("width", width)
	    .attr("height", height);

	var force = d3.layout.force()
	    .gravity(.05)
	    .distance(100)
	    .charge(-100)
	    .size([width, height]);

	force
	    .nodes(data.nodes)
	    .links(data.links)
	    .start();

	var link = svg.selectAll(".link")
	    .data(data.links)
	    .enter().append("line")
	    .attr("class", "link");

	var node = svg.selectAll(".node")
	    .data(data.nodes)
	    .enter().append("g")
	    .attr("class", "node")
	    .call(force.drag);

	node.append("image")
	    .attr("xlink:href", "mobile-favicon.png")
	    .attr("x", -8)
	    .attr("y", -8)
	    .attr("width", 16)
	    .attr("height", 16);

	node.append("text")
	    .attr("dx", 12)
	    .attr("dy", ".35em")
	    .text(function(d) { return d.name });

	force.on("tick", function() {
	    link.attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { return d.target.x; })
	        .attr("y2", function(d) { return d.target.y; });

	    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	});
	//END of d3 visualization
});

$.getJSON('api/users/', function(response){
       JSONlist = response;
       $(window).trigger('JSONlistready');
});
$.getJSON('api/ssids/', function(response){
       JSON = response;
       $(window).trigger('JSONready');
});
