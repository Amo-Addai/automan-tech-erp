'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "property";

var PropertySchema = new Schema({
    name: String,
    details: String,
    
    type: { type: String, enum: env.propertyTypes, default: env.propertyTypesDefault },
    capital_structure: { type: String, enum: env.capitalStructures, default: env.capitalStructuresDefault },
    investment_strategy: { type: String, enum: env.propertyInvestmentStrategies, default: env.propertyInvestmentStrategiesDefault }, 
    stage: { type: String, enum: env.propertyStages, default: env.propertyStagesDefault }, 
    status: { type: String, enum: env.propertyStatuses, default: env.propertyStatusesDefault }, 
    
    data: { type: {}, default: env.propertyDataDefault },
    waitlist: { type: {}, default: env.waitlistDataDefault },
    
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset'},
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project'},

    investments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    investors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    property_developers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    date_created: { type: Date, default: Date.now },
    image_stub: String,
});

PropertySchema.plugin(timestamps, {});
PropertySchema.plugin(deepPopulate, {});
var Model = mongoose.model('Property', PropertySchema);

var PublicMethods = {

    markModify : 'data waitlist', 
    deepPop : 'asset project investments investors property_developers employees',
    mainData : 'name details type stage status investment_strategy',
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
