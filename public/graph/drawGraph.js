var myObj;

function drawGraph (graphData) {

    var width = 0.9 * $(window).width(),
        height = 0.9 * $(window).height();
    var radius = 14;

    // Create the svg-container
    var svg = d3.select("body")
        .append("svg")
        .attr("id","svg-chart")
        .attr("width", width)
        .attr("height", height);

    // Initiate the force.
    var force = d3.layout.force()
        .gravity(0.1) //.gravity(0.15)
        .distance(55) //.distance(50)
        .charge(-200) //.charge(-150)
        .size([width, height]);

    force.nodes(graphData.nodes)
        .links(graphData.links)
        .start();

    // add all edges. - put them in a group.
    var edges = svg.append('g').attr('id','edges-group');
    var link = edges.selectAll(".link")
        .data(graphData.links)
        .enter().append("line")
        .attr("class", "link");

    var nodes = svg.append('g').attr('id','nodes-group');
    var node = nodes.selectAll(".node")
        .data(graphData.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);
    // add the node-circle to the group
    node.append("circle")
        .attr("r", radius)
        .attr("class", function (d,i) {
            if (d.group == 1) {
                return 'devices';
            }
            else if (d.group == 2) {
                return 'accesspoints';
            }
        });
    // add the image to the group
    node.append("image")
        .attr("xlink:href", function (d) {
            var u  = Math.random();
            if ( d.group == 1 ) {
                if ( u < 0.5 ) {
                    return "https://cdn3.iconfinder.com/data/icons/mobile-phone-icons/512/Slide_Phone-256.png";
                }
                else {
                    return "http://icons.iconseeker.com/png/fullsize/clearblack/black-computer.png";
                }
            }
            else {
                return "http://image.flaticon.com/icons/png/128/53/53524.png";
            }
        })
        .attr("x", -8)
        .attr("y", -8)
        .attr("width", 16)
        .attr("height", 16)
        .append("text").text( function (d) { 
            return d.name
        });

    d3.select("circle")
        .append("text") //used to be "title" which creates default tooltip
        .text( function (d) { return d.name; })
        .attr("cx", function (d) { return d; })
        .attr("cy", function (d) { return d; })


    // Add the mouseover to the circle.
    d3.selectAll("image")
        .on("mouseover", function () {

            myObj = $(this);

            var curr_circle = $($(this).parent()).children()[0]
            var parent = d3.select(curr_circle.parentNode),
                self = d3.select(curr_circle),        
                trans = d3.transform(parent.attr("transform")).translate,
                x = +self.attr('cx') + trans[0],
                y = +self.attr('cy') + trans[1];

            console.log(x,y);
            $("#tooltip").html($(this).text());
            $("#tooltip").css("position","fixed");
            $("#tooltip").css("top",(y-20) + "px");
            $("#tooltip").css("left", (x-40) + "px");
            $("#tooltip").show();

            var curr_r = d3.select(curr_circle).attr('r')
            d3.select(curr_circle).attr('r', curr_r*1.5)
        })
        .on("mouseout", function (ev) {
            $("#tooltip").hide();
            var curr_circle = $($(this).parent()).children()[0];
            var curr_r = d3.select(curr_circle).attr('r');
            d3.select(curr_circle).attr('r', curr_r/1.5);
        });

    // Create the tick function that is used to update positions of the nodes/edges.
    force.on("tick", function() {
        link.attr("x1", function (d) { return Math.max(radius, Math.min(width - radius, d.source.x));  })
            .attr("y1", function (d) { return Math.min(height - radius, d.source.y); })
            .attr("x2", function (d) { return Math.max(radius, Math.min(width - radius, d.target.x)); })
            .attr("y2", function (d) { return Math.min(height - radius, d.target.y); });

        node.attr("transform", function (d) { 
            return "translate(" + Math.max(radius, Math.min(width - radius, d.x)) + "," + Math.max(radius, Math.min(height - radius, d.y)) + ")"; 
        });
    });

} // end of function drawGraph