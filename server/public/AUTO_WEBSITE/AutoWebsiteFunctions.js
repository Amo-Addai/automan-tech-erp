'use strict';

var compose = require('composable-middleware');
var request = require('request');

var dataHandler = require('../../api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
var autoWebsiteModelscontrollersHandler = dataHandler.modelscontrollersHandler;

var funct = require('../../functions');
var settings = funct.settings;
var config = funct.config;
var auth = funct.auth;
var InternalAutoAuditingFunct = funct.InternalAutoAuditingFunct;
funct = funct.funct;

// console.log("AUTO-WEBSITE CONFIG -> " + JSON.stringify(Object.keys(config)));

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
//          DATA-FILE LOGGING FUNCTIONS
var DataHandlerModels = {
    "user": require('../../api/USER/user.model'),
    "message": require('../../api/MESSAGE/message.model'),
    "prospect": require('./DATA/PROSPECT/prospect.model'),
    "property": require('../AUTO_INVESTMENT/DATA/PROPERTY/property.model'),
    "post": require('./DATA/POST/post.model'),
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS

function getDataHandlerModel(type) {
    return DataHandlerModels[type];
}

async function getAllAutoWebsiteObjects(type, condition) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoWebsiteModelscontrollersHandler.getAll(getDataHandlerModel(type), JSON.stringify(condition));
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function getAutoWebsiteObject(type, id) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoWebsiteModelscontrollersHandler.get(getDataHandlerModel(type), id);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function saveAutoWebsiteObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoWebsiteModelscontrollersHandler.add(getDataHandlerModel(type), data);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function updateAutoWebsiteObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoWebsiteModelscontrollersHandler.update(getDataHandlerModel(type), data._id, data);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function deleteAutoWebsiteObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoWebsiteModelscontrollersHandler.delete(getDataHandlerModel(type), data._id);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
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



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS


async function validate(type, body){

    function checkIncludes(arr, obj){
        var returnObj = {};
        for(var k in obj){
            if(arr.includes(k)) returnObj[k] = obj[k];
        }
        return (Object.keys(returnObj).length > 0) ? JSON.parse(JSON.stringify(returnObj)) : null;
    } 

    return new Promise(async (resolve, reject) => {
        try { // FIND OUT HOW TO VALIDATE -> email, type, data, etc
            var newBody = null, condition = null;
            switch(type){
                case "prospect":
                    console.log("NO FUNCTIONALITY FOR THIS SECTION YET !!!!");
                    resolve(null);
                    break;
                case "subscriber":
                    condition = checkIncludes(["full_name", "email"], body);
                    if(!condition) throw Error("Error Occured during Condition Validation");
                    // console.log("CONDITION -> " + JSON.stringify(condition));
                    newBody = { condition, prospect: JSON.parse(JSON.stringify(condition)) };
                    // console.log("NEW BODY -> " + JSON.stringify(newBody));
                    newBody.prospect.data = { 
                        // ADD THIS IF YOU'D WANT TO FORCEFULLY SET THESE PROSPECTS' INTERESTS TOO ..
                        // "interests": {
                        //     "properties": []
                        // },
                        "subscribed": true 
                    };
                    // console.log("NEW BODY NOW -> " + JSON.stringify(newBody));
                    break;
                case "waitlist":
                    // MAYBE "message" SHOULD BE ADDED TO THIS LIST ???
                    condition = checkIncludes(["full_name", "email", "phone" /*, "message"*/ ], body);
                    if(!condition) throw Error("Error Occured during Condition Validation");
                    console.log("CONDITION -> " + JSON.stringify(condition));
                    newBody = { condition, prospect: JSON.parse(JSON.stringify(condition)) };
                    console.log("NEW BODY -> " + JSON.stringify(newBody));
                    // BUT MAKE SURE YOU CHANGE THIS BELOW TO newBody.prospect.data["interests"] = {}
                    if(body.hasOwnProperty("propertyId") && (body.propertyId.length > 0)){
                        newBody.propertyId = body.propertyId;
                        newBody.prospect.data = {
                            // ADD THIS IF YOU'D WANT TO FORCEFULLY SUBSCRIBE THESE PROSPECTS TOO ..
                            // "subscribed": true,
                            "interests": {
                                "properties": [body.propertyId]
                            }
                        };
                    }
                    console.log("NEW BODY NOW -> " + JSON.stringify(newBody));
                    break;
                case "message":
                    condition = checkIncludes(["full_name", "email", "subject", "message"], body);
                    if(!condition) throw Error("Error Occured during Condition Validation");
                    console.log("CONDITION -> " + JSON.stringify(condition));
                    // SPLIT condition INTO PROSPECT & MESSAGE DATA OBJECTS
                    var prospectBody = {condition: {}, prospect: {}}, messageBody = {condition: {}, message: {}};
                    // console.log("NEW PROSPECT BODY -> " + JSON.stringify(prospectBody));
                    // console.log("NEW MESSAGE BODY -> " + JSON.stringify(messageBody));
                    for(var i of ["full_name", "email", "subject", "message"]){
                        if(condition.hasOwnProperty(i)){
                            if(["full_name", "email"].includes(i)) {
                                prospectBody.prospect[i] = prospectBody.condition[i] = condition[i];
                            }
                            if(["subject", "message"].includes(i)) {
                                messageBody.message[i] = messageBody.condition[i] = condition[i];
                            }
                        }
                    } // MAKE SURE YOU ALSO SET THESE PROPS OF THE message
                    messageBody.message.type = config.messageTypesDefault || "Request";
                    messageBody.message.data = { // ADD THIS IF MESSAGE'S .data PROP INCLUDES .subject & .message ..
                        // "subject": condition["subject"],
                        // "message": condition["message"], 
                        "senderType": "Prospect"
                    };
                    newBody = { prospectBody, messageBody };
                    console.log("NEW BODY NOW -> " + JSON.stringify(newBody));
                    break;
                default:
                    resolve(null);
            }
            // console.log("RETURNING NEW REQUEST BODY -> " + JSON.stringify(newBody));
            resolve(newBody);
        } catch(e){
            console.log("ERROR -> " + e);
            console.log("ERROR -> " + JSON.stringify(e));
            resolve(null);
        }
    });
}

async function getAndSaveMergedObject(type, newBody){

    async function appendSimilarObjects(s=[], similar=[]){
        return new Promise((resolve, reject) => {
            var includes = false, newS = [];
            console.log("\n" + s.length + " 'MAYBE' SIMILAR OBJECTS TO APPEND -> " + JSON.stringify(s));
            for(var o of s){
                includes = false;
                for(var obj of similar){
                    try {
                        if((obj._id.toString()) == (o._id.toString())){
                            includes = true;
                            console.log("OBJECT ALREADY EXISTS IN SIMILAR OBJECTS ..")
                            break;
                        }
                    } catch (e){
                        console.log("LOOP ERROR -> " + JSON.stringify(e));
                        continue;
                    }
                }
                if(!includes) {
                    console.log("OBJECT DOESN'T EXIST IN SIMILAR OBJECTS, THEREFORE ADDING ..")
                    newS.push(JSON.parse(JSON.stringify(o)));
                }
            }
            console.log("NOW, ADDING ALL SIMILAR OBJECTS WITH DIFFERENT IDs")
            for(var o of newS) similar.push(JSON.parse(JSON.stringify(o)));
            console.log("FINALLY, " + similar.length + " SIMILAR OBJECTS -> " + JSON.stringify(similar) + "\n\n");
            resolve(JSON.parse(JSON.stringify(similar)));
        })
    }

    return new Promise(async (resolve, reject) => {
        /* GET MATCHES FOR type OBJECTS USING EACH PROP FROM body
         THEN MERGE ALL THE MATCHED INTO 1 NEW OBJECT -> body
         AND THEN, UPDATE THE MOST USED OBJECT eg. Prospect (WITH THE MOST LINKS TO OTHER DATA-DOMAINS)
         NOW, FINALLY, DELETE ALL THE OTHER MATCHED OBJECTS WHICH AREN'T USED THAT MUCH / AT ALL */

        try { // NO NEED TO CHECK IF body HAS .condition & [type] PROPS
            // COZ IT MUST ALREADY BE CHECKED IN ALL OF THE CALLING FUNCTIONS ..
            var body = newBody[type], condition = newBody.condition, cond = {}, similar = [], s = [];
            switch(type){
                case "prospect":
                    console.log("FULL CONDITION -> " + JSON.stringify(condition) + "\n");
                    for(var c in condition){
                        cond = JSON.parse(JSON.stringify({}));
                        cond[c] = condition[c];
                        s = await getAllAutoWebsiteObjects("prospect", cond);
                        similar = await appendSimilarObjects(s, similar);
                    }
                    // NOWWWW, MERGE ALL THE SIMILAR OBJECTS INTO 1 OBJECT -> body

                    // THEN ADD THIS OBJECT TO THE DATABASE

                    // AND FINALLY, RESET ALL THE GLOBAL LINKS FROM similar OBJECTS TO THIS NEW OBJECT

                    // BUT DON'T FORGET TO DELETE ALL THE OLD similar OBJECTS, SINCE THEY'RE USELESS NOW ..


                    // ONLY DO THIS IF body ALREADY HAS ._id PROP
                    // var prospect = await updateAutoWebsiteObject("prospect", body);
                    var prospect = await saveAutoWebsiteObject("prospect", body);
                    body = JSON.parse(JSON.stringify(prospect));
                    break;
                case "message": // WITH THIS, NO NEED TO MERGE ANYTHING, JUST ADD THE MESSAGE (COZ IT MUST BE BIG-DATA ANYWAY)
                    var message = await saveAutoWebsiteObject("message", body);
                    body = JSON.parse(JSON.stringify(message));
                    break;
                default:
                    resolve({
                        code: 400,
                        resultData: {success: false, message: 'Sorry, could not perform action'}
                    });
                    break;
            }
            var result = { code: 200, resultData: {success: true, message: 'Action Performed Successfully!', data: {}} };
            result.resultData.data[type] = body;
            resolve(result);
        } catch(e){
            console.log(JSON.stringify(e));
            resolve({
                code: 400,
                resultData: {success: false, message: 'Sorry, could not perform action'}
            });
        }
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PUBLIC FUNCTIONS

var AutoWebsiteFunctions = {

    newSubscriber: function(type="subscriber"){
        var _this = this;
        if (!type) throw new Error('Type needs to be set');
        return compose() // AUTO-WEBSITE, SO NO NEED FOR AUTH-TOKEN
        // .use(auth.isAuthorized(['newSubscriber', type])) //
            .use(async function newSubscriber(req, res, next) {
                try { // ALL THE CODE COMES RIGHT HERE ...
                    console.log("NEW SUBSCRIBER DATA -> " + JSON.stringify(req.body));
                    var newBody = await validate("subscriber", req.body);
                    if(newBody && newBody.condition && newBody.prospect){
                        console.log("NEW SUBSCRIBER PROSPECT -> " + JSON.stringify(newBody.prospect));
                        var result = await getAndSaveMergedObject("prospect", newBody);
                        // WORK WITH result HOWEVER YOU SEE FIT ..
                        //
                        return sendResponse(res, result.code, result.resultData);
                    } else return sendResponse(res, 404, {success: false, message: "Sorry, couldn't process data"});
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    newWaitlist: function(type="waitlist"){
        var _this = this;
        if (!type) throw new Error('Type needs to be set');
        return compose() // AUTO-WEBSITE, SO NO NEED FOR AUTH-TOKEN
        // .use(auth.isAuthorized(['newWaitlist', type])) //
            .use(async function newWaitlist(req, res, next) {
                try { // ALL THE CODE COMES RIGHT HERE ...
                    console.log("NEW WAITLIST DATA -> " + JSON.stringify(req.body));
                    var newBody = await validate("waitlist", req.body);
                    if(newBody && newBody.condition && newBody.prospect){ //  && newBody.propertyId 
                        // DON'T CHECK FOR PROPERTY ID YET, COZ WHETHER IT'S AVAILABLE OR NOT, STILL SAVE THE PROSPECT ..
                        console.log("NEW WAITLIST PROSPECT -> " + JSON.stringify(newBody.prospect));
                        var result = await getAndSaveMergedObject("prospect", newBody);
                        // WORK WITH result HOWEVER YOU SEE FIT ..
                        if(newBody.propertyId && result && result.resultData && result.resultData.data && result.resultData.data.prospect){
                            // NOWWW, YOU CHECK IF PROPERTY ID IS AVAILABLE, BEFORE YOU TRY TO UPDATE ITS .waitlist PROP
                            console.log("NOW FINDING & UPDATING THE PROPERTY IN QUESTION ..");
                            var prospect = result.resultData.data.prospect;
                            if(prospect._id){ // NOW, CHECK IF waitlistProspect'S INTERESTED PROPERTY ALSO EXISTS
                                var property = await getAutoWebsiteObject("property", newBody.propertyId);
                                if(property){ // THEN UPDATE ITS .waitlist PROPERTY
                                    if(!property.waitlist) property.waitlist = config.waitlistDataDefault;
                                    if(!property.waitlist["Prospects"]) property.waitlist["Prospects"] = [];
                                    if(!property.waitlist["Prospects"].includes(prospect._id.toString())) {
                                        // console.log("ADDING PROSPECT TO PROPERTY'S WAITLIST ..");
                                        property.waitlist["Prospects"].push(prospect._id.toString());
                                    }
                                    property = await updateAutoWebsiteObject("property", property);
                                    // console.log("UPDATED PROPERTY -> " + JSON.stringify(property));
                                    // KEEP WORKING WITH property HOWEVER YOU PREFER ..
                                }
                            }
                        }
                        return sendResponse(res, result.code, result.resultData);
                    } else return sendResponse(res, 404, {success: false, message: "Sorry, couldn't process data"});
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    newMessage: function(type="message"){
        var _this = this;
        if (!type) throw new Error('Type needs to be set');
        return compose() // AUTO-WEBSITE, SO NO NEED FOR AUTH-TOKEN
        // .use(auth.isAuthorized(['newMessage', type])) //
            .use(async function newMessage(req, res, next) {
                try { // ALL THE CODE COMES RIGHT HERE ...
                    console.log("NEW MESSAGE DATA -> " + JSON.stringify(req.body));
                    var { prospectBody, messageBody } = await validate("message", req.body);
                    // 
                    if(prospectBody && prospectBody.condition && prospectBody.prospect){
                        console.log("\nNEW MESSAGING PROSPECT -> " + JSON.stringify(prospectBody.prospect));
                        var result = await getAndSaveMergedObject("prospect", prospectBody);
                        // WORK WITH result HOWEVER YOU SEE FIT ..
                        //
                    } else console.log("SOME ISSUE OCCURED WITH THE PROSPECT DATA");
                    // 
                    if(messageBody && messageBody.condition && messageBody.message){
                        console.log("\nNEW MESSAGE -> " + JSON.stringify(messageBody.message));
                        var result = await getAndSaveMergedObject("message", messageBody);
                        // WORK WITH result HOWEVER YOU SEE FIT ..
                        //

                        return sendResponse(res, result.code, result.resultData);
                    } else return sendResponse(res, 404, {success: false, message: "Sorry, couldn't process data"});
                    // 
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },


    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    //  EXTRA AUTO-WEBSITE FUNCTIONS


};

module.exports = AutoWebsiteFunctions;
