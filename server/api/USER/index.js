'use strict';

var express = require('express');

var funct = require('../../functions');
var auth = funct.auth;
funct = funct.funct;

var controller = require('./user.controller');
var autoKYCfunct = require('../../config/AUTO_SECURITY/AUTO_KYC/AutoKYCFunctions');


var router = express.Router();
var obj = 'user';

router.get('/', auth.isAuthorizedToGetData(obj, controller.M));
router.get('/my', auth.isAuthorizedToGetData(obj, controller.M));
router.get('/me', funct.getUserData(controller.M));
router.put('/me', funct.editUserData(controller.M));
router.get('/schema', auth.isAuthenticated(),  controller.schema);
router.get('/count', auth.isAuthenticated(), controller.count);
router.get('/:id', auth.isAuthenticated(), controller.show);

router.post('/', auth.isAuthorized('add', obj), controller.create);
router.post('/message', funct.sendMessage(obj));
router.post('/reset_password', controller.resetpassword);
router.put('/verify/:id', autoKYCfunct.verifyKYC(obj));

router.post('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.put('/:id', auth.isAuthorized('edit', obj),  controller.update);
router.patch('/:id', auth.isAuthorized('edit', obj), controller.update);

router.delete('/:id', auth.isAuthorized('delete', obj), controller.destroy);

module.exports = router;
