/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var autoevent = require('./autoevent.model.js');

exports.register = function(socket) {
    autoevent.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    autoevent.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('autoevent:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('autoevent:remove', doc);
}