'use strict';

var express = require('express');
//
var compose = require('composable-middleware');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

// var oldConfig = require('../../../../environment/index');
// var validateJwt = expressJwt({secret: oldConfig.secrets.session}); // automan-secret
var validateJwt = expressJwt({secret: 'automan-secret'}); // automan-secret

var funct = {

    //      FIRST DEFINE ALL "PUBLIC" FUNCTIONS USED BY MULTIPLE MODULES (OBJECTS) WITHIN THIS FILE
    sendResponse: function (res, status, data) {
        if (res) {
            if (data.hasOwnProperty("code") && data.hasOwnProperty("index") && data.hasOwnProperty("errmsg")) {
                // THEN IT MEANS MOST LIKELY THIS IS AN ERROR OBJECT
                return res.status(status).send({success: false, message: data.errmsg});
            } else return res.status(status).send(data);
        }
    },

    validateAutoAuditAccessToken: function (req, res, next) { // return compose().use(); DOESN'T WORK WITH async/await MIDDLEWARE, SO WE'RE NOT USING IT FOR NOW :)
        if (req.params && req.params.sourceType && req.params.sourceType == "Internal") {
            console.log("THIS IS AN INTERNAL AUTO-AUDIT, THEREFORE NO NEED TO VALIDATE ACCESS-TOKEN");
            next();
        } else {
            console.log("THIS IS AN EXTERNAL AUTO-AUDIT, THEREFORE NOW VALIDATING ACCESS-TOKEN");
            // allow access_token to be passed through query parameter as well
            if (req.query && req.query.hasOwnProperty('access_token')) {
                console.error("the autoaudit_access_token on query ", req.query.access_token);
                req.headers.authorization = 'Bearer ' + req.query.access_token;
                req.access_token = req.query.access_token; // ATTACH TOKEN TO REQUEST OBJECT
                if (req.query.access_token) {
                    delete req.query['access_token']
                } // BY NOW THE .access_token PROP OF req.query SHOULD BE GONE
            }
            validateJwt(req, res, next);
        }
    }
};

var autoAuditFunct = require('./AutoAuditingFunctions.js');

var obj = 'autoaudit';

var router = express.Router();

var sourceType = "External";

// HANDLE AUTO LOG FROM EXTERNAL SOURCES  ,
router.post('/autoaudits/autologs/:sourceType/:source/:autoaudit', funct.validateAutoAuditAccessToken, async function (req, res, next) {
    try {
        console.log("RECEIVING A SINGLE AUTOLOG ...");
        if (!req.params.sourceType || !req.params.source || !req.params.autoaudit || !req.body)
            return funct.sendResponse(res, 404, {success: false, message: "Data not specified"});
        if (req.params.sourceType && req.params.sourceType.length > 0) sourceType = req.params.sourceType;
        else sourceType = "External";
        if (!["Internal", "External"].includes(sourceType))
            return funct.sendResponse(res, 404, {success: false, message: "Sorry, Some error occurred"});
        if (!req.params.hasOwnProperty("autoaudit") || !req.params.hasOwnProperty("source"))
            return funct.sendResponse(res, 404, {success: false, message: "Source or Audit not specified"});

        var extra = {
            source: req.params.source,
            autoaudit: req.params.autoaudit
        };
        var result = await autoAuditFunct.handleAutoAudit(sourceType, req.body, extra);
        return funct.sendResponse(res, result.code, result.resultData);
    } catch (err) {
        console.log("ERROR -> " + err);
        console.log("ERROR -> " + JSON.stringify(err));
        return funct.sendResponse(res, 404, {err: err, success: false, message: "Some error occurred"});
    }
});

// HANDLE AUTO LOGS IN BULK FROM EXTERNAL SOURCES
router.post('/autoaudits/autologs/:sourceType/:source', funct.validateAutoAuditAccessToken, async function (req, res, next) {
    try {
        console.log("RECEIVING MULTIPLE AUTOLOGS ...");
        if (!req.params.sourceType || !req.params.source || !req.body)
            return funct.sendResponse(res, 404, {success: false, message: "Data not specified"});
        if ((req.body instanceof Array) && (req.body.length > 0)) {
            var data = sortBulkData(req.body);  // MAKE SURE ALL DATA HAVE BEEN SORTED BY DATE
            var extra, extraData, result;
            data.forEach(function (body, index) {
                console.log(index + " : " + JSON.stringify(body));
                extra = body.params;
                if (!extra.hasOwnProperty("autoaudit"))
                    return funct.sendResponse(res, 400, {success: false, message: "Events not structured properly"});
                if (!extra.hasOwnProperty("source")) extra.source = req.params.source;
                if (req.params.sourceType && req.params.sourceType.length > 0) sourceType = req.params.sourceType;
                else sourceType = "External";
                if (!["Internal", "External"].includes(sourceType))
                    return funct.sendResponse(res, 404, {success: false, message: "Sorry, Some error occurred"});
                extraData = {
                    source: extra.source,
                    autoaudit: extra.autoaudit
                }; // IN THIS CASE (COZ THERE ARE MULTIPLE DATA OBJECTS, THEY MUST BE HANDLED ASYNCHRONOUSLY)
                result = autoAuditFunct.handleAutoAudit(sourceType, body.data, extraData);
                // FIND A WAY TO HANDLE ALL AUTO-AUDITS SUCCESSFULLY,
                // WITHOUT HAVING TO QUIT EVERYTHING ON THE FIRST NEGATIVE RESULT
            });
            // return funct.sendResponse(res, result.code, result.resultData);
            return funct.sendResponse(res, 200, {success: true, message: "Audits processed successfully"});
        } else return funct.sendResponse(res, 400, {success: false, message: "Audits not structured properly"});
    } catch (err) {
        console.log("ERROR -> " + err);
        return funct.sendResponse(res, 404, {err: err, success: false, message: "Some error occurred"});
    }
});

