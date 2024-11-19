/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var autolog = require('./autolog.model.js');

exports.register = function(socket) {
    autolog.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    autolog.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('autolog:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('autolog:remove', doc);
}