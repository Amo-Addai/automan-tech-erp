/**
 * Broadcast updates to complaint when the model changes
 */

'use strict'

var Complaint = require('./model.js')

exports.register = function(socket) {
    Complaint.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    Complaint.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('client:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('client:remove', doc)
}