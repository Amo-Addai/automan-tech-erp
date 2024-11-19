'use strict';

var compose = require('composable-middleware');

var dataHandler = require('../../../api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
var autoSecurityModelscontrollersHandler = dataHandler.modelscontrollersHandler;
var userempclientstakefunct = require('../../../api/GLOBAL_CONTROLLER/OTHER_FUNCTION_HELPERS/UserEmployeeClientStakeHolderServerFunctions')

var funct = require('../../../functions');
var settings = funct.settings;
var config = funct.config;
var auth = funct.auth;
funct = funct.funct;

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var autoauditFunct = {
    "Internal": require('./INTERNAL/InternalAutoAuditingFunctions.js'),
    "External": require('./EXTERNAL/ExternalAutoAuditingFunctions.js')
};

var autoauditEventHandlerFunct = {
    "Internal": require('./INTERNAL/EVENT_HANDLERS/InternalEventHandlersFunctions.js'),
    "External": require('./EXTERNAL/EVENT_HANDLERS/ExternalEventHandlersFunctions.js')
};

var autoauditMonitoringHandlerFunct = {
    "Internal": require('./INTERNAL/MONITORING_HANDLERS/InternalMonitoringHandlersFunctions.js'),
    "External": require('./EXTERNAL/MONITORING_HANDLERS/ExternalMonitoringHandlersFunctions.js')
};
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// console.log("AUTO-AUDITING FUNCTIONS !!!");

// console.log(Object.keys(settings)); console.log(Object.keys(auth)); console.log(Object.keys(funct));

// for(var src of ["Internal", "External"]){
//     console.log(src + "AutoAuditingFunctions.js");
//     console.log(Object.keys(autoauditFunct[src]));
//     console.log(src + "MonitoringHandlersFunctions.js");
//     console.log(Object.keys(autoauditMonitoringHandlerFunct[src]));
//     console.log(src + "EventHandlersFunctions.js");
//     console.log(Object.keys(autoauditEventHandlerFunct[src]));
//     console.log("");
// }

///////////////////////////////////////////////////////////////////////
//          DATA-FILE LOGGING FUNCTIONS
var DataHandlerModels = {
    "user": require('../../../api/USER/user.model'),
    "autolog": require('./DATA_FILE_LOGS/AUTOLOG/autolog.model'),
    "autoevent": require('./DATA_FILE_LOGS/AUTOEVENT/autoevent.model'),
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS

function getDataHandlerModel(type) {
    return DataHandlerModels[type];
}

async function getAllAutoLogsOrEvents(type, condition, dataType) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { // RETRIEVE AUTOLOG IN AUTO-API DATABASE & AUTOMAN AI DATA WAREHOUSE
            switch (dataType) {
                case "data":
                    var result = await autoSecurityModelscontrollersHandler.getAll(getDataHandlerModel(type), JSON.stringify(condition));
                    if (result.code === 200) resolve(result.resultData);
                    else resolve({
                        code: 400,
                        resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
                    });
                case "file": // WRITE CODE TO HANDLE FILE LOGGING FUNCTIONALITY
                    // YOU CAN CHOOSE TO SAVE GENERAL AUTOLOG DATA TO THE DATABASE BUT SAVE THE ACTUAL .data PROPERTY TO SOME FILE OR STH
                    resolve({
                        code: 200,
                        resultData: {success: false, message: 'File logging functionality not implemented yet'}
                    });
            }
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function getAutoLogOrEvent(type, id, dataType) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { // RETRIEVE AUTOLOG IN AUTO-API DATABASE & AUTOMAN AI DATA WAREHOUSE
            switch (dataType) {
                case "data":
                    var result = await autoSecurityModelscontrollersHandler.get(getDataHandlerModel(type), id);
                    if (result.code === 200) resolve(result.resultData);
                    else resolve({
                        code: 400,
                        resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
                    });
                case "file": // WRITE CODE TO HANDLE FILE LOGGING FUNCTIONALITY
                    // YOU CAN CHOOSE TO SAVE GENERAL AUTOLOG DATA TO THE DATABASE BUT SAVE THE ACTUAL .data PROPERTY TO SOME FILE OR STH
                    resolve({
                        code: 200,
                        resultData: {success: false, message: 'File logging functionality not implemented yet'}
                    });
            }
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function saveAutoLogOrEvent(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { // SAVE AUTOLOG IN AUTO-API DATABASE & AUTOMAN AI DATA WAREHOUSE
            switch (data.type) {
                case "data":
                    var result = await autoSecurityModelscontrollersHandler.add(getDataHandlerModel(type), data);
                    if (result.code === 200) resolve(result.resultData);
                    else resolve({
                        code: 400,
                        resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
                    });
                case "file": // WRITE CODE TO HANDLE FILE LOGGING FUNCTIONALITY
                    // YOU CAN CHOOSE TO SAVE GENERAL AUTOLOG DATA TO THE DATABASE BUT SAVE THE ACTUAL .data PROPERTY TO SOME FILE OR STH
                    resolve({
                        code: 200,
                        resultData: {success: false, message: 'File logging functionality not implemented yet'}
                    });
            }
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function updateAutoLogOrEvent(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { // SAVE AUTOLOG IN AUTO-API DATABASE & AUTOMAN AI DATA WAREHOUSE
            switch (data.type) {
                case "data":
                    var result = await autoSecurityModelscontrollersHandler.update(getDataHandlerModel(type), data._id, data);
                    if (result.code === 200) resolve(result.resultData);
                    else resolve({
                        code: 400,
                        resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
                    });
                case "file": // WRITE CODE TO HANDLE FILE LOGGING FUNCTIONALITY
                    // YOU CAN CHOOSE TO SAVE GENERAL AUTOLOG DATA TO THE DATABASE BUT SAVE THE ACTUAL .data PROPERTY TO SOME FILE OR STH
                    resolve({
                        code: 200,
                        resultData: {success: false, message: 'File logging functionality not implemented yet'}
                    });
            }
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function deleteAutoLogOrEvent(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { // SAVE AUTOLOG IN AUTO-API DATABASE & AUTOMAN AI DATA WAREHOUSE
            switch (data.type) {
                case "data":
                    var result = await autoSecurityModelscontrollersHandler.delete(getDataHandlerModel(type), data._id);
                    if (result.code === 200) resolve(result.resultData);
                    else resolve({
                        code: 400,
                        resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
                    });
                case "file": // WRITE CODE TO HANDLE FILE LOGGING FUNCTIONALITY
                    // YOU CAN CHOOSE TO SAVE GENERAL AUTOLOG DATA TO THE DATABASE BUT SAVE THE ACTUAL .data PROPERTY TO SOME FILE OR STH
                    resolve({
                        code: 200,
                        resultData: {success: false, message: 'File logging functionality not implemented yet'}
                    });
            }
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

function validateAutoAudit(sourceType, autoaudit, sources) {
    var x = settings.getAutoAuditMonitoringSettings(sourceType, autoaudit);
    if ((!x || !x.active) === true)
        return {
            code: 404,
            resultData: {
                err: null,
                success: false,
                message: autoaudit + " audit not active, Please check Settings"
            }
        }; // FIRST, VALIDATE THE SOURCE & SOURCE TYPE

    for (var source of sources) {
        if (!x.sources.includes(source))
            return {
                code: 404,
                resultData: {
                    err: null,
                    success: false,
                    message: source + " cannot perform " + autoaudit + " audit, Please check Settings"
                }
            };
    }

    return {code: 200}; // RETURN THIS TO SIGNIFY SUCCESS IN VALIDATION :)
}

async function preprocessAutoAudit(sourceType, data, extra) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        if (!data || !extra) reject({
            code: 400,
            resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}
        });
        try {
            /*
             extra = { source: req.params.source, autoaudit: req.params.autoaudit };
             */
            // return OBJECT WITH PROPERTIES: name, details, type (CHECK DATA FILE LOG SETTINGS), source_type, source, autoaudit, data
            console.log("PROCESSING AUTOAUDIT!!!")

            var x = settings.getAutoAuditMonitoringSubSettings(sourceType, extra.autoaudit, "autolog");
            var y = await autoauditFunct[sourceType].preprocessAutoAuditData(data, extra);

            console.log("SETTINGS/DEFAULT (x) DATA -> " + JSON.stringify(x));
            console.log("PRE-PROCESSING (y) DATA -> " + JSON.stringify(y));

            resolve({
                name: y.name || x.name || "",
                details: y.details || x.details || "",
                type: x.type || "",
                source_type: sourceType || "",
                source: extra.source || "",
                autoaudit: extra.autoaudit || "",
                data: y.data || x.data
                // THIS IS TOO DYNAMIC, SO FIND A WAY TO MAKE IT SPECIFIC TO EVERY SOURCE & SOURCE_TYPE
            });

        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function handleAutoLog(autolog) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            if (autolog) {
                // DECIDE WHETHER TO USE REGULAR (AUTO-API) OR CORRELATION (AUTOMAN AI - AUTO-ANALYTICS) ANALYSIS
                var x = settings.getAutoAuditMonitoringSettings(autolog.source_type, autolog.autoaudit);
                if (x.autologFunctionality) {
                    // NOW CHECK HANDLER METHOD (REAL TIME OR TRIGGERED
                    if (x.handlerMethod === "Regular Analysis") { // HANDLE REGULAR ANALYSIS
                        console.log("REGULAR ANALYSIS????");
                        resolve(await testAutoLogAndHandleAutoEvents(autolog));
                    } else if (x.handlerMethod === "Correlation Analysis") {
                        console.log("CORRELATION ANALYSIS????");
                        // CALL AUTOMAN AI - AUTO-ANALYTICS TO HANDLE CORRELATION ANALYSIS TO OBTAIN EMERGENCY LEVELS)
                        // (COMPARING NUMBER OF AUTOLOGS / AUTOEVENTS WITH TIME DURATIONS
                        resolve({
                            code: 200,
                            resultData: {
                                success: true,
                                message: 'CORRELATION ANALYSIS FUNCTIONALITY COMING SOON...'
                            }
                        });
                    } else { // HANDLE REGULAR ANALYSIS AS DEFAULT
                        console.log("NO HANDLER (ANALYSIS) METHOD SPECIFIED!!!");
                        resolve(await testAutoLogAndHandleAutoEvents(autolog));
                    }
                } else resolve({
                    code: 200,
                    resultData: {success: false, message: 'Sorry, AutoLog Functionality is turned off'}
                });

            } else reject({code: 400, resultData: {success: false, message: 'Sorry, Autolog not available'}});
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function testAutoLogAndHandleAutoEvents(autolog) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            // TEST AUTOLOG TO SEE WHETHER IT'S AN AUTO EVENT OR NOT
            console.log("OKAY, ABOUT TO TEST FOR AUTOEVENTS NOW...");
            console.log("THE AUTOLOG -> " + JSON.stringify(autolog));
            var autoevents = await getAutoEventsFromAutoLog(autolog);
            console.log("OKAY, DONE TESTING FOR AUTOEVENTS NOW...");
            console.log(JSON.stringify(autoevents));

            if (autoevents && autoevents.length > 0) {
                autoevents.forEach(async function (autoevent, index) {
                    try { // IF IT'S AN AUTOEVENT, CHECK SETTINGS WHETHER TO SAVE IT OR NOT
                        // NOW CHECK HANDLER TYPE (REAL TIME OR TRIGGERED) FOR AUTOEVENT SETTINGS (NOT MONITORING)
                        var x = settings.getAutoAuditMonitoringEventSettings(autoevent.source_type, autoevent.autoaudit, autoevent.autoevent);
                        if (x.autoeventFunctionality) {
                            // NOW, SET THE EMERGENCY LEVEL OF THE AUTOEVENT GENERICALLY ...
                            /*
                             FIND ALL RELATED AUTOEVENTS, COMPARE THEM WITH CORRELATION RATES (LOW/MEDIUM/HIGH),
                             THEN ASSIGN CORRESPONDING EMERGENCY LEVEL
                             */
                            console.log("");
                            console.log("NUMBER OF AUTOEVENTS TO TEST FOR CORRELATION ANALYSIS -> " + x.emergencyLevelSettings.number)
                            var num = x.emergencyLevelSettings.number;
                            var condition = { // NOTE THAT relatedAutoevents WILL HAVE autoevent AS ITS LAST ITEM, SO REMOVE IT IF YOU WANT
                                extra: { // DO THIS TO PULL OUT ONLY THE IMMEDIATELY-SAVED PREVIOUS AUTOEVENTS
                                    limit: --num, // DECREMENT IT, COZ CURRENT AUTOEVENT REPS THAT ITEM (DECREMENT)
                                },
                                // _id: { $ne : autoevent._id }, // THIS DOESN'T EVEN MATTER, COZ AUTOEVENT HAS NO ._id (IT HASN'T BEEN SAVED YET :)
                                type: autoevent.type, // data/file
                                source_type: autoevent.source_type, // Internal/External
                                source: autoevent.source, // Auto-API / Bro / Ossec / Kismet / Lynis
                                // YOU CHOOSE TO FILTER OUT AUTOEVENTS FROM THE SPECIFIC SOURCE OR NOT, BASED ON THE SETTINGS SPECIFIED
                                autoaudit: autoevent.autoaudit,
                                autoevent: autoevent.autoevent // DO THIS TOO, TO FILTER ONLY THIS PARTICULAR AUTOEVENT
                            }; // FIND A WAY TO SPECIFY LOG TYPE (data / file) GENERICALLY
                            console.log("NOW GETTING ALL RELATED AUTOEVENTS TO THIS CURRENT AUTOEVENT WE'RE TESTING ...");
                            console.log("CONDITION -> " + JSON.stringify(condition));
                            var relatedAutoevents = await getAllAutoLogsOrEvents("autoevent", condition, "data");
                            if (relatedAutoevents && relatedAutoevents.length > 0) {
                                console.log(relatedAutoevents.length + " RELATED AUTOEVENTS !!!!");
                                autoevent = await performRegularCorrelationAnalysis(autoevent, relatedAutoevents, x);
                            } else console.log("NO RELATED AUTOEVENTS !!!!");
                            //  DONE SETTING THE EMERGENCY LEVEL OF THIS AUTOEVENT; NOW SAVING THE AUTOEVENT ...
                            autoevent = await saveAutoLogOrEvent("autoevent", autoevent);
                            if (autoevent) { // WORK WITH result IF NECESSARY (BUT YOU MUST await IT FIRST)
                                var result = await handleAndAlertAutoEvent(autoevent);
                                console.log("HANDLE/ALERT AUTOEVENT RESULT -> " + JSON.stringify(result));
                                resolve(result);
                            }
                        } else { // LOG THIS ERROR MESSAGE, & FIND A WAY TO EXIT THIS .forEach() LOOP
                            console.log('Sorry, AutoEvent Functionality is turned off');
                        }
                    } catch (err) {
                        console.log("INDEX -> " + index);
                        console.log("INNER ERROR -> " + JSON.stringify(err));
                    }
                });
                resolve({
                    code: 200,
                    resultData: {
                        success: true,
                        message: 'Autolog and Autoevents handled, required personnel alerted'
                    }
                });
            } else resolve({
                code: 200,
                resultData: {
                    success: true,
                    message: 'Autolog has no AutoEvents'
                }
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function getAutoEventsFromAutoLog(autolog) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { // TEST AUTOLOG WITH ALL POSSIBLE EVENTS (USING PREVIOUSLY SAVED AUTOLOGS), THEN LINK ALL RELATED
            // AUTOLOGS TO ANY AUTOEVENT(S) FOUND, THEN return THE AUTOEVENT(S)

            var condition = { // NOTE THAT relatedAutologs WILL HAVE autolog AS ITS LAST ITEM, SO REMOVE IT IF YOU WANT
                _id: {$ne: autolog._id}, // YOU CAN EXCLUDE THIS CURRENT AUTOLOG WITH THIS CONDITION PARAMETER
                type: autolog.type, // data/file
                source_type: autolog.source_type, // Internal/External
                source: autolog.source, // Auto-API / Bro / Ossec / Kismet / Lynis
                // YOU CHOOSE TO FILTER OUT AUTOLOGS FROM THE SPECIFIC SOURCE OR NOT, BASED ON THE SETTINGS SPECIFIED
                autoaudit: autolog.autoaudit
            }; // FIND A WAY TO SPECIFY LOG TYPE (data / file) GENERICALLY
            console.log("NOW GETTING ALL RELATED AUTOLOGS TO THIS CURRENT AUTOLOG WE'RE TESTING ...");
            console.log("CONDITION -> " + JSON.stringify(condition));
            var relatedAutologs = await getAllAutoLogsOrEvents("autolog", condition, "data");
            if (relatedAutologs && relatedAutologs.length > 0) {
                var x = await autoauditFunct[autolog.source_type].testAutoLogsForAutoEvents(autolog, relatedAutologs);
                var autoevents = x.refinedAutoEvents;
                console.log("");
                console.log(x);
                console.log("");
                console.log(autoevents.length + " autoevent(s) -> " + JSON.stringify(autoevents));
                //
                if (autoevents && (autoevents.length > 0)) {
                    // NOW LINK ALL RELATED AUTOLOGS, AS WELL AS THIS CURRENT AUTOLOG TO ALL AUTOEVENTS THAT HAVE BEEN FOUND
                    // DECIDE WHETHER ALL RELATED AUTOLOGS SHOULD BE LINKED TO ALL AUTOEVENTS, OR WHETHER THE PARTICULAR ONES
                    // WHICH WERE USED IN FINDING THE AUTOEVENTS, ALONGSIDE THIS CURRENT AUTOLOG
                    // eg. FOR Session Tracking, JUST THE CONSECUTIVE LOGINS SHOULD BE LINKED TO THE AUTOEVENT,
                    // THEREFORE testAutoLogsForAutoEvents() MUST ALSO return THE "ACTUAL" RELATED AUTOLOGS
                    var actualRelatedAutologs = x.actualRelatedAutologs; // ALL THAT HAS BEEN HANDLED RIGHT HERE
                    actualRelatedAutologs.push(autolog);
                    console.log("")
                    console.log(actualRelatedAutologs.length + " actually related autolog(s) -> " + actualRelatedAutologs);
                    console.log("NOW, ABOUT TO LINK ALL RELATED AUTOLOGS TO ALL GENERATED AUTOEVENTS")
                    //
                    autoevents.forEach(function (autoevent, index) {
                        console.log("INDEX -> " + index);
                        // NOW LINK ALL AUTOLOGS TO FOUND AUTOEVENTS AND SAVE THEM
                        actualRelatedAutologs.forEach(function (autolog, index) {
                            if (!autoevent.autologs.includes(autolog._id.toString())
                                && !autoevent.autologs.includes(autolog._id)) {
                                autoevent.autologs.push(autolog._id.toString());
                            } else console.log("THIS RELATED AUTOLOG IS ALREADY LINKED TO AUTOEVENT")
                            /*
                             DON'T SETUP THE 2-WAY LINK (add autoevent's id to autologs' 'autoevents' property) YET,
                             COZ IF AUTO-EVENT FUNCITONALITY IS OFF, THE GENERATED AUTOEVENTS
                             WON'T BE SAVED & THESE AUTOLOGS'LL BE LINKED TO AUTOEVENTS THAT DON'T EXIST, SO YOU CAN JUST ...
                             UPDATE THE 1-WAY LINKS FROM AUTOEVENTS TO AUTOLOGS, & IF THEY'RE SAVED, GLOBAL LINKING'LL HANDLE THE REST
                             */
                        });
                        console.log("LINKED AUTOEVENT -> " + JSON.stringify(autoevent));
                        console.log("LINKED AUTOEVENT'S AUTOLOGS -> " + autoevent.autologs);
                        //DON'T SAVE THE AUTOEVENTS COZ YOU'VE NO RIGHT TO DO THAT NOW,
                        // YOU MUST CHECK THEIR autoeventFunctionality FIRST WITHIN THE CALLING FUNCTION
                        // WHICH IS WHY YOU SHOULDN'T EVEN SETUP THE 2-WAY LINK BETWEEN THE AUTOLOGS & AUTOEVENTS YET :)
                    });
                    resolve(autoevents);
                } else resolve([]);
            } else resolve([]);
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function performRegularCorrelationAnalysis(autoevent, relatedAutoevents, x) {
    return new Promise((resolve, reject) => {
        console.log("NOW, PERFORMING REGULAR CORRELATION ANALYSIS ...")
        console.log("AUTOEVENT'S CRITERIA -> " + x.criteria)
        console.log("AUTOEVENT -> " + JSON.stringify((autoevent)))
        console.log("RELATED AUTOEVENTS -> " + JSON.stringify((relatedAutoevents)))
        var currentTime = (new Date()),
            correlationRates = x.emergencyLevelSettings.correlationRates, // GET duration IN UNIX TIMESTAMP, THEN CONVERT IT TO SECONDS TOO ...
            duration = (currentTime - relatedAutoevents[0].date_created) / 1000, // USE Date.now() TO USE THIS CURRENT autoevent IN CALCULATION :)
            number = (relatedAutoevents.length + 1); // ADD 1 TO .length COZ OF THIS CURRENT autoevent
        // NOW, CONVERT DURATION TO SECONDS, THEN FIND RATE
        var rate = number / duration;
        console.log("NUMBER OF AUTOEVENTS -> " + number)
        console.log("DURATION (SECONDS) -> " + duration)
        console.log("CORRELATION RATE -> " + rate)
        console.log("CORRELATION RATES -> " + JSON.stringify(correlationRates))
        if (rate != Infinity) { // rate WILL BE INFINITY IF relatedAutoevents IS ONLY 1 ITEM (IF THIS CURRENT autoevent ISN'T INCLUDED IN DURATION CALCULATION)
            // COZ duration = 0 & ANY NUMBER DIVIDED BY 0 = Infinity
            // BUT, NOW rate CAN NEVER BE Infinity, COZ NOW THIS CURRENT autoevent HAS BEEN INCLUDED IN FINDING DURATION :)
            // NOW, COMPARE THE TIMESTAMPS OF THE RELATED AUTOEVENTS WITH CORRELATION RATES TO FIND EMERGENCY LEVEL
            var corrRate = 0;
            for (var eLvl in correlationRates) { // default,low,medium,high
                if (eLvl == "default") continue;
                corrRate = (number / correlationRates[eLvl]);
                if (rate > corrRate) autoevent.emergency_level = eLvl;
            }
        }
        console.log("EMERGENCY LEVEL -> " + autoevent.emergency_level);
        resolve(autoevent);
    });
}

async function preprocessAutoEventStraightAway(sourceType, data, extra) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        if (!data || !extra) reject({
            code: 400,
            resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}
        });
        try {
            /*
             extra = { source: req.params.source, autoaudit: req.params.autoaudit, autoevent: req.params.autoevent };
             */
            // return OBJECT WITH PROPERTIES: name, details, type (CHECK DATA FILE LOG SETTINGS), source_type, source, autoaudit, data

            console.log("PROCESSING AUTOEVENT STRAIGHT AWAY!!!")

            var x = settings.getAutoAuditMonitoringEventSubSettings(sourceType, extra.autoaudit, extra.autoevent, "autoevent");
            var y = await autoauditFunct[sourceType].preprocessAutoEventDataStraightAway(data, extra);

            console.log("X DATA -> " + JSON.stringify(x));
            console.log("Y DATA -> " + JSON.stringify(y));

            console.log("REFINING AUTOEVENT STRAIGHT AWAY ...")

            resolve({
                name: extra.name || y.name || x.name || "",
                details: extra.details || y.details || x.details || "",
                emergency_level: extra.emergency_level || y.emergency_level || x.emergency_level || "default",
                type: x.type || "",
                source_type: sourceType || "",
                source: extra.source || "",
                autoaudit: extra.autoaudit || "",
                autoevent: extra.autoevent || "",
                data: y.data || x.data || {},
                // THIS IS TOO DYNAMIC, SO FIND A WAY TO MAKE IT SPECIFIC TO EVERY SOURCE & SOURCE_TYPE
                autologs: []
            });

        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function handleAndAlertAutoEvent(autoevent) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { // THIS FUNCTION WILL RUN ONLY IF IT HAS BEEN SAVED
            var handled = true, alerted = true, result = null; // SET THEM BOTH TO TRUE IN CASE THEIR FUNCITONALITIES HAVE BEEN TURNED OFF
            // NOW CHECK HANDLER TYPE (REAL TIME OR TRIGGERED) FOR AUTOEVENT SETTINGS (NOT MONITORING)
            var x = settings.getAutoAuditMonitoringEventSettings(autoevent.source_type, autoevent.autoaudit, autoevent.autoevent);
            //
            if (x.handlerFunctionality) { // HANDLE AUTOEVENT RIGHT NOW
                result = await handleAutoEvent(autoevent);
                handled = (result.code === 200) && (result.resultData.success);
            }
            if (x.alertFunctionality) { // ALERT AUTHORIZED PERSONNEL ABOUT AUTOEVENT RIGHT NOW
                result = await alertAutoEvent(autoevent, result.resultData.handlerResults);
                alerted = (result.code === 200) && (result.resultData.success);
            }
            // NO MATTER THE RESULT, SEND A 200 RESPONSE (ALSO WITH "success: true") COZ THE SOURCES' AND AUTO-API'S FUNCTIONALITIES ARE DECOUPLED SEAMLESSLY
            // AND NO MATTER THE RESPONSE, THE SOURCE'S MUST RECEIVE A SUCCESS COZ THEY'VE DONE THEIR JOB OF SENDING THE AUTOLOG/AUTOEVENT
            // COZ IF THE ALGORITHM HAS EVEN REACHED THIS STAGE (WITHOUT "reject()" ENDING), THEN THE AUTOLOGS/AUTOEVENTS HAVE ALREADY BEEN SAVED WITHIN THE DATABASE ...
            if (handled && alerted) resolve({
                code: 200,
                resultData: {success: true, message: 'Autoevent handled and alerted'}
            });
            else {
                var msg = "AutoEvent " + (handled ? "handled, " : "could not be handled, "),
                    extraMsg = " recipients " + ( alerted ? "have been" : "could not be" ) + " alerted";
                //
                if (msg.includes("could not be")) msg += ( alerted ? "but" : "and" ) + extraMsg;
                else msg += ( alerted ? "and" : "but" ) + extraMsg;
                ;
                resolve({code: 200, resultData: {success: true, message: msg}});
            }
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

///////////////////////////////////////////////////////////////////////
//          EVENT HANDLING FUNCTIONS
// SOME EVENTS MUST EITHER BE HANDLED/ALERTED/BOTH

async function handleAutoEvent(autoevent) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            // NOW CHECK HANDLER SETTINGS TO SEE WHAT CAN BE DONE
            var eventSettings = settings.getAutoAuditMonitoringEventSettings(autoevent.source_type, autoevent.autoaudit, autoevent.autoevent),
                eventSubSettings = settings.getAutoAuditMonitoringEventSubSettings(autoevent.source_type, autoevent.autoaudit, autoevent.autoevent, "handler");

            console.log("event settings -> " + JSON.stringify(eventSettings));
            console.log("event sub settings -> " + JSON.stringify(eventSubSettings));

            console.log("NOW, PERFORMING THE HANDLING FUNCITONALITY");

            var result = await runHandlerBasedOnAutoAuditEvent(autoevent, eventSettings, eventSubSettings); // MAKE SURE ALL PARAMS ARE RIGHT
            console.log("HANDLER RESULTS -> " + JSON.stringify(result));

            // ONLY USE .code & .success TO TEST FOR SUCCESS (USING THE OTHER PROPERTIES ISN'T PERFECT IN CASE THERE ARE NO RECIPIENTS FOR THE ALERT)
            if ((result.code === 200) && (result.resultData.success)) resolve({
                code: 200,
                resultData: {success: true, message: 'AutoEvent Handler successful', handlerResults: result}
            });
            else resolve({
                code: 400,
                resultData: result.resultData || {
                    err: "AutoEvent couldn't be handled",
                    success: false,
                    message: 'Sorry, some error occurred'
                }
            });

        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

function runHandlerBasedOnAutoAuditEvent(autoevent, eventSettings, handlerSettings) {
    // YOU CAN ALSO JUST CALL THIS RIGHT HERE, BUT YOU MIGHT HAVE TO REMOVE THAT 'async' KEYWORD UP THERE
    return autoauditEventHandlerFunct[autoevent.source_type][autoevent.autoaudit][autoevent.autoevent](autoevent, handlerSettings);
}

///////////////////////////////////////////////////////////////////////
//          AUTO-ALERTING FUNCTIONS

async function alertAutoEvent(autoevent, handlerResults) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {// NOW CHECK ALERT SETTINGS TO SEE WHAT CAN BE DONE
            var eventSettings = settings.getAutoAuditMonitoringEventSettings(autoevent.source_type, autoevent.autoaudit, autoevent.autoevent),
                eventSubSettings = settings.getAutoAuditMonitoringEventSubSettings(autoevent.source_type, autoevent.autoaudit, autoevent.autoevent, "alert");
            console.log("event settings -> " + JSON.stringify(eventSettings));
            console.log("event sub settings -> " + JSON.stringify(eventSubSettings));

            // FIRST, CHECK IF THE EMERGENCY LEVEL OF THIS AUTOEVENT HAS REACHED THE EMERGENCY LEVEL FOR ALERTING
            // JUST COMPARE autoevent.emergency_level & WITH eventSubSettings.emergencyLevel PROPERTIES
            var eLvlArr = config.autoauditEmergencyLevels, eLvl = autoevent.emergency_level,
                requiredELvl = eventSubSettings.emergencyLevel;

            console.log("eLevels -> " + JSON.stringify(eLvlArr));
            console.log("Required -> " + requiredELvl);

            if (requiredELvl !== "default") { // IF DEFAULT, ALERT NO MATTER WHAT
                console.log("not default eLvl, therefore validating first")
                if ((eLvlArr.indexOf(eLvl) !== -1) && (eLvlArr.indexOf(requiredELvl) !== -1)) {
                    if (!(eLvlArr.indexOf(eLvl) >= eLvlArr.indexOf(requiredELvl))) {
                        // THEREFORE autoevent HAS NOT YET REACHED AUTO-ALERTING EMERGENCY LEVEL
                        resolve({code: 200, resultData: {success: true, message: 'Alert not required'}});
                    }
                }
            } // NOW PERFORM ALERTING FUNCITON HERE :)
            console.log("NOW, PERFORMING THE ALERTING FUNCITONALITY");

            // MAKE SURE ALL PARAMS ARE RIGHT
            var result = await alertUsersBasedOnAutoAuditEvent(autoevent, eventSettings, eventSubSettings, handlerResults);
            console.log("ALERT RESULTS -> " + JSON.stringify(result));
            //  && (result.resultData.message === "Message Sent")) {
            // ONLY USE .code & .success TO TEST FOR SUCCESS (USING THE OTHER PROPERTIES ISN'T PERFECT IN CASE THERE ARE NO RECIPIENTS FOR THE ALERT)
            if ((result.code === 200) && (result.resultData.success)) resolve({
                code: 200,
                resultData: {success: true, message: 'Alert successful'}
            });
            else resolve({
                code: 400,
                resultData: result.resultData || {
                    err: "Alert message couldn't be sent",
                    success: false,
                    message: 'Sorry, some error occurred'
                }
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

// THIS METHOD WILL BE IMPLEMENTED WHEN DECISION IS MADE TO ADD ALERT FUNCTIONALITY TO AUTOEVENT MONITORING
async function alertUsersBasedOnAutoAuditMonitoring(sourceType, eventSettings, alertSettings, handlerResults = null) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        if (!alertSettings) reject({
            code: 400,
            resultData: {err: "Alert Settings not set", success: false, message: 'Sorry, some error occurred'}
        });
        try { // FIGURE OUT HOW TO MAKE THIS FUNCTIONALITY WORK PERFECTLY (IF EVER REQUIRED :)

        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function alertUsersBasedOnAutoAuditEvent(autoevent, eventSettings, alertSettings, handlerResults = null) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        if (!alertSettings) reject({
            code: 400,
            resultData: {err: "Alert Settings not set", success: false, message: 'Sorry, some error occurred'}
        });
        try {
            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            // KNOW HOW YOU CAN USE .extraData PROPERTY OF alertSettings TO AFFECT MESSAGE INFORMATION subject/message
            //////////////////////////////////////////////////////////////////////////////////////////////////////////

            var subject = alertSettings.subject || "",
                message = alertSettings.message || "",
                recipients = alertSettings.recipients || [],
                contactMethods = alertSettings.contactMethods || null;

            if(alertSettings.autoGenerate){
                console.log("AUTO-GENERATING ALERT MESSAGE WITH AUTOEVENT -> " + JSON.stringify(autoevent));
                if(autoevent.autoevent && autoevent.name && (autoevent.name.length > 0))
                    subject = autoevent.autoevent + " - " + autoevent.name;
                if(autoevent.details && (autoevent.details.length > 0)) message = autoevent.details;
                if(handlerResults){
                    console.log("HANDLER RESULTS -> " + JSON.stringify(handlerResults));
                    //
                    var handlerSettings = settings.getAutoAuditMonitoringEventSubSettings(autoevent.source_type, autoevent.autoaudit, autoevent.autoevent, "handler"),
                    emergencyLevel = autoevent.emergency_level;
                    // YOU CAN CHOOSE TO USE config.autoauditEmergencyLevels INSTEAD
                    if (!["default", "low", "medium", "high"].includes(emergencyLevel))
                        emergencyLevel = "default";
                    var handlerActions = handlerSettings.emergencyLevels[emergencyLevel].actions;
                    if(handlerActions.length > 0){ // FIRST, CONCAT HANDLER ACTIONS INTO message
                        var num = 0, msg = "";
                        for(var i in handlerActions) {
                            if (handlerActions[i] && (handlerActions[i].length > 0)) {
                                ++num;
                                msg += ((num) + ". " + (handlerActions[i] || "-") + "\n");
                            }
                        }
                        // THEN, CONCAT HANDLER ACTIONS RESULTS MESSAGE INTO message
                        message += "\n" + num + " actions were to be performed" + "\n";
                        message += "\n" + msg;
                        message += ("\nRESULTS: " + (handlerResults.resultData.message || "-"));
                    }
                }
            }
            console.log("ALERT SUBJECT -> " + subject);
            console.log("ALERT MESSAGE -> " + message);

            var recipientsType = "user"; // THIS MUST BE EDITED TO WORK PERFECTLY
            switch (alertSettings.recipientsType) {
                case "Users":
                    recipientsType = "user";
                // case "Employees": recipientsType = "employee";
                // case "Clients": recipientsType = "client";
                // case "Stake Holders": recipientsType = "stakeholder";
                default:
                    recipientsType = "user";
            }

            // MAKE SURE THAT contactBody HAS ALL THESE PROPERTIES BEFORE CALLING THIS FUNCTION
            // PROPERTIES: .subject .message .extra { .autoEnum .dataId (& special extra) };


            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            // KNOW HOW YOU CAN USE .extraData PROPERTY OF alertSettings TO AFFECT MESSAGE INFORMATION subject/message
            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            //  OR MAYBE YOU CAN USE .extraData TO FILL THIS extra OBJECT INSTEAD, THINK ABOUT IT PLEASE :)

            var extra = {}; // FIND A WAY TO FILL THIS JSON OBJECT FOR ALL POSSIBLE CONTACT METHODS AVAILABLE
            var contactBody = {
                contact_methods: contactMethods,
                data: {
                    subject: subject, message: message,
                    extra: {
                        autoEnum: "AutoEvent", dataId: autoevent._id
                        // , // THE REST OF THIS DATA CAN BE SAVED FOR LATER, WHEN extra JSONOBJECT HAS BEEN FILLED BY .extraData
                        // "Notification": extra[""] || {
                        //     notificationType: null, send_after: null, delayed_option: null, delivery_time_of_day: null,
                        //     segments: null, player_ids: null, include_player_ids: null, send_after: null, send_after: null,
                        // },
                        // "SMS": extra["SMS"] || {  },
                        // "Email": extra["Email"] || { template: null, context: null },
                        // "Company Email": extra["Company Email"] || { template: null, context: null },
                        // "USSD": extra["USSD"] || {  },
                        // "Post Mail": extra["Post Mail"] || {  }
                    }
                }
            };
            // THESE MIGHT BE RECIPIENT OBJECTS / MIGHT JUST BE IDs
            contactBody[recipientsType] = recipients;

            console.log("ALERT CONTACT BODY -> " + JSON.stringify(contactBody));

            var result = await alert(recipientsType, contactBody, false);
            resolve(result);

        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function alert(type, contactBody, defaultCmeth=false) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await userempclientstakefunct.contact(type, contactBody, defaultCmeth);
            resolve(result);
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

function sendResponse(res, status, data) {
    if (res) {
        return res.status(status).send(data);
    }
}

var AutoAuditingFunctions = {

    sortBulkData: function (bulkData) {
        return bulkData; // FIND A WAY TO SORT ALL THIS DATA
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // console.log("HOW FAST ARE SETTINGS FUNCTIONS -> " + JSON.stringify(x));

    triggerAutoAudit: function (type) { //    FROM REST API (TRIGGER / AUTO-ACTION / AUTO-DATA)
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'autoaudit') throw new Error('Type needs to be autoaudit');
        return compose()
            .use(auth.isAuthorized(['run', type])) //
            .use(async function run(req, res, next) {
                try {
                    if (req.body && Object.keys(req.body).length > 0) {
                        if (!req.body.hasOwnProperty("sourceType") || !req.body.hasOwnProperty("sources") ||
                            !req.body.hasOwnProperty("autoaudit") || !req.body.hasOwnProperty("extra"))
                            return sendResponse(res, 404, {
                                err: null,
                                success: false,
                                message: "Auto-Audit Data not specified"
                            });
                        var sourceType = req.body.sourceType, sources = req.body.sources,
                            autoaudit = req.body.autoaudit, extra = req.body.extra;
                        console.log("SOURCE TYPE -> " + sourceType + " & SOURCES -> " + JSON.stringify(sources) + " & AUTO-AUDIT -> " + autoaudit);
                        console.log("EXTRA DATA -> " + JSON.stringify(extra));
                        // NOW, VALIDATE THIS AUTO-AUDIT (ACTIVE/INACTIVE) & WITH SOURCE & SOURCE-TYPE
                        var result = validateAutoAudit(sourceType, autoaudit, sources);
                        if (result.code !== 200) return sendResponse(res, result.code, result.resultData);
                        //  NOW, EXECUTE OPERATION(S) OF THIS PARTICULAR AUTO-AUDIT, BASED ON EXTRA PARAMS SPECIFIED WITHIN REQUEST
                        var result = await triggerAutoAuditOperation(sourceType, sources, autoaudit, extra);
                        //  CHANGE THIS BACK ONCE YOU'VE SUCCESSFULLY IMPLEMENTED THE OPERATIONS OF ALL (INTERNAL & EXTERNAL) AUTO-AUDITS
                        console.log("RESULT -> " + JSON.stringify(result));
                        return sendResponse(res, result.code, result.resultData);
                    } else return sendResponse(res, 404, {
                        success: false,
                        message: "Auto-Audit Triggering Options not specified"
                    });
                } catch (err) {
                    console.log("ERROR -> " + (err));
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    printAutoAudit: function (type) { //    FROM REST API (TRIGGER / AUTO-ACTION / AUTO-DATA)
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'autoaudit') throw new Error('Type needs to be autoaudit');
        return compose()
            .use(auth.isAuthorized(['print', type])) //
            .use(async function print(req, res, next) {
                try {
                    if (req.body && Object.keys(req.body).length > 0) {
                        if (!req.body.hasOwnProperty("sourceType") || !req.body.hasOwnProperty("sources") ||
                            !req.body.hasOwnProperty("autoaudit") || !req.body.hasOwnProperty("extra"))
                            return sendResponse(res, 404, {
                                err: null,
                                success: false,
                                message: "Auto-Audit Data not specified"
                            });
                        var sourceType = req.body.sourceType, sources = req.body.sources,
                            autoaudit = req.body.autoaudit, extra = req.body.extra;
                        console.log("SOURCE TYPE -> " + sourceType + " & SOURCES -> " + JSON.stringify(sources) + " & AUTO-AUDIT -> " + autoaudit);
                        console.log("EXTRA DATA -> " + JSON.stringify(extra));
                        // NOW, VALIDATE THIS AUTO-AUDIT (ACTIVE/INACTIVE) & WITH SOURCE & SOURCE-TYPE
                        var result = validateAutoAudit(sourceType, autoaudit, sources);
                        if (result.code !== 200) return sendResponse(res, result.code, result.resultData);
                        //  NOW, PRINT OUT ALL LOGS / EVENTS PERTAINING TO THIS PARTICULAR AUTO-AUDIT, BASED ON EXTRA PARAMS SPECIFIED WITHIN REQUEST
                        // var result = await printAutoAuditReport(sourceType, sources, autoaudit, extra);
                        var result = {code: 200,
                            resultData: {
                                success: true,
                                message: "Audit Report Printing Functionality has not been implemented yet"
                            }
                        };
                        //
                        console.log("RESULT -> " + JSON.stringify(result));
                        return sendResponse(res, result.code, result.resultData);
                    } else return sendResponse(res, 404, {
                        success: false,
                        message: "Auto-Audit Printing Options not specified"
                    });
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    handleAutoLogOrEvent: function (type) { //    FROM REST API (TRIGGER / AUTO-ACTION)
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'autolog' && type !== 'autoevent')
            throw new Error('Type needs to be either autolog/autoevent');
        return compose()
            .use(auth.isAuthorized(['handle', type])) //
            .use(async function handle(req, res, next) {
                try {
                    var result = {code: 400, resultData: {success: false, message: "Some error occured"}};
                    console.log("TYPE -> " + type + " & ID -> " + req.params.id);
                    var data = await getAutoLogOrEvent(type, req.params.id, "data"); // EITHER : autolog/autoevent
                    console.log("DATA -> " + JSON.stringify(data));
                    switch (type) {
                        case "autolog":
                            result = await handleAutoLog(data);
                            break;
                        case "autoevent": // OR CAN ALSO CALL handleAutoEvent & alertAutoEvent AS SERVER FUNCTIONS
                            result = await handleAndAlertAutoEvent(data);
                            break;
                        default:
                            result.resultData["err"] = "Type needs to be either autolog/autoevent";
                    }
                    console.log("RESULT -> " + JSON.stringify(result));
                    return sendResponse(res, result.code, result.resultData);
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    handleAutoAudit: async function (sourceType, data, extra) { // FROM THE SEQUENTIAL FLOW / BACKGROUND TASK
        return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
            if (!data || !extra) reject({
                code: 400,
                resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}
            });
            if (!extra.hasOwnProperty("autoaudit") || !extra.hasOwnProperty("source"))
                reject({
                    code: 400,
                    resultData: {
                        err: "autoaudit/source not available",
                        success: false,
                        message: 'Sorry, some error occurred'
                    }
                });
            if (!["Internal", "External"].includes(sourceType))
                reject({
                    code: 400,
                    resultData: {
                        err: "Source Type not Internal/External",
                        success: false,
                        message: 'Sorry, some error occurred'
                    }
                });
            console.log(sourceType + " AUTO-AUDIT WITH DATA -> " + JSON.stringify(data) + " ; EXTRA DATA -> " + JSON.stringify(extra));
            try { // FIRST, VALIDATE THIS AUTO-AUDIT (ACTIVE/INACTIVE) & WITH SOURCE & SOURCE-TYPE
                var result = validateAutoAudit(sourceType, extra.autoaudit, [extra.source]);
                if (result.code !== 200) reject(result);

                // PREPROCESS DATA TO GET AUTOLOG
                var autolog = await preprocessAutoAudit(sourceType, data, extra);
                if (autolog) {
                    // CHECK AUTOLOG SETTINGS TO WHETHER TO STORE AUTOLOG OR NOT
                    var x = settings.getAutoAuditMonitoringSettings(sourceType, extra.autoaudit);
                    console.log("AUTO-AUDIT SETTINGS -> " + JSON.stringify(x));
                    console.log("FINAL AUTOLOG OBJECT TO BE HANDLED -> " + JSON.stringify(autolog));

                    if (x.autologFunctionality) {
                        autolog = await saveAutoLogOrEvent("autolog", autolog);
                        if (autolog) {
                            // NOW CHECK HANDLER TYPE (REAL TIME OR TRIGGERED
                            if (x.handlerType === "Real Time") {
                                console.log("REAL TIME????");
                                // HANDLE AUTOLOG RIGHT NOW WITH REGULAR ANALYSIS AUTOMAN AI - AUTO-ANALYTICS CORRELATION ANALYSIS
                                resolve(await handleAutoLog(autolog));
                            } else if (x.handlerType === "Triggered") {
                                console.log("TRIGGERED????");
                                // WAIT FOR AUTOLOG TO BE HANDLED BY TRIGGER (SERVER FUNCTION / BACKGROUND TASK / AUTO-ACTION)
                                resolve({
                                    code: 200,
                                    resultData: {
                                        success: true,
                                        message: 'Autolog saved, and can be handled from Dashboard'
                                    }
                                });
                            } else { // HANDLE AUTOLOG RIGHT NOW AS DEFAULT
                                console.log("NO HANDLER TYPE SPECIFIED!!!");
                                resolve(await handleAutoLog(autolog));
                            }
                        } else reject({
                            code: 500,
                            resultData: {success: true, message: "Sorry, AutoLog couldn't be saved"}
                        });
                    } else resolve({
                        code: 200,
                        resultData: {success: true, message: 'Sorry, AutoLog Functionality is turned off'}
                    });

                } else reject({
                    code: 400,
                    resultData: {
                        err: "AutoLog could not be processed",
                        success: false,
                        message: 'Sorry, some error occurred'
                    }
                });
            } catch (err) {
                console.log("ERROR -> " + JSON.stringify(err));
                reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
            }
        });
    },

    handleAutoEventStraightAway: async function (sourceType, data, extra) {  // FROM THE SEQUENTIAL FLOW / BACKGROUND TASK
        // extra properties : .source .autoaudit .autoevent
        return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
            if (!data || !extra) reject({
                code: 400,
                resultData: {err: "Data/Extra not set", success: false, message: 'Sorry, some error occurred'}
            });
            if (!extra.hasOwnProperty("autoaudit") || !extra.hasOwnProperty("autoevent") || !extra.hasOwnProperty("source") || !extra.hasOwnProperty("emergency_level"))
                reject({
                    code: 400,
                    resultData: {
                        err: "autoaudit/autoevent/source not available",
                        success: false,
                        message: 'Sorry, some error occurred'
                    }
                });
            if (!["Internal", "External"].includes(sourceType))
                reject({
                    code: 400,
                    resultData: {
                        err: "Source Type not Internal/External",
                        success: false,
                        message: 'Sorry, some error occurred'
                    }
                });
            try { // FIRST, VALIDATE THIS AUTO-AUDIT (ACTIVE/INACTIVE) & WITH SOURCE & SOURCE-TYPE
                var result = validateAutoAudit(sourceType, extra.autoaudit, [extra.source]);
                if (result.code !== 200) reject(result);

                // PREPROCESS DATA TO GET AUTOLOG
                var autoevent = await preprocessAutoEventStraightAway(sourceType, data, extra);
                if (autoevent) { // CHECK AUTOEVENT SETTINGS TO WHETHER TO STORE AUTOEVENT OR NOT
                    var x = settings.getAutoAuditMonitoringEventSettings(sourceType, extra.autoaudit, extra.autoevent);
                    if (x.autoeventFunctionality) {
                        // NOW, SET THE EMERGENCY LEVEL OF THE AUTOEVENT GENERICALLY ...
                        /*
                         FIND ALL RELATED AUTOEVENTS, COMPARE THEM WITH CORRELATION RATES (LOW/MEDIUM/HIGH),
                         THEN ASSIGN CORRESPONDING EMERGENCY LEVEL
                         */
                        console.log("");
                        console.log("NUMBER OF AUTOEVENTS TO TEST FOR CORRELATION ANALYSIS -> " + x.emergencyLevelSettings.number);
                        var num = x.emergencyLevelSettings.number;
                        var condition = { // NOTE THAT relatedAutoevents WILL HAVE autoevent AS ITS LAST ITEM, SO REMOVE IT IF YOU WANT
                            extra: { // DO THIS TO PULL OUT ONLY THE IMMEDIATELY-SAVED PREVIOUS AUTOEVENTS
                                limit: --num, // DECREMENT IT, COZ CURRENT AUTOEVENT REPS THAT ITEM (DECREMENT)
                            },
                            // _id: { $ne : autoevent._id }, // THIS DOESN'T EVEN MATTER, COZ AUTOEVENT HAS NO ._id (IT HASN'T BEEN SAVED YET :)
                            type: autoevent.type, // data/file
                            source_type: autoevent.source_type, // Internal/External
                            source: autoevent.source, // Auto-API / Bro / Ossec / Kismet / Lynis
                            // YOU CHOOSE TO FILTER OUT AUTOEVENTS FROM THE SPECIFIC SOURCE OR NOT, BASED ON THE SETTINGS SPECIFIED
                            autoaudit: autoevent.autoaudit,
                            autoevent: autoevent.autoevent // DO THIS TOO, TO FILTER ONLY THIS PARTICULAR AUTOEVENT
                        }; // FIND A WAY TO SPECIFY LOG TYPE (data / file) GENERICALLY
                        // NOW, PERFORM CORRELATION ANALYSIS TO GET EMERGENCY LEVEL ...
                        console.log("NOW GETTING ALL RELATED AUTOEVENTS TO THIS CURRENT AUTOEVENT WE'RE TESTING ...");
                        console.log("CONDITION -> " + JSON.stringify(condition));
                        var relatedAutoevents = await getAllAutoLogsOrEvents("autoevent", condition, "data");
                        if (relatedAutoevents && relatedAutoevents.length > 0) {
                            autoevent = await performRegularCorrelationAnalysis(autoevent, relatedAutoevents, x);
                        } else console.log("NO RELATED AUTOEVENTS !!!!");
                        //  DONE SETTING THE EMERGENCY LEVEL OF THIS AUTOEVENT; NOW SAVING THE AUTOEVENT ...
                        autoevent = await saveAutoLogOrEvent("autoevent", autoevent);
                        if (autoevent) { // WORK WITH result IF NECESSARY (BUT YOU MUST await IT FIRST)
                            var result = await handleAndAlertAutoEvent(autoevent);
                            console.log("HANDLE/ALERT AUTOEVENT RESULT -> " + JSON.stringify(result));
                            resolve(result);
                        }
                    } else resolve({
                        code: 400,
                        resultData: {success: true, message: 'Sorry, AutoEvent Functionality is turned off'}
                    });
                } else reject({code: 400, resultData: {success: false, message: 'Sorry, some error occurred'}});
            } catch (err) {
                console.log("ERROR -> " + JSON.stringify(err));
                reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
            }
        });
    },

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    //  EXTRA AUTO-AUDITING FUNCTIONS
    triggerAutoAuditOperation: function (sourceType, sources, autoaudit, extra) {
        return triggerAutoAuditOperation(sourceType, sources, autoaudit, extra);
    },

    blackListAccessTokens: function (user, access_tokens) {
        return autoauditEventHandlerFunct["Internal"]["Session Tracking"]["extra"].blackListAccessTokens(user, access_tokens);
    },

    checkIfAccessTokenIsBlackListed: function (access_token, user) {
        return autoauditEventHandlerFunct["Internal"]["Session Tracking"]["extra"].checkIfAccessTokenIsBlackListed(access_token, user);
    },

};

module.exports = AutoAuditingFunctions;

// EXTRA FUNCTIONS CAN COME HERE ...

function triggerAutoAuditOperation(sourceType, sources, autoaudit, extra) {
    extra["autoaudit"] = autoaudit;
    extra["sources"] = sources; // DO THIS TO extra VARIABLE WILL HAVE ALL TO SOURCES TO TRIGGER AUTO-AUDIT :)
    return autoauditMonitoringHandlerFunct[sourceType][autoaudit]["extra"].triggerAutoAuditOperation(extra);
}