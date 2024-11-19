'use strict';

var mongoose = require('mongoose');

console.log("Initiating Unit Tests");

// THESE MODELS MIGHT NOT EVEN BE NEEDED ANYMORE - BUT REQUIRE THEM ANYWAY SO THEY'LL ALL BE DEFINED WITHIN MONGOOSE
// var User = require('../api/USER/user.spec');
// var AutoLog = require('../config/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOLOG/autolog.spec');
// var AutoEvent = require('../config/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOEVENT/autoevent.spec');

require('../api/USER/user.spec');
require('../config/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOLOG/autolog.spec');
require('../config/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOEVENT/autoevent.spec');

var data = {
  "User": [
      
  ],
  "AutoLog": [

  ],
  "AutoEvent": [

  ],
}

for(var x of ["User", "AutoLog", "AutoEvent"
]){
  runTests(x);
}

function runTests(type){
  console.log("Now testing data for Table - " + type);
  
}