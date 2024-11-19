/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var segment = require('./segment.model.js');

exports.register = function(socket) {
    segment.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    segment.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('segment:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('segment:remove', doc);
}