// HANDLE AUTO EVENT STRAIGHT AWAY FROM EXTERNAL SOURCES
router.post('/autoaudits/autoevents/:sourceType/:source/:autoaudit/:autoevent/:emergency_level', funct.validateAutoAuditAccessToken, async function (req, res, next) {
    try {
        console.log("RECEIVING A SINGLE AUTOEVENT ...");
        if (!req.params.sourceType || !req.params.source || !req.params.autoaudit || !req.params.autoevent || !req.params.emergency_level || !req.body)
            return funct.sendResponse(res, 404, {success: false, message: "Data not specified"});
        if (req.params.sourceType && req.params.sourceType.length > 0) sourceType = req.params.sourceType;
        else sourceType = "External";
        if (!["Internal", "External"].includes(sourceType))
            return funct.sendResponse(res, 404, {success: false, message: "Sorry, Some error occurred"});
        if (!req.params.hasOwnProperty("autoevent") || !req.params.hasOwnProperty("autoaudit") || !req.params.hasOwnProperty("source"))
            return funct.sendResponse(res, 404, {success: false, message: "Source or Event not specified"});

        var extra = {
            source: req.params.source,
            autoaudit: req.params.autoaudit,
            autoevent: req.params.autoevent,
            emergency_level: req.params.emergency_level
        };
        var result = await autoAuditFunct.handleAutoEventStraightAway(sourceType, req.body, extra);
        return funct.sendResponse(res, result.code, result.resultData);
    } catch (err) {
        console.log("ERROR -> " + err);
        return funct.sendResponse(res, 404, {err: err, success: false, message: "Some error occurred"});
    }
});

// HANDLE AUTO EVENTS IN BULK STRAIGHT AWAY FROM EXTERNAL SOURCES
router.post('/autoaudits/autoevents/:sourceType/:source', funct.validateAutoAuditAccessToken, async function (req, res, next) {
    try {
        console.log("RECEIVING MULTIPLE AUTOEVENTS ...");
        if (!req.params.sourceType || !req.params.source || !req.body)
            return funct.sendResponse(res, 404, {success: false, message: "Data not specified"});
        if ((req.body instanceof Array) && (req.body.length > 0)) {
            var data = sortBulkData(req.body);  // MAKE SURE ALL DATA HAVE BEEN SORTED BY DATE
            var extra, extraData, result;
            data.forEach(function (body, index) {
                console.log(index + " : " + JSON.stringify(body));
                extra = body.params;
                if (!extra.hasOwnProperty("autoaudit") || !extra.hasOwnProperty("autoevent") || !extra.hasOwnProperty("emergency_level"))
                    return funct.sendResponse(res, 400, {success: false, message: "Events not structured properly"});
                if (!extra.hasOwnProperty("source")) extra.source = req.params.source;
                if (req.params.sourceType && req.params.sourceType.length > 0) sourceType = req.params.sourceType;
                else sourceType = "External";
                if (!["Internal", "External"].includes(sourceType))
                    return funct.sendResponse(res, 404, {success: false, message: "Sorry, Some error occurred"});
                extraData = {
                    source: extra.source,
                    autoaudit: extra.autoaudit,
                    autoevent: extra.autoevent,
                    emergency_level: extra.emergency_level
                }; // IN THIS CASE (COZ THERE ARE MULTIPLE DATA OBJECTS, THEY MUST BE HANDLED ASYNCHRONOUSLY)
                result = autoAuditFunct.handleAutoEventStraightAway(sourceType, body.data, extraData);
                // FIND A WAY TO HANDLE ALL AUTO-AUDITS SUCCESSFULLY,
                // WITHOUT HAVING TO QUIT EVERYTHING ON THE FIRST NEGATIVE RESULT
            });
            // return funct.sendResponse(res, result.code, result.resultData);
            return funct.sendResponse(res, 200, {success: true, message: "Events processed successfully"});
        } else return funct.sendResponse(res, 400, {success: false, message: "Events not structured properly"});
    } catch (err) {
        console.log("ERROR -> " + err);
        return funct.sendResponse(res, 404, {err: err, success: false, message: "Some error occurred"});
    }
});

//  REST API FOR AutoAudits
//  MANUALLY TRIGGERING / PRINTING THE EXECUTION OF AN AUTO-AUDIT (OR WITH AUTO-ACTION / AUTO-DATA)
router.post('/autoaudits/trigger', autoAuditFunct.triggerAutoAudit(obj));
router.post('/autoaudits/print', autoAuditFunct.printAutoAudit(obj));

//  REST APIs FOR AutoLogs & AutoEvents
router.use('/autologs', require('./DATA_FILE_LOGS/AUTOLOG'));
router.use('/autoevents', require('./DATA_FILE_LOGS/AUTOEVENT'));

module.exports = router;

var sortBulkData = function (bulkData) {
    return autoAuditFunct.sortBulkData(bulkData); // FIND A WAY TO SORT ALL THIS DATA
};
