'use strict'

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema
var settings = require('../../config/settings/controller.js')
var env = require('../../config/environment')
var funct = require('../AUTO_CONTROLLER/functions.js')
var type = "client"

var ClientSchema = new Schema({

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

    type: { type: String, default: env.stakeholderTypesDefault }, // INDIVIDUAL/COMPANY/COUNTRY
    contact_method: { type: String, enum: env.contactMethods, default: env.contactMethodsDefault },

    data: { type: {}, default: config.clientDataDefault },

    datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity' },

    meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    banks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bank' }],
    companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],

    image_stub: String,
    date_created: { type: Date, default: Date.now },

    /// CLIENT-ONLY FIELDS

    is_user: Boolean,

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

})

var x
for(x of ['save', 'update']){
    ClientSchema.pre(x, function(next) {
        ClientSchema.methods.encryptData()
        next()
    })
}
for(x of ['find', 'findOne']){
    ClientSchema.pre(x, function(next) {
        ClientSchema.methods.decryptData()
        next()
    })
}
for(x of ['remove']){
    ClientSchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        ClientSchema.methods.deleteDataSecurity()
    })
}

ClientSchema.methods = {
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

ClientSchema.plugin(timestamps, {})
ClientSchema.plugin(deepPopulate, {})
var Model = mongoose.model('Client', ClientSchema)

var PublicMethods = {
  mainData : 'full_name details first_name last_name other_names title phone email home_address postal_address contact_method type is_user',
  deepPop : 'datasecurity user projects accounts banks companies',
  dataToExclude : '',
  imgdata : '',
  sort : 'full_name',
  type : type,

    validate: function validate(obj, add) {
        //  full_name, date_created, image_stub, create user object SHOULD BE SETTLED HERE
        if(add){
            obj.date_created = Date.now()
        } else {
            if (obj._id) {
                delete obj._id
            }
        }
        obj.full_name = obj.first_name + " " + obj.last_name + " " + obj.other_names + ""
        obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/CLIENT/" + obj._id
        if(obj.security){
            obj.datasecurity = funct.getDataSecurityObject(type, obj)
            delete obj.security
        }
        obj = funct.createUpdateUserTypeWithUser(obj)
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
