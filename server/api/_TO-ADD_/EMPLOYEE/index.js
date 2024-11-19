'use strict'

var express = require('express')
var controller = require('./controller.js')
var auth = require('../../auth/auth.service.js')
var funct = require('../AUTO_CONTROLLER/functions.js')
var router = express.Router()
var obj = 'employee'


router.get('/', auth.isAuthorizedToGetData(obj))
router.get('/schema',auth.isAuthenticated(),  controller.schema)
router.get('/:id',auth.isAuthenticated(),  controller.show)

router.post('/', auth.isAuthorized('add', obj), controller.create)
router.post('/message', funct.sendMessage(obj))

router.post('/:id', auth.isAuthorized('edit', obj),  controller.update)
router.put('/:id', auth.isAuthorized('edit', obj),  controller.update)
router.patch('/:id', auth.isAuthorized('edit', obj), controller.update)
router.put('/assign/:id', funct.assignProjectOrTaskToCompanyOrDepartmentOrEmployee(obj))
router.put('/suspend/:id', funct.suspendEmployeeOrDepartmentOrCompany(obj))
router.put('/pay/:id', funct.payEmployeeOrDepartmentOrCompany(obj))
router.put('/promotedemote/:id', funct.promoteOrDemoteEmployeeOrDepartmentOrCompany(obj)) // type IS EITHER promote/demote

router.delete('/:id', auth.isAuthorized('delete', obj), controller.destroy)
router.delete('/fire/:id', funct.fireEmployeeOrDepartmentOrCompany(obj))

module.exports = router
