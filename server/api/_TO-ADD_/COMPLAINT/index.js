'use strict'

var express = require('express')
var controller = require('./controller.js')
var auth = require('../../auth/auth.service.js')
var router = express.Router()
var obj = 'complaint'


router.get('/', auth.isAuthorizedToGetData(obj))
router.get('/schema',auth.isAuthenticated(),  controller.schema)
router.get('/:id',auth.isAuthenticated(),  controller.show)

router.post('/', auth.isAuthorized('add', obj), controller.create)

router.post('/:id', auth.isAuthorized('edit', obj),  controller.update)
router.put('/:id', auth.isAuthorized('edit', obj),  controller.update)
router.patch('/:id', auth.isAuthorized('edit', obj), controller.update)

router.delete('/:id', auth.isAuthorized('delete', obj), controller.destroy)

module.exports = router
