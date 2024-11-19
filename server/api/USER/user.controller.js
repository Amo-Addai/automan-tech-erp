'use strict';

var jwt = require("jsonwebtoken")
var passport = require('passport');

var funct = require('../../functions');
var config = funct.config;
var auth = funct.auth;
var settings = funct.settings;
funct = funct.funct;
//
// var fileHandler = funct.fileHandler;

var dataHandler = require('../GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
var modelscontrollersHandler = dataHandler.modelscontrollersHandler;

var M = require('./user.model');

exports.M = M;
exports.dataToExclude = M.dataToExclude;
exports.imgdata = M.imgdata.length > 0 ? imgdata : null;;
exports.deepPop = M.deepPop;
exports.mainData = M.mainData;
exports.sort = M.sort;
exports.type = M.type;
exports.validate = M.validate;

// Get all objects within the database
exports.get = async function (req, res) {
    try {
        var result = await modelscontrollersHandler.getAll(M, req.query.condition);
        return funct.sendResponse(res, result.code, result.resultData);
    } catch (err) { // RETURN THE REGULAR DATA, BUT LOG THE .err PROPERTY SO IT CAN BE HANDLED
        console.log("Some error occured -> " + JSON.stringify(err.err));
        return funct.sendResponse(res, err.code, err.resultData);
     }
  };
  
  // Get a single object
  exports.show = async function (req, res, next) {
    try {
        var result = await modelscontrollersHandler.get(M, req.params.id);
        return funct.sendResponse(res, result.code, result.resultData);
    } catch (err) { // RETURN THE REGULAR DATA, BUT LOG THE .err PROPERTY SO IT CAN BE HANDLED
        console.log("Some error occured -> " + JSON.stringify(err.err));
        return funct.sendResponse(res, err.code, err.resultData);
     }
  };
  
  // Creates a new object
  exports.create = async function (req, res, next) {
    try {
        var result = await modelscontrollersHandler.add(M, req.body); // DON'T RETURN USER DATA WITH ACCESS_TOKEN, LET USER LOGIN
        return funct.sendResponse(res, result.code, result.resultData);
    } catch (err) { // RETURN THE REGULAR DATA, BUT LOG THE .err PROPERTY SO IT CAN BE HANDLED
        console.log("Some error occured -> " + JSON.stringify(err.err));
        return funct.sendResponse(res, err.code, err.resultData);
     }
  };
  
  // Updates an existing object in the DB.
  exports.update = async function (req, res) {
    try {
        var result = await modelscontrollersHandler.update(M, req.params.id, req.body); // DON'T RETURN USER DATA WITH ACCESS_TOKEN, LET USER LOGIN
        return funct.sendResponse(res, result.code, result.resultData);
    } catch (err) { // RETURN THE REGULAR DATA, BUT LOG THE .err PROPERTY SO IT CAN BE HANDLED
        console.log("Some error occured -> " + JSON.stringify(err.err));
        return funct.sendResponse(res, err.code, err.resultData);
     }
  };
  
  // Deletes an object
  exports.destroy = async function (req, res) {
    try {
        var result = await modelscontrollersHandler.delete(M, req.params.id);
        return funct.sendResponse(res, result.code, result.resultData);
    } catch (err) { // RETURN THE REGULAR DATA, BUT LOG THE .err PROPERTY SO IT CAN BE HANDLED
        console.log("Some error occured -> " + JSON.stringify(err.err));
        return funct.sendResponse(res, err.code, err.resultData);
     }
  };
  
  // Get number of objects in database
  exports.count = async function (req, res, next) {
    try {
        var result = await modelscontrollersHandler.count(M, req.params.id);
        return funct.sendResponse(res, result.code, result.resultData);
    } catch (err) { // RETURN THE REGULAR DATA, BUT LOG THE .err PROPERTY SO IT CAN BE HANDLED
        console.log("Some error occured -> " + JSON.stringify(err.err));
        return funct.sendResponse(res, err.code, err.resultData);
     }
  };
  
//////////////////////////////////////////
//  OTHER AVAILABLE CONTROLLER FUNCTIONS

exports.resetpassword = function (req, res, next) {
    console.log("RESET PASSWORD!");
    //  USER MUST BE ABLE TO RESET PASSWORD WITH id & username & phone & email & company_email
    if (req.body && Object.keys(req.body).length > 0) {
        var obj = req.body;
        M.Model.findOne({_id: obj._id, username: obj.username, phone: obj.phone, email: obj.email},
            exports.dataToExclude)
            .exec(async function (err, user) {
                try {
                    if (err) {
                        console.log(err);
                        return funct.sendResponse(res, 500, err);
                    } else { 
                        console.log("FOUND USER -> " + JSON.stringify(user));
                        // DON'T USE auth.signToken() COZ IT ALSO DOES SOME AUTO-AUDITING STUFF (WHICH ISN'T REQUIRED HERE)
                        // var token = auth.signToken(user._id, user.role);
                        var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresIn: config.tokenExpiration});
                        var extra = { "Email" : null };
                        var contactData = {
                            user: [user],
                            contact_methods: ['Email'],
                            data: {
                                subject: 'Reset Password',
                                message: 'This email message must have something to do with user resetting a password',
                                extra: {
                                    autoEnum: "user", dataId: user._id, // THIS WON'T BE NECESSARY HERE THOUGH, COZ THIS IS A DIRECT CONTACT ACTION
                                    "Email": extra["Email"] || { 
                                        template: 'reset.password',
                                        context: {
                                            url: "?access_token=" + token
                                        }
                                     },
                                    // "Notification": extra[""] || { 
                                    //     notificationType: null, send_after: null, delayed_option: null, delivery_time_of_day: null,
                                    //     segments: null, player_ids: null, include_player_ids: null, send_after: null, send_after: null,
                                    // },
                                    // "SMS": extra["SMS"] || {  },
                                    // "Company Email": extra["Company Email"] || { template: null, context: null },
                                    // "USSD": extra["USSD"] || {  },
                                    // "Post Mail": extra["Post Mail"] || {  }
                                }
                            }
                        };
                        console.log("CONTACT DATA -> " + JSON.stringify(contactData));
                        // Company Email SHOULD BE USED COZ IT'S THE MOST SECURE
                        var result = await funct.contact('user', contactData, false);
                        return funct.sendResponse(res, result.code, result.resultData);
                    }
                } catch (err){
                    console.log(err);
                    if (err) return funct.sendResponse(res, 500, err);
                }
            });
    } else {
        return funct.sendResponse(res, 400, {success: false, message: 'No request body'});
    }
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
    res.redirect('/');
};

