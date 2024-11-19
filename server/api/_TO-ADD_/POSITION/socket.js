/**
 * Broadcast updates to client when the model changes
 */

'use strict'

var position = require('./model.js')

exports.register = function(socket) {
    position.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    position.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('position:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('position:remove', doc)
}