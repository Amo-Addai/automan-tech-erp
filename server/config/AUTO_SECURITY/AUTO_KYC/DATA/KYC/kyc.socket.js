/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var KYC = require('./kyc.model.js');

exports.register = function(socket) {
    KYC.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    KYC.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('kyc:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('kyc:remove', doc);
}