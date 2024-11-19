'use strict'

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema
var settings = require('../../config/settings/controller.js')
var env = require('../../config/environment')
var funct = require('../AUTO_CONTROLLER/functions.js')
var type = "meeting"

var MeetingSchema = new Schema({
    name: String,
    details: String,
    topic: String,
    purpose: String,
    read: Boolean,
    start_date: Date,
    end_date: Date,
    start_time: Date,
    end_time: Date,
    type: { type: String, enum: env.meetingTypes, default: env.meetingTypesDefault },
    data: {},

    datasecurity: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity' },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    parent : { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },

    sub_meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }],
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
    MeetingSchema.pre(x, function(next) {
        MeetingSchema.methods.encryptData()
        next()
    })
}
for(x of ['find', 'findOne']){
    MeetingSchema.pre(x, function(next) {
        MeetingSchema.methods.decryptData()
        next()
    })
}
for(x of ['remove']){
    MeetingSchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        MeetingSchema.methods.deleteDataSecurity()
    })
}

MeetingSchema.methods = {
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

MeetingSchema.plugin(timestamps, {})
MeetingSchema.plugin(deepPopulate, {})
var Model = mongoose.model('Meeting', MeetingSchema)

var PublicMethods = {
  mainData : 'name details topic purpose read start_date end_date start_time end_time',
  deepPop : 'datasecurity parent head sub_meetings companies departments employees clients stakeholders users',
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
        obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/MEETING/" + obj._id
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
