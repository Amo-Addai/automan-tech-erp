'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "geospatial";

var GeoSpatialSchema = new Schema({
    name: String,
    details: String,

    type: { type: String, enum: env.geospatialTypes, default: env.geospatialTypesDefault }, //

    data: {}, // CUSTOM GEO-SPATIAL DATA
    geo_json: {}, // { type: "Point" , coordinates: [] },  // MONGO-DB GeoJson DATA-type
    // YOU CAN ALSO ADD PATHS TO .geojson / shapefile / .kml / etc GEO-SPATIAL DATA FILES :)

    date_created: {type: Date, default: Date.now}

});

GeoSpatialSchema.plugin(timestamps, {});
GeoSpatialSchema.plugin(deepPopulate, {});
var Model = mongoose.model('GeoSpatial', GeoSpatialSchema);

var PublicMethods = {

    markModify : 'data', // geo_json CAN ALSO BE USED TOO :)
  deepPop : '',
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
