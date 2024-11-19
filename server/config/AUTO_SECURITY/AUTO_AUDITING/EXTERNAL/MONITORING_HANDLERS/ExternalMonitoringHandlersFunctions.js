'use strict';

var funct = require('../../../../../functions');
var settings = funct.settings;
var config = funct.config;
funct = funct.funct;

var monitoringHelperfunct = {
    "generalHelperfunct": require('../SOURCES/GeneralHelperFunct.js'),
    "Bro": require('../SOURCES/Bro/HelperFunct.js'),
    "Snort": require('../SOURCES/Snort/HelperFunct.js'),
    "Kismet": require('../SOURCES/Kismet/HelperFunct.js'),
    "Ossec": require('../SOURCES/Ossec/HelperFunct.js'),
    "Lynis": require('../SOURCES/Lynis/HelperFunct.js'),
    "Nikto": require('../SOURCES/Nikto/HelperFunct.js'),
    "Suricata": require('../SOURCES/Suricata/HelperFunct.js'),
};

function generalTriggerAutoAuditOperation(extra) {
    return new Promise(async (resolve, reject) => {
        try {
            if ((!extra.autoaudit) || (!extra.sources)) return {
                code: 400,
                resultData: {success: false, message: "Both auto-audit and sources not specified"}
            };
            // CHECK extra PARAM TO KNOW WHAT FUNCTION TO CALL, AND WITH WHICH CORRESPONDING SOURCE ..
            var failures = {}, msg = "", sources = extra.sources, autoaudit = extra.autoaudit;
            delete extra.sources;
            delete extra.autoaudit;
            console.log("AGAIN!!! EXTRA DATA -> " + JSON.stringify(extra));
            var sourcesWithExtra = {}, x = null;
            for (var source of sources) {
                if ((monitoringHelperfunct[source]) && (monitoringHelperfunct[source].preTriggerAutoAudit) &&
                    (typeof monitoringHelperfunct[source].preTriggerAutoAudit == "function")) {
                    x = await monitoringHelperfunct[source].preTriggerAutoAudit(autoaudit, extra);
                    if (x) {
                        if (!sourcesWithExtra.hasOwnProperty(x.triggerType)) sourcesWithExtra[x.triggerType] = {}; // YOU'VE TO DO THIS FIRST, BEFORE MOVING ON TO NEXT LINE,
                        sourcesWithExtra[x.triggerType][source] = x.extra; // OR THERE'LL BE AN ERROR :)
                    } else failures[source] = "Cannot Trigger autoaudit '" + autoaudit + "'";
                } else failures[source] = "Does not have a Pre-Trigger function for autoaudit '" + autoaudit + "'";
            } // NOW, PERFORM ACTUAL TRIGGER OPERATIONS ...
            var results = {};
            console.log("SOURCES -> " + JSON.stringify(sourcesWithExtra));
            for (var triggerType in sourcesWithExtra) {
                results[triggerType] = await monitoringHelperfunct["generalHelperfunct"][triggerType].activateAutoAuditingSleeper("autoaudit", autoaudit, sourcesWithExtra[triggerType]);
            }
            for (var triggerType in results) if (!results[triggerType]) failures[triggerType] = "An Error occurred during activation of AUTO_AUDITING_SLEEPER";
            for (var source in failures) console.log(source + " -> " + failures[source]);
            if (Object.keys(failures).length <= 0) msg = "has been";
            else msg = "could not be";
            resolve({
                code: 200,
                resultData: {
                    success: true,
                    message: "Auto-Audit '" + autoaudit + "' " + msg + " triggered on all sources successfully"
                }
            });
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}

var ExternalMonitoringHandlers = {

    "Network Connection Tracking": {
        /*
         AutoLog : Network Connection Sessions are logged into some DB Table or file whenever a device connects, and are logged too whenever that device disconnects (with session deleted).
         AutoEvent : Therefore check sessions to look for any anomalies or events that may have occurred.
         Examples:
         1. Network Multiple Connections:
         2. Unrecognized Device

         */

        getNameAndDetails: function (logOrEvent, data, extra) {
            var name = null, details = null;  // SET THESE VARIALBLES BASED ON data & extra
            if (logOrEvent === "autolog") {
                try {
                    name = "Network Connection Tracking Audit: " + data.connection._id;
                    details = (data.protocol.toUpperCase()) + " connection from originator (" +
                        data.connection.orig_endpoint.address + ":" + data.connection.orig_endpoint.port + ") to responder (" +
                        data.connection.resp_endpoint.address + ":" + data.connection.resp_endpoint.port + "), on date " + new Date(data.timestamp);
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e))
                    console.log(e)
                    console.log("THEREFORE, PREPROCESSING name & details USING THE PARTICULAR SOURCE OF THIS AUTOLOG")
                    switch (extra.source) {
                        case "Bro":
                            break;
                        case "Kismet":
                            break;
                    }
                }
            } else if (logOrEvent === "autoevent") {// PREPROCESS BASED ON AUTOEVENT
                // extra properties: .source .autoaudit .autoevent .emergency_level
                //  FIRST SET THE GENERIC name & details STRINGS
                name = "";
                details = "";
                switch (extra.autoevent) {
                    case "Network Multiple Connections":
                        try {
                            name = "Network Connection Tracking Event: Multiple Connections";
                            details = (data.connections.length) + " connections with multiple (" + data.protocols.length + ") protocols";
                        } catch (e) {
                            console.log("ERROR -> " + JSON.stringify(e))
                            console.log(e)
                            console.log("THEREFORE, PREPROCESSING name & details USING THE PARTICULAR SOURCE OF THIS AUTOEVENT")
                            switch (extra.source) {
                                case "Bro":
                                    break;
                                case "Kismet":
                                    break;
                            }
                        }
                        break;
                    case "Unrecognized Device":
                        name = "";
                        details = "";
                        break;
                }
            } // NOTE THE REAL REASON FOR THESE NEXT 2 LINES OF CODE, & WHETHER THEY'RE NECESSARY AT ALL
            // THEY HAVE A REASON, IN CASE THE SOURCE SPECIFIES A STRING FOR .name / .details PROPERTY, THAT TRUMPS THIS NLG RIGHT UP THERE
            if (extra.hasOwnProperty("name") && extra.name && (extra.name.length > 0)) name = extra.name;
            if (extra.hasOwnProperty("details") && extra.details && (extra.details.length > 0)) details = extra.details;
            return {name: name, details: details};
        },

        preprocessAutoAuditData: function (data, extra) {
            return new Promise((resolve, reject) => {
                var x = this.getNameAndDetails("autolog", data, extra);
                console.log("NAME & DETAILS -> " + JSON.stringify(x));
                resolve({ // FIRST SETUP .data PROPERTY OF AUTOLOG
                    // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                    name: x.name, details: x.details,
                    data: data || {} // RETURN data FOR NOW, BUT THIS FUNCTION MIGHT BE A LITTLE DIFFERENT IN ANOTHER AUTOAUDIT
                }); // YOU CAN AT LEAST VALIDATE data TO BE SURE THAT IT INCLUDES ALL NECESSARY PROPS OF SESSION TRACKING AUTO-AUDITS
                // VALIDATE BY COMPARING IT WITH .data PROPERTY OF autologSettings WITHING AUTO-AUDITING SETTINGS
            });
        },

        testAutoLogsForAutoEvents: async function (autolog, relatedAutologs) {
            function someHelperFunction() {
                return null;
            }

            return new Promise((resolve, reject) => {
                // RUN THROUGH EVERY POSSIBLE EVENT AND TEST EACH OF THEM FOR ANOMALIES
                var possibleEvents = settings.getAutoAuditAutoEventOptions(autolog.source_type, autolog.autoaudit);
                var autoeventDatas = [], actualRelatedAutologs = [];
                console.log("POSSIBLE EVENTS -> " + JSON.stringify(possibleEvents));
                //
                console.log("RELATED AUTOLOGS -> " + JSON.stringify(relatedAutologs));
                for (var evt of possibleEvents) { // SHOULG BE for(let evt of possibleEvents){}
                    switch (evt) {
                        case "Network Multiple Connections": // PERFORM SOME TEST FUNCTION TO GENERATE AUTOEVENT DATA OBJECT
                            console.log("TESTING FOR NETWORK MULTIPLE CONNECTIONS ... :)");
                            /*
                             // FIRST FILTER OUT ONLY relatedAutologs THAT HAVE THE SAME .data.someprop PROPERTY
                             var somepropRelatedAutologs = relatedAutologs.filter(function isRelated(element, index, array) {
                             console.log(index + " : " + element.data.someprop._id.toString() +
                             " : " + autolog.data.someprop._id.toString());
                             // .someprop MUST ASK FOR THE ._id PROP OF THE someprop OBJECT
                             return (element.data.someprop._id.toString() === (autolog.data.someprop._id.toString() || ""));
                             });
                             console.log("someprop RELATED AUTOLOGS -> " + JSON.stringify(somepropRelatedAutologs));
                             // SORT relatedAutologs IN TERMS OF .timestamp (WITHIN .data PROPERTY) OR IN TERMS OF .date_created PROPERTY
                             //
                             if(somepropRelatedAutologs && somepropRelatedAutologs.length > 0){
                             //  NOW YOU CAN IMPLEMENT TESTING RIGHT HERE :)
                             } else {
                             console.log("THERE ARE NO ACTUAL (someprop) RELATED AUTOLOGS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                             }
                             */
                            break;
                        default:
                            break;
                    }
                }
                resolve({autoeventDatas: autoeventDatas, actualRelatedAutologs: actualRelatedAutologs});
            });
        },

        preprocessAutoEventDataStraightAway: async function (data, extra) {
            return new Promise((resolve, reject) => {
                // extra properties: .source .autoaudit .autoevent .emergency_level
                if (!data || !extra) reject({
                    code: 400,
                    resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}
                });
                // PREPROCESS DATA BASED ON EXTERNAL SOURCE (AUTO-API)
                // NB: data MUST HAVE ALL THESE PROPERTIES COMING FROM THE SOURCE (MOST LIKELY AN EXTERNAL SOURCE)
                var x = this.getNameAndDetails("autoevent", data, extra);
                switch (extra.autoevent) {
                    case "Network Multiple Connections":
                        resolve({ // FIRST SETUP .data PROPERTY OF AUTOEVENT
                            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                            name: x.name, details: x.details,
                            emergency_level: extra.emergency_level || "default", // FIND A WAY TO SET THIS GENERICALLY
                            data: data || {
                                // PROPERTIES ARE SET BASED ON THE AUTOEVENT
                            }
                        });
                        break;
                    default:
                        reject({
                            code: 400,
                            resultData: {
                                err: "Event not recognized",
                                success: false,
                                message: 'Sorry, some error occurred'
                            }
                        });
                        break;
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            triggerAutoAuditOperation: function (extra) {
                return generalTriggerAutoAuditOperation(extra);
            },
        }

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Intrusion Detection": {
        /*
         AutoLog : How it works.
         AutoEvent : Therefore check autologs to look for any anomalies or events that may have occurred.
         Examples:
         1. Some AutoEvent

         */

        getNameAndDetails: function (logOrEvent, data, extra) {
            var name = null, details = null;  // SET THESE VARIALBLES BASED ON data & extra
            if (logOrEvent === "autolog") {
                try {
                    name = data.ids + " Intrusion Detection Audit: " + data.connection._id;
                    details = (data.protocol.toUpperCase()) + " connection from originator (" +
                        data.connection.orig_endpoint.address + ":" + data.connection.orig_endpoint.port + ") to responder (" +
                        data.connection.resp_endpoint.address + ":" + data.connection.resp_endpoint.port + "), on date " + new Date(data.timestamp);
                    if (data.sources.hasOwnProperty(extra.source)) {
                        var sourceData = data.sources[extra.source];
                        console.log("THEREFORE, PREPROCESSING name & details USING THE PARTICULAR SOURCE OF THIS AUTOLOG")
                        switch (extra.source) {
                            case "Bro": // COZ SOURCE IS BRO, RESET THE name / details VARS TO LOOK LIKE A VALID BRO LOG/EVENT
                                if (sourceData.hasOwnProperty("notice")) {
                                    if (sourceData.notice.hasOwnProperty("type") && sourceData.notice.hasOwnProperty("sub_message"))
                                        name = sourceData.notice.type + ": " + sourceData.notice.sub_message;
                                    if (sourceData.notice.hasOwnProperty("type") && sourceData.notice.hasOwnProperty("message"))
                                        details = sourceData.notice.type + ": " + sourceData.notice.message;
                                }
                                break;
                            case "Snort":
                                if (sourceData.hasOwnProperty("alert")) {
                                    if (sourceData.alert.hasOwnProperty("type") && sourceData.alert.hasOwnProperty("priority"))
                                        name = sourceData.alert.type + "; Priority: " + sourceData.alert.priority;
                                    if (sourceData.alert.hasOwnProperty("type") && sourceData.alert.hasOwnProperty("message"))
                                        details = sourceData.alert.type + ": " + sourceData.alert.message;
                                }
                                break;
                            case "Ossec":
                                break;
                            case "Kismet":
                                break;
                        }
                    }
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e))
                    console.log(e); // RESET name & details TO USE THE DEFAULT SETTING
                    name = "", details = "";
                }
            } else if (logOrEvent === "autoevent") { // PREPROCESS BASED ON AUTOEVENT
                // extra properties: .source .autoaudit .autoevent .emergency_level
                //  FIRST SET THE GENERIC name & details STRINGS
                name = "";
                details = "";
                switch (extra.autoevent) {
                    case "Intrusion Detected":
                        try {
                            name = data.ids + " Intrusion Detection Event: Intrusion Detected";
                            details = (data.protocol.toUpperCase()) + " connection from originator (" +
                                data.connection.orig_endpoint.address + ":" + data.connection.orig_endpoint.port + ") to responder (" +
                                data.connection.resp_endpoint.address + ":" + data.connection.resp_endpoint.port + "), on date " + new Date(data.timestamp);
                            if (data.sources.hasOwnProperty(extra.source)) {
                                var sourceData = data.sources[extra.source];
                                console.log("THEREFORE, PREPROCESSING name & details USING THE PARTICULAR SOURCE OF THIS AUTOLOG")
                                switch (extra.source) {
                                    case "Bro": // COZ SOURCE IS BRO, RESET THE name / details VARS TO LOOK LIKE A VALID BRO LOG/EVENT
                                        if (sourceData.hasOwnProperty("notice")) {
                                            if (sourceData.notice.hasOwnProperty("type") && sourceData.notice.hasOwnProperty("sub_message"))
                                                name = sourceData.notice.type + ": " + sourceData.notice.sub_message;
                                            if (sourceData.notice.hasOwnProperty("type") && sourceData.notice.hasOwnProperty("message"))
                                                details = sourceData.notice.type + ": " + sourceData.notice.message;
                                        }
                                        break;
                                    case "Snort":
                                        if (sourceData.hasOwnProperty("alert")) {
                                            if (sourceData.alert.hasOwnProperty("type") && sourceData.alert.hasOwnProperty("priority"))
                                                name = sourceData.alert.type + "; Priority: " + sourceData.alert.priority;
                                            if (sourceData.alert.hasOwnProperty("type") && sourceData.alert.hasOwnProperty("message"))
                                                details = sourceData.alert.type + ": " + sourceData.alert.message;
                                        }
                                        break;
                                    case "Ossec":
                                        break;
                                    case "Kismet":
                                        break;
                                }
                            }
                        } catch (e) {
                            console.log("ERROR -> " + JSON.stringify(e))
                            console.log(e); // RESET name & details TO USE THE DEFAULT SETTING
                            name = "", details = "";
                        }
                        break;
                }
            } // NOTE THE REAL REASON FOR THESE NEXT 2 LINES OF CODE, & WHETHER THEY'RE NECESSARY AT ALL
            // THEY HAVE A REASON, IN CASE THE SOURCE SPECIFIES A STRING FOR .name / .details PROPERTY, THAT TRUMPS THIS NLG RIGHT UP THERE
            if (extra.hasOwnProperty("name") && extra.name && (extra.name.length > 0)) name = extra.name;
            if (extra.hasOwnProperty("details") && extra.details && (extra.details.length > 0)) details = extra.details;
            return {name: name, details: details};
        },

        preprocessAutoAuditData: function (data, extra) {
            return new Promise((resolve, reject) => {
                var x = this.getNameAndDetails("autolog", data, extra);
                console.log("NAME & DETAILS -> " + JSON.stringify(x));
                resolve({ // FIRST SETUP .data PROPERTY OF AUTOLOG
                    // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                    name: x.name, details: x.details,
                    data: data || {} // RETURN data FOR NOW, BUT THIS FUNCTION MIGHT BE A LITTLE DIFFERENT IN ANOTHER AUTOAUDIT
                }); // YOU CAN AT LEAST VALIDATE data TO BE SURE THAT IT INCLUDES ALL NECESSARY PROPS OF SESSION TRACKING AUTO-AUDITS
                // VALIDATE BY COMPARING IT WITH .data PROPERTY OF autologSettings WITHING AUTO-AUDITING SETTINGS
            });
        },

        testAutoLogsForAutoEvents: async function (autolog, relatedAutologs) {
            function someHelperFunction() {
                return null;
            }

            return new Promise((resolve, reject) => {
                // RUN THROUGH EVERY POSSIBLE EVENT AND TEST EACH OF THEM FOR ANOMALIES
                var possibleEvents = settings.getAutoAuditAutoEventOptions(autolog.source_type, autolog.autoaudit);
                var autoeventDatas = [], actualRelatedAutologs = [];
                console.log("POSSIBLE EVENTS -> " + JSON.stringify(possibleEvents));
                //
                console.log("RELATED AUTOLOGS -> " + JSON.stringify(relatedAutologs));
                for (var evt of possibleEvents) { // SHOULG BE for(let evt of possibleEvents){}
                    switch (evt) {
                        case "Intrusion Detected": // PERFORM SOME TEST FUNCTION TO GENERATE AUTOEVENT DATA OBJECT
                            console.log("TESTING FOR INTRUSION DETECTED ... :)");
                            /*
                             // FIRST FILTER OUT ONLY relatedAutologs THAT HAVE THE SAME .data.someprop PROPERTY
                             var somepropRelatedAutologs = relatedAutologs.filter(function isRelated(element, index, array) {
                             console.log(index + " : " + element.data.someprop._id.toString() +
                             " : " + autolog.data.someprop._id.toString());
                             // .someprop MUST ASK FOR THE ._id PROP OF THE someprop OBJECT
                             return (element.data.someprop._id.toString() === (autolog.data.someprop._id.toString() || ""));
                             });
                             console.log("someprop RELATED AUTOLOGS -> " + JSON.stringify(somepropRelatedAutologs));
                             // SORT relatedAutologs IN TERMS OF .timestamp (WITHIN .data PROPERTY) OR IN TERMS OF .date_created PROPERTY
                             //
                             if(somepropRelatedAutologs && somepropRelatedAutologs.length > 0){
                             //  NOW YOU CAN IMPLEMENT TESTING RIGHT HERE :)
                             } else {
                             console.log("THERE ARE NO ACTUAL (someprop) RELATED AUTOLOGS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                             }
                             */
                            break;
                        default:
                            break;
                    }
                }
                resolve({autoeventDatas: autoeventDatas, actualRelatedAutologs: actualRelatedAutologs});
            });
        },

        preprocessAutoEventDataStraightAway: async function (data, extra) {
            return new Promise((resolve, reject) => {
                // extra properties: .source .autoaudit .autoevent .emergency_level
                if (!data || !extra) reject({
                    code: 400,
                    resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}
                });
                // PREPROCESS DATA BASED ON EXTERNAL SOURCE (AUTO-API)
                // NB: data MUST HAVE ALL THESE PROPERTIES COMING FROM THE SOURCE (MOST LIKELY AN EXTERNAL SOURCE)
                var x = this.getNameAndDetails("autoevent", data, extra);
                switch (extra.autoevent) {
                    case "Intrusion Detected":
                        resolve({ // FIRST SETUP .data PROPERTY OF AUTOEVENT
                            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                            name: x.name, details: x.details,
                            emergency_level: extra.emergency_level || "default", // FIND A WAY TO SET THIS GENERICALLY
                            data: data || {
                                // PROPERTIES ARE SET BASED ON THE AUTOEVENT
                            }
                        });
                        break;
                    default:
                        reject({
                            code: 400,
                            resultData: {
                                err: "Event not recognized",
                                success: false,
                                message: 'Sorry, some error occurred'
                            }
                        });
                        break;
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            triggerAutoAuditOperation: function (extra) {
                return generalTriggerAutoAuditOperation(extra);
            },
        }

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Vulnerability Scanning": {
        /*
         AutoLog : How it works.
         AutoEvent : Therefore check autologs to look for any anomalies or events that may have occurred.
         Examples:
         1. Some AutoEvent

         */

        getNameAndDetails: function (logOrEvent, data, extra) {
            var name = null, details = null;  // SET THESE VARIALBLES BASED ON data & extra
            if (logOrEvent === "autolog") {
                try {
                    name = "Vulnerability Scanning Audit on host: " + data.host.host_name + " (" + data.host.ip_addr + ":"
                        + data.host.port + ") on date " + new Date(data.timestamp);
                    details = "Vulnerability Scan on " + data.host.host_name + " (" + data.host.ip_addr + ":" + data.host.port + "): " + data.description;
                    if (data.sources.hasOwnProperty(extra.source)) {
                        var sourceData = data.sources[extra.source];
                        console.log("THEREFORE, PREPROCESSING name & details USING THE PARTICULAR SOURCE OF THIS AUTOLOG")
                        switch (extra.source) {
                            case "Nikto": // COZ SOURCE IS NIKTO, RESET THE name / details VARS TO LOOK LIKE A VALID NIKTO LOG/EVENT
                                if (sourceData.hasOwnProperty("osvdbid")) { // OR uri / method
                                    // DO NOTHING OVER HERE FOR NOW ..:)
                                }
                                break;
                        }
                    }
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e))
                    console.log(e); // RESET name & details TO USE THE DEFAULT SETTING
                    name = "", details = "";
                }
            } else if (logOrEvent === "autoevent") {// PREPROCESS BASED ON AUTOEVENT
                // extra properties: .source .autoaudit .autoevent .emergency_level
                //  FIRST SET THE GENERIC name & details STRINGS
                name = "";
                details = "";
                switch (extra.autoevent) {
                    case "Vulnerability Detected":
                        try {
                            name = "Vulnerability Detected on host: " + data.host.host_name + " (" + data.host.ip_addr + ":"
                                + data.host.port + ") on date " + new Date(data.timestamp);
                            details = data.host.host_name + " (" + data.host.ip_addr + ":" + data.host.port + "): " + data.description;
                            if (data.sources.hasOwnProperty(extra.source)) {
                                var sourceData = data.sources[extra.source];
                                console.log("THEREFORE, PREPROCESSING name & details USING THE PARTICULAR SOURCE OF THIS AUTOLOG")
                                switch (extra.source) {
                                    case "Nikto": // COZ SOURCE IS NIKTO, RESET THE name / details VARS TO LOOK LIKE A VALID NIKTO LOG/EVENT
                                        if (sourceData.hasOwnProperty("osvdbid")) { // OR uri / method
                                            // DO NOTHING OVER HERE FOR NOW ..:)
                                        }
                                        break;
                                }
                            }
                        } catch (e) {
                            console.log("ERROR -> " + JSON.stringify(e))
                            console.log(e); // RESET name & details TO USE THE DEFAULT SETTING
                            name = "", details = "";
                        }
                        break;
                }
            } // NOTE THE REAL REASON FOR THESE NEXT 2 LINES OF CODE, & WHETHER THEY'RE NECESSARY AT ALL
            // THEY HAVE A REASON, IN CASE THE SOURCE SPECIFIES A STRING FOR .name / .details PROPERTY, THAT TRUMPS THIS NLG RIGHT UP THERE
            if (extra.hasOwnProperty("name") && extra.name && (extra.name.length > 0)) name = extra.name;
            if (extra.hasOwnProperty("details") && extra.details && (extra.details.length > 0)) details = extra.details;
            return {name: name, details: details};
        },

        preprocessAutoAuditData: function (data, extra) {
            return new Promise((resolve, reject) => {
                var x = this.getNameAndDetails("autolog", data, extra);
                console.log("NAME & DETAILS -> " + JSON.stringify(x));
                resolve({ // FIRST SETUP .data PROPERTY OF AUTOLOG
                    // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                    name: x.name, details: x.details,
                    data: data || {} // RETURN data FOR NOW, BUT THIS FUNCTION MIGHT BE A LITTLE DIFFERENT IN ANOTHER AUTOAUDIT
                }); // YOU CAN AT LEAST VALIDATE data TO BE SURE THAT IT INCLUDES ALL NECESSARY PROPS OF SESSION TRACKING AUTO-AUDITS
                // VALIDATE BY COMPARING IT WITH .data PROPERTY OF autologSettings WITHING AUTO-AUDITING SETTINGS
            });
        },

        testAutoLogsForAutoEvents: async function (autolog, relatedAutologs) {
            function someHelperFunction() {
                return null;
            }

            return new Promise((resolve, reject) => {
                // RUN THROUGH EVERY POSSIBLE EVENT AND TEST EACH OF THEM FOR ANOMALIES
                var possibleEvents = settings.getAutoAuditAutoEventOptions(autolog.source_type, autolog.autoaudit);
                var autoeventDatas = [], actualRelatedAutologs = [];
                console.log("POSSIBLE EVENTS -> " + JSON.stringify(possibleEvents));
                //
                console.log("RELATED AUTOLOGS -> " + JSON.stringify(relatedAutologs));
                for (var evt of possibleEvents) { // SHOULG BE for(let evt of possibleEvents){}
                    switch (evt) {
                        case "Vulnerability Detected": // PERFORM SOME TEST FUNCTION TO GENERATE AUTOEVENT DATA OBJECT
                            console.log("TESTING FOR VULNERABILITY DETECTED :)");
                            /*
                             // FIRST FILTER OUT ONLY relatedAutologs THAT HAVE THE SAME .data.someprop PROPERTY
                             var somepropRelatedAutologs = relatedAutologs.filter(function isRelated(element, index, array) {
                             console.log(index + " : " + element.data.someprop._id.toString() +
                             " : " + autolog.data.someprop._id.toString());
                             // .someprop MUST ASK FOR THE ._id PROP OF THE someprop OBJECT
                             return (element.data.someprop._id.toString() === (autolog.data.someprop._id.toString() || ""));
                             });
                             console.log("someprop RELATED AUTOLOGS -> " + JSON.stringify(somepropRelatedAutologs));
                             // SORT relatedAutologs IN TERMS OF .timestamp (WITHIN .data PROPERTY) OR IN TERMS OF .date_created PROPERTY
                             //
                             if(somepropRelatedAutologs && somepropRelatedAutologs.length > 0){
                             //  NOW YOU CAN IMPLEMENT TESTING RIGHT HERE :)
                             } else {
                             console.log("THERE ARE NO ACTUAL (someprop) RELATED AUTOLOGS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                             }
                             */
                            break;
                        default:
                            break;
                    }
                }
                resolve({autoeventDatas: autoeventDatas, actualRelatedAutologs: actualRelatedAutologs});
            });
        },

        preprocessAutoEventDataStraightAway: async function (data, extra) {
            return new Promise((resolve, reject) => {
                // extra properties: .source .autoaudit .autoevent .emergency_level
                if (!data || !extra) reject({
                    code: 400,
                    resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}
                });
                // PREPROCESS DATA BASED ON EXTERNAL SOURCE (AUTO-API)
                // NB: data MUST HAVE ALL THESE PROPERTIES COMING FROM THE SOURCE (MOST LIKELY AN EXTERNAL SOURCE)
                var x = this.getNameAndDetails("autoevent", data, extra);
                switch (extra.autoevent) {
                    case "Vulnerability Detected":
                        resolve({ // FIRST SETUP .data PROPERTY OF AUTOEVENT
                            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                            name: x.name, details: x.details,
                            emergency_level: extra.emergency_level || "default", // FIND A WAY TO SET THIS GENERICALLY
                            data: data || {
                                // PROPERTIES ARE SET BASED ON THE AUTOEVENT
                            }
                        });
                        break;
                    default:
                        reject({
                            code: 400,
                            resultData: {
                                err: "Event not recognized",
                                success: false,
                                message: 'Sorry, some error occurred'
                            }
                        });
                        break;
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            triggerAutoAuditOperation: function (extra) {
                return generalTriggerAutoAuditOperation(extra);
            },
        }

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "System Auditing": {
        /*
         AutoLog : How it works.
         AutoEvent : Therefore check autologs to look for any anomalies or events that may have occurred.
         Examples:
         1. Some AutoEvent

         */

        getNameAndDetails: function (logOrEvent, data, extra) {
            var name = null, details = null;  // SET THESE VARIALBLES BASED ON data & extra
            if (logOrEvent === "autolog") {
                name = "";
                details = "";
            } else if (logOrEvent === "autoevent") {// PREPROCESS BASED ON AUTOEVENT
                // extra properties: .source .autoaudit .autoevent .emergency_level
                //  FIRST SET THE GENERIC name & details STRINGS
                name = "";
                details = "";
                switch (extra.autoevent) {
                    case "SOME AUTOEVENT":
                        name = "";
                        details = "";
                        break;
                }
            } // NOTE THE REAL REASON FOR THESE NEXT 2 LINES OF CODE, & WHETHER THEY'RE NECESSARY AT ALL
            // THEY HAVE A REASON, IN CASE THE SOURCE SPECIFIES A STRING FOR .name / .details PROPERTY, THAT TRUMPS THIS NLG RIGHT UP THERE
            if (extra.hasOwnProperty("name") && extra.name && (extra.name.length > 0)) name = extra.name;
            if (extra.hasOwnProperty("details") && extra.details && (extra.details.length > 0)) details = extra.details;
            return {name: name, details: details};
        },

        preprocessAutoAuditData: function (data, extra) {
            return new Promise((resolve, reject) => {
                var x = this.getNameAndDetails("autolog", data, extra);
                console.log("NAME & DETAILS -> " + JSON.stringify(x));
                resolve({ // FIRST SETUP .data PROPERTY OF AUTOLOG
                    // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                    name: x.name, details: x.details,
                    data: data || {} // RETURN data FOR NOW, BUT THIS FUNCTION MIGHT BE A LITTLE DIFFERENT IN ANOTHER AUTOAUDIT
                }); // YOU CAN AT LEAST VALIDATE data TO BE SURE THAT IT INCLUDES ALL NECESSARY PROPS OF SESSION TRACKING AUTO-AUDITS
                // VALIDATE BY COMPARING IT WITH .data PROPERTY OF autologSettings WITHING AUTO-AUDITING SETTINGS
            });
        },

        testAutoLogsForAutoEvents: async function (autolog, relatedAutologs) {
            function someHelperFunction() {
                return null;
            }

            return new Promise((resolve, reject) => {
                // RUN THROUGH EVERY POSSIBLE EVENT AND TEST EACH OF THEM FOR ANOMALIES
                var possibleEvents = settings.getAutoAuditAutoEventOptions(autolog.source_type, autolog.autoaudit);
                var autoeventDatas = [], actualRelatedAutologs = [];
                console.log("POSSIBLE EVENTS -> " + JSON.stringify(possibleEvents));
                //
                console.log("RELATED AUTOLOGS -> " + JSON.stringify(relatedAutologs));
                for (var evt of possibleEvents) { // SHOULG BE for(let evt of possibleEvents){}
                    switch (evt) {
                        case "SOME AUTOEVENT": // PERFORM SOME TEST FUNCTION TO GENERATE AUTOEVENT DATA OBJECT
                            console.log("TESTING FOR ... :)");
                            /*
                             // FIRST FILTER OUT ONLY relatedAutologs THAT HAVE THE SAME .data.someprop PROPERTY
                             var somepropRelatedAutologs = relatedAutologs.filter(function isRelated(element, index, array) {
                             console.log(index + " : " + element.data.someprop._id.toString() +
                             " : " + autolog.data.someprop._id.toString());
                             // .someprop MUST ASK FOR THE ._id PROP OF THE someprop OBJECT
                             return (element.data.someprop._id.toString() === (autolog.data.someprop._id.toString() || ""));
                             });
                             console.log("someprop RELATED AUTOLOGS -> " + JSON.stringify(somepropRelatedAutologs));
                             // SORT relatedAutologs IN TERMS OF .timestamp (WITHIN .data PROPERTY) OR IN TERMS OF .date_created PROPERTY
                             //
                             if(somepropRelatedAutologs && somepropRelatedAutologs.length > 0){
                             //  NOW YOU CAN IMPLEMENT TESTING RIGHT HERE :)
                             } else {
                             console.log("THERE ARE NO ACTUAL (someprop) RELATED AUTOLOGS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                             }
                             */
                            break;
                        default:
                            break;
                    }
                }
                resolve({autoeventDatas: autoeventDatas, actualRelatedAutologs: actualRelatedAutologs});
            });
        },

        preprocessAutoEventDataStraightAway: async function (data, extra) {
            return new Promise((resolve, reject) => {
                // extra properties: .source .autoaudit .autoevent .emergency_level
                if (!data || !extra) reject({
                    code: 400,
                    resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}
                });
                // PREPROCESS DATA BASED ON EXTERNAL SOURCE (AUTO-API)
                // NB: data MUST HAVE ALL THESE PROPERTIES COMING FROM THE SOURCE (MOST LIKELY AN EXTERNAL SOURCE)
                var x = this.getNameAndDetails("autoevent", data, extra);
                switch (extra.autoevent) {
                    case "SOME AUTOEVENT":
                        resolve({ // FIRST SETUP .data PROPERTY OF AUTOEVENT
                            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                            name: x.name, details: x.details,
                            emergency_level: extra.emergency_level || "default", // FIND A WAY TO SET THIS GENERICALLY
                            data: data || {
                                // PROPERTIES ARE SET BASED ON THE AUTOEVENT
                            }
                        });
                        break;
                    default:
                        reject({
                            code: 400,
                            resultData: {
                                err: "Event not recognized",
                                success: false,
                                message: 'Sorry, some error occurred'
                            }
                        });
                        break;
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            triggerAutoAuditOperation: function (extra) {
                return generalTriggerAutoAuditOperation(extra);
            },
        }

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "AntiVirus Scanning": {
        /*
         AutoLog : How it works.
         AutoEvent : Therefore check autologs to look for any anomalies or events that may have occurred.
         Examples:
         1. Some AutoEvent

         */

        getNameAndDetails: function (logOrEvent, data, extra) {
            var name = null, details = null;  // SET THESE VARIALBLES BASED ON data & extra
            if (logOrEvent === "autolog") {
                name = "";
                details = "";
            } else if (logOrEvent === "autoevent") {// PREPROCESS BASED ON AUTOEVENT
                // extra properties: .source .autoaudit .autoevent .emergency_level
                //  FIRST SET THE GENERIC name & details STRINGS
                name = "";
                details = "";
                switch (extra.autoevent) {
                    case "SOME AUTOEVENT":
                        name = "";
                        details = "";
                        break;
                }
            } // NOTE THE REAL REASON FOR THESE NEXT 2 LINES OF CODE, & WHETHER THEY'RE NECESSARY AT ALL
            // THEY HAVE A REASON, IN CASE THE SOURCE SPECIFIES A STRING FOR .name / .details PROPERTY, THAT TRUMPS THIS NLG RIGHT UP THERE
            if (extra.hasOwnProperty("name") && extra.name && (extra.name.length > 0)) name = extra.name;
            if (extra.hasOwnProperty("details") && extra.details && (extra.details.length > 0)) details = extra.details;
            return {name: name, details: details};
        },

        preprocessAutoAuditData: function (data, extra) {
            return new Promise((resolve, reject) => {
                var x = this.getNameAndDetails("autolog", data, extra);
                console.log("NAME & DETAILS -> " + JSON.stringify(x));
                resolve({ // FIRST SETUP .data PROPERTY OF AUTOLOG
                    // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                    name: x.name, details: x.details,
                    data: data || {} // RETURN data FOR NOW, BUT THIS FUNCTION MIGHT BE A LITTLE DIFFERENT IN ANOTHER AUTOAUDIT
                }); // YOU CAN AT LEAST VALIDATE data TO BE SURE THAT IT INCLUDES ALL NECESSARY PROPS OF SESSION TRACKING AUTO-AUDITS
                // VALIDATE BY COMPARING IT WITH .data PROPERTY OF autologSettings WITHING AUTO-AUDITING SETTINGS
            });
        },

        testAutoLogsForAutoEvents: async function (autolog, relatedAutologs) {
            function someHelperFunction() {
                return null;
            }

            return new Promise((resolve, reject) => {
                // RUN THROUGH EVERY POSSIBLE EVENT AND TEST EACH OF THEM FOR ANOMALIES
                var possibleEvents = settings.getAutoAuditAutoEventOptions(autolog.source_type, autolog.autoaudit);
                var autoeventDatas = [], actualRelatedAutologs = [];
                console.log("POSSIBLE EVENTS -> " + JSON.stringify(possibleEvents));
                //
                console.log("RELATED AUTOLOGS -> " + JSON.stringify(relatedAutologs));
                for (var evt of possibleEvents) { // SHOULG BE for(let evt of possibleEvents){}
                    switch (evt) {
                        case "SOME AUTOEVENT": // PERFORM SOME TEST FUNCTION TO GENERATE AUTOEVENT DATA OBJECT
                            console.log("TESTING FOR ... :)");
                            /*
                             // FIRST FILTER OUT ONLY relatedAutologs THAT HAVE THE SAME .data.someprop PROPERTY
                             var somepropRelatedAutologs = relatedAutologs.filter(function isRelated(element, index, array) {
                             console.log(index + " : " + element.data.someprop._id.toString() +
                             " : " + autolog.data.someprop._id.toString());
                             // .someprop MUST ASK FOR THE ._id PROP OF THE someprop OBJECT
                             return (element.data.someprop._id.toString() === (autolog.data.someprop._id.toString() || ""));
                             });
                             console.log("someprop RELATED AUTOLOGS -> " + JSON.stringify(somepropRelatedAutologs));
                             // SORT relatedAutologs IN TERMS OF .timestamp (WITHIN .data PROPERTY) OR IN TERMS OF .date_created PROPERTY
                             //
                             if(somepropRelatedAutologs && somepropRelatedAutologs.length > 0){
                             //  NOW YOU CAN IMPLEMENT TESTING RIGHT HERE :)
                             } else {
                             console.log("THERE ARE NO ACTUAL (someprop) RELATED AUTOLOGS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                             }
                             */
                            break;
                        default:
                            break;
                    }
                }
                resolve({autoeventDatas: autoeventDatas, actualRelatedAutologs: actualRelatedAutologs});
            });
        },

        preprocessAutoEventDataStraightAway: async function (data, extra) {
            return new Promise((resolve, reject) => {
                // extra properties: .source .autoaudit .autoevent .emergency_level
                if (!data || !extra) reject({
                    code: 400,
                    resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}
                });
                // PREPROCESS DATA BASED ON EXTERNAL SOURCE (AUTO-API)
                // NB: data MUST HAVE ALL THESE PROPERTIES COMING FROM THE SOURCE (MOST LIKELY AN EXTERNAL SOURCE)
                var x = this.getNameAndDetails("autoevent", data, extra);
                switch (extra.autoevent) {
                    case "SOME AUTOEVENT":
                        resolve({ // FIRST SETUP .data PROPERTY OF AUTOEVENT
                            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                            name: x.name, details: x.details,
                            emergency_level: extra.emergency_level || "default", // FIND A WAY TO SET THIS GENERICALLY
                            data: data || {
                                // PROPERTIES ARE SET BASED ON THE AUTOEVENT
                            }
                        });
                        break;
                    default:
                        reject({
                            code: 400,
                            resultData: {
                                err: "Event not recognized",
                                success: false,
                                message: 'Sorry, some error occurred'
                            }
                        });
                        break;
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            triggerAutoAuditOperation: function (extra) {
                return generalTriggerAutoAuditOperation(extra);
            },
        }

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Others": {},
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

};

module.exports = ExternalMonitoringHandlers;