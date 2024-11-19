'use strict';

var internalMonitoringHandler = require('./MONITORING_HANDLERS/InternalMonitoringHandlersFunctions.js');

var sourceType = "Internal", defaultSource = "Auto-API";

//  MIGHT CAUSE A CYCLIC DEPENDENCY, FIND A WAY TO RECTIFY THIS
var funct = require('../../../../functions')
var settings = funct.settings;
funct = funct.funct;

function refineAutoEvent (data, extra) {
    return refineAutoEvent(data, extra, null); // FIND OUT WHAT TO USE source FOR :)
}

function refineAutoEvent (data, extra, source) {
    try {
        if (!data || !extra) return null;
        /*
        extra = { source: req.params.source, autoaudit: req.params.autoaudit, autoevent: req.params.autoevent };
        */
        // RETURN OBJECT WITH PROPERTIES: name, details, type (CHECK DATA FILE LOG SETTINGS), source_type, source, autoaudit, data
        var x = settings.getAutoAuditMonitoringEventSubSettings(sourceType, extra.autoaudit, extra.autoevent, "autoevent");
        console.log("x -> " + JSON.stringify(x));
        console.log("extra -> " + JSON.stringify(extra));
        var final = {
            name: extra.name || x.name || "",
            details: extra.details || x.details || "",
            emergency_level: extra.emergency_level || x.emergency_level || "default",
            type: x.type || "data", // FIND A WAY TO SET THIS GENERICALLY ..
            source_type: sourceType || "",
            source: source || defaultSource || "",
            autoaudit: extra.autoaudit || "",
            autoevent: extra.autoevent || "",
            data: data || x.data,
            // THIS IS TOO DYNAMIC, SO FIND A WAY TO MAKE IT SPECIFIC TO EVERY SOURCE & SOURCE_TYPE
            autologs: []
        };
        console.log("final -> " + JSON.stringify(final));
        return final;
    } catch (err){
        console.log("ERROR -> " + JSON.stringify(err));
         return null;
    }
}

var InternalAutoAuditingFunctions = {

    preprocessAutoAuditData: function (data, extra) { // extra properties: .name .details .autoaudit & .source
        try {
            if (!data || !extra) return null;

            console.log("PROCESSING INTERNAL AUTOAUDIT DATA!!!")


            // PREPROCESS DATA BASED ON INTERNAL SOURCE (AUTO-API)
            // .data MUST INCLUDE ALL REQUIRED PROPERTIES PERTAINING TO THE PARTICULAR AUTOAUDIT TO BE USED FOR THE AUTOEVENT
            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
            return internalMonitoringHandler[extra.autoaudit].preprocessAutoAuditData(data, extra);
            // MIGHT NOT EVEN BE NECESSARY, YOU CAN ALSO JUST return data;
            // THEREFORE THE SOURCE MUST MAKE SURE IT SENDS THE RIGHT ONE WITH RIGHT PROPERTIES
            // THEN IT ALSO MEANS YOU CAN EVEN DO SOME VALIDATIONS ON data BASED ON THE AUTOAUDIT

        } catch (err){
            console.log("ERROR -> " + JSON.stringify(err));
             return {code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}};
        }
    },

    testAutoLogsForAutoEvents: async function (autolog, relatedAutologs) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("INTERNAL TESTING HAPPENING NOW ...")
                var x = await internalMonitoringHandler[autolog.autoaudit].testAutoLogsForAutoEvents(autolog, relatedAutologs);
                console.log("TESTING RESULTS -> " + JSON.stringify(x));

                var autoeventDatas = x.autoeventDatas || [], actualRelatedAutologs = x.actualRelatedAutologs || [];
                if (autoeventDatas && actualRelatedAutologs) { // autoevents MUST EACH HAVE THESE PROPERTIES : .name .details .emergency_level .type .source .source_type, .autoaudit, .autoevent
                    var extra, refinedAutoEvents = [];
                    console.log("");
                    console.log("REFINING EACH AUTOEVENT NOW ...");
                    autoeventDatas.forEach(function (x, i) {
                        console.log("INDEX -> " + i);
                        refinedAutoEvents.push(refineAutoEvent(x.data, x.extra, autolog.source));
                    });
                    resolve({refinedAutoEvents: refinedAutoEvents, actualRelatedAutologs: actualRelatedAutologs});
                } else resolve({refinedAutoEvents: [], actualRelatedAutologs: []});

            } catch (err){
                console.log("ERROR -> " + JSON.stringify(err));
                reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
            }
        });
    },

    preprocessAutoEventDataStraightAway: function (data, extra) {
        try {
            // extra properties: .name .details .source .autoaudit .autoevent .emergency_level
            if (!data || !extra) return null;

            console.log("PROCESSING INTERNAL AUTOEVENT DATA STRAIGHT AWAY !!!")

            // data MUST INCLUDE ALL REQUIRED PROPERTIES PERTAINING TO THE PARTICULAR AUTOAUDIT TO BE USED FOR THE AUTOEVENT
            // AS WELL AS .name & .details PROPERTIES (SUMMARIES OF .data)
            return internalMonitoringHandler[extra.autoaudit].preprocessAutoEventDataStraightAway(data, extra);
            // MIGHT NOT EVEN BE NECESSARY, YOU CAN ALSO JUST return data;
            // THEREFORE THE SOURCE MUST MAKE SURE IT SENDS THE RIGHT ONE WITH RIGHT PROPERTIES
            // THEN IT ALSO MEANS YOU CAN EVEN DO SOME VALIDATIONS ON data BASED ON THE AUTOAUDIT
        } catch (err){
            console.log("ERROR -> " + JSON.stringify(err));
             return {code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}};
        }
    },

};

module.exports = InternalAutoAuditingFunctions;
