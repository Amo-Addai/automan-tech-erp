/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Investment = require('./investment.model.js');

exports.register = function(socket) {
    Investment.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    Investment.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('investment:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('investment:remove', doc);
}