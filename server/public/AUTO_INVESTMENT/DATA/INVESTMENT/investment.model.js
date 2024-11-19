'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "investment";

var InvestmentSchema = new Schema({
    name: String,
    details: String,
    transaction_id: String,
    payment_confirmed: { type: Boolean, default: false },
    
    data: { type: {}, default: env.investmentDataDefault },

    investor: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    asset: {type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    stock: {type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
    property: {type: mongoose.Schema.Types.ObjectId, ref: 'Property' },

    date_created: { type: Date, default: Date.now },
    image_stub: String,
});

InvestmentSchema.plugin(timestamps, {});
InvestmentSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Investment', InvestmentSchema);

var PublicMethods = {

    markModify : 'data', 
  deepPop : 'investor asset stock property',
  mainData : 'name details',
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
