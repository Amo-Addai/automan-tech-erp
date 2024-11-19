/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Property = require('./property.model.js');

exports.register = function(socket) {
    Property.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    Property.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('property:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('property:remove', doc);
}