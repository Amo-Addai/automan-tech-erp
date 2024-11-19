'use strict';

var express = require('express');
var passport = require('passport'); // MAYBE THIS BE A CUSTOM FILENAME, COZ 'passport' COULD ALSO MEAN THE NODE PACKAGE
var async = require("async");

var funct = require('../../functions');
var auth = funct.auth,
    config = funct.config;
funct = funct.funct;

// EXTRA IMPORTS FOR THIS AUTO-FEATURE
var userempclientstakefunct = require('../../api/GLOBAL_CONTROLLER/OTHER_FUNCTION_HELPERS/UserEmployeeClientStakeHolderServerFunctions');
var dataHandler = require('../../api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
//
var models = dataHandler.models; // THIS MIGHT NOT BE USABLE ANYMORE 
var modelscontrollers = dataHandler.modelscontrollers; // MAYBE COZ OF CYCLIC-DEPENDENCIES
var modelscontrollersHandler = dataHandler.modelscontrollersHandler;
//

var User = require('../../api/USER/user.model.js');

var router = express.Router();
var authOption = 'local';

async function contactRecipient(type, contactBody, defaultCmeth = false) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await userempclientstakefunct.contact(type, contactBody, defaultCmeth);
            resolve(result);
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
        }
    });
}

async function sendUserAuth(user) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            if (user && user._id) {
                var baseUrl = config.protocol + (config.ip === "localhost/" ? "localhost:" + config.port + "/" : config.ip),
                    recipientsType = "user", contactBody = {
                        contact_methods: ["Email"], // , "SMS"],
                        data: {
                            subject: "Signup Confirmation", message: "Hello " + (user.full_name || user.first_name) + "!! Welcome to [SAMPLE_COMPANY] Real Estate Investments, where Real Estate Investing is made Simple!"
                                + "\n\nPlease confirm your registration, by clicking the following link below to verify your email address and activate your [SAMPLE_COMPANY] account.\n\nGet ready to own some new Real Estate!!\n\n"
                                + baseUrl + "auth/local/activate/" + user._id, // <- FIGURE OUT WHETHER TO USE /user._id OR ?email=user.email
                            extra: {
                                autoEnum: "User", dataId: user._id
                                // THE REST OF THIS DATA CAN BE SAVED FOR LATER, WHEN extra JSONOBJECT HAS BEEN FILLED
                                // "SMS": {  }, "USSD": {  }, "Post Mail": {  }
                                // "Email": { template: null, context: null },
                                // "Company Email": { template: null, context: null },
                                // "Notification": {
                                //     notificationType: null, send_after: null, delayed_option: null, delivery_time_of_day: null,
                                //     segments: null, player_ids: null, include_player_ids: null, send_after: null, send_after: null,
                                // },
                            }
                        }
                    }; // THESE MIGHT BE RECIPIENT OBJECTS / MIGHT JUST BE IDs
                contactBody[recipientsType] = [user];
                console.log("CONTACT BODY -> " + JSON.stringify(contactBody));
                var result = await contactRecipient(recipientsType, contactBody, false);
                console.log("\CONTACT RESULT -> " + JSON.stringify(result));
                resolve(result);
            } else {
                console.log("USER HAS NO ID -> " + JSON.stringify(user))
                resolve(null);
            }
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
        }
    });
}

function handleAuthenticationResults(res, err, user, extraAuth, info, userEdit = false) { // RETURN THE AUTH TOKEN
    var error = err || info;
    if (!error && user) {
        console.log("\n\nuser: " + user);
        var token = auth.signToken(user, null);
        console.log("Generated token : " + token);
        return funct.sendResponse(res, 200, { access_token: token, user: user });
        // FIND A WAY TO ALSO ADD -> settings: {}, data: {}, company: {}
    } else {
        console.log("err: " + err);
        console.log("info: " + JSON.stringify(info));
        var resp = ({ err, err, success: false, message: info.message || "Something went wrong, please try again." });
        console.log('SENDING ERROR RESPONSE -> ' + JSON.stringify(resp));
        return funct.sendResponse(res, 404, resp);
    }
}

