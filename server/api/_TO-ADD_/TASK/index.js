'use strict'

var express = require('express')
var controller = require('./controller.js')
var auth = require('../../auth/auth.service.js')
var funct = require('../AUTO_CONTROLLER/functions.js')
var router = express.Router()
var obj = 'task'

router.get('/', auth.isAuthorizedToGetData(obj))
router.get('/schema',auth.isAuthenticated(),  controller.schema)
router.get('/:id',auth.isAuthenticated(),  controller.show)

router.post('/', auth.isAuthorized('add', obj), controller.create)

router.post('/:id', auth.isAuthorized('edit', obj),  controller.update)
router.put('/:id', auth.isAuthorized('edit', obj),  controller.update)
router.patch('/:id', auth.isAuthorized('edit', obj), controller.update)
router.put('/:submitWithdraw/proof/:id', funct.submitProofForProjectOrTask(obj))
router.put('/:validateDecline/proof/:id', funct.validateOrDeclineProofForProjectOrTask(obj))
router.put('/markread/:id', funct.markProjectOrTaskOrMeetingAsRead(obj))
router.put('/assign/:id', funct.assignProjectOrTaskToCompanyOrDepartmentOrEmployee(obj))
router.put('/postpone/:id', funct.postponeProjectOrTaskOrMeeting(obj))
router.put('/analyze/:id', funct.analyzeProjectOrTaskOrPerformance(obj))

router.delete('/:id', auth.isAuthorized('delete', obj), controller.destroy)
router.delete('/cancel/:id', funct.cancelProjectOrTaskOrMeeting(obj))

module.exports = router
