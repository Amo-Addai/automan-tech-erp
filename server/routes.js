/**
 * Main application routes
 */

'use strict';

var path = require('path');

var funct = require('./functions');
var errors = funct.errors; // OR JUST CALL THIS BELOW
funct = funct.funct;
// var errors = require('./components/errors');

module.exports = function (app) {

    //WEBSITE ROUTES
    app.use('/', require('./views'));

    // API ROUTES
    app.use('/api/users', require('./api/USER'));
    app.use('/api/proposals', require('./api/PROPOSAL'));
    app.use('/api/projects', require('./api/PROJECT'));
    app.use('/api/messages', require('./api/MESSAGE'));

    // CONFIG ROUTES
    app.use('/api/settings', require('./config/SETTINGS'));
    app.use('/api/autosecurity', require('./config/AUTO_SECURITY'));
    app.use('/api/autofinance', require('./config/AUTO_FINANCE'));

    // AUTH ROUTES
    app.use('/auth', require('./auth'));

    // PUBLIC ROUTES
    app.use('/public', require('./public'));

    // '/static/IMAGES/DIRECTORY_NAME/FILENAME.ext' -> TO GET STATIC FILES
    // eg. '/static/' + obj.image_stub

    // All undefined asset or api routes should return a 404
    app.route('/:url(public|api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]); // MIGHT HAVE TO CHANGE 'bower_components|assets' IN THIS CODE

    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function (req, res) {
            res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
        });
};
