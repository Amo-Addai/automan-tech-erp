'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var BlackListedAccessTokenSchema = new Schema({
    access_token: String,
    expiresInMinutes: Number,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date_created: {type: Date, default: Date.now},
});

BlackListedAccessTokenSchema.plugin(timestamps, {});
BlackListedAccessTokenSchema.plugin(deepPopulate, {});

var Model = mongoose.model('BlackListedAccessToken', BlackListedAccessTokenSchema);

var meths = {
    
    Model: Model, 

    isBlackListed: function (access_token, user) {
        return new Promise((resolve, reject) => {
            console.log("Access Token -> " + access_token);
            Model.findOne({access_token: access_token, user: user})
                .exec(function (err, obj) {
                    resolve(!err && obj); // IF NO ERROR & OBJECT EXISTS, THEN TOKEN IS BLACKLISTED (TRUE)2
                });
        });
    },
    getAll: function () {
        Model.find({}).sort('date_created').deepPopulate('user').exec(function (err, data) {
            if (err || !data) return false;
            return data;
        });
    },
    get: function (id) {
        Model.findById(id, function (err, obj) {
            if (err || !obj) return false;
            return obj;
        });
    },
    add: function (obj) {
        Model.create(obj, function (err, obj) {
            return (!err && obj); // IF NO ERROR & OBJECT EXISTS, THEN TOKEN IS BLACKLISTED (TRUE)2
        });
    },
    update: function (id, obj) {
        Model.findById(id, function (err, oldobj) {
            if (err || !oldobj) return false;
            var updatedobj = Object.assign(oldobj, obj);
            updatedobj.save(function (err) {
                return !err;
            });
        });
    },
    delete: function (id) {
        Model.findById(id, function (err, obj) {
            if (err || !obj) return false;
            obj.remove(function (err) {
                return !err;
            });
        });
    }
};

module.exports = meths;