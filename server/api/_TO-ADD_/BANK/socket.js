/**
 * Broadcast updates to client when the model changes
 */

'use strict'

var bank = require('./model.js')

exports.register = function(socket) {
    bank.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    bank.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('bank:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('bank:remove', doc)
}