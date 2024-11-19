'use strict'

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema
var settings = require('../../config/settings/controller.js')
var env = require('../../config/environment')
var funct = require('../AUTO_CONTROLLER/functions.js')
var type = "performance"

var PerformanceSchema = new Schema({
    name: String,
    details: String,

    type: { type: String, enum: env.performanceTypes, default: env.performanceTypesDefault }, //employee, department, company
    grade: { type: String, enum: env.performanceGrades, default: env.performanceGradesDefault }, // COMPANY DEFINES THE DIFFERENT GRADES

    data: {},
    appraisal: {},
    RIs: {},
    KRIs: {},

    datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity' },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

    completed_projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    completed_tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    completed_projects_before_deadline: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    completed_tasks_before_deadline: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    completed_projects_after_deadline: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    completed_tasks_after_deadline: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],

    image_stub: String,
    date_created: { type: Date, default: Date.now },

})

var x
for(x of ['save', 'update']){
    PerformanceSchema.pre(x, function(next) {
        PerformanceSchema.methods.encryptData()
        next()
    })
}
for(x of ['find', 'findOne']){
    PerformanceSchema.pre(x, function(next) {
        PerformanceSchema.methods.decryptData()
        next()
    })
}
for(x of ['remove']){
    PerformanceSchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        PerformanceSchema.methods.deleteDataSecurity()
    })
}

PerformanceSchema.methods = {
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

PerformanceSchema.plugin(timestamps, {})
PerformanceSchema.plugin(deepPopulate, {})
var Model = mongoose.model('Performance', PerformanceSchema)

var PublicMethods = {
  mainData : 'name details type grade appraisal',
  deepPop : 'datasecurity employee department company completed_projects completed_tasks completed_projects_before_deadline completed_tasks_before_deadline completed_projects_after_deadline completed_tasks_after_deadline',
  dataToExclude : '',
  imgdata : '',
  sort : 'name',
  type : type,

    validate: function validate(obj, add) {
        if(add){
        // date_created SHOULD BE SETTLED HERE
            obj.date_created = Date.now()
        } else {
            if (obj._id) {
                delete obj._id
            }
        }
        obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/PERFORMANCE/" + obj._id
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
