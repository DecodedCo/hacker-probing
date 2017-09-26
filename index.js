// example curl:
// curl -F data=@output.log ip:5000/api/data/

var fs = require('fs');

var csvtojson = require('csvtojson');
var express = require('express');
var expressAuth0Simple = require('express-auth0-simple');
var dotenv = require('dotenv');
var multer = require('multer');

var Converter = csvtojson.Converter;

dotenv.config();

var app = express();
var auth = new expressAuth0Simple(app);
var upload = multer();

app.set('port', (process.env.PORT || 5000));

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
      // order the data
      sorted_ssid_keys = Object.keys(ssids).sort(function(a,b){
        return ssids[b] - ssids[a];
      });
      sorted_ssids = {};
      sorted_ssid_keys.forEach(function(key) {
        sorted_ssids[key] = ssids[key];
      });
      // save the result
      fs.writeFile('ssids.json', JSON.stringify(sorted_ssids), function(err) {
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
            // order the data
            sorted_user_keys = Object.keys(users).sort(function(a,b){
              return users[b].length - users[a].length;
            });
            sorted_users = {};
            sorted_user_keys.forEach(function(key) {
              sorted_users[key] = users[key];
            });
            // save the data
            fs.writeFile('users.json', JSON.stringify(sorted_users), function(err) {
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

// all routes defined after this point will be protected by auth
app.use(auth.requiresLogin);

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

// Switch it on
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
