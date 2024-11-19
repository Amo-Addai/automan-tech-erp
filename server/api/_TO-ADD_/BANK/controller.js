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
exports.schema = function(req, res, next){
  var schema = []
  return funct.sendResponse(res, 200, schema)
}
