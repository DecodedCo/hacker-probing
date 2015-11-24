// example curl:
// curl -F data=@output.log ip:5000

var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer();
var Converter = require("csvtojson").Converter;
var fs = require('fs');

app.set('port', (process.env.PORT || 5000));

/*****************************\
| DO NOT REMOVE THIS FUNCTION |
\*****************************/
app.use(function(request, response, next) {
  var ipAddr = request.headers["x-forwarded-for"];
  if (ipAddr){
    var list = ipAddr.split(",");
    ipAddr = list[list.length-1];
  } else {
    ipAddr = request.connection.remoteAddress;
  }
  // Allow access to labs
  allowed_ips = ['::1','127.0.0.1','localhost','::ffff:127.0.0.1','::ffff:172.16.1.201'];
  if (ipAddr === process.env.LABS_IP || allowed_ips.indexOf(ipAddr) != -1) {
    next();
  } else {
    response.status(403);
    response.send('Direct access forbidden', ipAddr);
    response.end();
  }
})
/*****************\
| OK, CARRY ON... |
\*****************/

app.post('/', upload.single('data'), function(req, res) {
  var incomingData = req.file.buffer.toString();
  // get fresh copy of db
  console.log("Received POST with data");

  fs.readFile('ssids.json', function (err, data) {
    if (err) throw err;
    var ssids = JSON.parse(data);
    var converter = new Converter({
      noheader: true,
      headers: ["MAC", "SSID"]
    });
    converter.fromString(incomingData, function(err,parsedData){
      if (err) throw err;
      // MVP: just tally list of SSIDs by number
      parsedData.forEach(function(ssid) {
        if (ssid.SSID in ssids) {
          ssids[ssid.SSID] += 1;
        } else {
          ssids[ssid.SSID] = 1;
        }
      });

      fs.writeFile('ssids.json', JSON.stringify(ssids), function(err) {
        if (err) throw err;
        res.end("Om nom nom\n");
      });

    });

  });

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


