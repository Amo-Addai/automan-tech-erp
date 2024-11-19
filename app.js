
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var pid = process.pid;

var config = require('./server/config/environment');

// Connect to database - Mongoose
console.log("Now connecting to Database: " + config.mongo.uri);
console.log("With Options: " + JSON.stringify(config.mongo.options));

mongoose.connect(config.mongo.uri, config.mongo.options)
.then(() => {
  console.log("Connected to Database server (" + config.mongo.uri + ") successfully...");
  console.log("Now, checking if Database seeding/population is required ...");

  // Populate DB with sample data
  if (config.seedDB) require('./server/config/seed'); 
  else console.log("Not Required ..\n")
  // Test DB with sample data
  if (config.testDB) require('./server/config/unit.testing'); 

})
.catch((err) => {
  console.log("Could not connect to Database server (" + config.mongo.uri + ") successfully...");
  if(err) console.log("ERROR -> " + JSON.stringify(err));
});

var app = express();
var path = require('path');

//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
app.use(allowCrossDomain);


// CHANGE THIS TO https WHEN GOING LIVE IN PRODUCTION ENVIRONMENT
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: (config.env === 'production') ? false : true,
  path: '/socket.io-client'
});

require('./server/config/express')(app);
require('./server/routes')(app);
require('./server/config/socketio')(socketio);
require('./server/config/server.scaling')(app);

// Start server - https://localhost:8080 (development/test) & https://automanghana.herokuapp.com (production)

// server.listen(config.port, config.ip, function () {
//   console.log('Server (%s) listening on port %d, in %s mode with process %d', config.ip, config.port, app.get('env'), pid);
// });
server.listen(config.port, function () {
  console.log('Server (%s) listening on port %d, in %s mode with process %d', config.ip, config.port, app.get('env'), pid);
}); 

//  THIS IS FOR WINDOWS (FOR MAC, JUST RUN -> mongo)
// "C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe" - RUN MONGODB INSTANCE
// "C:\Program Files\MongoDB\Server\3.4\bin\mongo.exe" - RUN MONGODB SHELL / CLI
// 
// cd OneDrive\Desktop\WORK\COFUNDIE\CoFundie\API_DASHBOARD\server\views\dashboard\react-material-admin
// cd OneDrive\Desktop\WORK\COFUNDIE\CoFundie\API_DASHBOARD

// Expose app
module.exports = app;

