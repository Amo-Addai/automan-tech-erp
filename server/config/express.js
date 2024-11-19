'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var busboyBodyParser = require('busboy-body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var passport = require('passport');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var cors = require('cors');
var ejs = require('ejs');
var fileUpload = require('express-fileupload');

var funct = require('../functions');
var config = funct.config;
funct = funct.funct;

module.exports = function (app) {
    
    var env = app.get('env') || "development";
    
    app.set('views', config.root + '/server/views');
    // YOU SHOULD DO THIS STRAIGHT AWAY
    app.set('view engine', 'ejs'); 
    // app.engine('html', ejs.renderFile);
    // app.set('view engine', 'html');
    app.use(compression());
    app.use(cors());
    app.use(bodyParser.urlencoded({extended: true})); // parse application/x-www-form-urlencoded
    app.use(bodyParser.json()); // parse application/json
    app.use(busboyBodyParser()); // parse multipart/form-data
    app.use(methodOverride());
    app.use(cookieParser());

    app.use(session({
        secret: config.secrets.session,
        resave: true,
        saveUninitialized: true,
        store: new mongoStore({mongooseConnection: mongoose.connection})
    }));
    app.use(passport.initialize());
    // app.use(passport.session()); // USE THIS TO SERIALIZE & DESERIALIZE USERS

    app.use(fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 } // BUSBOY OPTIONS INCLUDED
    })); // THIS WILL BE USED FOR HANDLING UPLOADED FILES

    switch(env){
        case 'development' || 'test':
            app.use(require('connect-livereload')());
            app.use('/files', express.static(path.join(config.root, 'AUTOMAN_FILE_SYSTEM'))); // SO NOW YOU CAN LOAD FILES
            app.use(morgan('dev'));
            app.use(errorHandler()); // Error handler - has to be last
            break;
        case 'production':
            app.use('/files', express.static(path.join(config.root, 'AUTOMAN_FILE_SYSTEM'))); // SO NOW YOU CAN LOAD FILES
            app.use(morgan('dev'));
            break;
    }
};