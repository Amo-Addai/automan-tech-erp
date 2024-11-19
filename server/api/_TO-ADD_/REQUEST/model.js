'use strict'

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema
var settings = require('../../config/settings/controller.js')
var env = require('../../config/environment')
var funct = require('../AUTO_CONTROLLER/functions.js')
var type = "request"

var RequestSchema = new Schema({
    name: String,
    details: String,

    type: String,
    data: {},

    datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity' },
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    image_stub: String,
    date_created: { type: Date, default: Date.now },
})

var x
for(x of ['save', 'update']){
    RequestSchema.pre(x, function(next) {
        RequestSchema.methods.encryptData()
        next()
    })
}
for(x of ['find', 'findOne']){
    RequestSchema.pre(x, function(next) {
        RequestSchema.methods.decryptData()
        next()
    })
}
for(x of ['remove']){
    RequestSchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        RequestSchema.methods.deleteDataSecurity()
    })
}

RequestSchema.methods = {
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

RequestSchema.plugin(timestamps, {})
RequestSchema.plugin(deepPopulate, {})
var Model = mongoose.model('Request', RequestSchema)

var PublicMethods = {
  mainData : 'name details type',
  deepPop : 'datasecurity user',
  dataToExclude : '',
  imgdata : '',
  sort : 'date_created',
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
            if(obj.image_data){
                imgdata = obj.image_data
                obj.image_data = null
                delete obj.image_data
                obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/REQUEST"
            }
        return obj
    },

  Model : Model

}
module.exports = PublicMethods
