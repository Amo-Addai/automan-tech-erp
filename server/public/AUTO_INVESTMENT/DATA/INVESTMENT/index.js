'use strict';

var express = require('express');

var funct = require('../../../../functions');
var auth = funct.auth;
funct = funct.funct;

var controller = require('./investment.controller.js');
var autoInvestmentfunct = require('../../AutoInvestmentFunctions');

var router = express.Router();
var obj = 'investment';

router.get('/', auth.isAuthorizedToGetData(obj, controller.M));
router.get('/my', auth.isAuthorizedToGetData(obj, controller.M));
router.get('/schema', auth.isAuthenticated(),  controller.schema);
router.get('/count', auth.isAuthenticated(), controller.count);
router.get('/:id', auth.isAuthenticated(),  controller.show);

router.post('/', auth.isAuthorized('add', obj), controller.create);

router.post('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.put('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.patch('/:id', auth.isAuthorized('edit', obj), controller.update);

router.delete('/:id', auth.isAuthorized('delete', obj), controller.destroy);

module.exports = router;