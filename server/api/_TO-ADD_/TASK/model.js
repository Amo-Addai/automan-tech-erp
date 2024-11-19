'use strict'

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema
var settings = require('../../config/settings/controller.js')
var env = require('../../config/environment')
var funct = require('../AUTO_CONTROLLER/functions.js')
var type = "task"

var TaskSchema = new Schema({
    name: String,
    details: String,
    is_assigned: Boolean,
    start_date: Date,
    deadline: Date,
    read: Boolean,
    type: String,
    data: {},

    //  DATA FOR COMPLETiON & VALIDATION
    is_completed: Boolean,
    performance_grade: { type: String, enum: env.performanceGrades, default: env.performanceGradesDefault },
    completion_remarks: {
        "employees": [
            {
                "employee": "",
                "remark": "",
                "percentage": 100
            }
        ],
        "clients": [
            {
                "client": "",
                "remark": "",
                "percentage": 100
            }
        ],
        "stakeholders": [
            {
                "stakeholder": "",
                "remark": "",
                "percentage": 100
            }
        ],
    },

    datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity' },
    parent : { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    head : { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

    sub_tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
    stakeholders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StakeHolder' }],

    image_stub: String,
    date_created: { type: Date, default: Date.now },

})

var x
for(x of ['save', 'update']){
    TaskSchema.pre(x, function(next) {
        TaskSchema.methods.encryptData()
        next()
    })
}
for(x of ['find', 'findOne']){
    TaskSchema.pre(x, function(next) {
        TaskSchema.methods.decryptData()
        next()
    })
}
for(x of ['remove']){
    TaskSchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        TaskSchema.methods.deleteDataSecurity()
    })
}

TaskSchema.methods = {
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

TaskSchema.plugin(timestamps, {})
TaskSchema.plugin(deepPopulate, {})
var Model = mongoose.model('Task', TaskSchema)

var PublicMethods = {
  mainData : 'name details is_assigned start_date deadline read is_completed performance_grade completion_remarks',
  deepPop : 'datasecurity parent head project sub_tasks companies departments employees clients stakeholders users',
  dataToExclude : '',
  imgdata : '',
  sort : 'name',
  type : type,

    validate : function validate(obj, add) {
        // is_completed, read, date_created, is_assigned, image_stub SHOULD BE SETTLED HERE
        if(add){
            obj.is_completed = false
            obj.read = false; obj.date_created = Date.now()
        } else {
            if (obj._id) {
                delete obj._id
            }
        }
        obj.is_assigned = (obj.departments.length > 0) || (obj.employees.length > 0)
        obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/TASK/" + obj._id
        if(obj.security){
            obj.datasecurity = funct.getDataSecurityObject(type, obj)
            delete obj.security
        }
        obj.users = funct.getUsersInvolved(obj)
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
