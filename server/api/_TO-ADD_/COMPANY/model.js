'use strict'

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema
var settings = require('../../config/settings/controller.js')
var env = require('../../config/environment')
var funct = require('../AUTO_CONTROLLER/functions.js')
var type = "company"

var CompanySchema = new Schema({

    // USER-FIELDS

    name: String,
    registered_name: String,
    details: String,
    age: Number,
    phone: String,
    email: { type: String, lowercase: true },
    home_address: String,
    postal_address: String,

    type: {
        type: String,
        enum: config.companyTypes,
        default: config.companyTypesDefault,
    },
    contact_method: { type: String, enum: env.contactMethods, default: env.contactMethodsDefault },

    data: { type: {}, default: config.companyDataDefault },

    datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity' },

    image_stub: String,
    date_created: { type: Date, default: Date.now },

    // COMPANY-ONLY FIELDS

    types: { type: [String], enum: env.companyTypes, default: [env.companyTypesDefault] },
    branches: [String],

    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    performance: { type: mongoose.Schema.Types.ObjectId, ref: 'Performance' },
    position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
    setting: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting' },

    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    completed_projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    completed_tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    sub_companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
    stakeholders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StakeHolder' }],
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    banks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bank' }],

})

var x
for(x of ['save', 'update']){
    CompanySchema.pre(x, function(next) {
        CompanySchema.methods.encryptData()
        next()
    })
}
for(x of ['find', 'findOne']){
    CompanySchema.pre(x, function(next) {
        CompanySchema.methods.decryptData()
        next()
    })
}
for(x of ['remove']){
    CompanySchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        CompanySchema.methods.deleteDataSecurity()
    })
}

CompanySchema.methods = {
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

CompanySchema.plugin(timestamps, {})
CompanySchema.plugin(deepPopulate, {})
var Model = mongoose.model('Company', CompanySchema)

var PublicMethods = {

  deepPop : 'datasecurity parent head performance setting projects tasks completed_projects completed_tasks sub_companies departments employees clients stakeholders accounts banks',
  mainData : 'name registered_name details age phone email home_address postal_address contact_method types branches',
  dataToExclude : '-setting',
  imgdata : '',
  sort : 'name',
  type : type,

    validate: function validate(obj, add) {
        // date_created, image_stub SHOULD BE SETTLED HERE
        if(add){
            obj.age = 0; obj.date_created = Date.now(); obj.performance = {}
        } else {
            if (obj._id) {
                delete obj._id
            }
        }
        obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/COMPANY/" + obj._id
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
