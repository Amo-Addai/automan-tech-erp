'use strict'

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema
var settings = require('../../config/settings/controller.js')
var env = require('../../config/environment')
var funct = require('../AUTO_CONTROLLER/functions.js')
var type = "position"

var PositionSchema = new Schema({
    name: String,
    details: String,
    type: { type: String, enum: env.positionTypes, default: env.positionTypesDefault }, //employee, department
    data: {},

    datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity' },
    parent : { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },

    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
    sub_positions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Position' }],

    image_stub: String,
    date_created: { type: Date, default: Date.now },

})

var x
for(x of ['save', 'update']){
    PositionSchema.pre(x, function(next) {
        PositionSchema.methods.encryptData()
        next()
    })
}
for(x of ['find', 'findOne']){
    PositionSchema.pre(x, function(next) {
        PositionSchema.methods.decryptData()
        next()
    })
}
for(x of ['remove']){
    PositionSchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        PositionSchema.methods.deleteDataSecurity()
    })
}

PositionSchema.methods = {
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

PositionSchema.plugin(timestamps, {})
PositionSchema.plugin(deepPopulate, {})
var Model = mongoose.model('Position', PositionSchema)

var PublicMethods = {
  mainData : 'name details type',
  deepPop : 'datasecurity parent sub_positions employees departments',
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
        obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/POSITION/" + obj._id
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
