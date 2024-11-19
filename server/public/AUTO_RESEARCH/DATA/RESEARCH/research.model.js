'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "research";

var ResearchSchema = new Schema({
    name: String,
    details: String,
    type: { type: String, enum: env.researchTypes, default: env.researchTypesDefault }, //
    budget: Number,
    // PLATFORM SHOULD BE ABLE TO AUTO-GENERATE THESE OTHER PROPS
    stage: { type: String, enum: env.researchStages, default: env.researchStagesDefault }, // 
    start_date: Date,
    end_date: Date,
    executed: { type: Boolean, default: false },
    
    design: { type: {}, default: env.researchDesignDataDefault },
    data: { type: {}, default: env.researchDataDataDefault },

    date_created: {type: Date, default: Date.now}

});

ResearchSchema.plugin(timestamps, {});
ResearchSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Research', ResearchSchema);

var PublicMethods = {

    markModify : 'design data', // geo_json CAN ALSO BE USED TOO :)
  deepPop : '',
  mainData : 'name details executed type stage start_date end_date',
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
