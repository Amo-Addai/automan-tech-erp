'use strict';

var express = require('express');
var passport = require('passport');

var funct = require('../functions');
var config = funct.config;
var auth = funct.auth;
funct = funct.funct;

// THIS MIGHT OR MIGHT NOT CAUSE AN ISSUE (SO CHECK FIRST, BEFORE USING)
var User = require('../api/USER/user.model.js');
var Company = {}; // require('../api/COMPANY/company.model.js');

var init = require('./init');
// NOT TOO SURE ABOUT THIS THOUGH - CHECK IT! (COZ init() IS ALSO BEING USED AT THE ENDING OF ALL passport.js AUTH FILES)
init(); // SETUP SERIALIZATION & DESERIALIZATION OF USERS

// Passport Configurations
require('./local/passport').setup(User, Company, config);

// Now setup auth routes

var router = express.Router();

router.use('/local', auth.handleExtraAuthentication, require('./local'));

/*
router.post('/signup', function (req, res, next) {
    // FIND OUT HOW YOU CAN MAKE THIS HAPPEN FOR ALL POSSIBLE AUTHENTICATIONS
});

router.post('/dashboard/signup', function (req, res, next) { 
    // FIND OUT HOW YOU CAN MAKE THIS HAPPEN FOR ALL POSSIBLE AUTHENTICATIONS
});

router.post('/logout', function (req, res, next) {
    // FIND OUT HOW YOU CAN MAKE THIS HAPPEN FOR ALL POSSIBLE AUTHENTICATIONS
});

router.post('/dashboard/logout', function (req, res, next) {
    // FIND OUT HOW YOU CAN MAKE THIS HAPPEN FOR ALL POSSIBLE AUTHENTICATIONS
});
*/

module.exports = router;
