/**
 * Broadcast updates to client when the model changes
 */

'use strict'

var Employee = require('./model.js')

exports.register = function(socket) {
    Employee.schema.post('save', function (doc) {
        onSave(socket, doc)
    })
    Employee.schema.post('remove', function (doc) {
        onRemove(socket, doc)
    })
}

function onSave(socket, doc, cb) {
    socket.emit('employee:save', doc)
}

function onRemove(socket, doc, cb) {
    socket.emit('employee:remove', doc)
}