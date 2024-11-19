'use strict'

var funct = require('../AUTO_CONTROLLER/functions.js')
var M = require('./model.js')
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
exports.schema = async (req, res) => {
    var schema = [
        {
            name: "Name",
            dbname: "name",
            datatype: "string"
        },
        {
            name: "Details",
            dbname: "details",
            datatype: "string"
        },
        {
            name: "Security Level",
            dbname: "level_of_security",
            datatype: "integer"
        },
        /////////////////////////////
        //   NEEDED FOR EDIT AND DETAILS ONLY
        {
            name: "Age",
            dbname: "age",
            datatype: "integer"
        },
        ////////////////////////////////////////////////////
        //   NEEDED FOR DETAILS ONLY
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
        {
            name: "Performance",
            dbname: "performance",
            datatype: "object",
            of: "performance"
        },
        /////////////////////////////
        //      OBJECTS
        {
            name: "Parent Company",
            dbname: "parent",
            datatype: "object",
            of: "Company"
        },
        {
            name: "Head of Company",
            dbname: "head_of_Company",
            datatype: "object",
            of: "employee"
        },
        /////////////////////////////
        //      ARRAYS
        {
            name: "Sub-Companys",
            dbname: "sub_Companys",
            datatype: "array",
            of: "Company"
        },
        {
            name: "Projects",
            dbname: "projects",
            datatype: "array",
            of: "project"
        },
        {
            name: "Tasks",
            dbname: "tasks",
            datatype: "array",
            of: "task"
        },
        {
            name: "Employees",
            dbname: "employees",
            datatype: "array",
            of: "employee"
        },
        {
            name: "Completed Projects",
            dbname: "completed_projects",
            datatype: "array",
            of: "project"
        },
        {
            name: "Completed Tasks",
            dbname: "completed_tasks",
            datatype: "array",
            of: "task"
        }
    ]
    return funct.sendResponse(res, 200, schema)
}
