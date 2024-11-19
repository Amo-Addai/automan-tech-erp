/**
 * Broadcast updates to Request when the model changes
 */

'use strict'

var Request = require('./model.js')

exports.register = function(socket) {
    Request.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    Request.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('client:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('client:remove', doc)
}