/* //   ROUTES ON THE CLIENTS' SIDE
    login: localRoutes + '', // SAME THING
    loginDashboard: localRoutes + 'dashboard',
    signup: localRoutes + 'signup', // SAME THING
    signupDashboard: localRoutes + 'dashboard/signup',
    logout: localRoutes + 'logout', // SAME THING
    logoutDashboard: localRoutes + 'dashboard/logout',
*/

router.post('/', auth.isAuthenticationAllowed(authOption, false), function (req, res, next) {
    console.log("the req.query says --->", req.query);
    var extraAuth = {}; // req.extraAuthenticationData; delete req.extraAuthenticationData;
    //  NOW, YOU CAN PERFORM YOUR REGULAR passport.authenticate FUNCTION
    passport.authenticate(authOption, function (err, user, info) {
        return handleAuthenticationResults(res, err, user, extraAuth, info, false);
    })(req, res, next)
});

router.post('/dashboard', auth.isAuthenticationAllowed(authOption, true), function (req, res, next) {
    console.log("the req.query says --->", req.query);
    var extraAuth = {}; // req.extraAuthenticationData; delete req.extraAuthenticationData;
    //  NOW, YOU CAN PERFORM YOUR REGULAR passport.authenticate FUNCTION
    passport.authenticate(authOption, function (err, user, info) {
        return handleAuthenticationResults(res, err, user, extraAuth, info, false);
    })(req, res, next)
});

router.post('/signup', auth.isAuthenticationAllowed(authOption, true), auth.handleExtraAuthentication,
    async function (req, res, next) {
        try { // MAYBE, YOU SHOULD PERFORM SOME VALIDATIONS ON req.body.user OBJECT 1ST, BEFORE ADDING IT TO THE DATABASE
            let u = req.body.user;
            if (u.data) {
                u.data = Object.assign(config.userDataDefault, u.data);
                console.log("USER DATA -> " + JSON.stringify(u.data));
            }
            var result = await modelscontrollersHandler.add(User, u); // DON'T RETURN USER DATA WITH ACCESS_TOKEN, LET USER LOGIN
            console.log("RESULT -> " + JSON.stringify(result));
            if (result.code === 200) {
                var user = result.resultData;
                // HANDLE ANY EXTRA AUTHENTICATION RIGHT HERE ..
                var extraAuth = {}; // req.extraAuthenticationData; delete req.extraAuthenticationData;

                // HANDLE EMAIL / SMS AUTHENTICATION & VERIFICATION HERE ..
                await sendUserAuth(user);

                return handleAuthenticationResults(res, null, user, extraAuth, null, false);
            } else return funct.sendResponse(res, 400, { success: false, message: "User couldn't be signed up" });
        } catch (err) {
            console.log("Some error occured -> " + JSON.stringify(err));
            return funct.sendResponse(res, 400, err);
        }
    });

router.post('/dashboard/signup', auth.isAuthenticationAllowed(authOption, true), auth.handleExtraAuthentication,
    async function (req, res, next) {
        try { // MAYBE, YOU SHOULD PERFORM SOME VALIDATIONS ON req.body.user OBJECT 1ST, BEFORE ADDING IT TO THE DATABASE
            let u = req.body.user;
            if (u.data) {
                u.data = Object.assign(config.userDataDefault, u.data);
                console.log("USER DATA -> " + JSON.stringify(u.data));
            }
            var result = await modelscontrollersHandler.add(User, u); // DON'T RETURN USER DATA WITH ACCESS_TOKEN, LET USER LOGIN
            if (result.code === 200) {
                var user = result.resultData;
                // HANDLE ANY EXTRA AUTHENTICATION RIGHT HERE ..
                var extraAuth = {}; // req.extraAuthenticationData; delete req.extraAuthenticationData;

                // HANDLE EMAIL / SMS AUTHENTICATION & VERIFICATION HERE ..
                await sendUserAuth(user);

                return handleAuthenticationResults(res, null, user, extraAuth, null, false);
            } else return funct.sendResponse(res, 400, { success: false, message: "User couldn't be signed up" });
        } catch (err) {
            console.log("Some error occured -> " + JSON.stringify(err));
            return funct.sendResponse(res, 400, err);
        }
    });

