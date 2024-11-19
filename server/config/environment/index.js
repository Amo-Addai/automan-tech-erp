'use strict';

var path = require('path');

// // THIS ISN'T REQUIRED, COZ IT'LL CAUSE A CYCLIC DEPENDENCY BETWEEN THIS FILE AND functions.js
// // WELL APPARENTLY, THIS SHIT'S ACTUALLY WORKING SO... .... HMMMMM ..
// var funct = require('../../functions'); 
// var settings = funct.settings;
// console.log(settings.getValue("hahahaha"));

function requiredProcessEnv(name) {
    if (!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable');
    }
    return process.env[name];
} // RUN THIS BELOW TO MAKE SURE THAT ALL THE REQUIRED ENVIRONMENT VARIABLES ARE AVAILABLE ..
// for(var k of ["NODE_ENV", "PROTOCOL", "IP", "DOMAIN", "PORT"]) requiredProcessEnv(k);

// All configurations will extend these options
// ============================================
var all = {

    env: process.env.NODE_ENV || "development",

    // YOU CAN LET SETTINGS CONTROL THIS VARIABLE (IF POSSIBLE)
    protocol: process.env.PROTOCOL || 'http://', 

    // YOU CAN LET SETTINGS CONTROL THIS VARIABLE (IF POSSIBLE)
    ip: process.env.IP || 'localhost/', 

    // Server port
    port: process.env.PORT || 8080,

    urls: {
        website: 'https://www.cofundie.com/',
        dashboard: 'https://app.cofundie.com/',

    },

    // MongoDB connection options
    mongo: { // MONGODB URI FORMAT: mongodb://username:password@host:port/database
        uri: "mongodb://localhost/automanapi-dev",
        options : {
            useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
            // db: {
            //     safe: true
            // }
        }
    },

    // Should we populate the DB with sample data?
    seedDB: false, // true, // 
    // Should we test the DB with sample data?
    testDB: false,

    // Root path of server
    root: path.normalize(__dirname + '/../../..'),

    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
        "session" : process.env.SECRET_SESSION || "automan-secret"
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///             THE GENERIC ENVIRONMENTAL VARIABLES
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // FIND A WAY TO MAKE THESE 2 PROPERTIES WORK PERFECTLY
    _settingsFile: 'settings', 
    get settingsFile (){ // THESE KIND OF get ACCESSORS CAN ONLY BE CALLED OUTSIDE THIS LITERAL DEFINITION
        return this._settingsFile;
    },
    _defaultSettingsFile:  'default_settings', 
    get defaultSettingsFile(){
        return this._defaultSettingsFile;
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////EXTRA SETTINGSS///////////////////////////////////////////////////////
    tokenExpiration: "1h", // 10000000000, //settings.getValue("tokenExpiration") ||  
    userEditTokenExpiration: 500, //settings.getValue("userEditTokenExpiration") || 
    autoAuditTokenExpiration: 1000, //settings.getValue("autoAuditTokenExpiration") || 
    
};

// Export the config object based on the NODE_ENV
module.exports = Object.assign(all, require('./' + process.env.NODE_ENV + '.js') || {});
