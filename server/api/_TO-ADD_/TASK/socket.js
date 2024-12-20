/**
 * Broadcast updates to Task when the model changes
 */

'use strict'

var Task = require('./model.js')

exports.register = function(socket) {
    Task.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    Task.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('task:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('task:remove', doc)
}