router.get('/activate/:userId', auth.isAuthenticationAllowed(authOption, false), auth.handleExtraAuthentication,
    async function (req, res, next) {
        try {
            let uid = req.params.userId || null;
            if (uid && uid.length > 0) { //  NOW, YOU CAN ACTIVATE THIS USER'S ACCOUNT
                var result = await modelscontrollersHandler.get(User, uid);
                console.log("RESULT -> " + JSON.stringify(result));
                if (result.code === 200) {
                    var user = result.resultData;
                    user.data.activated = true;
                    result = await modelscontrollersHandler.update(User, uid, user);
                    console.log("ACTIVATED USER RESULT -> " + JSON.stringify(result));
                    if (result.code === 200) {
                        // DON'T DO THIS, OR IT'LL RETURN RAW JSON DATA TO THE USER'S BROWSER TAB ..

                        // var extraAuth = {}; // req.extraAuthenticationData; delete req.extraAuthenticationData;
                        // return handleAuthenticationResults(res, null, user, extraAuth, null, false);

                        // INSTEAD, RE-DIRECT USER BACK TO THE DASHBOARD (NOT API) LINK -> https://app.[SAMPLE_COMPANY].com/
                        console.log("NOW, REDIRECTING BACK TO THE DASHBOARD'S LOGIN PAGE (or maybe straight to the Home Page ??)");
                        res.status(301).redirect(config.urls.dashboard); 

                    }
                } else return funct.sendResponse(res, 400, { success: false, message: "User couldn't be found" });
            }
        } catch (err) {
            console.log("Some error occured -> " + JSON.stringify(err));
            return funct.sendResponse(res, 400, err);
        }
    });

router.post('/verify/:contact', auth.isAuthenticationAllowed(authOption, true), auth.handleExtraAuthentication,
    async function (req, res, next) {
        try { // MAYBE, YOU SHOULD PERFORM SOME VALIDATIONS ON req.body.user OBJECT 1ST, BEFORE ADDING IT TO THE DATABASE
            // let u = req.body.user;
            // if(u.data){
            //     u.data = Object.assign(config.userDataDefault, u.data);
            //     console.log("USER DATA -> " + JSON.stringify(u.data));
            // }
            // var result = await modelscontrollersHandler.add(User, u); // DON'T RETURN USER DATA WITH ACCESS_TOKEN, LET USER LOGIN
            // if(result.code === 200){
            //     var user = result.resultData;
            //     var extraAuth = {}; // req.extraAuthenticationData; delete req.extraAuthenticationData;
            //     return handleAuthenticationResults(res, null, user, extraAuth, null, false);
            // } else 
            return funct.sendResponse(res, 400, { success: false, message: "User couldn't be signed up" });
        } catch (err) {
            console.log("Some error occured -> " + JSON.stringify(err));
            return funct.sendResponse(res, 400, err);
        }
    });

router.post('/logout', async function (req, res, next) {
    console.log("the req.body says --->", req.body);
    try {
        if (req.body && (Object.keys(req.body).length > 0)) {
            var body = req.body;
            var user = body.user, token = body.access_token, device = null; // body.device 
            if (await auth.unsignToken(user, token))
                return funct.sendResponse(res, 200, {
                    success: true,
                    message: "User logged out"
                });
            else return funct.sendResponse(res, 400, { success: false, message: "User couldn't be logged out" });
        } else return funct.sendResponse(res, 400, { success: false, message: "No request body" });
    } catch (err) {
        console.log("ERROR -> " + JSON.stringify(err));
        return funct.sendResponse(res, 400, { err: err, success: false, message: "Some error occurred" });
    }
});

router.post('/dashboard/logout', async function (req, res, next) {
    console.log("the req.body says --->", req.body);
    try {
        if (req.body && (Object.keys(req.body).length > 0)) {
            var body = req.body;
            var user = body.user, token = body.access_token, device = null; // body.device 
            if (await auth.unsignToken(user, token))
                return funct.sendResponse(res, 200, {
                    success: true,
                    message: "User logged out"
                });
            else return funct.sendResponse(res, 400, { success: false, message: "User couldn't be logged out" });
        } else return funct.sendResponse(res, 400, { success: false, message: "No request body" });
    } catch (err) {
        console.log("ERROR -> " + JSON.stringify(err));
        return funct.sendResponse(res, 400, { err: err, success: false, message: "Some error occurred" });
    }
});

