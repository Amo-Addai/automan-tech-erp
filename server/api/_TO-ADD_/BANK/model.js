"use strict"

var mongoose = require("mongoose"),
  timestamps = require("mongoose-timestamp"),
  deepPopulate = require("mongoose-deep-populate")(mongoose),
  Schema = mongoose.Schema
var settings = require("../../config/settings/controller.js")
var env = require("../../config/environment")
var funct = require("../AUTO_CONTROLLER/functions.js")
var type = "bank"

var BankSchema = new Schema({
  name: String,
  details: String,
  phone: String,
  email: { type: String, lowercase: true },
  home_address: String,
  postal_address: String,
  contact_method: {
    type: String,
    enum: env.contactMethods,
    default: env.contactMethodsDefault,
  },
  branches: [String],

  type: {
    type: String,
    enum: config.bankTypes,
    default: config.bankTypesDefault,
  },
  data: { type: {}, default: config.bankDataDefault },

  datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: "DataSecurity" },

  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Client" }],
  stakeholders: [{ type: mongoose.Schema.Types.ObjectId, ref: "StakeHolder" }],
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],

  image_stub: String,
  date_created: { type: Date, default: Date.now },
})

var x
for (x of ["save", "update"]) {
  BankSchema.pre(x, function (next) {
    BankSchema.methods.encryptData()
    next()
  })
}
for (x of ["find", "findOne"]) {
  BankSchema.pre(x, function (next) {
    BankSchema.methods.decryptData()
    next()
  })
}
for (x of ["remove"]) {
  BankSchema.post(x, function (next) {
    // DELETE THIS OBJECT'S DATASECURITY OBJECT
    BankSchema.methods.deleteDataSecurity()
  })
}

BankSchema.methods = {
  encryptData: function () {
    var x = funct.encryptData(type, this)
    for (var key in x) {
      this[key] = x[key] // DO THIS TO ONLY EDIT PROPS OF this WHICH ARE PRESENT IN x
    }
  },
  decryptData: function () {
    var x = funct.decryptData(type, this)
    for (var key in x) {
      this[key] = x[key]
    }
  },
  deleteDataSecurity: function () {
    return funct.deleteDataSecurityObject(type, this) // THIS RETURNED BOOLEAN VALUE WON'T EVEN BE USED THOUGH
  },
}

BankSchema.plugin(timestamps, {})
BankSchema.plugin(deepPopulate, {})
var Model = mongoose.model("Bank", BankSchema)

var PublicMethods = {
  mainData:
    "name details phone email home_address postal_address contact_method branches",
  deepPop: "datasecurity accounts employees clients stakeholders",
  dataToExclude: "",
  imgdata: "",
  sort: "name",
  type: type,

  validate: function validate(obj, add) {
    // date_created, image_stub SHOULD BE SETTLED HERE
    if (add) {
      obj.date_created = Date.now()
    } else {
      if (obj._id) {
        delete obj._id
      }
    }
    obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/BANK/" + obj._id
    if (obj.security) {
      obj.datasecurity = funct.getDataSecurityObject(type, obj)
      delete obj.security
    }
    obj.users = funct.getUsersInvolved(obj)
    if (obj.image_data) {
      imgdata = obj.image_data
      obj.image_data = null
      delete obj.image_data
    }
    return obj
  },

  Model: Model,
}
module.exports = PublicMethods