// show the schema of the database object
exports.schema = function (req, res) {
    var schema = [
        {
            name: "Username",
            dbname: "username",
            datatype: "string"
        },
        {
            name: "Possible Password",
            dbname: "password",
            datatype: "string"
        },
        {
            name: "First Name",
            dbname: "first_name",
            datatype: "string"
        },
        {
            name: "Last Name",
            dbname: "last_name",
            datatype: "string"
        },
        {
            name: "Other Names",
            dbname: "other_names",
            datatype: "string"
        },
        {
            name: "Age",
            dbname: "age",
            datatype: "integer"
        },
        {
            name: "Phone",
            dbname: "phone",
            datatype: "string"
        },
        {
            name: "Email",
            dbname: "email",
            datatype: "string"
        },
        {
            name: "Company Email",
            dbname: "company_email",
            datatype: "string"
        },
        {
            name: "Home Address",
            dbname: "home_address",
            datatype: "string"
        },
        {
            name: "Postal Address",
            dbname: "postal_address",
            datatype: "string"
        },
        {
            name: "Security Level",
            dbname: "level_of_security",
            datatype: "integer"
        },
        {
            name: "RFID Card Number",
            dbname: "rfid",
            datatype: "integer"
        },

        {
            name: "Account Number",
            dbname: "account_no",
            datatype: "integer"
        },
        {
            name: "User Type",
            dbname: "type",
            datatype: "options",
            of: "string",
            possiblevalues: config.userTypes  // ['employee', 'client', 'stakeholder']
        },
        {
            name: "Role",
            dbname: "role",
            datatype: "options",
            of: "string",
            possiblevalues: config.userRoles //['user', 'admin', 'AUTOMAN', 'super_admin']
        },
        {
            name: "Means of Contact",
            dbname: "contact_method",
            datatype: "options",
            of: "string",
            possiblevalues: config.contactMethods //['notification', 'email', 'sms']
        },
        ////////////////////////////////////////
        //    NEEDED FOR EDIT AND DETAILS ONLY

        {
            name: "Is Available",
            dbname: "available",
            datatype: "boolean"
        },
        {
            name: "Inside Building",
            dbname: "in_building",
            datatype: "boolean"
        },

        ///////////////////////////////
        //  NEEDED FOR DETAILS ONLY
        {
            name: "Full Name",
            dbname: "full_name",
            datatype: "string"
        },
        {
            name: "Image Name",
            dbname: "image_stub",
            datatype: "string"
        },
        {
            name: "Date Created",
            dbname: "createdAt",
            datatype: "date"
        },

        /////////////////////////////////////////
        //  NOT NEEDED AT ALL, JUST FOR CODE USE
        {
            name: "Location",
            dbname: "location",
            datatype: "array",
            of: "coordinates"
        },
        {
            name: "Is Employee",
            dbname: "is_employee",
            datatype: "boolean"
        },
        {
            name: "Is Client",
            dbname: "is_client",
            datatype: "boolean"
        },
        {
            name: "Is Stakeholder",
            dbname: "is_stakeholder",
            datatype: "boolean"
        },
        {
            name: "Provider",
            dbname: "provider",
            datatype: "string"
        },
        {
            name: "Salt",
            dbname: "salt",
            datatype: "string"
        },
        {
            name: "Hashed Password",
            dbname: "hashedPassword",
            datatype: "string"
        },
        {
            name: "Password",
            dbname: "password",
            datatype: "string"
        },
        /////////////////////////////
        //  OBJECTS
        {
            name: "Employee",
            dbname: "employee",
            datatype: "object",
            of: "employee"
        },
        {
            name: "Client",
            dbname: "client",
            datatype: "object",
            of: "client"
        },
        {
            name: "Stake Holder",
            dbname: "stakeholder",
            datatype: "object",
            of: "stakeholder"
        },
        /////////////////////////////
        //  ARRAYS
        {
            name: "Banks",
            dbname: "banks",
            datatype: "array",
            of: "bank"
        }
    ];
    return funct.sendResponse(res, 200, schema);
};
