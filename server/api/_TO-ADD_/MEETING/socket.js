/**
 * Broadcast updates to client when the model changes
 */

'use strict'

var meeting = require('./model.js')

exports.register = function(socket) {
    meeting.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    meeting.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('meeting:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('meeting:remove', doc)
}