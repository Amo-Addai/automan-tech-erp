'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    notification_id: "",
    recipients: [],
    date_created: {type: Date, default: Date.now},
});

NotificationSchema.plugin(timestamps, {});
NotificationSchema.plugin(deepPopulate, {});

var Model = mongoose.model('Notification', NotificationSchema);

var meths = {
    notificationExists: function (notiId) {
        Model.findOne({notification_id: notiId})
            .exec(function (err, obj) {
                return (!err && obj); // IF NO ERROR & OBJECT EXISTS, THEN TOKEN IS BLACKLISTED (TRUE)2
            });
    },
    getAll: function () {
        Model.find({}).sort('date_created').exec(function (err, data) {
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