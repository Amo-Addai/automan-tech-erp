'use strict';

var express = require('express');

var funct = require('../../../../functions');
var auth = funct.auth;
funct = funct.funct;

var controller = require('./research.controller.js');
var autoResearchfunct = require('../../AutoResearchFunctions');

var router = express.Router();
var obj = 'research';

router.get('/', auth.isAuthorizedToGetData(obj, controller.M));
router.get('/schema', auth.isAuthenticated(),  controller.schema);
router.get('/count', auth.isAuthenticated(), controller.count);
router.get('/:id',auth.isAuthenticated(),  controller.show);

router.post('/', auth.isAuthorized('add', obj), controller.create);

router.post('/:id/survey/get_responses', autoResearchfunct.getResearchResponses(obj));
router.post('/:id/responses', autoResearchfunct.receiveResearchResponse(obj));
router.put('/:id/survey/:source', autoResearchfunct.updateResearchSurvey(obj));
router.put('/:executeOrStop/:id', autoResearchfunct.executeOrStopAutoResearch(obj));
router.post('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.put('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.patch('/:id', auth.isAuthorized('edit', obj), controller.update);

router.delete('/:id', auth.isAuthorized('delete', obj), controller.destroy);

module.exports = router;