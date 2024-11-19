'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "autoevent";

var AutoEventSchema = new Schema({
    name: String,
    details: String,

    type: {type: String, enum: env.autoauditTypes, default: env.autoauditTypesDefault}, // data/file
    source_type: {type: String, enum: env.autoauditSourceTypes, default: env.autoauditSourceTypesDefault}, // Internal/External
    source: {type: String, enum: env.autoauditSources, default: env.autoauditSourcesDefault}, // Auto-API / Bro / Ossec / Kismet / Lynis
    autoaudit: {type: String, enum: env.autoaudits, default: env.autoauditsDefault},
    data: {},

    emergency_level: {type: String, enum: env.autoauditEmergencyLevels, default: env.autoauditEmergencyLevelsDefault}, // default/low/medium/high
    autoevent: {type: String, enum: env.autoevents, default: env.autoeventsDefault},

    autologs: [{type: mongoose.Schema.Types.ObjectId, ref: 'AutoLog'}],

    // datasecurity: {type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity'},
    date_created: {type: Date, default: Date.now}

});

AutoEventSchema.plugin(timestamps, {});
AutoEventSchema.plugin(deepPopulate, {});
var Model = mongoose.model('AutoEvent', AutoEventSchema);

var PublicMethods = {

    markModify : 'data',
  deepPop : 'autologs',
  mainData : 'name details type source_type source autoaudit data autoevent emergency_level',
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
