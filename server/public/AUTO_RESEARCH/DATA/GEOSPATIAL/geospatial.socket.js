/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var geospatial = require('./geospatial.model.js');

exports.register = function(socket) {
    geospatial.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    geospatial.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('geospatial:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('geospatial:remove', doc);
}