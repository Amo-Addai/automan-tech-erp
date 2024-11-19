'use strict';

var express = require('express');
var funct = require('../functions');
var auth = funct.auth;
var PublicFunct = funct.PublicFunct;
funct = funct.funct;

var obj = 'public';

var router = express.Router();

//  SETUP AUTO-WEBSITE, AUTO-BOTS, AUTO-RECRUIT, AUTO-MARKETING, AUTO-INVESTMENT ROUTES

router.use('/autowebsite', require('./AUTO_WEBSITE'));
router.use('/autoinvestment', require('./AUTO_INVESTMENT'));
// router.use('/autoresearch', require('./AUTO_RESEARCH'));

module.exports = router;
