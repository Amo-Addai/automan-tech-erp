'use strict';

var express = require('express');

var funct = require('../../functions');
var auth = funct.auth;
funct = funct.funct;
var controller = require('./settings.controller');

var obj = 'setting';

var router = express.Router();

router.get('/company', auth.isAuthenticated(),  controller.getCompanySettings);

router.post('/default', auth.isAuthorized('edit', obj), controller.setDefault);
router.put('/default', auth.isAuthorized('edit', obj), controller.setDefault);
router.patch('/default', auth.isAuthorized('edit', obj), controller.setDefault);

router.post('/', auth.isAuthorized('edit', obj),  controller.update);
router.put('/', auth.isAuthorized('edit', obj),  controller.update);
router.patch('/', auth.isAuthorized('edit', obj), controller.update);

module.exports = router;