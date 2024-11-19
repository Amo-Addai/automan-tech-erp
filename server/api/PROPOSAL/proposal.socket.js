/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Proposal = require('./proposal.model.js');

exports.register = function(socket) {
    Proposal.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    Proposal.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('proposal:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('proposal:remove', doc);
}