router.post('/reset/:pass', auth.isAuthenticationAllowed(authOption, true), auth.handleExtraAuthentication,
    async function (req, res, next) {
        try { // CONFIRM USER'S .email, THEN SEND AN EMAIL WITH LINK TO REDIRECT USER TO reset_password.html
            // LINK MUST BE UNIQUE TO THE CORRESPONDING USER & MUST EXPIRE AFTER 2 HOURS

            if (req.body && (Object.keys(req.body).length > 0)) {
                switch (req.params.pass) {
                    case "password":
                        if ((req.body.email || "").length > 0) {
                            let email = req.body.email;
                            console.log("FINDING ALL USERS WITH email -> " + email);
                            let result = await modelscontrollersHandler.getOne(User, JSON.stringify({ email }));
                            console.log("RESULT -> " + JSON.stringify(result));
                            if (result.code === 200) {
                                var user = result.resultData || [];
                                if (user && user._id) {
                                    var baseUrl = config.protocol + (config.ip === "localhost/" ? "localhost:" + config.port + "/" : config.ip),
                                        recipientsType = "user", contactBody = {
                                            contact_methods: ["Email"],
                                            data: {
                                                subject: "[SAMPLE_COMPANY] Password Reset", message: "Hello " + (user.full_name || user.first_name) + "!!"
                                                    + "\n\nPlease click the following link below to reset your password.\n\nGet ready to own some more Real Estate!!\n\n"
                                                    + baseUrl + "resetpassword?id=" + user._id, // <- FIGURE OUT WHETHER TO USE /user._id OR ?email=user.email
                                                extra: { autoEnum: "User" }
                                            }
                                        }; // THESE MIGHT BE RECIPIENT OBJECTS / MIGHT JUST BE IDs
                                    contactBody[recipientsType] = [user];
                                    console.log("CONTACT BODY -> " + JSON.stringify(contactBody));
                                    result = await contactRecipient(recipientsType, contactBody, false);
                                    console.log("\CONTACT RESULT -> " + JSON.stringify(result));
                                }
                            }
                        }
                        break;
                    case "confirm":
                        if (((req.body.password || "").length > 0) && ((req.body.userId || "").length > 0)) {
                            let password = req.body.password, uid = req.body.userId;
                            // 
                            console.log("FINDING user -> " + uid);
                            var result = await modelscontrollersHandler.get(User, uid);
                            console.log("RESULT -> " + JSON.stringify(result));
                            if (result.code === 200) {
                                var user = result.resultData;
                                user.password = password;
                                // 
                                result = await modelscontrollersHandler.update(User, uid, user);
                                console.log("\n\nRESET PASSWORD RESULT -> " + JSON.stringify(result));
                                if (result.code === 200) {
                                    // DON'T DO THIS, OR IT'LL RETURN RAW JSON DATA TO THE USER'S BROWSER TAB ..

                                    // var extraAuth = {}; // req.extraAuthenticationData; delete req.extraAuthenticationData;
                                    // return handleAuthenticationResults(res, null, user, extraAuth, null, false);

                                    // INSTEAD, RE-DIRECT USER BACK TO THE DASHBOARD (NOT API) LINK -> https://app.[SAMPLE_COMPANY].com/
                                    console.log("NOW, REDIRECTING BACK TO THE DASHBOARD'S LOGIN PAGE (or maybe straight to the Home Page ??)");
                                    
                                    // THIS REDIRECT BELOW DOESN'T WORK, COZ THIS IS A JSON REQUEST (FIX IT !!!)
                                    // res.status(301).redirect(config.urls.dashboard);

                                }
                            } else return funct.sendResponse(res, 400, { success: false, message: "User couldn't be found" });
                        }
                        break;
                    default:
                    break;
                }


                // THIS WILL RUN SYNCHRONOUSLY, NOT await'ing CODE ABOVE ...
                return funct.sendResponse(res, 200, {
                    success: true,
                    message: "User " + (req.params.pass || "password") + " Reset"
                });
            } else return funct.sendResponse(res, 400, { success: false, message: "No request body" });
        } catch (err) {
            console.log("Some error occured -> " + JSON.stringify(err));
            console.log(err);
            return funct.sendResponse(res, 400, err);
        }
    });



module.exports = router;
