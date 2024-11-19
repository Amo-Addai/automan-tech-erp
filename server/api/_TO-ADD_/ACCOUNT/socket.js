/**
 * Broadcast updates to client when the model changes
 */

'use strict'

var account = require('./model.js')

exports.register = function(socket) {
    account.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    account.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('account:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('account:remove', doc)
}