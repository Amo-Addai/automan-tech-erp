'use strict';

var funct = require('../../../../../functions');
var settings = funct.settings;
var config = funct.config;
funct = funct.funct;
var externalMonitoringFunct = require('../MONITORING_HANDLERS/ExternalMonitoringHandlersFunctions')

var eventHelperfunct = {
    "generalHelperfunct": require('../SOURCES/GeneralHelperFunct.js'),
    "Bro": require('../SOURCES/Bro/HelperFunct.js'),
    "Snort": require('../SOURCES/Snort/HelperFunct.js'),
    "Kismet": require('../SOURCES/Kismet/HelperFunct.js'),
    "Ossec": require('../SOURCES/Ossec/HelperFunct.js'),
    "Lynis": require('../SOURCES/Lynis/HelperFunct.js'),
    "Nikto": require('../SOURCES/Nikto/HelperFunct.js'),
    "Suricata": require('../SOURCES/Suricata/HelperFunct.js'),
    //
    "Auto-API": require('../../INTERNAL/SOURCES/Auto-API/HelperFunct.js'),
};

function getActions(emergencyLevel, handlerSettings) {
    // YOU CAN CHOOSE TO USE config.autoauditEmergencyLevels INSTEAD
    if (!["default", "low", "medium", "high"].includes(emergencyLevel))
        emergencyLevel = "default";
    return handlerSettings.emergencyLevels[emergencyLevel].actions;
}
function actionsContains(action, emergencyLevel, handlerSettings) {
    return getActions(emergencyLevel, handlerSettings).includes(action);
}

function convertDefaultHandlerActionToAutoAudit(action) {
    try {
        console.log("HANDLING DEFAULT ACTION -> " + action);
        var arr = action.split(" - ");
        var autoaudit = arr[0], sources = arr[1];
        sources = sources.split(", ");
        console.log("AUTOAUDIT: " + autoaudit + " -> " + JSON.stringify(sources))
        var extra = { autoaudit: autoaudit, sources: sources };
        return externalMonitoringFunct[autoaudit]["extra"].triggerAutoAuditOperation(extra)
    } catch (e) {
        console.log(e);
    }
    return false;
}

