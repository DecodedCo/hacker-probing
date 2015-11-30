// example curl:
// curl -F data=@output.log ip:5000/api/data/

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

// Return all ssid counts
app.get('/api/ssids/', function(req, res) {
  fs.readFile('ssids.json', function (err, data) {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
});

// Return all users and their ssids for network analysis
app.get('/api/users/', function(req, res) {
  fs.readFile('users.json', function (err, data) {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
});

// Feedback on available endpoints
app.get('/api/', function(req, res) {
  res.json( { "Available endpoints": ["GET /api/ssids/", "GET /api/users/", "POST /api/", "DELETE /api/"] } );
});

// Clear out data
app.delete('/api/', function(req, res) {
  fs.writeFile('ssids.json', "{}", function(err) {
    if (err) throw err;
    console.log("Emptied ssid file");
    fs.writeFile('users.json', "{}", function(err) {
      if (err) throw err;
      console.log("Emptied users file");
      res.json({"message" : "Cleared"});
    });
  });
});

// Process incoming data and store
app.post('/api/', upload.single('data'), function(req, res) {
  // convert file upload to string
  var incomingData = req.file.buffer.toString();
  // get fresh copy of current stored ssids
  fs.readFile('ssids.json', function (err, data) {
    if (err) throw err;
    var ssids = JSON.parse(data);
    // convert uploaded csv data to an object
    var converter = new Converter({
      noheader: true,
      headers: ["MAC", "SSID"]
    });
    converter.fromString(incomingData, function(err,parsedData){
      if (err) throw err;
      console.log("Received ",parsedData.length, " items");
      // tally list of SSIDs by number
      parsedData.forEach(function(ssid) {
        // make sure SSID has valid name
        if (typeof ssid.SSID == "string" && ssid.SSID.length > 0) {
          if (ssid.SSID in ssids) {
            // Increment existing ssid
            ssids[ssid.SSID] += 1;
          } else {
            // Add new ssid
            ssids[ssid.SSID] = 1;
          }
        }
      });

      // save the result
      fs.writeFile('ssids.json', JSON.stringify(ssids), function(err) {
        if (err) throw err;
        console.log("Saved ssids to disk");

        // now load up users.json and update
        fs.readFile('users.json', function (err, data) {
          if (err) throw err;
          var users = JSON.parse(data);
          var converter = new Converter({
            noheader: true,
            headers: ["MAC", "SSID"]
          });
          converter.fromString(incomingData, function(err,parsedData){
            if (err) throw err;
            // compile a list of ssids by user for network analysis
            parsedData.forEach(function(user) {
              // check for valid SSID name
              if (typeof user.SSID == "string" && user.SSID.length > 0) {
                if (user.MAC in users) {
                  if (users[user.MAC].indexOf(user.SSID) > -1) {
                    // skip as SSID already noted
                  } else {
                    // add new mac to this user
                    users[user.MAC].push(user.SSID);
                  }
                } else {
                  // create the user with their first ssid
                  users[user.MAC] = Array(user.SSID);
                }
              }
            });
            // save the data
            fs.writeFile('users.json', JSON.stringify(users), function(err) {
              if (err) throw err;
              console.log("Saved users to disk");
              res.end("Om nom nom\n");
            });
          });
        });
      });
    });
  });
});

// Serve front page
app.use(express.static('public'));

// Switch it on
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
