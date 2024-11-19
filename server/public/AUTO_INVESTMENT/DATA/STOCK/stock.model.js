'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "stock";

var StockSchema = new Schema({
    name: String,
    details: String,

    price: Number,

    data: { type: {}, default: env.stockDataDefault }, 
    // name, price, shares, company, change, volume, capital, dps, eps
    
    investors: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    investments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Investment'}],
    
    // company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    // datasecurity: {type: mongoose.Schema.Types.ObjectId, ref: 'DataSecurity'},

    date_created: {type: Date, default: Date.now}

});

StockSchema.plugin(timestamps, {});
StockSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Stock', StockSchema);

var PublicMethods = {

    markModify : 'data',
  deepPop : 'investors investments',
  mainData : 'name details price',
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
