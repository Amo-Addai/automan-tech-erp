'use strict'

var funct = require('../AUTO_CONTROLLER/functions.js')
var M = require('./model.js')
var config = require('../../config/environment')
var settings = require('../../config/settings/controller.js')
//
var fileHandler = require('./AUTO_DIRECTORY/FileHandler.js')
var dataHandler = require('./AUTO_DATABASE/DataHandler.js')
//
var modelHandlers = dataHandler.modelHandlers

exports.dataToExclude = M.dataToExclude
exports.imgdata = M.imgdata.length > 0 ? imgdata : null
exports.deepPop = M.deepPop
exports.mainData = M.mainData
exports.sort = M.sort
exports.type = M.type
exports.validate = M.validate

// Get all objects within the database
exports.get = async (req, res) => {
  var result = modelHandlers.getAll(this.type, req.query.condition)
  return funct.sendResponse(res, result.code, result.resultData)
}

// Get a single object
exports.show = async (req, res) => {
  var result = modelHandlers.get(this.type, req.params.id)
  return funct.sendResponse(res, result.code, result.resultData)
}

// Creates a new object
exports.create = async (req, res) => {
  var result = modelHandlers.add(this.type, req.body) // DON'T RETURN USER DATA WITH ACCESS_TOKEN, LET USER LOGIN
  return funct.sendResponse(res, result.code, result.resultData)
}

// Updates an existing object in the DB.
exports.update = async (req, res) => {
  var result = modelHandlers.update(this.type, req.params.id, req.body) // DON'T RETURN USER DATA WITH ACCESS_TOKEN, LET USER LOGIN
  return funct.sendResponse(res, result.code, result.resultData)
}

// Deletes an object
exports.destroy = async (req, res) => {
  var result = modelHandlers.delete(this.type, req.params.id)
  return funct.sendResponse(res, result.code, result.resultData)
}

// Get number of objects in database
exports.count = async (req, res) => {
  var result = modelHandlers.count(this.type, req.params.id)
  return funct.sendResponse(res, result.code, result.resultData)
}

//////////////////////////////////////////
//  OTHER AVAILABLE CONTROLLER FUNCTIONS

// show the schema of the database object
exports.schema = function(req, res){
    var schema = [
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
            name: "Details",
            dbname: "details",
            datatype: "string"
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
            name: "Security Level",
            dbname: "level_of_security",
            datatype: "integer"
        },
        {
            name: "Client Type",
            dbname: "type",
            datatype: "options",
            of: "string",
            possiblevalues: config.clientTypes //["individual", "company", "country"]
        },

        ////////////////////////////////////////
        //    NEEDED FOR EDIT AND DETAILS ONLY

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
        /////////////////////////////
        //  OBJECTS
        {   // CREATE USER OBJECT BASED ON CLIENT DETAILS
            name: "User",
            dbname: "user",
            datatype: "obj",
            of: "user"
        },
        /////////////////////////////
        //  ARRAYS
        {
            name: "Companies",
            dbname: "companies",
            datatype: "array",
            of: "companies"
        },
        {
            name: "Banks",
            dbname: "banks",
            datatype: "array",
            of: "banks"
        },
        {
            name: "Projects",
            dbname: "projects",
            datatype: "array",
            of: "projects"
        }
    ]
    return funct.sendResponse(res, 200, schema)
}