function generalHandlerActionOperation(extra) {
    return new Promise(async (resolve, reject) => {
        try {
            if ((!extra.action) || (!extra.sources)) return {
                code: 400,
                resultData: {success: false, message: "Both auto-audit and sources not specified"}
            };
            // CHECK extra PARAM TO KNOW WHAT FUNCTION TO CALL, AND WITH WHICH CORRESPONDING SOURCE ..
            var failures = {}, msg = "", sources = extra.sources, action = extra.action;
            delete extra.sources;
            delete extra.action;
            console.log("AGAIN!!! EXTRA DATA -> " + JSON.stringify(extra));
            var sourcesWithExtra = {}, x = null;
            for (var source of sources) {
                if ((monitoringHelperfunct[source]) && (monitoringHelperfunct[source].prePerformAction) &&
                    (typeof monitoringHelperfunct[source].prePerformAction == "function")) {
                    x = await monitoringHelperfunct[source].prePerformAction(action, extra);
                    if (x) {
                        if (!sourcesWithExtra.hasOwnProperty(x.triggerType)) sourcesWithExtra[x.triggerType] = {}; // YOU'VE TO DO THIS FIRST, BEFORE MOVING ON TO NEXT LINE,
                        sourcesWithExtra[x.triggerType][source] = x.extra; // OR THERE'LL BE AN ERROR :)
                    } else failures[source] = "Cannot Perform action '" + action + "'";
                } else failures[source] = "Does not have a Pre-Perform function for action '" + action + "'";
            } // NOW, PERFORM ACTUAL HANDLER OPERATIONS ...
            var results = {};
            console.log("SOURCES -> " + JSON.stringify(sourcesWithExtra));
            for (var triggerType in sourcesWithExtra) {
                results[triggerType] = await monitoringHelperfunct["generalHelperfunct"][triggerType].activateAutoAuditingSleeper("action", action, sourcesWithExtra[triggerType]);
            }
            for (var triggerType in results) if (!results[triggerType]) failures[triggerType] = "An Error occurred during activation of AUTO_AUDITING_SLEEPER";
            for (var source in failures) console.log(source + " -> " + failures[source]);
            if (Object.keys(failures).length <= 0) msg = "has been";
            else msg = "could not be";
            resolve({
                code: 200,
                resultData: {
                    success: true,
                    message: "Auto-Audit '" + action + "' " + msg + " performed on all sources successfully"
                }
            });
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}

function handleResults(results) {
    // THIS CODE UP HERE CAN BE PACKAGED INTO A SINGLE FUNCTION TO BE CALLED CHAW TIMES ( handleResults(results) -> {code: .., resultData: ..} )
    var success = true, failedActions = [], msg = "";
    console.log("NOW DISPLAYING HANDLER RESULTS ...")
    for (var action in results) {
        console.log(action + " -> " + JSON.stringify(results[action]));
        if (!results[action]) {
            failedActions.push(action);
            success = false;
        }
    }
    for (var a of failedActions) msg += ('"' + a + '"' + ', ');
    msg = msg.trim().slice(0, -1); // MAKE SURE TO REMOVE THE LAST ',' THOUGH
    if (success) return {code: 200, resultData: {success: true, message: 'All handlers were executed successfully'}};
    else return {
        code: 400,
        resultData: {success: false, message: 'Some handlers (' + msg + ') were not executed successfully'}
    };
}

var ExternalEventHandlers = {

    "Network Connection Tracking": {

        "Network Multiple Connections": async function (autoevent, handlerSettings) {
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    console.log("ACTIONS -> " + getActions(autoevent.emergency_level, handlerSettings));
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if ((action.length == 0) || (action == "")) continue;
                        console.log("'" + action + "' action ...")
                        switch (action) {
                            //  BLOCK IP ADDRESS WITH AUTO-SECURITY FIREWALL
                            case "Block devices's IP Address":
                                data = autoevent.data;
                                console.log("device -> " + JSON.stringify(data.device));
                                console.log("sessions -> " + JSON.stringify(data.sessions));
                                results[action] = await eventHelperfunct["Auto-API"].blockIPAddresses(data.device, data.sessions);
                                break;
                            default:
                                results[action] = await convertDefaultHandlerActionToAutoAudit(action);
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

        "extra": {
            blockIPAddresses: function (device, sessions) {
                return eventHelperfunct["Auto-API"].blockIPAddresses(device, sessions);
            },
            someExtraFunction: function () {
            }
        },

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Intrusion Detection": {

        "Intrusion Detected": async function (autoevent, handlerSettings) {
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    console.log("ACTIONS -> " + getActions(autoevent.emergency_level, handlerSettings));
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if ((action.length == 0) || (action == "")) continue;
                        console.log("'" + action + "' action ...")
                        switch (action) {
                            // PUT ACTION'S DESCRIPTION HERE :)
                            case "SOME ACTION":
                                break;
                            default:
                                results[action] = await convertDefaultHandlerActionToAutoAudit(action);
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

        "extra": {
            someExtraFunction: function () {
            }
        },

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Vulnerability Scanning": {

        "Vulnerability Detected": async function (autoevent, handlerSettings) {
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    console.log("ACTIONS -> " + getActions(autoevent.emergency_level, handlerSettings));
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if ((action.length == 0) || (action == "")) continue;
                        console.log("'" + action + "' action ...")
                        switch (action) {
                            // PUT ACTION'S DESCRIPTION HERE :)
                            case "SOME ACTION":
                                break;
                            default:
                                results[action] = await convertDefaultHandlerActionToAutoAudit(action);
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

        "extra": {
            someExtraFunction: function () {
            }
        },

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "System Auditing": {

        "System Failure": async function (autoevent, handlerSettings) {
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    console.log("ACTIONS -> " + getActions(autoevent.emergency_level, handlerSettings));
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if ((action.length == 0) || (action == "")) continue;
                        console.log("'" + action + "' action ...")
                        switch (action) {
                            // PUT ACTION'S DESCRIPTION HERE :)
                            case "SOME ACTION":
                                break;
                            default:
                                results[action] = await convertDefaultHandlerActionToAutoAudit(action);
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

        "extra": {
            someExtraFunction: function () {
            }
        },

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "AntiVirus Scanning": {

        "Virus Detected": async function (autoevent, handlerSettings) {
            return new Promise(async (resolve, reject) => {
                try {
                    var results = {}, data = null;
                    console.log("ACTIONS -> " + getActions(autoevent.emergency_level, handlerSettings));
                    for (var action of getActions(autoevent.emergency_level, handlerSettings)) {
                        if ((action.length == 0) || (action == "")) continue;
                        console.log("'" + action + "' action ...")
                        switch (action) {
                            // PUT ACTION'S DESCRIPTION HERE :)
                            case "SOME ACTION":
                                break;
                            default:
                                results[action] = await convertDefaultHandlerActionToAutoAudit(action);
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

        "extra": {
            someExtraFunction: function () {
            }
        },

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Others": {},
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};

module.exports = ExternalEventHandlers;