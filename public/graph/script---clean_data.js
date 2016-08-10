// Read the data.
d3.json("data/clean_data.json", function(error, json) {
    
    if (error) throw error;
    
    drawGraph(json);

});


