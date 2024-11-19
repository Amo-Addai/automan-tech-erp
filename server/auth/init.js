'use strict';

var passport = require('passport');

module.exports = function() {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
        // saved to session req.session.passport.user = {id:'..'}
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
            // user object attached to the request as req.user
        });
    });

};
