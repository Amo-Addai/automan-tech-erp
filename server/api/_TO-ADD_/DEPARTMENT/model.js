'use strict'

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema
var settings = require('../../config/settings/controller.js')
var env = require('../../config/environment')
var funct = require('../AUTO_CONTROLLER/functions.js')
var type = "department"

var DepartmentSchema = new Schema({
    name: String,
    details: String,
    age: Number,

    type: String,
    data: {},

    datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity' },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    parent : { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    performance: { type: mongoose.Schema.Types.ObjectId, ref: 'Performance' },
    position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    completed_projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    completed_tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    sub_departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    banks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bank' }],

    image_stub: String,
    date_created: { type: Date, default: Date.now },

})

var x
for(x of ['save', 'update']){
    DepartmentSchema.pre(x, function(next) {
        DepartmentSchema.methods.encryptData()
        next()
    })
}
for(x of ['find', 'findOne']){
    DepartmentSchema.pre(x, function(next) {
        DepartmentSchema.methods.decryptData()
        next()
    })
}
for(x of ['remove']){
    DepartmentSchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        DepartmentSchema.methods.deleteDataSecurity()
    })
}

DepartmentSchema.methods = {
    encryptData: function(){
        var x = funct.encryptData(type, this)
        for(var key in x){
            this[key] = x[key] // DO THIS TO ONLY EDIT PROPS OF this WHICH ARE PRESENT IN x
        }
    },
    decryptData: function(){
        var x = funct.decryptData(type, this)
        for(var key in x){
            this[key] = x[key]
        }
    },
    deleteDataSecurity: function(){
        return funct.deleteDataSecurityObject(type, this) // THIS RETURNED BOOLEAN VALUE WON'T EVEN BE USED THOUGH
    }
}

DepartmentSchema.plugin(timestamps, {})
DepartmentSchema.plugin(deepPopulate, {})
var Model = mongoose.model('Department', DepartmentSchema)

var PublicMethods = {
  mainData : 'name details age',
  deepPop : 'datasecurity parent head performance position company projects tasks employees sub_departments completed_projects completed_tasks accounts banks',
  dataToExclude : '',
  imgdata : '',
  sort : 'name',
  type : type,

    validate: function validate(obj, add) {
        // age, date_created, image_stub, performance SHOULD BE SETTLED HERE
        if(add){
            obj.age = 0; obj.date_created = Date.now(); obj.performance = {}
        } else {
            if (obj._id) {
                delete obj._id
            }
        }
        obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/DEPARTMENT/" + obj._id
        if(obj.security){
            obj.datasecurity = funct.getDataSecurityObject(type, obj)
            delete obj.security
        }

        if(obj.image_data){
            imgdata = obj.image_data
            obj.image_data = null
            delete obj.image_data
        }
        return obj
    },

  Model : Model

}
module.exports = PublicMethods
