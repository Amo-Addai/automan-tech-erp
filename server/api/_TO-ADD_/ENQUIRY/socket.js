/**
 * Broadcast updates to enquiry when the model changes
 */

'use strict'

var Enquiry = require('./model.js')

exports.register = function(socket) {
    Enquiry.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    Enquiry.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('client:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('client:remove', doc)
}