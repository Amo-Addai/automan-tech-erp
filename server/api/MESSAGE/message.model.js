'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "message";

var MessageSchema = new Schema({
    name: String,
    details: String,
    // 
    subject: String,
    message: String,
    
    type: { type: String, enum: env.messageTypes, default: env.messageTypesDefault },
    
    data: { type: {}, default: env.messageDataDefault },

    user: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
    prospect: {type:mongoose.Schema.Types.ObjectId, ref:'Prospect'},

    date_created: { type: Date, default: Date.now },
    image_stub: String,
});

MessageSchema.plugin(timestamps, {});
MessageSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Message', MessageSchema);

var PublicMethods = {

    markModify : 'data', 
  deepPop : 'user prospect',
  mainData : 'name details type',
  dataToExclude : '',
  imgdata : '',
  sort : {"date_created": -1},
  type : type,

    validate : function validate(obj, add) {
        // date_created, image_stub SHOULD BE SETTLED HERE
        if (add) {
            obj.date_created = Date.now();
        } else {
            if (obj._id) {
                delete obj._id;
            }
        }
        if (obj.security) {
            delete obj.security;
            // obj.datasecurity = funct.getDataSecurityObject(type, obj);
            // delete obj.security;
        }
        return obj;
    },

  Model : Model

};
module.exports = PublicMethods;
