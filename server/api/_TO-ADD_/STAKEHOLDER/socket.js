/**
 * Broadcast updates to stakeholder when the model changes
 */

'use strict'

var stakeholder = require('./model.js')

exports.register = function(socket) {
    stakeholder.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    stakeholder.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('stakeholder:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('stakeholder:remove', doc)
}