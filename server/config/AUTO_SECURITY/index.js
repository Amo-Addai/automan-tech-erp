'use strict';

var express = require('express');

var funct = require('../../functions');
var autoSecurityFunct = funct.AutoSecurityFunct;
// var autoSecurityFunct = require('./AutoSecurityFunctions.js');
funct = funct.funct;

var obj = 'autosecurity';

var router = express.Router();

//  SETUP DATA SECURITY, AUTO AUDITING, FIREWALL, IOT DEVICE MANAGEMENT SECURITY ROUTES

router.use('/autoauditing', require('./AUTO_AUDITING'));

module.exports = router;
