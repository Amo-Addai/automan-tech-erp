'use strict';

var express = require('express');

var funct = require('../../../../../functions');
var auth = funct.auth;
funct = funct.funct;

var controller = require('./autoevent.controller.js');
var autoauditfunct = require('../../AutoAuditingFunctions.js');

var router = express.Router();
var obj = 'autoevent';

router.get('/', auth.isAuthorizedToGetData(obj, controller.M));
router.get('/schema', auth.isAuthenticated(),  controller.schema);
router.get('/count', auth.isAuthenticated(), controller.count);
router.get('/:id',auth.isAuthenticated(),  controller.show);

router.post('/', auth.isAuthorized('add', obj), controller.create);

router.post('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.put('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.patch('/:id', auth.isAuthorized('edit', obj), controller.update);
router.put('/handle/:id', autoauditfunct.handleAutoLogOrEvent(obj));

router.delete('/:id', auth.isAuthorized('delete', obj), controller.destroy);

module.exports = router;