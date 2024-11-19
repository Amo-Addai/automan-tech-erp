'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "account";

var AccountSchema = new Schema({
    name: String,
    details: String,

    type: { type: String, enum: env.accountTypes, default: env.accountTypesDefault },
    data: { type: {}, default: env.accountDataDefault },

    user: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
    project: {type:mongoose.Schema.Types.ObjectId, ref:'Project'},
    asset: {type:mongoose.Schema.Types.ObjectId, ref:'Asset'},
    
    investments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Investment'}],

    image_stub: String,
    date_created: { type: Date, default: Date.now },

    // datasecurity: {type:mongoose.Schema.Types.ObjectId, ref:'DataSecurity'},

});

AccountSchema.plugin(timestamps, {});
AccountSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Account', AccountSchema);

var PublicMethods = {

    markModify : 'data', 
  deepPop : 'user project investments',
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

/*
var x;
for(x of ['save', 'update']){
    AccountSchema.pre(x, function(next) {
        AccountSchema.methods.encryptData();
        next();
    });
}
for(x of ['find', 'findOne']){
    AccountSchema.pre(x, function(next) {
        AccountSchema.methods.decryptData();
        next();
    });
}
for(x of ['remove']){
    AccountSchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        AccountSchema.methods.deleteDataSecurity();
    })
}

AccountSchema.methods = {
    encryptData: function(){
        var x = funct.encryptData(type, this);
        for(var key in x){
            this[key] = x[key]; // DO THIS TO ONLY EDIT PROPS OF this WHICH ARE PRESENT IN x
        }
    },
    decryptData: function(){
        var x = funct.decryptData(type, this);
        for(var key in x){
            this[key] = x[key];
        }
    },
    deleteDataSecurity: function(){
        return funct.deleteDataSecurityObject(type, this); // THIS RETURNED BOOLEAN VALUE WON'T EVEN BE USED THOUGH
    }
};

AccountSchema.plugin(timestamps, {});
AccountSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Account', AccountSchema);

var PublicMethods = {

  deepPop : 'datasecurity employee bank client stakeholder',
  mainData : 'account_no sort_code details',
  dataToExclude : '',
  imgdata : '',
  sort : 'account_no',
  type : type,

    validate = function validate(obj, add) {
        // date_created, image_stub SHOULD BE SETTLED HERE
        if(add){
            obj.date_created = Date.now();
        } else {
            if (obj._id) {
                delete obj._id;
            }
        }
        obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/ACCOUNT/" + obj._id;
        if(obj.security){
            obj.datasecurity = funct.getDataSecurityObject(type, obj);
            delete obj.security;
        }
        obj.user = funct.getUsersInvolved(obj);
        if(obj.image_data){
            imgdata = obj.image_data;
            obj.image_data = null;
            delete obj.image_data;
        }
        return obj;
    },

  Model : Model

};
module.exports = PublicMethods;
*/