'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;

var type = "autolog";

var AutoLogSchema = new Schema({
    name: String,
    details: String,

    type: {type: String, enum: env.autoauditTypes, default: env.autoauditTypesDefault}, // data/file
    source_type: {type: String, enum: env.autoauditSourceTypes, default: env.autoauditSourceTypesDefault}, // Internal/External
    source: {type: String, enum: env.autoauditSources, default: env.autoauditSourcesDefault}, // Auto-API / Bro / Ossec / Kismet / Lynis
    autoaudit: {type: String, enum: env.autoaudits, default: env.autoauditsDefault},
    // data: {type: mongoose.Schema.Types.Mixed},
    data: {},

    autoevents: [{type: mongoose.Schema.Types.ObjectId, ref: 'AutoEvent'}],

    // datasecurity: {type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity'},
    date_created: {type: Date, default: Date.now}

});

AutoLogSchema.plugin(timestamps, {});
AutoLogSchema.plugin(deepPopulate, {});
var Model = mongoose.model('AutoLog', AutoLogSchema);

var PublicMethods = {

    markModify : 'data',
  deepPop : 'autoevents',
  mainData : 'name details type source_type source autoaudit data',
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
