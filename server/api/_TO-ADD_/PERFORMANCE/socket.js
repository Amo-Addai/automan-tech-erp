/**
 * Broadcast updates to performance when the model changes
 */

'use strict'

var Performance = require('./model.js')

exports.register = function(socket) {
    Performance.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    Performance.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('performance:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('performance:remove', doc)
}