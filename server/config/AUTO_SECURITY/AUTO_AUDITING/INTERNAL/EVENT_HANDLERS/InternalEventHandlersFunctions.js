'use strict';

var funct = require('../../../../../functions');
var settings = funct.settings;
var config = funct.config;
funct = funct.funct;

var autoauditFunct = require('../../AutoAuditingFunctions'); // MIGHT CAUSE A CYCLIC DEPENDENCY

var eventHelperfunct = {
    "generalHelperfunct" : require('../SOURCES/GeneralHelperFunct.js'),
    "Auto-API": require('../SOURCES/Auto-API/HelperFunct.js')
};

function getActions (emergencyLevel, handlerSettings) {
    // YOU CAN CHOOSE TO USE config.autoauditEmergencyLevels INSTEAD
    if (!["default", "low", "medium", "high"].includes(emergencyLevel))
        emergencyLevel = "default";
    return handlerSettings.emergencyLevels[emergencyLevel].actions;
}
function actionsContains (action, emergencyLevel, handlerSettings) {
    return getActions(emergencyLevel, handlerSettings).includes(action);
}

function generalHandlerActionOperation(extra){
    return new Promise(async (resolve, reject) => {
        try {
            if((!extra.action) || (!extra.sources)) return { code: 400, resultData: {success: false, message: "Both auto-audit and sources not specified"} };
            // CHECK extra PARAM TO KNOW WHAT FUNCTION TO CALL, AND WITH WHICH CORRESPONDING SOURCE ..
            var failures = {}, msg = "", sources = extra.sources, action = extra.action;
            delete extra.sources; delete extra.action;
            console.log("AGAIN!!! EXTRA DATA -> " + JSON.stringify(extra));
            var sourcesWithExtra = {}, x = null;
            for(var source of sources){
                if( (monitoringHelperfunct[source]) && (monitoringHelperfunct[source].prePerformAction) &&
                 (typeof monitoringHelperfunct[source].prePerformAction == "function") ) {
                    x = await monitoringHelperfunct[source].prePerformAction(action, extra);
                    if(x) {
                        if(!sourcesWithExtra.hasOwnProperty(x.triggerType)) sourcesWithExtra[x.triggerType] = {}; // YOU'VE TO DO THIS FIRST, BEFORE MOVING ON TO NEXT LINE, 
                        sourcesWithExtra[x.triggerType][source] = x.extra; // OR THERE'LL BE AN ERROR :)
                    } else failures[source] = "Cannot Perform action '" + action + "'";
                } else failures[source] = "Does not have a Pre-Perform function for action '" + action + "'";
            } // NOW, PERFORM ACTUAL HANDLER OPERATIONS ...
            var results = {}; console.log("SOURCES -> " + JSON.stringify(sourcesWithExtra));
            for(var triggerType in sourcesWithExtra) {
                results[triggerType] = await monitoringHelperfunct["generalHelperfunct"][triggerType].performAutoAuditOrAction("action", action, sourcesWithExtra[triggerType]);
            }
            for(var triggerType in results) if(!results[triggerType]) failures[triggerType] = "An Error occurred during activation of AUTO_AUDITING_SLEEPER";
            for(var source in failures) console.log(source + " -> " + failures[source]);
            if(Object.keys(failures).length <= 0) msg = "has been"; 
            else msg = "could not be";
            resolve({code: 200, resultData: {success: true, message: "Auto-Audit '" + action + "' " + msg + " performed on all sources successfully" }});
        } catch (e){
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}

function handleResults(results){
    // THIS CODE UP HERE CAN BE PACKAGED INTO A SINGLE FUNCTION TO BE CALLED CHAW TIMES ( handleResults(results) -> {code: .., resultData: ..} )
    var success = true, failedActions = [], msg = "";
    console.log("NOW DISPLAYING HANDLER RESULTS ...")
    for (var action in results) {
        console.log(action + " -> " + results[action]);
        if (!results[action]) {
            failedActions.push(action);
            success = false;
        }
    }
    for(var a of failedActions) msg += ('"'+a+'"' + ', ');
    msg = msg.trim().slice(0, -1); // MAKE SURE TO REMOVE THE LAST ',' THOUGH
    if(success) return {code: 200, resultData: {success: true, message: 'All handlers were executed successfully'}};
    else return {code: 400, resultData: {success: false, message: 'Some handlers ('+msg+') were not executed successfully'}};
}

var InternalEventHandlers = {

    "Session Tracking": {

        "User Multiple Logins": async function (autoevent, handlerSettings) {
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    console.log("ACTIONS -> " + getActions(autoevent.emergency_level, handlerSettings));
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if( (action.length == 0) || (action == "") ) continue;
                        console.log("'" + action + "' action ...")
                        switch (action) {
                            // PUT ACCESS TOKEN IN BLACKLIST (DATABASE) TO BE USED TO PREVENT BLACKLISTED ACCESS TOKEN ON ALL AUTHENTICATIONS
                            case "Blacklist user's access token": 
                                data = autoevent.data;
                                console.log("user -> " + JSON.stringify(data.user)); console.log("acces_tokens -> " + JSON.stringify(data.access_tokens));
                                results[action] = await eventHelperfunct["Auto-API"].blackListAccessTokens(data.user, data.access_tokens);
                                break;
                            case "Delete user from System's Database":
                                data = autoevent.data;
                                results[action] = await eventHelperfunct["Auto-API"].deleteUser(data.user);
                                break;
                        }
                    }
                    resolve(handleResults(results));
                    //
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                }
            });
        },

        "Unrecognized Device": async function(autoevent, handlerSettings){
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if( (action.length == 0) || (action == "") ) continue;
                        switch (action) {
                            // PUT ACCESS TOKEN IN BLACKLIST (DATABASE) TO BE USED TO PREVENT BLACKLISTED ACCESS TOKEN ON ALL AUTHENTICATIONS
                            case "Alert user to confirm device": // THIS COULD BE BY NOTIFICATION/EMAIL/USSD
                                data = autoevent.data; // THIS KINDA WORKS IN THE SAME WAY AS "Blacklist user's access token" HANDLER
                                results[action] = await eventHelperfunct["Auto-API"].alertUserToConfirmDevice(data.user, data.access_token, data.device);
                                break;
                            case "Deny user access token":
                                data = autoevent.data; // THIS KINDA WORKS IN THE SAME WAY AS "Blacklist user's access token" HANDLER
                                results[action] = await eventHelperfunct["Auto-API"].blackListAccessTokens(data.user, [data.access_token]);
                                break;
                            // PUT ACCESS TOKEN IN BLACKLIST (DATABASE) TO BE USED TO PREVENT BLACKLISTED ACCESS TOKEN ON ALL AUTHENTICATIONS
                            case "Blacklist user's access token":
                                data = autoevent.data;
                                results[action] = await eventHelperfunct["Auto-API"].blackListAccessTokens(data.user, [data.access_token]);
                                break;
                            case "Delete user from System's Database":
                                data = autoevent.data;
                                results[action] = await eventHelperfunct["Auto-API"].deleteUser(data.user);
                                break;
                        }
                    }
                    resolve(handleResults(results));
                    //
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            blackListAccessTokens: function (user, access_tokens) {
                return eventHelperfunct["Auto-API"].blackListAccessTokens(user, access_tokens);
            },
            checkIfAccessTokenIsBlackListed: function (access_token, user) {
                return eventHelperfunct["Auto-API"].checkIfAccessTokenIsBlackListed(access_token, user);
            }
        },

    },

    "Stock Market Monitoring": {

        "Up-trending (Bull) Market": async function(autoevent, handlerSettings){
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if( (action.length == 0) || (action == "") ) continue;
                        // switch (action) {
                        //     case "CALL":
                        //     break;
                        //     case "PUT":
                        //     break;
                        //     case "SELL":
                        //     break;
                        //     case "SHORTS":
                        //     break;
                        // }
                        data = autoevent.data; 
                        results[action] = await eventHelperfunct["Auto-API"].performStockOption(action, data.stock);
                    }
                    resolve(handleResults(results));
                    //
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                }
            });
        },

        "Down-trending (Bear) Market": async function(autoevent, handlerSettings){
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if( (action.length == 0) || (action == "") ) continue;
                        // switch (action) {
                        //     case "CALL":
                        //     break;
                        //     case "PUT":
                        //     break;
                        //     case "SELL":
                        //     break;
                        //     case "SHORTS":
                        //     break;
                        // }
                        data = autoevent.data; 
                        results[action] = await eventHelperfunct["Auto-API"].performStockOption(action, data.stock);
                    }
                    resolve(handleResults(results));
                    //
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                }
            });
        },

        "Sideways-trending Market": async function(autoevent, handlerSettings){
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if( (action.length == 0) || (action == "") ) continue;
                        switch (action) {
                            case "CALL":
                            break;
                            case "PUT":
                            break;
                            case "SELL":
                            break;
                            case "SHORTS":
                            break;
                        }
                        data = autoevent.data; 
                        results[action] = await eventHelperfunct["Auto-API"].performStockOption(action, data.stock);
                    }
                    resolve(handleResults(results));
                    //
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                }
            });
        },

        "Double Top": async function(autoevent, handlerSettings){
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if( (action.length == 0) || (action == "") ) continue;
                        switch (action) {
                            case "CALL":
                            break;
                            case "PUT":
                            break;
                            case "SELL":
                            break;
                            case "SHORTS":
                            break;
                        }
                        data = autoevent.data; 
                        results[action] = await eventHelperfunct["Auto-API"].performStockOption(action, data.stock);
                    }
                    resolve(handleResults(results));
                    //
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                }
            });
        },

        "Double Down": async function(autoevent, handlerSettings){
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if( (action.length == 0) || (action == "") ) continue;
                        switch (action) {
                            case "CALL":
                            break;
                            case "PUT":
                            break;
                            case "SELL":
                            break;
                            case "SHORTS":
                            break;
                        }
                        data = autoevent.data; 
                        results[action] = await eventHelperfunct["Auto-API"].performStockOption(action, data.stock);
                    }
                    resolve(handleResults(results));
                    //
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            
        }
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Geo-Spatial Monitoring": {

        "Irregular User Location": async function (autoevent, handlerSettings) {
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    console.log("ACTIONS -> " + getActions(autoevent.emergency_level, handlerSettings));
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if( (action.length == 0) || (action == "") ) continue;
                        console.log("'" + action + "' action ...")
                        switch (action) {
                            // PUT ACCESS TOKEN IN BLACKLIST (DATABASE) TO BE USED TO PREVENT BLACKLISTED ACCESS TOKEN ON ALL AUTHENTICATIONS
                            case "Update user's true location":
                                data = autoevent.data;
                                // console.log("user -> " + JSON.stringify(data.user)); console.log("acces_tokens -> " + JSON.stringify(data.access_tokens));
                                // results[action] = await eventHelperfunct["Auto-API"].updateGeoLocation(PARAMS COME RIGHT HERE ...);
                                break;
                        }
                    }
                    resolve(handleResults(results));
                    //
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            someExtraFunction: function () {
            }
        },

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Employment Contract Details": {},
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Unusual Activities (Monitoring for Compromise)": {},
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Others": {}
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
};

module.exports = InternalEventHandlers;