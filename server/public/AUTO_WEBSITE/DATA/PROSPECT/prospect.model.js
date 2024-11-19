'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "prospect";

var ProspectSchema = new Schema({
    full_name: String,
    first_name: String,
    last_name: String,
    other_names: String,
    gender: { type: String, enum: env.userGenders, default: env.userGendersDefault },
    nationality: { type: String, enum: env.userNationalities, default: env.userNationalitiesDefault },
    age: Number,
    details: String,
    phone: String,
    email: { type: String, lowercase: true },
    home_address: String,
    postal_address: String,

    type: { type: String, enum: env.prospectTypes, default: env.prospectTypesDefault },
    data: { type: {}, default: env.prospectDataDefault },
    social_media: {},
    
    date_created: { type: Date, default: Date.now },
    image_stub: String,
});


/**
 * Pre-save hook
 */
ProspectSchema.pre('save', async function(next) {
    try {
        if (!this.isNew) return next();

        if(!this.full_name || ((this.full_name || "").length <= 0)) {
            this.full_name = ((this.first_name || "").trim() + " " + 
            (this.last_name || "").trim() + " " + (this.other_name || "").trim()).trim()
        }
        // console.log("FULL NAME -> " + this.full_name);
    } catch (err){
        console.log("ERROR -> " + err);
        return next(new Error('Some error occurred'));
    }
});


ProspectSchema.plugin(timestamps, {});
ProspectSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Prospect', ProspectSchema);

var PublicMethods = {

    markModify : 'data social_media', 
  deepPop : '',
  mainData : 'full_name first_name last_name other_names gender age details phone email home_address postal_address type',
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
