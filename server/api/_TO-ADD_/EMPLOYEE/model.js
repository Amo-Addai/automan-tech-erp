"use strict"

var mongoose = require("mongoose"),
  timestamps = require("mongoose-timestamp"),
  deepPopulate = require("mongoose-deep-populate")(mongoose),
  Schema = mongoose.Schema
var settings = require("../../config/settings/controller.js")
var env = require("../../config/environment")
var funct = require("../AUTO_CONTROLLER/functions.js")
var type = "employee"

var EmployeeSchema = new Schema({
  // USER FIELDS

  full_name: String,
  details: String,
  first_name: String,
  last_name: String,
  other_names: String,
  title: String,
  phone: String,
  email: { type: String, lowercase: true },
  home_address: String,
  postal_address: String,

  type: { type: String, default: env.employeeTypesDefault },
  contact_method: {
    type: String,
    enum: env.contactMethods,
    default: env.contactMethodsDefault,
  },

  data: { type: {}, default: config.employeeDataDefault },

  datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: "DataSecurity" },

  meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  banks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bank" }],
  companies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],

  image_stub: String,
  date_created: { type: Date, default: Date.now },

  // EMPLOYEE-ONLY FIELDS // TODO ITDs required here

  salary: Number,
  contract_details: String,
  date_of_employment: Date,
  is_user: Boolean,
  is_head_of_project: Boolean,
  is_head_of_task: Boolean,
  is_head_of_department: Boolean,
  is_head_of_company: Boolean,
  is_head_of_meeting: Boolean,

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  performance: { type: mongoose.Schema.Types.ObjectId, ref: "Performance" },
  position: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },

  head_of_projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  head_of_tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  head_of_departments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  ],
  head_of_companies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
  head_of_meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }],

  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
  sub_employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  completed_projects: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  ],
  completed_tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
})

var x
for (x of ["save", "update"]) {
  EmployeeSchema.pre(x, function (next) {
    EmployeeSchema.methods.encryptData()
    next()
  })
}
for (x of ["find", "findOne"]) {
  EmployeeSchema.pre(x, function (next) {
    EmployeeSchema.methods.decryptData()
    next()
  })
}
for (x of ["remove"]) {
  EmployeeSchema.post(x, function (next) {
    // DELETE THIS OBJECT'S DATASECURITY OBJECT
    EmployeeSchema.methods.deleteDataSecurity()
  })
}

EmployeeSchema.methods = {
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

EmployeeSchema.plugin(timestamps, {})
EmployeeSchema.plugin(deepPopulate, {})
var Model = mongoose.model("Employee", EmployeeSchema)

var PublicMethods = {
  mainData:
    "full_name details first_name last_name other_names title phone email home_address postal_address contact_method salary contract_details date_of_employment is_user" +
    this.getIsHeadOf(),
  deepPop:
    "datasecurity parent user performance position projects tasks completed_projects completed_tasks sub_employees departments accounts banks companies",
  dataToExclude: "",
  imgdata: "",
  sort: "full_name",
  type: type,

  getIsHeadOf: function getIsHeadOf() {
    var str = ""
    for (let x of ["project", "task", "department", "company", "meeting"]) {
      str += " is_head_of_" + x
    }
    return str
  },

  validate: function validate(obj, add) {
    // full_name, date_created, image_stub, performance, position, create user object SHOULD BE SETTLED HERE
    if (add) {
      obj.date_created = Date.now()
      obj.performance = {}
      obj.position = {}
    } else {
      if (obj._id) {
        delete obj._id
      }
    }
    obj.full_name =
      obj.first_name + " " + obj.last_name + " " + obj.other_names + ""
    obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/EMPLOYEE/" + obj._id
    if (obj.security) {
      obj.datasecurity = funct.getDataSecurityObject(type, obj)
      delete obj.security
    }
    obj = funct.createUpdateUserTypeWithUser(obj)
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
