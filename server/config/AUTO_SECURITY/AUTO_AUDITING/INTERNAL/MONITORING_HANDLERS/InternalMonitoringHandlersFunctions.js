'use strict';

var funct = require('../../../../../functions');
var settings = funct.settings;
var config = funct.config;
funct = funct.funct;

var monitoringHelperfunct = {
    "generalHelperfunct" : require('../SOURCES/GeneralHelperFunct.js'),
    "Auto-API": require('../SOURCES/Auto-API/HelperFunct.js')
};

function generalTriggerAutoAuditOperation(extra){
    return new Promise(async (resolve, reject) => {
        try {
            if((!extra.autoaudit) || (!extra.sources)) return { code: 400, resultData: {success: false, message: "Both auto-audit and sources not specified"} };
            // CHECK extra PARAM TO KNOW WHAT FUNCTION TO CALL, AND WITH WHICH CORRESPONDING SOURCE ..
            var failures = {}, msg = "", sources = extra.sources, autoaudit = extra.autoaudit;
            delete extra.sources; delete extra.autoaudit;
            console.log("AGAIN!!! EXTRA DATA -> " + JSON.stringify(extra));
            var sourcesWithExtra = {}, x = null;
            for(var source of sources){
                if( (monitoringHelperfunct[source]) && (monitoringHelperfunct[source].preTriggerAutoAudit) &&
                    (typeof monitoringHelperfunct[source].preTriggerAutoAudit == "function") ) {
                    x = await monitoringHelperfunct[source].preTriggerAutoAudit(autoaudit, extra);
                    if(x) {
                        if(!sourcesWithExtra.hasOwnProperty(x.triggerType)) sourcesWithExtra[x.triggerType] = {}; // YOU'VE TO DO THIS FIRST, BEFORE MOVING ON TO NEXT LINE,
                        sourcesWithExtra[x.triggerType][source] = x.extra; // OR THERE'LL BE AN ERROR :)
                    } else failures[source] = "Cannot Trigger autoaudit '" + autoaudit + "'";
                } else failures[source] = "Does not have a Pre-Trigger function for autoaudit '" + autoaudit + "'";
            } // NOW, PERFORM ACTUAL TRIGGER OPERATIONS ...
            var results = {}; console.log("SOURCES -> " + JSON.stringify(sourcesWithExtra));
            for(var triggerType in sourcesWithExtra) {
                results[triggerType] = await monitoringHelperfunct["generalHelperfunct"][triggerType].performAutoAuditOrAction("autoaudit", autoaudit, sourcesWithExtra[triggerType]);
            }
            for(var triggerType in results) if(!results[triggerType]) failures[triggerType] = "An Error occurred";
            for(var source in failures) console.log(source + " -> " + failures[source]);
            if(Object.keys(failures).length <= 0) msg = "has been";
            else msg = "could not be";
            resolve({code: 200, resultData: {success: true, message: "Auto-Audit '" + autoaudit + "' " + msg + " triggered on all sources successfully" }});
        } catch (e){
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}

var InternalMonitoringHandlers = {

    "Session Tracking": {
        /*
         AutoLog : Sessions are logged into some DB Table or file whenever a user logs in, and are logged too whenever that user logs out (with access token deleted).
         AutoEvent : Therefore check sessions to look for any anomalies or events that may have occurred.
         Examples:
         1. User Multiple Logins:
         2. Unrecognized Device

         */

        getNameAndDetails : function(logOrEvent, data, extra){
            var name = null, details = null;  // SET THESE VARIALBLES BASED ON data & extra
            if(logOrEvent === "autolog"){
                name = "Session Tracking audit pertaining to user: " + data.user.full_name;
                details = "User (" + data.user.full_name + ") has logged " + (data.login ? "in" : "out") + " with a device ("
                    + (data.device.id || "") + "), on date " + new Date(data.timestamp) + " with access token " + data.access_token.token;
            } else if (logOrEvent === "autoevent"){ // PREPROCESS BASED ON AUTOEVENT
                // extra properties: .source .autoaudit .autoevent .emergency_level
                //  FIRST SET THE GENERIC name & details STRINGS
                name = "Session Tracking audit pertaining to user: " + data.user.full_name;
                details = "";
                switch(extra.autoevent){
                    case "User Multiple Logins":
                        name = "Session Tracking event pertaining to user: " + data.user.full_name;
                        details = "User: (" + data.user.full_name + ") has had " + data.logins + " logins with " + data.devices.length + " devices";
                        break;
                    case "Unrecognized Device":
                        name = "Session Tracking event pertaining to user: " + data.user.full_name;
                        details = "User: (" + data.user.full_name + ") tried to access server an unrecognized device";
                        break;
                }
            } // NOTE THE REAL REASON FOR THESE NEXT 2 LINES OF CODE, & WHETHER THEY'RE NECESSARY AT ALL
            // THEY HAVE A REASON, IN CASE THE SOURCE SPECIFIES A STRING FOR .name / .details PROPERTY, THAT TRUMPS THIS NLG RIGHT UP THERE
            if(extra.hasOwnProperty("name") && extra.name && (extra.name.length > 0)) name = extra.name;
            if(extra.hasOwnProperty("details") && extra.details && (extra.details.length > 0)) details = extra.details;
            return {name: name, details: details};
        },

        preprocessAutoAuditData: async function (data, extra) {
            return new Promise((resolve, reject) => {
                var x = this.getNameAndDetails("autolog", data, extra);
                console.log("NAME & DETAILS -> " + JSON.stringify(x));
                resolve({ // FIRST SETUP .data PROPERTY OF AUTOLOG
                    // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                    name : x.name, details : x.details,
                    data : data || {} // RETURN data FOR NOW, BUT THIS FUNCTION MIGHT BE A LITTLE DIFFERENT IN ANOTHER AUTOAUDIT
                }); // YOU CAN AT LEAST VALIDATE data TO BE SURE THAT IT INCLUDES ALL NECESSARY PROPS OF SESSION TRACKING AUTO-AUDITS
                // VALIDATE BY COMPARING IT WITH .data PROPERTY OF autologSettings WITHING AUTO-AUDITING SETTINGS
            });
        },

        testAutoLogsForAutoEvents: async function (autolog, relatedAutologs) {
            //  HELPER FUNCTIONS
            function isLog(str, autolog) {
                if (str === "in") return autolog.data.login && !autolog.data.logout;
                else if (str === "out") return !autolog.data.login && autolog.data.logout;
                else return null;
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
                        case "User Multiple Logins":
                            console.log("TESTING FOR USER MULTIPLE LOGINS... :)");
                            // FIRST FILTER OUT ONLY relatedAutologs THAT HAVE THE SAME .data.user PROPERTY
                            var userRelatedAutologs = relatedAutologs.filter(function isRelated(element, index, array) {
                                console.log(index + " : " + element.data.user._id.toString() +
                                    " : " + autolog.data.user._id.toString());
                                // .user MUST ASK FOR THE ._id PROP OF THE USER OBJECT
                                return (element.data.user._id.toString() === (autolog.data.user._id.toString() || ""));
                            });
                            console.log("USER RELATED AUTOLOGS -> " + JSON.stringify(userRelatedAutologs));
                            // SORT relatedAutologs IN TERMS OF .timestamp (WITHIN .data PROPERTY) OR IN TERMS OF .date_created PROPERTY
                            //
                            if(userRelatedAutologs && userRelatedAutologs.length > 0){
                                if (isLog("in", autolog)) {
                                    var logins = 1, devices = [], timestamps = [], access_tokens = [],
                                        emergencyLevel = "default",
                                        loopAutolog = null;
                                    // PUSH THE DATA OF THE MAIN AUTOLOG BEING TESTED
                                    access_tokens.push(autolog.data.access_token);
                                    devices.push(autolog.data.device);
                                    timestamps.push(autolog.data.timestamp);
                                    //
                                    console.log("BEFORE LOOP ...")
                                    console.log(JSON.stringify(access_tokens))
                                    console.log(JSON.stringify(devices))
                                    console.log(JSON.stringify(timestamps))
                                    //
                                    console.log("NOW, LOOPING FROM BEHIND THE USER RELATED LOGS")
                                    for (var i = userRelatedAutologs.length-1; i >= 0; i--) { // LOOP FROM BEHIND
                                        console.log("INDEX -> " + i);
                                        loopAutolog = userRelatedAutologs[i];
                                        console.log("IS LOOP AUTOLOG A LOGOUT -> " + isLog("out", loopAutolog));
                                        if (isLog("out", loopAutolog)) break;
                                        console.log("NOT A LOGOUT APPARENTLY, PUSHING INTO ACTUAL RELATED AUTOLOGS ..");
                                        actualRelatedAutologs.push(loopAutolog);
                                        logins++; // INCREMENT NUMBER OF LOGINS
                                        console.log("NO. OF LOGINS -> " + logins);
                                        // PUSH THE DATA OF THIS LOOP AUTOLOG
                                        access_tokens.push(loopAutolog.data.access_token);
                                        devices.push(loopAutolog.data.device);
                                        timestamps.push(loopAutolog.data.timestamp);
                                        console.log("PUSHED ALL PROPS INTO RESPECTIVE ARRAYS");
                                    }
                                    //
                                    console.log("AFTER LOOP ...")
                                    console.log(JSON.stringify(access_tokens))
                                    console.log(JSON.stringify(devices))
                                    console.log(JSON.stringify(timestamps))
                                    //
                                    console.log("ACTUAL RELATED AUTOLOGS -> " + JSON.stringify(actualRelatedAutologs));
                                    console.log("");
                                    //
                                    if (logins > 1) { // IF MULTIPLE LOGINS
                                        var eventData = { // FIRST SETUP .data PROPERTY OF AUTOEVENT
                                            user: {
                                                "_id": autolog.data.user._id || "",
                                                "full_name": autolog.data.user.full_name || "",
                                            },
                                            logins: logins,
                                            access_tokens: access_tokens,
                                            devices: devices,
                                            timestamps: timestamps
                                        }, extra = {
                                            emergency_level: emergencyLevel,
                                            autoaudit: "Session Tracking" || "",
                                            autoevent: evt || ""
                                        };
                                        // FIND A WAY TO SET emergencyLevel VAR (EVEN THOUGH THIS IS REGULAR ANALYSIS)
                                        var x = this.getNameAndDetails("autoevent", eventData, extra);
                                        extra.name = x.name; extra.details = x.details; // ADD SUMMARIES OF .data
                                        //
                                        console.log("EVENT DATA -> " + JSON.stringify(eventData));
                                        console.log("EXTRA DATA -> " + JSON.stringify(extra));
                                        //
                                        autoeventDatas.push({data: eventData, extra: extra});
                                    }
                                }
                            } else {
                                console.log("THERE ARE NO ACTUAL (USER) RELATED AUTOLOGS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                            }
                            break;
                        case "Unrecognized Device": // THIS IS A 2-STAGE AUTOAUDIT APPARENTLY, SO NO NEED FOR TESTING STAGE
                                                    // HOWEVER, IF YOU WANT, YOU CAN STILL BRING THE TESTING FUNCTIONALITY (VALIDATION OF IoT DEVICE) HERE
                            break;
                        case "":
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
                if (!data || !extra) reject({code: 400, resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}});
                // PREPROCESS DATA BASED ON INTERNAL SOURCE (AUTO-API)
                // NB: data MUST HAVE ALL THESE PROPERTIES COMING FROM THE SOURCE (MOST LIKELY AN EXTERNAL SOURCE)
                var x = this.getNameAndDetails("autoevent", data, extra);
                switch(extra.autoevent){
                    case "User Multiple Logins":
                        resolve({ // FIRST SETUP .data PROPERTY OF AUTOEVENT
                            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                            name : x.name, details : x.details,
                            emergency_level: extra.emergency_level || "default", // FIND A WAY TO SET THIS GENERICALLY
                            data : {
                                user: data.user || {},
                                logins: data.logins,
                                devices: data.devices,
                                timestamps: data.timestamps,
                                access_tokens: data.access_tokens
                            }
                        });
                        break;
                    case "Unrecognized Device":
                        resolve({ // FIRST SETUP .data PROPERTY OF AUTOEVENT
                            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                            name : x.name, details : x.details,
                            emergency_level: extra.emergency_level || "default", // FIND A WAY TO SET THIS GENERICALLY
                            data : {
                                user: data.user || {},
                                access_token: data.access_token,
                                device: data.device,
                                timestamp: data.timestamp,
                            }
                        });
                        break;
                    default:
                        reject({code: 400, resultData: {err: "Event not recognized", success: false, message: 'Sorry, some error occurred'}});
                        break;
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            triggerAutoAuditOperation: function (extra) {
                return generalTriggerAutoAuditOperation(extra);
            }
        }

    },

    "Stock Market Monitoring": {
        /*
         AutoLog : Stocks' information are logged into some DB Table or file whenever AutoInvestment performs Stock Market Monitoring.
         AutoEvent : Therefore check stocks' information to look for any anomalies or events that may have occurred.
         Examples:
         1. Up-trending (Bull) Market:
         2. Down-trending (Bear) Market:

         */

        getNameAndDetails : function(logOrEvent, data, extra){
            var name = null, details = null;  // SET THESE VARIALBLES BASED ON data & extra
            if(logOrEvent === "autolog"){
                name = "Current Stock Information for " + data.stock.stock_name;
                details = "Current Stock Price for " + data.stock.stock_name + " is now at " + data.stock.price;
            } else if (logOrEvent === "autoevent"){ // PREPROCESS BASED ON AUTOEVENT
                // extra properties: .source .autoaudit .autoevent .emergency_level
                //  FIRST SET THE GENERIC name & details STRINGS
                name = "Stock Market Monitoring event pertaining to stock: " + data.stock.stock_name;
                details = extra.autoevent + " pattern on stock: " + data.stock.stock_name;
                // switch(extra.autoevent){
                //     case "Up-trending (Bull) Market":
                //     name = "Stock Market Monitoring audit pertaining to stock: " + data.stock.stock_name;
                //     details = "";
                //     break;
                //     case "Down-trending (Bear) Market":
                //     name = "";
                //     details = "";
                //     break;
                //     case "Sideways-trending Market":
                //     name = "";
                //     details = "";
                //     break;
                //     case "Double Top":
                //     name = "";
                //     details = "";
                //     break;
                //     case "Double Down":
                //     name = "";
                //     details = "";
                //     break;
                //     //
                //     default:
                //     break;
                // }
            } // NOTE THE REAL REASON FOR THESE NEXT 2 LINES OF CODE, & WHETHER THEY'RE NECESSARY AT ALL
            // THEY HAVE A REASON, IN CASE THE SOURCE SPECIFIES A STRING FOR .name / .details PROPERTY, THAT TRUMPS THIS NLG RIGHT UP THERE
            if(extra.hasOwnProperty("name") && extra.name && (extra.name.length > 0)) name = extra.name;
            if(extra.hasOwnProperty("details") && extra.details && (extra.details.length > 0)) details = extra.details;
            return {name: name, details: details};
        },

        preprocessAutoAuditData: async function (data, extra) {
            return new Promise((resolve, reject) => {
                var x = this.getNameAndDetails("autolog", data, extra);
                console.log("NAME & DETAILS -> " + JSON.stringify(x));
                resolve({ // FIRST SETUP .data PROPERTY OF AUTOLOG
                    // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                    name : x.name, details : x.details,
                    data : data || {} // RETURN data FOR NOW, BUT THIS FUNCTION MIGHT BE A LITTLE DIFFERENT IN ANOTHER AUTOAUDIT
                }); // YOU CAN AT LEAST VALIDATE data TO BE SURE THAT IT INCLUDES ALL NECESSARY PROPS OF SESSION TRACKING AUTO-AUDITS
                // VALIDATE BY COMPARING IT WITH .data PROPERTY OF autologSettings WITHING AUTO-AUDITING SETTINGS
            });
        },

        testAutoLogsForAutoEvents: async function (autolog, relatedAutologs) {
            //  HELPER FUNCTIONS
            function getTrend(thisStock, previousStock){
                console.log("STOCK PRICES -> " + thisStock.price + " (THIS) " + previousStock.price + " (PREVIOUS)");
                if( (thisStock.price != previousStock.price) &&
                    (thisStock.price > previousStock.price) ){
                    console.log("POSSIBLE UP-TREND AUTO-EVENT");
                    return "Up";
                } else if( (thisStock.price != previousStock.price) &&
                    (thisStock.price < previousStock.price) ){
                    console.log("POSSIBLE DOWN-TREND AUTO-EVENT");
                    return "Down";
                } else {
                    console.log("UNDETERMINABLE TREND!!!")
                    return "";
                }
            }

            function validateTrend(trend, autolog, stockRelatedAutologs) {

                switch(trend){
                    case "Up":
                        break;
                    case "Down":
                        break;
                    default: // DO NOTHING HERE FOR NOW
                        console.log("DOING NOTHING :)");
                        break;
                }
            }

            return new Promise((resolve, reject) => {

                // RUN THROUGH EVERY POSSIBLE EVENT AND TEST EACH OF THEM FOR ANOMALIES
                var possibleEvents = settings.getAutoAuditAutoEventOptions(autolog.source_type, autolog.autoaudit);
                var autoeventDatas = [], actualRelatedAutologs = [];
                console.log("POSSIBLE EVENTS -> " + JSON.stringify(possibleEvents));
                //
                console.log("RELATED AUTOLOGS -> " + JSON.stringify(relatedAutologs));
                for (var evt of possibleEvents) { // SHOULG BE for(let evt of possibleEvents){}
                    console.log("PERFORMING TEST FOR EVENT -> " + evt);
                    if(["Up-trending (Bull) Market", "Down-trending (Bear) Market"].includes(evt)) {
                        // FIRST FILTER OUT ONLY relatedAutologs THAT HAVE THE SAME .data.stock PROPERTY
                        var stockRelatedAutologs = relatedAutologs.filter(function isRelated(element, index, array) {
                            console.log(index + " : " + element.data.stock._id.toString() +
                                " : " + autolog.data.stock._id.toString());
                            // .stock MUST ASK FOR THE ._id PROP OF THE STOCK OBJECT
                            return (element.data.stock._id.toString() === (autolog.data.stock._id.toString() || ""));
                        });
                        console.log("STOCK RELATED AUTOLOGS -> " + JSON.stringify(stockRelatedAutologs));
                        // SORT relatedAutologs IN TERMS OF .timestamp (WITHIN .data PROPERTY) OR IN TERMS OF .date_created PROPERTY
                        //
                        if(stockRelatedAutologs && stockRelatedAutologs.length > 0){
                            // CURRENT AUTOLOG = autolog;
                            // PREVIOUS AUTOLOG = LAST AUTOLOG OF stockRelatedAutologs = stockRelatedAutologs[stockRelatedAutologs.length - 1];
                            var thisStock = autolog.data.stock, previousStock = stockRelatedAutologs[stockRelatedAutologs.length - 1].data.stock;
                            //  BY DEFAULT : isValidTrend = false, previousWasEqual = false
                            var trend = getTrend(thisStock, previousStock), isValidTrend = false, previousWasEqual = false, t = "";
                            console.log("TREND -> " + trend + "; EVENT -> " + evt);
                            if( trend[0].toLowerCase() !== evt[0].toLowerCase() ){
                                console.log("NO NEED TO CONTINUE TESTING ANYMORE, COZ THIS IS NOT THE AUTOEVENT WE'RE LOOKING FOR");
                                continue;
                            } // DO THIS TO MAKE SURE THAT YOU'RE TESTING FOR THE RIGHT AUTOEVENT IN THE FIRST PLACE :)
                            if(trend && trend.length > 0){
                                console.log("NOW, VALIDATING TREND: " + trend);
                                console.log("BEFORE LOOP ...");
                                var emergencyLevel = "default", loopAutolog = null;
                                if(!(stockRelatedAutologs.length > 1)){ // DO THIS TO BE SURE THAT YOU CAN VALIDATE THE TREND FOUND
                                    console.log("CANNOT TEST FOR VALID TREND, NOT ENOUGH ACTUAL (STOCK) RELATED AUTOLOGS")
                                    isValidTrend = false;
                                } else {
                                    for (var i = stockRelatedAutologs.length-1; i >= 0; i--) { // LOOP FROM BEHIND
                                        if(i == 0){
                                            console.log("LAST ITERATION (AUTOLOG), THEREFORE CANNOT VALIDATE TREND ANYMORE, ENDING LOOP");
                                            break;
                                        }
                                        console.log("INDEX -> " + i);
                                        loopAutolog = stockRelatedAutologs[i];
                                        thisStock = loopAutolog.data.stock, previousStock = stockRelatedAutologs[i - 1].data.stock;
                                        console.log("THIS STOCK -> " + JSON.stringify(thisStock));
                                        console.log("PREVIOUS STOCK -> " + JSON.stringify(previousStock));
                                        t = getTrend(thisStock, previousStock);
                                        if( (t.length > 0) && (t === trend) && !previousWasEqual ){
                                            console.log("PREVIOUS WAS NOT EQUAL, AND TRENDS ARE THE SAME, SO NOT A VALID TREND ENDING LOOP");
                                            console.log("TRENDS : " + trend + " : " + t);
                                            isValidTrend = false;
                                            previousWasEqual = false;
                                            break;
                                        }
                                        // IF EXECUTION REACHES HERE, THEN TREND MIGHT BE VALID
                                        console.log("TREND MIGHT BE VALID: " + ( (t.length > 0) ? t : "-" ) + " : " + trend + "; AND PREVIOUS WAS "
                                            + ( previousWasEqual ? "" : "NOT" ) + " EQUAL");
                                        //
                                        console.log("PUSHING ONLY THE CURRENT ITERATION (LOOP) AUTOLOG FOR NOW");
                                        actualRelatedAutologs.push(loopAutolog);
                                        if( (t.length > 0) && (t !== trend) ){
                                            console.log(trend + " IS INDEED A VALID TREND, PUSHING THE PREVIOUS AUTOLOG TOO, BEFORE BREAKING THE LOOP");
                                            actualRelatedAutologs.push(stockRelatedAutologs[i - 1]);
                                            isValidTrend = true;
                                            previousWasEqual = false;
                                            break;
                                        } else if( t.length == 0 || t === "" ) {
                                            console.log("TREND IS EQUAL FOR THIS ITERATION, MOVING ON TO NEXT ITERATION");
                                            previousWasEqual = true;
                                        }
                                    }
                                } // NOW, CREATE AUTO-EVENT, IF TREND WAS INDEED VALID
                                console.log("AFTER LOOP ...");
                                if(isValidTrend){ // IF TREND (UP/DOWN) IS INDEED VALID
                                    var eventData = { // FIRST SETUP .data PROPERTY OF AUTOEVENT
                                        stock: {
                                            "_id": autolog.data.stock._id || "",
                                            "stock_name": autolog.data.stock.stock_name || "",
                                        },
                                        timestamp: autolog.data.timestamp
                                    }, extra = {
                                        emergency_level: emergencyLevel,
                                        autoaudit: "Stock Market Monitoring" || "",
                                        autoevent: evt || ""
                                    };
                                    // FIND A WAY TO SET emergencyLevel VAR (EVEN THOUGH THIS IS REGULAR ANALYSIS)
                                    var x = this.getNameAndDetails("autoevent", eventData, extra);
                                    extra.name = x.name; extra.details = x.details; // ADD SUMMARIES OF .data
                                    //
                                    console.log("EVENT DATA -> " + JSON.stringify(eventData));
                                    console.log("EXTRA DATA -> " + JSON.stringify(extra));
                                    //
                                    autoeventDatas.push({data: eventData, extra: extra});
                                }
                            }
                        } else {
                            console.log("THERE ARE NO ACTUAL (STOCK) RELATED AUTOLOGS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                        }
                    } // YOU CAN FIND OUT HOW TO TEST FOR THESE REMAINING EVENTS WHEN IT'S TIME ....
                    switch (evt) {
                        case "Up-trending (Bull) Market":
                            break;
                        case "Down-trending (Bear) Market":
                            break;
                        case "Sideways-trending Market":
                            break;
                        case "Double Top":
                            break;
                        case "Double Down":
                            break;
                        // THESE TOP 5 POSSIBLE EVENTS CANNOT HAPPEN AT THE SAME TIME
                        default: // SO YOU CAN PERFORM ONE HUGE TEST HERE, OR NOT EVEN WITHIN THE LOOP SEF
                            break;
                    }
                }
                resolve({autoeventDatas: autoeventDatas, actualRelatedAutologs: actualRelatedAutologs});
            });
        },

        preprocessAutoEventDataStraightAway: async function (data, extra) {
            return new Promise((resolve, reject) => {
                // extra properties: .source .autoaudit .autoevent .emergency_level
                if (!data || !extra) reject({code: 400, resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}});
                // PREPROCESS DATA BASED ON INTERNAL SOURCE (AUTO-API)
                // NB: data MUST HAVE ALL THESE PROPERTIES COMING FROM THE SOURCE (MOST LIKELY AN EXTERNAL SOURCE)
                var x = this.getNameAndDetails("autoevent", data, extra);
                var data = {
                    stock: data.stock || {},
                    timestamp: data.timestamp
                };
                // switch(extra.autoevent){
                //     case "Up-trending (Bull) Market":
                //     data = {};
                //     break;
                //     case "Down-trending (Bear) Market":
                //     data = {};
                //     break;
                //     case "Sideways-trending Market":
                //     data = {};
                //     break;
                //     case "Double Top":
                //     data = {};
                //     break;
                //     case "Double Down":
                //     data = {};
                //     break;
                //     case "Double Down":
                //     data = {};
                //         break;
                //     case "Double Top":
                //     data = {};
                //         break;
                //     default:
                //         reject({code: 400, resultData: {err: "Event not recognized", success: false, message: 'Sorry, some error occurred'}});
                //         break;
                // }
                resolve({ // FIRST SETUP .data PROPERTY OF AUTOEVENT
                    // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                    name : x.name, details : x.details,
                    emergency_level: extra.emergency_level || "default", // FIND A WAY TO SET THIS GENERICALLY
                    data : data
                });
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
    "Geo-Spatial Monitoring": {
        /*
         AutoLog : Sessions are logged into some DB Table or file whenever a user logs in, and are logged too whenever that user logs out (with access token deleted).
         AutoEvent : Therefore check sessions to look for any anomalies or events that may have occurred.
         Examples:
         1. Irregular User Location:

         */

        getNameAndDetails : function(logOrEvent, data, extra){
            var name = null, details = null;  // SET THESE VARIALBLES BASED ON data & extra
            if(logOrEvent === "autolog"){
                name = "Geo-Spatial Monitoring audit pertaining to user: " + data.user.full_name;
                details = "User (" + data.user.full_name + ") has logged " + (data.login ? "in" : "out") + " with a device ("
                    + (data.device.id || "") + "), on date " + new Date(data.timestamp) + " with access token " + data.access_token.token;
            } else if (logOrEvent === "autoevent"){ // PREPROCESS BASED ON AUTOEVENT
                // extra properties: .source .autoaudit .autoevent .emergency_level
                //  FIRST SET THE GENERIC name & details STRINGS
                name = "Geo-Spatial Monitoring audit pertaining to user: " + data.user.full_name;
                details = "";
                switch(extra.autoevent){
                    case "Irregular User Location":
                        name = "Geo-Spatial Monitoring event pertaining to user: " + data.user.full_name;
                        details = "User: (" + data.user.full_name + ") has had " + data.logins + " logins with " + data.devices.length + " devices";
                        break;
                }
            } // NOTE THE REAL REASON FOR THESE NEXT 2 LINES OF CODE, & WHETHER THEY'RE NECESSARY AT ALL
            // THEY HAVE A REASON, IN CASE THE SOURCE SPECIFIES A STRING FOR .name / .details PROPERTY, THAT TRUMPS THIS NLG RIGHT UP THERE
            if(extra.hasOwnProperty("name") && extra.name && (extra.name.length > 0)) name = extra.name;
            if(extra.hasOwnProperty("details") && extra.details && (extra.details.length > 0)) details = extra.details;
            return {name: name, details: details};
        },

        preprocessAutoAuditData: async function (data, extra) {
            return new Promise((resolve, reject) => {
                var x = this.getNameAndDetails("autolog", data, extra);
                console.log("NAME & DETAILS -> " + JSON.stringify(x));
                resolve({ // FIRST SETUP .data PROPERTY OF AUTOLOG
                    // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                    name : x.name, details : x.details,
                    data : data || {} // RETURN data FOR NOW, BUT THIS FUNCTION MIGHT BE A LITTLE DIFFERENT IN ANOTHER AUTOAUDIT
                }); // YOU CAN AT LEAST VALIDATE data TO BE SURE THAT IT INCLUDES ALL NECESSARY PROPS OF Geo-Spatial Monitoring AUTO-AUDITS
                // VALIDATE BY COMPARING IT WITH .data PROPERTY OF autologSettings WITHING AUTO-AUDITING SETTINGS
            });
        },

        testAutoLogsForAutoEvents: async function (autolog, relatedAutologs) {
            //  HELPER FUNCTIONS
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
                        case "Irregular User Location":
                            console.log("TESTING FOR Irregular User Location... :)");
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
                        case "":
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
                if (!data || !extra) reject({code: 400, resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}});
                // PREPROCESS DATA BASED ON INTERNAL SOURCE (AUTO-API)
                // NB: data MUST HAVE ALL THESE PROPERTIES COMING FROM THE SOURCE (MOST LIKELY AN EXTERNAL SOURCE)
                var x = this.getNameAndDetails("autoevent", data, extra);
                switch(extra.autoevent){
                    case "Irregular User Location":
                        resolve({ // FIRST SETUP .data PROPERTY OF AUTOEVENT
                            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
                            name : x.name, details : x.details,
                            emergency_level: extra.emergency_level || "default", // FIND A WAY TO SET THIS GENERICALLY
                            data : data || {
                                // PROPERTIES ARE SET BASED ON THE AUTOEVENT
                                timestamps: data.timestamps
                            }
                        });
                        break;
                    default:
                        reject({code: 400, resultData: {err: "Event not recognized", success: false, message: 'Sorry, some error occurred'}});
                        break;
                }
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        "extra": { // MOSTLY ACCESSES THE HELPER FUNCTIONS FILE
            triggerAutoAuditOperation: function (extra) {
                return generalTriggerAutoAuditOperation(extra);
            }
        }

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Employment Contract Details": {},
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Unusual Activities (Monitoring for Compromise)": {},
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    "Others": {},
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

};

module.exports = InternalMonitoringHandlers;