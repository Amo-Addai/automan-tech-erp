/**
 * Broadcast updates to client when the model changes
 */

'use strict'

var company = require('./model.js')

exports.register = function(socket) {
    company.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    company.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('company:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('company:remove', doc)
}