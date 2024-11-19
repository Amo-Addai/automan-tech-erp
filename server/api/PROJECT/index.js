'use strict';

var express = require('express');

var funct = require('../../functions');
var auth = funct.auth;
funct = funct.funct;

var controller = require('./project.controller.js');

var router = express.Router();
var obj = 'project';

router.get('/', auth.isAuthorizedToGetData(obj, controller.M));
router.get('/my', auth.isAuthorizedToGetData(obj, controller.M));
router.get('/schema', auth.isAuthenticated(),  controller.schema);
router.get('/count', auth.isAuthenticated(), controller.count);
router.get('/:id', auth.isAuthenticated(),  controller.show);

router.post('/', auth.isAuthorized('add', obj), controller.create);

router.post('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.put('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.patch('/:id', auth.isAuthorized('edit', obj), controller.update);
// router.put('/:submitWithdraw/proof/:id', funct.submitProofForProjectOrTask(obj));
// router.put('/:validateDecline/proof/:id', funct.validateOrDeclineProofForProjectOrTask(obj));
// router.put('/markread/:id', funct.markProjectOrTaskOrMeetingAsRead(obj));
// router.put('/assign/:id', funct.assignProjectOrTaskToCompanyOrDepartmentOrEmployee(obj));
// router.put('/postpone/:id', funct.postponeProjectOrTaskOrMeeting(obj));
// router.put('/analyze/:id', funct.analyzeProjectOrTaskOrPerformance(obj));
// router.put('/cancel/:id', funct.cancelProjectOrTaskOrMeeting(obj));

router.delete('/:id', auth.isAuthorized('delete', obj), controller.destroy);

module.exports = router;