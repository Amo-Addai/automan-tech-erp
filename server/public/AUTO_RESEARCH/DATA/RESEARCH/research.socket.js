/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var research = require('./research.model.js');

exports.register = function(socket) {
    research.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    research.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('research:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('research:remove', doc);
}