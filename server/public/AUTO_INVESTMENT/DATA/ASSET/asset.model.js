'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "asset";

var AssetSchema = new Schema({
    name: String,
    details: String,

    type: { type: String, enum: env.assetTypes, default: env.assetTypesDefault },

    data: { type: {}, default: env.assetDataDefault },

    investors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    investments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    portfolios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' }],

    date_created: { type: Date, default: Date.now },
    image_stub: String,
});

AssetSchema.plugin(timestamps, {});
AssetSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Asset', AssetSchema);

var PublicMethods = {

    markModify: 'data',
    deepPop: 'investors investments portfolios',
    mainData: 'name details type',
    dataToExclude: '',
    imgdata: '',
    sort: { "date_created": -1 },
    type: type,

    validate: function validate(obj, add) {
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

    Model: Model

};
module.exports = PublicMethods;
