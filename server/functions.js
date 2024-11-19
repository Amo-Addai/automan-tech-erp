'use strict';

var request = require('request');
var mongoose = require('mongoose');
var crypto = require('crypto');
var fs = require('fs');
var _ = require('lodash');
var compose = require('composable-middleware');
var path = require('path');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');


var dataHandler = require('./api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler'); // this.dataHandler; 
//
var models = dataHandler.models;
var modelscontrollers = dataHandler.modelscontrollers;
var modelscontrollersHandler = dataHandler.modelscontrollersHandler;

var oldConfig = require('./config/environment') || {};
var userempclienstakefunct = require('./api/GLOBAL_CONTROLLER/OTHER_FUNCTION_HELPERS/UserEmployeeClientStakeHolderServerFunctions');
var globalMM = require('./api/GLOBAL_CONTROLLER/OTHER_FUNCTION_HELPERS/GlobalMarkModifiedServerFunctions');
//  ALSO REQUIRED VARIABLES : projtaskmeetfunct compdepempfunct calendar 

//      FIRST DEFINE ALL "PUBLIC" FUNCTIONS USED BY MULTIPLE MODULES (OBJECTS) WITHIN THIS FILE
function sendResponse(res, status, data) {
    if (res) {
        if (data && data.hasOwnProperty("code") && data.hasOwnProperty("index") && data.hasOwnProperty("errmsg")) {
            // THEN IT MEANS MOST LIKELY THIS IS AN ERROR OBJECT
            return res.status(status).send({ success: false, message: data.errmsg });
        } else return res.status(status).send(data);
    }
}

function markModified(data, newdata, M) {
    console.log("DATA -> " + data);
    console.log("NEW DATA -> " + JSON.stringify(newdata));
    var updated = Object.assign(data, newdata);
    console.log("UPDATED -> " + updated);
    var str = '', arr = (M.markModify || "").split(' ');
    console.log("MARK MODIFY ARRAY -> " + arr);
    for (var d of arr) {
        console.log("Mark Modifying Property -> " + d);
        updated.markModified('' + d + '');
    }
    console.log("DONE MARK MODIFYING! RETURNING OBJECT -> ");
    console.log(JSON.stringify(updated))
    return updated;
}

function globalMarkModified(M, deepPop, data) {
    //  REMOVE THIS WHEN READY TO PERFECT THIS FUNCTION ...
    console.log("\n\nGLOBAL MARK MODIFIED FUNCTIONALITY WILL BE HANDLED LATER ...\n\n")
    // var arr = globalMM.explode(deepPop), type = M.type;
    // console.log("TYPE -> " + type + " & PROPERTIES -> " + arr);
    // for (var x of arr) {
    //     if (x.length <= 0) continue;
    //     else if (x === 'location' || x === 'types' || x.includes('completed_') || x.includes('accepted_')) continue;
    //     else if (x === 'parent' || x.includes('sub_')) {
    //         console.log("Handling Parent Or Sub_ ...");
    //         globalMM.handleParentOrSub(type, x, data);
    //     } else if (x === 'head') {
    //         console.log("Handling Head of ...");
    //         globalMM.handleHead(type, data);
    //     } else {
    //         console.log("Handling Default ...");
    //         globalMM.handleDefault(type, x, data);
    //     }
    // }
}

function getModelName(type) {
    switch (type) {
        case "autolog":
            return "AutoLog";
        case "autoevent":
            return "AutoEvent";
        case "user":
            return "User";
    }
    return null;
}

function getModel(type) {
    return mongoose.model(getModelName(type));
}

function getSchema(type) {
    return mongoose.model(getModelName(type)).schema;
}

async function contact(type, body, defaultCmeth = false) {
    return await userempclienstakefunct.contact(type, body, defaultCmeth);
}

var settingsData = require('./config/SETTINGS/settings.json');
var defaultSettingsData = require('./config/SETTINGS/DEFAULT_SETTINGS/default_settings.json');

var settings = {
    //  FIRST, DEFINE THE FILE "fs" FUNCTIONS TO ACCESS SETTINGS FILE
    getDefaultSettingsFile: function (filename) {
        return defaultSettingsData;
        // return new Promise((resolve, reject) => {
        //         // '/Users/mr.amo-addai/Desktop/Level400/PROJECT_API/API_DASHBOARD/server/config/SETTINGS/DEFAULT_SETTINGS/default_settings.json'
        //         filename = path.join(__dirname + '/config/SETTINGS/DEFAULT_SETTINGS/', filename + '.json');
        //         console.log("FILE PATH -> " + filename);
        //         // resolve(require(filename)); //  YOU CAN ALSO DO THIS THOUGH
        //         fs.readFile(filename, function read(err, data) { // FIND A WAY TO MAKE THIS FUNCTION CALL WORK PERFECTLY
        //             if (err) {
        //                 console.log("ERROR -> " + err);
        //                 resolve(false); 
        //             } else resolve(JSON.parse(data));
        //         });
        // });
    },

    saveDefaultSettingsFile: function () {
        // return new Promise((resolve, reject) => {

        // });

    },

    getSettingsFile: function (filename) {
        return settingsData;
        // return new Promise((resolve, reject) => {
        //         // '/Users/mr.amo-addai/Desktop/Level400/PROJECT_API/API_DASHBOARD/server/config/SETTINGS/settings.json'
        //         filename = path.join(__dirname + '/config/SETTINGS/', filename + '.json');
        //         console.log("FILE PATH -> " + filename);
        //        // resolve(require(filename)); //  YOU CAN ALSO DO THIS THOUGH
        //         fs.readFile(filename, function read(err, data) { // FIND A WAY TO MAKE THIS FUNCTION CALL WORK PERFECTLY
        //             if (err) {
        //                 console.log("ERROR -> " + err);
        //                 resolve(false); 
        //             } else resolve(JSON.parse(data));
        //         });
        // });
    },

    saveSettingsFile: async function (filename, settings) {
        return new Promise((resolve, reject) => {
            settingsData = Object.assign(settingsData, settings);
            console.log("FILE NAME -> " + filename);
            // '/Users/mr.amo-addai/Desktop/Level400/PROJECT_API/API_DASHBOARD/server/config/SETTINGS/settings.json'
            filename = path.join(__dirname + '/config/SETTINGS/', filename + '.json');
            console.log("FILE PATH -> " + filename);
            console.log("NEW SETTINGS DATA -> " + JSON.stringify(settingsData));
            fs.writeFile(filename, JSON.stringify(settingsData), function write(err) {
                if (err) {
                    console.log("ERROR -> " + err);
                    resolve(false);
                } else { // NOW, RESET UR settingsData VARIABLE (U CAN CHOOSE NOT TO THO)
                    settingsData = require('./config/SETTINGS/settings.json');
                    console.log("NEW SETTINGS OBJECT -> " + JSON.stringify(settingsData));
                    resolve(true);
                }
            });
        });
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    //  EXTRA SETTINGS FUNCTIONS

    getThisCompanyDefaultSettings: function () {
        return this.getDefaultSettingsFile(oldConfig.defaultSettingsFile) || {};
    },

    saveThisCompanyDefaultSettings: function (settings) {
        // return this.saveDefaultSettingsFile(oldConfig.defaultSettingsFile, settings);
    },
    /////////////////////////////////////////////////////////////////////////////////////////////
    getThisCompanySettings: function () {
        return this.getSettingsFile(oldConfig.settingsFile) || {};
    },

    saveThisCompanySettings: async function (settings) {
        return await this.saveSettingsFile(oldConfig.settingsFile, settings);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////

    setValue: function (key, value, json) {
        try {
            json = json || this.getThisCompanySettings();
            if (key !== undefined && json !== undefined) {
                if (json.hasOwnProperty(key)) {
                    json[key] = value;
                    return true;
                }
                var nextJson, i;
                for (i in json) {
                    nextJson = json[i];
                    try {
                        if (nextJson.hasOwnProperty(key)) {
                            nextJson[key] = value;
                            return true;
                        }
                        // IF NOT THEN CALL THIS FUNCTION RECURSIVELY
                        if ((typeof nextJson === "object") && (nextJson != null)
                            && Object.keys(nextJson).length > 0 && !(nextJson instanceof Array)) {
                            // ARRAYS ARE typeof "object" BUT OBJECTS AREN'T instanceof Array
                            if (this.setValue(key, value, nextJson)) {
                                this.saveThisCompanySettings(/*FIND A WAY TO MAKE THIS WORK PERFECTLY WITH THIS RECURSIVE FUNCTION*/);
                                return true;
                            }
                            // IF IT WAS FALSE, THEN JUST MOVE ON TO THE NEXT OBJECT
                        }
                    } catch (err) {
                        continue;  // IF THAT WASN'T A JSONOBJECT, LOOP JUST CONTINUES TO NEXT KEY
                    }
                }
            }
        } catch (err) {
            console.log("Error : " + err);
            throw err;
        }
        return false;
    },

    getValue: function (key, json) {
        try {
            var value = null;
            json = json || this.getThisCompanySettings();
            if (key !== undefined && json !== undefined) {
                if (json.hasOwnProperty(key)) return json[key];
                var nextJson, i;
                for (i in json) {
                    nextJson = json[i];
                    try {
                        if (nextJson.hasOwnProperty(key)) return nextJson[key];
                        // IF NOT THEN CALL THIS FUNCTION RECURSIVELY
                        if ((typeof nextJson === "object") && (nextJson != null)
                            && Object.keys(nextJson).length > 0 && !(nextJson instanceof Array)) {
                            // ARRAYS ARE typeof "object" BUT OBJECTS AREN'T instanceof Array
                            value = this.getValue(key, nextJson);
                            if (value !== null) return value;
                            // IF IT WAS NULL, THEN JUST MOVE ON TO THE NEXT OBJECT
                        }
                    } catch (err) {
                        continue;  // IF THAT WASN'T A JSONOBJECT, LOOP JUST CONTINUES TO NEXT KEY
                    }
                }
            }
        } catch (err) {
            console.log("Error : " + err);
            throw err;
        }
        return null;
    },

    getDefaultValue: function (option) {
        return this.getValue(option + "Default");
    },

    getArray: function (option) {
        switch (option) {
            default:
                return this.getValue(option);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //                              AUTO - SECURITY SETTINGS
    //      AUTHENTICATION SETTINGS
    canEditSubSettings: function (subSettings, user) {
        return true;
    },

    // Checks if the user role meets the minimum requirements of the route
    isAuthenticationAllowed: function (auth, dash) {
        return true;
    },

    hasAccessRights: function (x, user, authData, security, params) {
        return true;
    },

    checkAccessRights: function (user, authData, security, params) { // params SHOULD BE A VARIATIC PARAMETER
        return true;
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //  DATA SECURITY SETTINGS
    //  NB: type IS EITHER file/data/messages

    //  STORAGE & BACKUP SETTINGS

    // FILE SYSTEM SETTINGS

    getDefaultFileType: function (file) {
        return (this.getValue("storageSettings")["fileTypes"][file]);
    },

    getFileTypes: function (file) {
        return (this.getValue("storageSettings")["file"]["types"][file + "Options"]);
    },

    canEncryptFileType: function (type) {
        return (this.getDataSecurityTechniqueSettings("encryption", "file")["encrypt"].includes(type));
    },

    canDecryptFileType: function (type) {
        return (this.getDataSecurityTechniqueSettings("encryption", "file")["decrypt"].includes(type));
    },


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //                              AUTO - RESEARCH SETTINGS
    getAutoResearchSettings: function (type) {
        if (!this.getValue("AUTO_RESEARCHFunctionality")) return false;
        if (type) {
            return this.getValue(type);
        } else { // THEN DO STH ELSE ..
        }
        return null;
    },


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //                              AUTO - AUDITING SETTINGS

    getAutoAuditOptions: function (intext) {
        if (!this.getValue("AUTO_AUDITINGFunctionality")) return false;
        return this.getValue("AUTO_AUDITINGSettings")["autoaudits"][intext]["autoauditOptions"] || null;
    },

    getAutoAuditAutoEventOptions: function (intext, autoAudit) {
        if (!this.getValue("AUTO_AUDITINGFunctionality")) return false;
        return this.getValue("AUTO_AUDITINGSettings")["autoaudits"][intext][autoAudit]["autoeventOptions"] || null;
    },

    getAutoAuditMonitoringSettings: function (intext, autoAudit) {
        if (!this.getValue("AUTO_AUDITINGFunctionality")) return false;
        if (intext) {
            if (!this.getValue(intext + "AUTO_AUDITINGFunctionality")) return false;
            return this.getValue(intext + "AUTO_AUDITINGSettings")[autoAudit] || null;
        } else { // TRY intext AS BOTH internal & external
        }
        return null;
    },

    getAutoAuditMonitoringSubSettings: function (intext, autoAudit, sub) {
        if (!["autolog"
            // ,"handler", "alert" // THESE ONES NOT REQUIRED ANYMORE
        ].includes(sub)) return false;
        var monitoringSettings = this.getAutoAuditMonitoringSettings(intext, autoAudit);
        if (monitoringSettings) {
            if (!this.getValue(sub + "Functionality")) return false;
            return monitoringSettings[sub + "Settings"] || null;
        }
        return null;
    },

    getAutoAuditMonitoringEventSettings: function (intext, autoAudit, event) {
        var monitoringSettings = this.getAutoAuditMonitoringSettings(intext, autoAudit);
        if (monitoringSettings) {
            return monitoringSettings["events"][event] || null;
        }
        return null;
    },

    getAutoAuditMonitoringEventSubSettings: function (intext, autoAudit, event, sub) {
        if (!["handler", "autoevent", "alert"].includes(sub)) return false;
        var eventSettings = this.getAutoAuditMonitoringEventSettings(intext, autoAudit, event);
        if (eventSettings) {
            if (!this.getValue(sub + "Functionality")) return false;
            return eventSettings[sub + "Settings"] || null;
        }
        return null;
    }

};

// DO THIS TO PREVENT ALL FORMS OF CYCLIC DEPENDENCIES WITHIN AUTO-API
var ModuleReferencer = {

    //////////////////////////////////////////////////////////////////////////////////////////////
    // funct: ServerFunctions, // ref.funct
    get funct() {
        return this.ServerFunctions();
    },
    //////////////////////////////////////////////////////////////////////////////////////////////
    // InternalAutoAuditingFunct: this.sth, // ref.InternalAutoAuditingFunct,
    get InternalAutoAuditingFunct() {
        return this.InternalAutoAuditingFunctions();
    },
    //////////////////////////////////////////////////////////////////////////////////////////////
    // fileHandler: this.sth, // ref.fileHandler,
    // get fileHandler () { return this.FileSystemFunctions(); }, 
    // dataHandler: this.sth, // ref.dataHandler,
    // get dataHandler () { return this.DatabaseSystemFunctions(); },
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // auth: AuthService, // ref.auth,
    get auth() {
        return this.AuthService();
    },
    // config: ConfigEnvironment, // ref.config,
    get config() {
        return this.ConfigEnvironment();
    },
    // settings: ConfigSettings, // ref.settings,
    get settings() {
        return this.ConfigSettings();
    },
    // errors: Errors, // ref.errors,
    get errors() {
        return this.Errors;
    },
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // AutoSecurityFunct: this.sth, // ref.AutoSecurityFunct,
    get AutoSecurityFunct() {
        return this.AutoSecurityFunctions();
    },
    // // AutoAuditingFunct: this.sth, // ref.AutoAuditingFunct,
    // get AutoAuditingFunct () { return this.AutoAuditingFunctions(); }, 
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // AutoFunct: this.sth, // ref.AutoFunct,
    // get AutoFunct () { return this.AutoFunctions; }, 
    // // AutoChatFunct: this.sth, // ref.AutoChatFunct,
    // get AutoChatFunct () { return this.AutoChatFunctions; }, 
    // // AutoFinanceFunct: this.sth, // ref.AutoFinanceFunct,
    // get AutoFinanceFunct () { return this.AutoFinanceFunctions; },
    // //////////////////////////////////////////////////////////////////////////////////////////////
    // //////////////////////////////////////////////////////////////////////////////////////////////
    // // PublicFunct: PublicFunctions, // ref.PublicFunct,
    // get PublicFunct () { return this.PublicFunctions(); },
    // // AutoRecruitingFunct: this.sth, // ref.AutoRecruitingFunct,
    // get AutoRecruitingFunct () { return this.AutoRecruitingFunctions; }, 
    // // AutoMarketingFunct: this.sth, // ref.AutoMarketingFunct,
    // get AutoMarketingFunct () { return this.AutoMarketingFunctions; }, 
    // // AutoInvestmentFunct: this.sth, // ref.AutoInvestmentFunct,
    // get AutoInvestmentFunct () { return this.AutoInvestmentFunctions; }, 

    Errors: {
        404: function pageNotFound(req, res) {
            var viewFilePath = '404';
            var statusCode = 404;
            var result = {
                status: statusCode
            };

            res.status(result.status);
            res.render(viewFilePath, function (err) {
                if (err) {
                    return res.status(result.status).json(result); // DEPRECATED -> res.json(result, result.status);
                }

                res.render(viewFilePath);
            });
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////            ACTUAL SERVER FUNCTIONS

    ServerFunctions: function () {

        var config = this.config;
        var auth = this.auth;

        var Funct = {

            sendResponse: function (res, status, data) {
                return sendResponse(res, status, data);
            },

            markModified: function (data, newdata) {
                return markModified(data, newdata);
            },

            globalMarkModified: function (type, deepPop, data) {
                globalMarkModified(type, deepPop, data);
            },

            getUsersInvolved: function (obj) {
                return []; // userempclientstakefunct.getUsersInvolved(obj);
            },

            handleCheckSchedule: function (type, obj) {
                return "success";
            },

            handleAutoCheckSchedule: function (type, obj) {
                return "success";
            },

            /////////////////////////////////////////////////////////////////////////////////////////////////
            ////    DATABASE SYSTEM FUNCTIONS

            encryptData: function (type, schema) {
                return schema;
            },
            decryptData: function (type, schema) {
                return schema;
            },

            // EXTRA FUNCTIONS

            migrateAllData: function (from, to) {
                return true;
            },

            saveFile: function (data, filename, domain, filetype) {
                return true;
            },

            deleteFile: function (filename, domain, filetype) {
                return true;
            },

            /////////////////////////////////////////////////////////////////////////////////////////////////
            ////    AUTO-SECURITY FUNCTIONS

            getDataSecurityObject: function (type, obj) {
                return null;
            },

            deleteDataSecurityObject: function (type, obj) {
                return true;
            },

            ////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////
            //////////////////////////  SERVER FUNCTIONS

            getUserData: function (userModel) {
                console.log("GETTING USER MODEL -> " + Object.keys(userModel));
                return compose()
                    .use(auth.isAuthenticated()) // NOW GET USER AND COMPANY DATA
                    .use(async function getUser(req, res, next) {
                        try {
                            // if (!req.params.companyId) throw new Error('Company Id needs to be set');
                            var typeModel = userModel; // "user"; 
                            console.log("USER ID -> " + req.user._id);
                            var result = await modelscontrollersHandler.get(typeModel, req.user._id);
                            if (result.code !== 200) return sendResponse(res, result.code, result.resultData);
                            var user = result.resultData;

                            // typeModel = companyModel; // "company";
                            // var result = await modelscontrollersHandler.get(typeModel, req.params.companyId);
                            // if(result.code !== 200) return sendResponse(res, result.code, result.resultData);
                            // var company = result.resultData;
                            // SIGN ANOTHER ACCESS TOKEN

                            // GET SETTINGS & MORE DATA BASED ON THE USER-TYPE

                            var token = "EMPTY ACCESS TOKEN FOR NOW, THEREFORE IGNORE !!!"; // auth.signToken(user._id, null);
                            return sendResponse(res, 200, { access_token: token, user: user, settings: {}, data: {} });
                        } catch (err) {
                            console.log("Some Error has occurred -> " + JSON.stringify(err));
                            return sendResponse(res, 404, { err: err, success: false, message: "Some error occurred" });
                        }
                    });
            },

            editUserData: function (userModel) {
                return compose()
                    .use(auth.isAuthenticated()) // NOW EDIT USER AND COMPANY DATA
                    .use(auth.isUserEditTokenAuthenticated()) // VALIDATE USER-EDIT ACCESS TOKEN
                    .use(async function editUser(req, res, next) {
                        try {
                            // if (!req.params.companyId) throw new Error('Company Id needs to be set');
                            var user = req.body.user // , company = req.body.company
                            if (user) { // if(user && company){ // VALIDATE userEditingAllowance & user PROPS WITH EDITABLE PROPS
                                // if(settings.getUserEditingAllowance()){
                                // var props = settings.getEditableUserProfileData();
                                // if(!props) return sendResponse(res, 403, {success: false, message: "User Editing not allowed"});
                                // Object.keys(user).forEach(function(prop, index){
                                //     if(!props.includes(prop))
                                //     return sendResponse(res, 404, {success: false,
                                //         message: "User Property " + prop + " Editing not allowed"});
                                // });
                                if (true) {
                                    // NOW CARRY ON WITH EDITING USER & COMPANY PROFILE DATA
                                    var userBool = false, companyBool = true, updateduser = null, updatedcompany = {},
                                        result = null;
                                    var typeModel = userModel; // "user";
                                    result = await modelscontrollersHandler.update(typeModel, req.user._id, user);
                                    if (result.code === 200) {
                                        updateduser = result.resultData;
                                        // if (updateduser.types && updateduser.types.length > 0) {
                                        //     updateduser = this.createUpdateUserWithTypes(updateduser);
                                        // } // NO NEED FOR THIS CODE ABOVE, COZ User HAS ONLY 1 .type
                                        userBool = true;
                                    }
                                    // typeModel = companyModel; // "company";
                                    // result = await modelscontrollersHandler.update(typeModel, req.params.companyId, company);
                                    // if(result.code === 200){
                                    //   updatedcompany = result.resultData;
                                    //   companyBool = true;
                                    // }
                                    if (updateduser && userBool) {
                                        // SIGN ANOTHER ACCESS TOKEN & BLACKLIST THE USER-EDIT ACCESS TOKEN (BUT THIS IS COMMENTED FOR NOW ..)
                                        // console.log("UNSIGNING OLD ACCESS-TOKEN -> " + auth.unsignToken(user._id, req.body.user_edit_access_token));
                                        var token = "EMPTY ACCESS TOKEN FOR NOW, THEREFORE IGNORE !!!"; // auth.signToken(updateduser._id, null);
                                        return sendResponse(res, 200, {
                                            access_token: token,
                                            user: updateduser,
                                            settings: {}, data: {} // EMPTY OBJECTS FOR NOW ..
                                        });
                                    } else return sendResponse(res, 404, {
                                        success: false,
                                        message: "User data could not be edited"
                                    });
                                } else return sendResponse(res, 404, {
                                    success: false,
                                    message: "User Editing not allowed"
                                });
                            } else return sendResponse(res, 404, { success: false, message: "No user data specified" });
                        } catch (err) {
                            console.log("Some Error has occurred -> " + JSON.stringify(err));
                            return sendResponse(res, 404, { err: err, success: false, message: "Some error occurred" });
                        }
                    });
            },

            createUpdateUserTypeWithUser: function (userType, obj) {
                return obj;
                // obj.is_user = obj.user && obj.user.hasOwnProperty("_id") && obj.user._id.length > 0;
                // if (obj.should_update_extra) obj = userempclientstakefunct.createUpdateWithExtra("user", obj, userType);
                // delete obj.should_update_extra; // THIS SHOULD BE INCLUDED IN THE ADD EDIT PAGES IN THE CLIENT APPS
                // return obj;
            },

            createUpdateUserWithTypes: function (user) {
                return user;
                // /* USE USER OBJECT'S .types PROPERTY TO DETERMINE WHICH USER TYPE OBJECT TO CREATE (emp/client/stakeholder)
                //  THEN ASSIGN THAT USER TYPE OBJECT'S ._id PROPERTY TO THE USER OBJECT'S CORRESPONDING USER TYPE PROPERTY (.employee / .client / .stakeholder)*/
                // for (let type of user.types) {
                //     switch (type) {
                //         case "Employee":
                //             user = userempclientstakefunct.createUpdateWithExtra("employee", user, "user");
                //             break;
                //         case "Client":
                //             user = userempclientstakefunct.createUpdateWithExtra("client", user, "user");
                //             break;
                //         case "Stake Holder":
                //             user = userempclientstakefunct.createUpdateWithExtra("stakeholder", user, "user");
                //             break;
                //     }
                //     if(!user) return null;
                // }
                // return user;
            },

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //  DASHBOARD LOGIN REQUIRED SERVER FUNCTIONS

            sendMessage: function (type) {
                if (!type) throw new Error('Type needs to be set');
                if (!['user', 'employee', 'client', 'stakeholder', 'bank', 'company', 'applicant', 'customer', 'investor'].includes(type))
                    throw new Error('Type needs to be set');
                return compose()
                    .use(auth.isAuthorized(['contact', type])) //
                    .use(async function send(req, res, next) {
                        try {
                            //  req.body must have all the 'contact message' data required
                            if (req.body && Object.keys(req.body).length > 0) {
                                if (!req.body.contact_methods) throw new Error('Contact Methods need to be set');
                                for (var cmeth of req.body.contact_methods) {
                                    if (!config.contactMethods.includes(cmeth)) throw new Error('Contact Methods need to be one of the methods specified in the settings.');
                                }
                                var contactBody = req.body;
                                for (var prop of [type, "contact_methods", "data"]) {
                                    if (!contactBody.hasOwnProperty(prop)) return sendResponse(res, 404, {
                                        success: false,
                                        message: prop + " data not specified"
                                    });
                                }
                                for (var prop of ["subject", "message", "extra"]) {
                                    if (!contactBody.data.hasOwnProperty(prop)) return sendResponse(res, 404, {
                                        success: false,
                                        message: prop + " data not specified"
                                    });
                                }
                                /*
                                 // MAKE SURE THAT contactBody HAS ALL THESE PROPERTIES BEFORE CALLING THIS FUNCTION
                                 // PROPERTIES: .subject .message .extra { .autoEnum .dataId (& special extra) };
                                 var extra = {}; // FIND A WAY TO FILL THIS JSON OBJECT FOR ALL POSSIBLE CONTACT METHODS AVAILABLE
                                 var contactBody = {
                                 contact_methods: contactMethods,
                                 data: {
                                 subject: subject, message: message,
                                 extra: {
                                 autoEnum: type, dataId: obj._id, // THIS WON'T BE NECESSARY HERE THOUGH, COZ THIS IS A DIRECT CONTACT ACTION
                                 "Notification": extra[""] || {
                                 notificationType: null, send_after: null, delayed_option: null, delivery_time_of_day: null,
                                 segments: null, player_ids: null, include_player_ids: null, send_after: null, send_after: null,
                                 },
                                 "SMS": extra["SMS"] || {  },
                                 "Email": extra["Email"] || { template: null, context: null },
                                 "Company Email": extra["Company Email"] || { template: null, context: null },
                                 "USSD": extra["USSD"] || {  },
                                 "Post Mail": extra["Post Mail"] || {  }
                                 }
                                 }
                                 };
                                 // THESE MIGHT BE RECIPIENT OBJECTS / MIGHT JUST BE IDs
                                 contactBody[recipientsData.type] = recipientsData.recipients;
                                 // type is either user/employee/client/stakeholder/bank/company
                                 return this.contact(recipientsData.type, contactBody, false);
                                 */
                                //  YOU CAN CALL this.contact BUT COZ THIS IS INSIDE A SEPARATE FUNCTION'S "send()" CONTEXT, IT WON'T WORK
                                var result = await contact(type, contactBody, false);
                                return sendResponse(res, result.code, result.resultData);
                            } else return sendResponse(res, 404, {
                                success: false,
                                message: "Contact Data not specified"
                            });

                        } catch (err) {
                            console.log("Some Error has occurred -> " + JSON.stringify(err));
                            return sendResponse(res, 404, { err: err, success: false, message: "Some error occurred" });
                        }
                    });
            },

            contact: async function (type, body, defaultCmeth) {
                return await contact(type, body, defaultCmeth);
            }
        };

        return Funct;
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////            DATABASE SYSTEM FUNCTIONS

    DatabaseSystemFunctions: function () {

    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////            FILE SYSTEM FUNCTIONS

    FileSystemFunctions: function () {

    },


    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////            INTERNAL AUTO-AUDITING FUNCTIONS

    InternalAutoAuditingFunctions: function () {

        var AutoSecurityFunct = this.AutoSecurityFunct;
        var config = this.config;

        var InternalAutoAuditingFunct = {

            handleAutoAuditError: function (err) {
                console.log("THE AUTOAUDIT ENDED");
                console.log("AUTOAUDIT ERROR -> " + JSON.stringify(err));
                console.log("AUTOAUDIT ERROR -> " + err);
            },

            handleAutoAuditResult: function (auditResult) {
                console.log("THE AUTOAUDIT ENDED");
                if (auditResult.code === 200) {
                    console.log("Audit successful");
                    console.log(auditResult);
                    return true;
                } else {
                    console.log("Audit unsuccessful");
                    console.log(auditResult);
                    return false;
                }
            },

            isAuditActive: async function (audit) {
                return new Promise((resolve, reject) => {
                    var res = settings.getAutoAuditMonitoringSettings("Internal", audit);
                    if ((res && res.active) === true) resolve(null); // YOU DON'T REALLY NEED TO RESOLVE ANY DATA SEF :)
                    else reject({ code: 404, resultData: { success: false, message: audit + " audit not active" } })
                });
            },

            // ALL THESE FUNCTIONS HAVE NO DEFINITE ORDER, THEREFORE WILL LOOK A BIT CONFUSING 

            //////////////////////////////////////////////////////////////////////////////////
            ///////////////  SESSION TRACKING
            //////////////////////////////////////////////////////////////////////////////////

            //  AUTOAUDITS - AUTOLOGS (3 STAGE PROCESS)
            sendGeoSpatialMonitoringAutoAudit: async function () {
                var _this = this;

                try {
                    await this.isAuditActive("Geo-Spatial Monitoring");

                    var autoaudit = "Geo-Spatial Monitoring",
                        autoauditData = {
                            "geo": {},
                            "timestamp": Date.now()
                        };

                    // var auditResult = await AutoSecurityFunct.sendAutoAudit(autoaudit, autoauditData);
                    // NOW, WORK WITH auditResult HOWEVER YOU WANT
                    // return this.handleAutoAuditResult(auditResult);

                    //
                    const options = {
                        url: config.AutoAPIURL + "api/autosecurity/autoauditing/autoaudits/autologs/" + "Internal/Auto-API" + "/" + autoaudit,
                        method: 'POST',
                        host: config.AutoAPIURL,
                        port: config.port,
                        path: "",
                        headers: {},
                        body: autoauditData,
                        json: true,
                    };
                    console.log("OPTIONS -> " + JSON.stringify(options));
                    request(options, function (error, response, body) {
                        if (error) {
                            console.log("Error", error);
                            // DO NOTHING ELSE FOR NOW
                            this.handleAutoAuditError(error);
                        } else if (body) {
                            console.log("Response: ", JSON.stringify(body));
                            // DO NOTHING ELSE FOR NOW
                            return _this.handleAutoAuditResult({ code: 200, resultData: body });
                        }
                    });

                } catch (err) {
                    this.handleAutoAuditError(err);
                }
            },

            sendStockMarketMonitoringAutoAudit: async function (stock) {
                var _this = this;

                try {
                    await this.isAuditActive("Stock Market Monitoring");

                    var autoaudit = "Stock Market Monitoring",
                        autoauditData = {
                            "stock": {
                                "_id": stock._id || "",
                                "stock_name": stock.stock_name || "",
                                "price": stock.price || ""
                            },
                            "timestamp": Date.now()
                        };

                    // var auditResult = await AutoSecurityFunct.sendAutoAudit(autoaudit, autoauditData);
                    // NOW, WORK WITH auditResult HOWEVER YOU WANT
                    // return this.handleAutoAuditResult(auditResult);

                    //
                    const options = {
                        url: config.AutoAPIURL + "api/autosecurity/autoauditing/autoaudits/autologs/" + "Internal/Auto-API" + "/" + autoaudit,
                        method: 'POST',
                        host: config.AutoAPIURL,
                        port: config.port,
                        path: "",
                        headers: {},
                        body: autoauditData,
                        json: true,
                    };
                    console.log("OPTIONS -> " + JSON.stringify(options));
                    request(options, function (error, response, body) {
                        if (error) {
                            console.log("Error", error);
                            // DO NOTHING ELSE FOR NOW
                            this.handleAutoAuditError(error);
                        } else if (body) {
                            console.log("Response: ", JSON.stringify(body));
                            // DO NOTHING ELSE FOR NOW
                            return _this.handleAutoAuditResult({ code: 200, resultData: body });
                        }
                    });

                } catch (err) {
                    this.handleAutoAuditError(err);
                }
            },

            sendSessionTrackingAutoAudit: async function (user, token, device, login) { // NOW, USE USER ID TO SEND AUTOAUDIT TO AUTO-API
                try {
                    await this.isAuditActive("Session Tracking");

                    device = {};

                    var autoaudit = "Session Tracking",
                        autoauditData = {
                            "user": {
                                "_id": user._id || "",
                                "full_name": user.full_name || ""
                            },
                            "access_token": {
                                "token": token,
                                "expiresInMinutes": oldConfig.tokenExpiration
                            },
                            "device": {
                                id: "", // device._id ||  FIND A WAY TO SET THIS PROPERTY RIGHT HERE
                            },
                            "login": login,
                            "logout": !login,
                            "timestamp": Date.now()
                        };

                    var auditResult = await AutoSecurityFunct.sendAutoAudit(autoaudit, autoauditData);
                    // NOW, WORK WITH auditResult HOWEVER YOU WANT
                    return this.handleAutoAuditResult(auditResult);
                } catch (err) {
                    this.handleAutoAuditError(err);
                }
            },

            /* // YOU CAN USE THIS WAY WHEN YOU GET TOO MANY FUNCTIONS HERE, ALL SENDING AUTO-AUDITS
             sendSessionTrackingAutoAudit: async function (user, token, device, login) { // NOW, USE USER ID TO SEND AUTOAUDIT TO AUTO-API
             device = {};
             var autoaudit = "Session Tracking",
             autoauditData = {
             "user": {
             "_id": user._id || "",
             "full_name": user.full_name || ""
             },
             "access_token": {
             "token": token,
             "expiresInMinutes": oldConfig.tokenExpiration
             },
             "device": {
             id: "", // device._id ||  FIND A WAY TO SET THIS PROPERTY RIGHT HERE
             },
             "login": login,
             "logout": !login,
             "timestamp": Date.now()
             };
             return this.sendAutoAudit(autoaudit, autoauditData);
             },

             sendAutoAudit(autoaudit, autoauditData){
             try {
             await this.isAuditActive(autoaudit);
             var autoaudit = autoaudit, autoauditData = autoauditData;
             //
             var auditResult = await AutoSecurityFunct.sendAutoAudit(autoaudit, autoauditData);
             // NOW, WORK WITH auditResult HOWEVER YOU WANT
             return this.handleAutoAuditResult(auditResult);
             } catch (err) {
             this.handleAutoAuditError(err);
             }
             },
             */

            // //  AUTOEVENTS - STRAIGHT AWAY (2 STAGE PROCESS)
            // validateIoTDeviceAutoAudit: async function(user, token, device){
            //     try { // USE USER ID TO SEND AUTOAUDIT TO AUTO-API
            //         var autoaudit = "Session Tracking", autoevent = "Unrecognized Device", 
            //         eLvl = "default"; // FIND A WAY TO FIND THIS RIGHT HERE
            //         autoauditData = {
            //             "user": {
            //                 "_id": user._id || "",
            //                 "full_name": user.full_name || ""
            //             },
            //             "access_token": {
            //             "token": token,
            //             "expiresInMinutes": oldConfig.tokenExpiration
            //             },
            //             "device": {
            //                 id : "", // device._id ||  FIND A WAY TO SET THIS PROPERTY RIGHT HERE
            //             },
            //             "timestamp": Date.now()
            //         }; 


            //         var auditResult = await AutoSecurityFunct.sendAutoEventStraightAway(autoaudit, autoevent, eLvl, autoeventData);

            //         // NOW, WORK WITH auditResult HOWEVER YOU WANT
            //         if(this.handleAutoAuditResult(auditResult)){
            //             // CHECK IF HANDLERS SPECIFIED INCLUDE DENYING THE USER AN ACCESS TOKEN (IN CASE THIS WAS A LOGIN)
            //             return {/* RETURN IoT DEVICE OBJECT RIGHT HERE */};
            //         }
            //         return false;
            //     } catch (err) {
            //         this.handleAutoAuditError(err);
            //     }
            // },

        };

        return InternalAutoAuditingFunct;
    },


    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////            AUTHENTICATION - SERVICE FUNCTIONS

    AuthService: function () {

        var validateJwt = expressJwt({ secret: oldConfig.secrets.session }); // automan-secret
        var device = null; // JUST IN CASE THIS SHIT IS CALLED SOMEWHERE BY MISTAKE (FOR VALIDATING IoT DEVICES - validateIoTDevice())

        var AutoSecurityFunct = this.AutoSecurityFunct;
        var InternalAutoAuditingFunct = this.InternalAutoAuditingFunct;

        var auth = {

            /**
             * Attaches the user object to the request if authenticated
             * Otherwise returns 403
             */
            isAuthenticationAllowed: function (authOption, dashboard = false) { // FIGURE OUT MORE AUTH OPTIONS
                if (!["local"].includes(authOption)) throw new Error("INCORRECT AUTHENTICATION OPTION")
                return compose()
                    // Validate jwt
                    .use(function checkAuthenticationAllowed(req, res, next) {
                        // allow access_token to be passed through query parameter as well
                        next();
                    });
            },

            handleExtraAuthentication: function (req, res, next) {
                // HANDLE COMPANY REGISTERED NAME, DEVICE IDs, ETC HERE
                if (req.body.companyRegisteredName) delete req.body.companyRegisteredName;
                if (req.extraAuthenticationData) {
                    req.extraAuthenticationData = null; // ATTACH ALL EXTRA AUTH DATA HERE - COMPANY, DEVICE, etc
                    delete req.extraAuthenticationData;
                }
                next(); //  RETURN THIS IN CASE OF ANY AUTH ERROR WITH THE CORRESPONDING extraAuth
                // sendResponse(res, 400, {success : false, message : extraAuth + " not authorized"})
            },

            // isAuthenticated : function () {
            //     return compose()
            //         .use(function(req, res, next){
            //             next(); // THIS SHOULD BE REMOVED TO FUNCTION PROPERLY
            //         });
            // },

            isAuthenticated: function () {
                return compose()
                    // Validate jwt 
                    .use(function validateAccessToken(req, res, next) {
                        // allow access_token to be passed through query parameter as well
                        var aToken = "";
                        if (req.query && req.query.hasOwnProperty('access_token')) {
                            console.error("the access_token on query ", req.query.access_token);
                            req.headers.authorization = 'Bearer ' + req.query.access_token;
                            aToken = req.query.access_token;
                            if (req.query.access_token) {
                                delete req.query['access_token']
                            } // BY NOW THE .access_token PROP OF req.query SHOULD BE GONE
                        } else if (req.headers.authorization) {
                            // console.log("NO ACCESS TOKEN IN QUERY, BUT IT'S IN Authorization HEADER")
                            aToken = req.headers.authorization;
                        }
                        req.access_token = aToken; // ATTACH TOKEN TO REQUEST OBJECT
                        validateJwt(req, res, next);
                    })
                    // Attach user to request
                    .use(function attachUserToRequestAndUpdateLocation(req, res, next) {
                        console.log("FOUND USER : "); // THIS ISN'T THE WHOLE USER OBJECT THO
                        console.log(JSON.stringify(req.user)); // SO FIND THE WHOLE OBJECT AND ATTACH TO REQUEST
                        var M = { Model: getModel("user") }; // WILL NOT INCLUDE validate & OTHER FUNCTIONS WITHIN .model.js FILE
                        // var M = getModel("user");
                        M.Model.findById(req.user._id, '-salt -hashedPassword', function (err, user) {
                            if (err) return next(err);
                            if (!user) return sendResponse(res, 401, { success: false, message: "User not found" });
                            // //  UPDATE USER LOCATION IF AVAILABLE
                            // if (req.query && req.query.hasOwnProperty('location')) {
                            //     var updated = markModified(user, {location: req.query['location']});
                            //     updated.save(function (err) {
                            //         if (err) return sendResponse(res, 500, err);
                            //         console.log('updated obj: ' + JSON.stringify(updated));
                            //         delete req.query['location'];
                            //         return sendResponse(res, 200, updated);
                            //     });
                            // }
                            req.user = user;
                            console.log("Token -> " + req.access_token);
                            console.log("User -> " + req.user.full_name); // req.user FILLS UP CLI
                            next();
                        });
                    })
                    .use(async function checkIfAccessTokenIsBlackListed(req, res, next) {
                        try { // THIS FUNCTION RETURNS TRUE OR FALSE ALREADY (NO NEED FOR result.code === 200 :)
                            next(); //  USE THIS TO SKIP THIS AUTHENTICATION FUNCTION
                            // if (await AutoSecurityFunct.checkIfAccessTokenIsBlackListed(req.access_token, req.user))
                            //     return sendResponse(res, 400, {
                            //         success: false,
                            //         message: "This User's Access Token is blacklisted"
                            //     });
                            // else next();
                        } catch (err) {
                            console.log(err);
                            // RETURN next() FOR NOW, COZ SOMETIMES API MIGHT NOT FIND AutoAuditingFunctions.js
                            // (DUE TO CYCLIC-DEPENDENCY) eg. /api/autosecurity/autoauditing/autologs/handle/:id
                            next(); // AutoSecurityFunct.autoAuditingFunct.autoauditEventHandlerFunct.eventHelperfunct
                            // return sendResponse(res, 400, {err: err, success: false, message: "Some error occurred"});
                        }
                    })
                    ;
            },

            isAuthorized: function isAuthorized(sth) { // sth SHOULD BE A VARIATIC PARAMETER
                if (!sth) throw new Error('Some specification needs to be set');
                return compose()
                    .use(this.isAuthenticated())
                    .use(function isAuthorized(req, res, next) {
                        // THIS IS WHERE ARE AUTO-SECURITY AUTO-AUTHORIZATION LOGIC LIES ..
                        next();
                    });
            },

            signTokenForUserEditing: function signTokenForUserEditing(id) {
                return jwt.sign({ _id: id }, oldConfig.secrets.session, { expiresIn: oldConfig.userEditTokenExpiration });
            },

            isUserEditTokenAuthenticated: function isUserEditTokenAuthenticated() {
                return compose()
                    // Validate jwt
                    .use(function validateAccessToken(req, res, next) {
                        if (!req.body.user_edit_access_token) req.body.user_edit_access_token = "DEFAULT USER-EDIT ACCESSTOKEN TOKEN";
                        next();
                    });
            },

            /**
             * Returns a jwt token signed by the app secret
             */
            signToken: function signToken(user, role) {
                var token = jwt.sign({ _id: user._id }, oldConfig.secrets.session, { expiresIn: oldConfig.tokenExpiration });
                try {
                    // FIRST, VALIDATE DEVICE TO BE SURE THAT THIS DEVICE IS RECOGNIZED

                    // var result = InternalAutoAuditingFunct.sendSessionTrackingAutoAudit(user, token, null, true);
                    // WORK WITH result HOWEVER YOU WANT BUT MUST BE AWAITED FIRST
                    // SHOULD YOU CHOOSE TO AWAIT THIS, YOU MUST EDIT sendSessionTrackingAutoAudit() TO RETURN A PROMISE
                } catch (err) {
                    console.log("FINAL ERROR -> " + err);
                }
                return token; // DO THIS SO NO MATTER WHAT YOU'LL RETURN A TOKEN
            },

            /**
             * Removes a jwt token signed by the app secret
             */
            unsignToken: async function unsignToken(user, token) {
                return new Promise(async (resolve, reject) => {
                    try {
                        // if(!validateIoTDevice(user, token, null)) resolve(false);
                        // NOW, USE USER ID TO SEND AUTOAUDIT TO AUTO-API
                        // if (await AutoSecurityFunct.blackListAccessTokens(user, [token])) {
                        //     console.log("TOKEN BLACKLISTED, SENDING AUTOAUDIT FOR LOGOUT ..")
                        //     var result = InternalAutoAuditingFunct.sendSessionTrackingAutoAudit(user, token, null, false);
                        //     // WORK WITH result HOWEVER YOU WANT BUT MUST BE AWAITED FIRST
                        //     // SHOULD YOU CHOOSE TO AWAIT THIS, YOU MUST EDIT sendSessionTrackingAutoAudit() TO RETURN A PROMISE
                        //     resolve(true);
                        // }
                        resolve(true);
                    } catch (err) {
                        console.log("FINAL ERROR -> " + err);
                        resolve(false);
                    }
                });
            },

            /**
             * Set token cookie directly for oAuth strategies
             */
            setTokenCookie: function setTokenCookie(req, res) {
                if (!req.user) return sendResponse(res, 404, {
                    success: false,
                    message: 'Something went wrong, please try again.'
                });
                var token = signToken(req.user, null);
                res.cookie('access_token', JSON.stringify(token));
                // FIND A WAY TO ATTACH .user & .company TO THE REQUEST OBJECT req
                return sendResponse(res, 200, { access_token: token, user: req.user, company: {} });
                // res.redirect('/');
            },

            isAuthorizedToGetMyData: function isAuthorizedToGetMyData(type) {

                return compose()
                    .use(function checkRequirements(req, res, next) {
                        // 1ST CHECK IF THE req.url EVEN CONTAINS type+"/my" IN THE FIRST PLACE ..
                        // req.originalUrl = /public/autoinvestment/properties/my
                        // req.path = /my
                        // req.baseUrl = /public/autoinvestment/properties
                        // THIS WON'T WORK -> type + "/my" <- COZ type IS IN SINGULAR (BUT req.originalUrl HAS IT'S PLURAL VERSION)
                        if (req.path && req.path === "/my") {
                            try { // CREATE QUERY BASED ON THIS MODEL'S SCHEMA, USING req.user._id
                                console.log("Getting user's own '" + type + "' data ..");
                                console.log("USER CALLING REQUEST -> " + req.user._id);
                                // FIND A WAY TO MAKE THESE RETRIEVABLE TYPES GENERIC

                                //  THIS SHOULD BE COMING FROM settings, & SHOULD BE DIFFERENT FOR THE DIFFERENT userTypes
                                let mydataTypes = ["project", "proposal", "account", "investment", "property", "portfolio"];

                                if (!mydataTypes.includes(type)) return sendResponse(res, 400, { success: false, message: type + ' data cannot be retrieved by this user' });
                                else { // ATTACH .condition TO req.query OBJECT
                                    console.log("CURRENT REQUEST QUERY -> " + JSON.stringify(req.query));
                                    let newCondition = {}, user = req.user;
                                    // "mydata": ["projects", "proposals", "accounts", "investments", "properties", "portfolios"],
                                    switch (type) {
                                        case "project":
                                            let key = "";
                                            if (user.type === "Employee") key = 'employees';
                                            else if (user.type === "Property Developer") key = 'property_developers';
                                            // else if(user.type === "Investor") key = "investors"; // <- NOT NEEDED FOR NOW ..
                                            // else // RUN SOME ERROR FUNCTION (IF REQUIRED)

                                             // FOR THIS, KEY MUST BE 'property_developers' WITHOUT '._id', FIND OUT WHY ..
                                            if (key.length > 0) newCondition = { [key]: user._id }; // { [key + '._id']: user._id };

                                            // THIS CONDITION WILL ONLY BE REQUIRED WHEN SCALING, WHEN AN Employee CAN ALSO BE A Property Developer FOR A SPECIFIC PROJECT
                                            // OR WHEN AN Investor NEEDS TO BE ACTIVELY MONITORING STATUS OF HIS/HER my.project (AS AN INVESTOR, WHETHER HE'S A PDev / Employee)
                                            // newCondition = { 
                                            //     $or: [
                                            //         { 'property_developers': user._id },
                                            //         { 'employees': user._id },
                                            //         // { 'investors': user._id }, // <- NOT NEEDED FOR NOW ..
                                            //     ]
                                            // };
                                            break;
                                        case "proposal":
                                            newCondition = { proposer: user._id };
                                            break;
                                        case "account":
                                            newCondition = { user: user._id };
                                            break;
                                        case "investment":
                                            newCondition = { investor: user._id };
                                            break;
                                        case "property": // FOR THIS, KEY MUST BE 'investors._id'
                                            newCondition = { 'investors._id': user._id }; // <- FIND OUT WHY ..
                                            break;
                                        case "portfolio":
                                            newCondition = {
                                                $or: [
                                                    { owner: user._id },
                                                    { 'investors._id': user._id },
                                                ]
                                            };
                                            break;
                                        default:
                                            break;
                                    }
                                    req.query.condition = Object.assign(req.query.condition || {}, newCondition);
                                    console.log("REQUEST QUERY CONDITION NOW -> " + JSON.stringify(req.query.condition));
                                    next();
                                }
                            } catch (err) { // RETURN THE REGULAR DATA, BUT LOG THE .err PROPERTY SO IT CAN BE HANDLED
                                console.log("Some error occured while retrieving mydata condition -> " + JSON.stringify(err));
                                return sendResponse(res, 400, { success: false, message: type + ' data cannot be retrieved' });
                            }
                        } else next();
                    });
            },

            isAuthorizedToGetData: function isAuthorizedToGetData(type, M) {
                if (!type) throw new Error('Some specification needs to be set');
                console.log("Getting " + type + " data");
                return compose()
                    .use(this.isAuthenticated()) // OR .use(this.isAuthorized(["get", type]))
                    .use(this.isAuthorizedToGetMyData(type))
                    .use(function checkRequirements(req, res, next) {
                        console.log("This user is authenticated");
                        var condition = (req.query.condition || {});

                        /*
                        try {
                            if (!condition.hasOwnProperty("_id")) // DO THIS COZ IF IT INCLUDES "_id", IT'LL REPLACE IT WITH ANOTHER QUOTES, MESSING UP THE CONDITION
                                condition = (condition || '').replace(/([a-zA-Z0-9$\.][^:,]*)(?=\s*:)/g, '"$1"').replace(/""/igm, '"');
                            condition = JSON.parse(condition || null);
                            console.log("the current condition is ", condition);
                        } catch (e) {
                            console.log('ERROR -> ', e);
                            return sendResponse(res, 401, { success: false, message: "Bad request condition" });
                        }
                        */

                        /// NOW WORK WITH condition TO DETERMINE THE LEVEL OF SECURITY REQUIRED
                        res.user = req.user; // THIS MIGHT NOT EVEN BE NECESSARY
                        res.type = type; // MAKE SURE YOU ASSIGN THIS VAR TO THE REQUEST

                        console.log("Getting " + type + " data for user '" + (req.user.full_name || req.user._id)
                            + "' (" + (req.user.type || "") + ") ..");

                        // IN CASE OF USER-TYPE FEATURE (req.user.type) RETURN ONLY THE DATA ACCESSIBLE TO THE USER
                        // eg. IF user.type === "Investor", user CAN ONLY RETRIEVE DATA RELATED TO user
                        // THEREFORE, USE A condition = { user(s): req.user._id } TO GET RELATED data

                        M = M || { Model: getModel(type) }; // WILL NOT INCLUDE validate & OTHER FUNCTIONS WITHIN .model.js FILE
                        M.Model.find(condition, M.dataToExclude || "")
                            .sort(M.sort || "")
                            .populate(M.deepPop || "")
                            // .deepPopulate(M.deepPop || "")
                            .exec(function (err, data) {
                                if (err) {
                                    console.log("Error -> " + err);
                                    return sendResponse(res, 403, {
                                        err: err,
                                        success: false,
                                        message: "Could not retrieve data",
                                        data: data || []
                                    });
                                } else if (!data) return sendResponse({
                                    code: 400,
                                    resultData: { success: false, message: type + ' objects do not exist' }
                                });
                                else { // EXECUTE THIS COMMENTED CODE BELOW IF NECESSARY
                                    // THEN CALL
                                    // res.data = data;
                                    // next();

                                    // IN CASE OF USER-TYPE FEATURE (req.user.type) RETURN ONLY THE DATA ACCESSIBLE TO THE USER
                                    // eg. IF user.type === "Investor", user CAN ONLY RETRIEVE DATA RELATED TO user

                                    return sendResponse(res, 200, data);
                                }
                            });
                    });
            },

            /////////////////////////////////////////////////////////////////////////////////////////
            // EXTRA AUTHORIZATION FUNCTIONS
            // THIS ISN'T REQUIRED, COZ IT'S ONLY USED WITHIN settings.controller.js FILE ITSELF
            userOremployeeCanEditSubSettings: function (settingsType, id, employee) {
                return true;
            },

        };

        return auth;
    },


    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////            CONFIG - ENVIRONMENT FUNCTIONS

    ConfigEnvironment: function () { // PUT ALL THE ENV VARIABLES THAT REQUIRE USING THE settings (AND ANY OTHER) FUNCTIONS
        // FIRST, GET THE WHOLE settings (ConfigSettings) OBJECT
        // IF THIS DOESN'T WORK, THEN JUST SEND THIS WHOLE ConfigEnvironment PROPERTY TO AFTER ModuleReferencer's OBJECT LITERAL DECLARATION
        // SENDING IT AFTER THE DECLARATION ALLOWS YOU TO ACCESS ModuleReferencer's settings PROPERTY EASILY
        // var settings = settings; // COZ, DOING IT LIKE THIS WON'T WORK SINCE get() CANNOT WORK WITHIN THE SAME OBJECT LITERAL (ONLY OUTSIDE)
        //  OR MAYBE YOU CAN ASSIGN A WHOLE SELF-CALLING FUNCTION (function(){}()) TO get settings(){} ACCESSOR UP THERE

        var newConfig = {

            get AutoAPIURL() { // ONLY ADD THE oldConfig.port IF THE IP IS localhost (SO NOT, WITHIN PRODUCTION :)
                var url = oldConfig.protocol + oldConfig.ip + (oldConfig.ip == "localhost" ? (":" + oldConfig.port) : "") + "/";
                return url;
            },

            // // THIS STUFF DOESN'T WORK, FIX IT NOWWW !!!!

            // // ONE SIGNAL STUFF
            // oneSignalAppID: settings.getValue("onesignal").app_id || process.env.ONESIGNAL_APP_ID || "P6z1ZM4ydxUl4KpMVhHOeCElr8pYiiKxml5ve72W",
            // oneSignalAPIKey: settings.getValue("onesignal").api_key || process.env.ONESIGNAL_API_KEY || "Ct5L2VHOvp2Ts3TXZY6lDlmCiagq9OcyuTeagn8i",
            // oneSignalMasterKey: settings.getValue("onesignal").master_key || process.env.ONESIGNAL_MASTER_KEY || "drfcxHMZVZq4N7VyigZrT6ycdTpcA20l6sHbPZFP",

            // // TWILIO STUFF
            // twilioAccountSID: settings.getValue("twilio").account_sid || process.env.TWILIO_ACCOUNT_SID || "AC382ac76f2538ba61af41b7519a45b62b",
            // twilioAuthToken: settings.getValue("twilio").auth_token || process.env.TWILIO_AUTHORIZATION_TOKEN || "f95b0532ae9a943214580eadea2054b3",

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //  MAIN COMPANY DETAILS
            get defaultCompanyId() {
                return "";
            }, // THIS PROPERTY MUST BE HARD CODED
            get companyName() {
                return "Cofundie";
            },
            get companyRegisteredName() {
                return "Cofundie";
            },
            get companyDetails() {
                return "Cofundie is a Real Estate Investment platform. \
                Our mission is to provide direct access to top notch & carefully analysed Real Estate deals.";
            },
            get companyEmail() {
                return "invest@cofundie.com";
            },
            get companyPhoneNumber() {
                return "+233 24 014 3392";
            },
            get companyHomeAddress() {
                return "19 Banana street, East Legon Accra, Ghana";
            },
            get companyLocation() {
                return "Accra - Ghana";
            },

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            _default_settings: settings.getThisCompanyDefaultSettings(),
            get default_settings() {
                return this._default_settings;
            },

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //////////////////////////////////////ENVIRONMENTAL VARIABLES////////////////////////////////////////////////////
            // data: settings.getValue("data") || function(){ return this.default_settings.AUTO_AUDITINGSettings.data; },
            // //
            // subSettings: settings.getValue("subSettingOptions") || function(){ return this.default_settings.AUTO_AUDITINGSettings.subSettingOptions; },
            // subSettingsDefault: settings.getValue("subSettingOptionsDefault") || function(){ return this.default_settings.AUTO_AUDITINGSettings.subSettingOptionsDefault; },
            //
            ///////////////////////////////////////////////////AUTO-AUDITING ENVIRONMENTAL VARIABLES/////////////////////////////////////////////////////
            // 


            //////////////////////////////////////////////////////////////////////////////////////////////
            //  AUTOMAN MAIN ENVIRONMENTAL VARIABLES


            get userDataDefault() {
                return settings.getValue("userDataDefault") || this.default_settings.AUTOMANSettings.userDataDefault;
            },
            get proposalDataDefault() {
                return settings.getValue("proposalDataDefault") || this.default_settings.AUTOMANSettings.proposalDataDefault;
            },
            get projectDataDefault() {
                return settings.getValue("projectDataDefault") || this.default_settings.AUTOMANSettings.projectDataDefault;
            },
            get messageDataDefault() {
                return settings.getValue("messageDataDefault") || this.default_settings.AUTOMANSettings.messageDataDefault;
            },
            // 
            get userTypes() {
                return settings.getValue("userTypeOptions") || this.default_settings.AUTOMANSettings.userTypeOptions;
            },
            get userTypesDefault() {
                return settings.getValue("userTypeOptionsDefault") || this.default_settings.AUTOMANSettings.userTypeOptionsDefault;
            },
            get userGenders() {
                return settings.getValue("userGenderOptions") || this.default_settings.AUTOMANSettings.userGenderOptions;
            },
            get userGendersDefault() {
                return settings.getValue("userGenderOptionsDefault") || this.default_settings.AUTOMANSettings.userGenderOptionsDefault;
            },
            get userNationalities() {
                return settings.getValue("userNationalityOptions") || this.default_settings.AUTOMANSettings.userNationalityOptions;
            },
            get userNationalitiesDefault() {
                return settings.getValue("userNationalityOptionsDefault") || this.default_settings.AUTOMANSettings.userNationalityOptionsDefault;
            },
            get userIdentifications() {
                return settings.getValue("userIdentificationOptions") || this.default_settings.AUTOMANSettings.userIdentificationOptions;
            },
            get userIdentificationsDefault() {
                return settings.getValue("userIdentificationOptionsDefault") || this.default_settings.AUTOMANSettings.userIdentificationOptionsDefault;
            },
            get recipientsTypes() {
                return settings.getValue("recipientsTypeOptions") || this.default_settings.AUTOMANSettings.recipientsTypeOptions;
            },
            get recipientsTypesDefault() {
                return settings.getValue("recipientsTypeOptionsDefault") || this.default_settings.AUTOMANSettings.recipientsTypeOptionsDefault;
            },
            get contactMethods() {
                return settings.getValue("contactMethodOptions") || this.default_settings.AUTOMANSettings.contactMethodOptions;
            },
            get contactMethodsDefault() {
                return settings.getValue("contactMethodOptionsDefault") || this.default_settings.AUTOMANSettings.contactMethodOptionsDefault;
            },
            get notificationTypes() {
                return settings.getValue("notificationTypeOptions") || this.default_settings.AUTOMANSettings.notificationTypeOptions;
            },
            get notificationTypesDefault() {
                return settings.getValue("notificationTypeOptionsDefault") || this.default_settings.AUTOMANSettings.notificationTypeOptionsDefault;
            },
            get messageTypes() {
                return settings.getValue("messageTypeOptions") || this.default_settings.AUTOMANSettings.messageTypeOptions;
            },
            get messageTypesDefault() {
                return settings.getValue("messageTypeOptionsDefault") || this.default_settings.AUTOMANSettings.messageTypeOptionsDefault;
            },
            get proposalTypes() {
                return settings.getValue("proposalTypeOptions") || this.default_settings.AUTOMANSettings.proposalTypeOptions;
            },
            get projectTypes() {
                return settings.getValue("projectTypeOptions") || this.default_settings.AUTOMANSettings.projectTypeOptions;
            },
            get projectTypesDefault() {
                return settings.getValue("projectTypeOptionsDefault") || this.default_settings.AUTOMANSettings.projectTypeOptionsDefault;
            },
            get projectStages() {
                return settings.getValue("projectStageOptions") || this.default_settings.AUTOMANSettings.projectStageOptions;
            },
            get projectStagesDefault() {
                return settings.getValue("projectStageOptionsDefault") || this.default_settings.AUTOMANSettings.projectStageOptionsDefault;
            },

            //////////////////////////////////////////////////////////////////////////////////////////////
            //  AUTO-WEBSITE ENVIRONMENTAL VARIABLES

            get postDataDefault() {
                return settings.getValue("postDataDefault") || this.default_settings.AUTO_WEBSITESettings.postDataDefault;
            },
            get prospectDataDefault() {
                return settings.getValue("prospectDataDefault") || this.default_settings.AUTO_WEBSITESettings.prospectDataDefault;
            },
            // 
            get prospectTypes() {
                return settings.getValue("prospectTypeOptions") || this.default_settings.AUTO_WEBSITESettings.prospectTypeOptions;
            },
            get prospectTypesDefault() {
                return settings.getValue("prospectTypeOptionsDefault") || this.default_settings.AUTO_WEBSITESettings.prospectTypeOptionsDefault;
            },

            //////////////////////////////////////////////////////////////////////////////////////////////
            //  AUTO-SECURITY ENVIRONMENTAL VARIABLES

            get userRoles() {
                return settings.getValue("userRoleOptions") || this.default_settings.AUTO_SECURITYSettings.userRoleOptions;
            },
            get userRolesDefault() {
                return settings.getValue("userRoleOptionsDefault") || this.default_settings.AUTO_SECURITYSettings.userRoleOptionsDefault;
            },
            get securityLevels() {
                return settings.getValue("securityLevelOptions") || this.default_settings.AUTO_SECURITYSettings.securityLevelOptions;
            },
            get securityLevelsDefault() {
                return settings.getValue("securityLevelOptionsDefault") || this.default_settings.AUTO_SECURITYSettings.securityLevelOptionsDefault;
            },

            //////////////////////////////////////////////////////////////////////////////////////////////
            //  AUTO-AUDITING ENVIRONMENTAL VARIABLES

            get autoaudits() {
                return settings.getValue("autoauditOptions") || this.default_settings.AUTO_AUDITINGSettings.autoauditOptions;
            },
            get autoauditsDefault() {
                return settings.getValue("autoauditOptionsDefault") || this.default_settings.AUTO_AUDITINGSettings.autoauditOptionsDefault;
            },
            //
            get autoauditTypes() {
                return settings.getValue("autoauditTypeOptions") || this.default_settings.AUTO_AUDITINGSettings.autoauditTypeOptions;
            },
            get autoauditTypesDefault() {
                return settings.getValue("autoauditTypeOptionsDefault") || this.default_settings.AUTO_AUDITINGSettings.autoauditTypeOptionsDefault;
            },
            //
            get autoauditSourceTypes() {
                return settings.getValue("autoauditSourceTypeOptions") || this.default_settings.AUTO_AUDITINGSettings.autoauditSourceTypeOptions;
            },
            get autoauditSourceTypesDefault() {
                return settings.getValue("autoauditSourceTypeOptionsDefault") || this.default_settings.AUTO_AUDITINGSettings.autoauditSourceTypeOptionsDefault;
            },
            //
            get autoauditSources() {
                return settings.getValue("autoauditSourceOptions") || this.default_settings.AUTO_AUDITINGSettings.autoauditSourceOptions;
            },
            get autoauditSourcesDefault() {
                return settings.getValue("autoauditSourceOptionsDefault") || this.default_settings.AUTO_AUDITINGSettings.autoauditSourceOptionsDefault;
            },
            //
            get autoauditEmergencyLevels() {
                return settings.getValue("autoauditEmergencyLevelOptions") || this.default_settings.AUTO_AUDITINGSettings.autoauditEmergencyLevelOptions;
            },
            get autoauditEmergencyLevelsDefault() {
                return settings.getValue("autoauditEmergencyLevelOptionsDefault") || this.default_settings.AUTO_AUDITINGSettings.autoauditEmergencyLevelOptionsDefault;
            },

            //////////////////////////////////////////////////////////////////////////////////////////////
            //  AUTO-PAY ENVIRONMENTAL VARIABLES

            get paymentMethods() {
                return settings.getValue("paymentMethodOptions") || this.default_settings.AUTO_PAYSettings.paymentMethodOptions;
            },
            get paymentMethodsDefault() {
                return settings.getValue("paymentMethodOptionsDefault") || this.default_settings.AUTO_PAYSettings.paymentMethodOptionsDefault;
            },
            get accountTypes() {
                return settings.getValue("accountTypeOptions") || this.default_settings.AUTO_PAYSettings.accountTypeOptions;
            },
            get accountTypesDefault() {
                return settings.getValue("accountTypeOptionsDefault") || this.default_settings.AUTO_PAYSettings.accountTypeOptionsDefault;
            },
            // 
            get accountDataDefault() {
                return settings.getValue("accountDataDefault") || this.default_settings.AUTO_PAYSettings.accountDataDefault;
            },
            get paymentDataDefault() {
                return settings.getValue("paymentDataDefault") || this.default_settings.AUTO_PAYSettings.paymentDataDefault;
            },

            //////////////////////////////////////////////////////////////////////////////////////////////
            //  AUTO-INVESTMENT ENVIRONMENTAL VARIABLES

            get waitlistDataDefault() {
                return settings.getValue("waitlistDataDefault") || this.default_settings.AUTO_INVESTMENTSettings.waitlistDataDefault;
            },
            get investmentDataDefault() {
                return settings.getValue("investmentDataDefault") || this.default_settings.AUTO_INVESTMENTSettings.investmentDataDefault;
            },
            get portfolioDataDefault() {
                return settings.getValue("portfolioDataDefault") || this.default_settings.AUTO_INVESTMENTSettings.portfolioDataDefault;
            },
            get assetDataDefault() {
                return settings.getValue("assetDataDefault") || this.default_settings.AUTO_INVESTMENTSettings.assetDataDefault;
            },
            get stockDataDefault() {
                return settings.getValue("stockDataDefault") || this.default_settings.AUTO_INVESTMENTSettings.stockDataDefault;
            },
            get propertyDataDefault() {
                return settings.getValue("propertyDataDefault") || this.default_settings.AUTO_INVESTMENTSettings.propertyDataDefault;
            },
            //
            get portfolioTypes() {
                return settings.getValue("portfolioTypeOptions") || this.default_settings.AUTO_INVESTMENTSettings.portfolioTypeOptions;
            },
            get portfolioTypesDefault() {
                return settings.getValue("portfolioTypeOptionsDefault") || this.default_settings.AUTO_INVESTMENTSettings.portfolioTypeOptionsDefault;
            },
            get assetTypes() {
                return settings.getValue("assetTypeOptions") || this.default_settings.AUTO_INVESTMENTSettings.assetTypeOptions;
            },
            get assetTypesDefault() {
                return settings.getValue("assetTypeOptionsDefault") || this.default_settings.AUTO_INVESTMENTSettings.assetTypeOptionsDefault;
            },
            get capitalStructures() {
                return settings.getValue("capitalStructureOptions") || this.default_settings.AUTO_INVESTMENTSettings.capitalStructureOptions;
            },
            get capitalStructuresDefault() {
                return settings.getValue("capitalStructureOptionsDefault") || this.default_settings.AUTO_INVESTMENTSettings.capitalStructureOptionsDefault;
            },
            get propertyTypes() {
                return settings.getValue("propertyTypeOptions") || this.default_settings.AUTO_INVESTMENTSettings.propertyTypeOptions;
            },
            get propertyTypesDefault() {
                return settings.getValue("propertyTypeOptionsDefault") || this.default_settings.AUTO_INVESTMENTSettings.propertyTypeOptionsDefault;
            },
            get propertyStages() {
                return settings.getValue("propertyStageOptions") || this.default_settings.AUTO_INVESTMENTSettings.propertyStageOptions;
            },
            get propertyStagesDefault() {
                return settings.getValue("propertyStageOptionsDefault") || this.default_settings.AUTO_INVESTMENTSettings.propertyStageOptionsDefault;
            },
            get propertyStatuses() {
                return settings.getValue("propertyStatusOptions") || this.default_settings.AUTO_INVESTMENTSettings.propertyStatusOptions;
            },
            get propertyStatusesDefault() {
                return settings.getValue("propertyStatusOptionsDefault") || this.default_settings.AUTO_INVESTMENTSettings.propertyStatusOptionsDefault;
            },
            get propertyInvestmentStrategys() {
                return settings.getValue("propertyInvestmentStrategyOptions") || this.default_settings.AUTO_INVESTMENTSettings.propertyInvestmentStrategyOptions;
            },
            get propertyInvestmentStrategysDefault() {
                return settings.getValue("propertyInvestmentStrategyOptionsDefault") || this.default_settings.AUTO_INVESTMENTSettings.propertyInvestmentStrategyOptionsDefault;
            },
            get stockNames() {
                return settings.getValue("stockNameOptions") || this.default_settings.AUTO_INVESTMENTSettings.stockNameOptions;
            },
            get stockNamesDefault() {
                return settings.getValue("stockNameOptionsDefault") || this.default_settings.AUTO_INVESTMENTSettings.stockNameOptionsDefault;
            },

            //////////////////////////////////////////////////////////////////////////////////////////////
            //  AUTO-RESEARCH ENVIRONMENTAL VARIABLES

            get researchDesignDataDefault() {
                return settings.getValue("researchDesignDataDefault") || this.default_settings.AUTO_RESEARCHSettings.researchDesignDataDefault;
            },
            get researchDataDataDefault() {
                return settings.getValue("researchDataDataDefault") || this.default_settings.AUTO_RESEARCHSettings.researchDataDataDefault;
            },
            get segmentationDataDefault() {
                return settings.getValue("segmentationDataDefault") || this.default_settings.AUTO_RESEARCHSettings.segmentationDataDefault;
            },
            get preferencesDataDefault() {
                return settings.getValue("preferencesDataDefault") || this.default_settings.AUTO_RESEARCHSettings.preferencesDataDefault;
            },
            // 
            get researchTypes() {
                return settings.getValue("researchTypeOptions") || this.default_settings.AUTO_RESEARCHSettings.researchTypeOptions;
            },
            get researchTypesDefault() {
                return settings.getValue("researchTypeOptionsDefault") || this.default_settings.AUTO_RESEARCHSettings.researchTypeOptionsDefault;
            },
            get researchStages() {
                return settings.getValue("researchStageOptions") || this.default_settings.AUTO_RESEARCHSettings.researchStageOptions;
            },
            get researchStagesDefault() {
                return settings.getValue("researchStageOptionsDefault") || this.default_settings.AUTO_RESEARCHSettings.researchStageOptionsDefault;
            },
            get researchMethods() {
                return settings.getValue("researchMethodOptions") || this.default_settings.AUTO_RESEARCHSettings.researchMethodOptions;
            },
            get researchMethodsDefault() {
                return settings.getValue("researchMethodOptionsDefault") || this.default_settings.AUTO_RESEARCHSettings.researchMethodOptionsDefault;
            },

            //////////////////////////////////////////////////////////////////////////////////////////////
            //  OTHER AUTOMAN ENVIRONMENTAL VARIABLES

            //

            ////////////////////////////////////////////////////////////////////////////////////////////
        };

        return Object.assign(oldConfig, newConfig); // COMBINE OLD WITH NEW ENV
    }, // LET THIS BE A FUNCTION THAT IS BEING CALLED RIGHT THIS VERY MOMENT


    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////            CONFIG - SETTINGS FUNCTIONS

    ConfigSettings: function () { // PUT ALL THE SETTINGS FUNCTIONS THAT REQUIRE USING THE config (AND ANY OTHER) PROPERTIES

        // FIRST, GET THE WHOLE config (ConfigEnvironment) OBJECT
        // IF THIS DOESN'T WORK, THEN JUST SEND THIS WHOLE ConfigSettings PROPERTY TO AFTER ModuleReferencer's OBJECT LITERAL DECLARATION
        // SENDING IT AFTER THE DECLARATION ALLOWS YOU TO ACCESS ModuleReferencer's settings PROPERTY EASILY
        //  OR MAYBE YOU CAN ASSIGN A WHOLE SELF-CALLING FUNCTION (function(){}()) TO get settings(){} ACCESSOR UP THERE
        // var config = this.config; // COZ, DOING IT LIKE THIS WON'T WORK SINCE get() CANNOT WORK WITHIN THE SAME OBJECT LITERAL (ONLY OUTSIDE)
        // ACTUALLY, DOING IT LIKE THIS UP HERE WILL CAUSE ANOTHER "IMPLICIT" CYCLIC DEPENDENCY BETWEEN this.ConfigSettings & this.ConfigEnvironment
        // BUT, HOWEVER!!! THE ONLY "CONFIG" STUFF YOU NEED WITHIN THIS FUNCTION ARE .settingsFile & .defaultSettingsFile
        // WHICH ARE BOTH WITHIN THE ACTUAL ./config/environment FILE, THEREFORE YOU DON'T EVEN NEED THE this.ConfigEnvironment "CONFIG"

        return settings;
    },


    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////            AUTO-SECURITY FUNCTIONS

    AutoSecurityFunctions: function () {

        // var mch = {
        //     getAll: function (type, condition) {
        //         return modelscontrollersHandler.getAll(type, condition);
        //     },

        //     get: function (type, id) {
        //         return modelscontrollersHandler.get(type, id);
        //     },

        //     add: function (type, body) {
        //         return modelscontrollersHandler.add(type, body);
        //     },

        //     update: function (type, id, obj) {
        //         return modelscontrollersHandler.update(type, id, obj);
        //     },

        //     delete: function (type, id) {
        //         return modelscontrollersHandler.delete(type, id);
        //     },
        // };

        // // PASS WHATEVER MODULES IT MIGHT REQUIRE
        // autoAuditingFunct = autoAuditingFunct.init(settings, mch); // OR PERHAPS JUST PASS IN this.AutoSecurityFunct.modelscontrollersHandler
        //     // (COZ THAT'S REALLY ALL WHAT AutoAuditingFunctions.bower_components ACTUALLY REQUIRES FROM functions.bower_components)

        var autoAuditingFunct = require('./config/AUTO_SECURITY/AUTO_AUDITING/AutoAuditingFunctions');

        var AutoSecurityFunct = {

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///     MODEL HANDLERS (MOSTLY FOR SECURITY MODELS eg. - DATASECURITY)
            // modelscontrollersHandler: mch,

            intext: "Internal",
            source: "Auto-API",

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///     AUTO-AUDITING FUNCTIONS

            sortBulkData: function (bulkData) {
                return autoAuditingFunct.sortBulkData(bulkData); // FIND A WAY TO SORT ALL THIS DATA
            },

            sendAutoEventStraightAway: async function (autoaudit, autoevent, emergencyLvl, data) {
                return new Promise(async (resolve, reject) => {
                    try {
                        if (!autoaudit || !autoevent || !emergencyLvl || !data || !extra) reject(false);
                        var extra = {
                            source: this.source,
                            autoaudit: autoaudit,
                            autoevent: autoevent,
                            emergency_level: emergencyLvl
                        };
                        // // source PARAM IS this.source
                        if (!data || !extra) reject(false);
                        if (!extra.hasOwnProperty("source")) extra.source = this.source;
                        if (!extra.hasOwnProperty("autoaudit")) reject(false);
                        if (!extra.hasOwnProperty("autoevent")) reject(false);
                        if (!extra.hasOwnProperty("emergency_level")) reject(false);
                        if (!["Internal", "External"].includes(this.intext)) reject(false);
                        resolve(await autoAuditingFunct.handleAutoEventStraightAway(this.intext, data, extra));
                    } catch (err) {
                        console.log("ERROR -> " + JSON.stringify(err));
                        reject(err);
                    }
                });
            },

            sendAutoEventsStraightAway: async function (data) {
                return new Promise((resolve, reject) => {
                    try {
                        if (!data) reject(false);
                        //
                        if ((data instanceof Array) && (data.length > 0)) {
                            data = this.sortBulkData(body);
                            var extra, extraData, result;
                            data.forEach(function (body, index) {
                                console.log(index + " : " + body);
                                extra = body.params;
                                if (!extra.hasOwnProperty("source")) extra.source = this.source;
                                if (!extra.hasOwnProperty("autoaudit")) reject(false);
                                if (!extra.hasOwnProperty("autoevent")) reject(false);
                                if (!extra.hasOwnProperty("emergency_level")) reject(false);
                                if (!["Internal", "External"].includes(this.intext)) reject(false);
                                extraData = {
                                    source: extra.source,
                                    autoaudit: extra.autoaudit,
                                    autoevent: extra.autoevent,
                                    emergency_level: extra.emergencyLvl
                                };
                                result = autoAuditingFunct.handleAutoAudit(this.intext, body.data, extraData);
                                // FIND A WAY TO HANDLE ALL AUTO-AUDITS SUCCESSFULLY,
                                // WITHOUT HAVING TO QUIT EVERYTHING ON THE FIRST NEGATIVE RESULT
                            });
                            // resolve({code: result.code, resultData: result.resultData});
                            resolve({ code: 200, resultData: { success: true, message: "Events processed successfully" } });
                        } else reject(false);
                    } catch (err) {
                        console.log("ERROR -> " + JSON.stringify(err));
                        reject(err);
                    }
                });
            },

            sendAutoAudit: async function (autoaudit, data) { // FROM THE SEQUENTIAL FLOW / BACKGROUND TASK
                return new Promise(async (resolve, reject) => {
                    try {
                        if (!data || !autoaudit) reject(false);
                        var extra = {
                            source: this.source,
                            autoaudit: autoaudit
                        };
                        //
                        if (!data || !extra) reject(false);
                        if (!extra.hasOwnProperty("source")) extra.source = this.source;
                        if (!extra.hasOwnProperty("autoaudit")) reject(false);
                        if (!["Internal", "External"].includes(this.intext)) reject(false);
                        resolve(await autoAuditingFunct.handleAutoAudit(this.intext, data, extra));
                    } catch (err) {
                        console.log("ERROR -> " + JSON.stringify(err));
                        reject(err);
                    }
                });
            },

            sendAutoAudits: async function (data) {
                return new Promise((resolve, reject) => {
                    try {
                        if (!data) reject(false);
                        //
                        if ((data instanceof Array) && (data.length > 0)) {
                            data = this.sortBulkData(body);
                            var extra, extraData, result;
                            data.forEach(function (body, index) {
                                console.log(index + " : " + body);
                                extra = body.params;
                                if (!extra.hasOwnProperty("autoaudit")) reject(false);
                                if (!extra.hasOwnProperty("source")) extra.source = this.source;
                                if (!["Internal", "External"].includes(this.intext)) reject(false);
                                extraData = {
                                    source: extra.source,
                                    autoaudit: extra.autoaudit
                                };
                                result = autoAuditingFunct.handleAutoAudit(this.intext, body.data, extraData);
                                // FIND A WAY TO HANDLE ALL AUTO-AUDITS SUCCESSFULLY,
                                // WITHOUT HAVING TO QUIT EVERYTHING ON THE FIRST NEGATIVE RESULT
                            });
                            // resolve({code: result.code, resultData: result.resultData});
                            resolve({ code: 200, resultData: { success: true, message: "Audits processed successfully" } });
                        } else reject(false);
                    } catch (err) {
                        console.log("ERROR -> " + JSON.stringify(err));
                        reject(err);
                    }
                });
            },

            // EXTRA AUTO-AUDITING FUNCTIONS
            blackListAccessTokens: function (user, access_tokens) {
                return autoAuditingFunct.blackListAccessTokens(user, access_tokens);
            },
            checkIfAccessTokenIsBlackListed: function (access_token, user) {
                console.log(Object.keys(autoAuditingFunct))
                return autoAuditingFunct.checkIfAccessTokenIsBlackListed(access_token, user);
            },

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///     FIREWALL FUNCTIONS


            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///     IOT DEVICE MANAGEMENT FUNCTIONS


            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///     EXTRA FUNCTIONS
            extra: function () {
            }
        };

        return AutoSecurityFunct;
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////            INITIALIZATION FUNCTION

    init: function () {
        //  USE THIS FUNCTION TO INITIALIZE ANY OTHER PROPERTIES YOU MIGHT WANT TO INITIALIZE
        // console.log("INITIALIZATION OF ALL FUNCTIONS COMPLETE!!!!!!!");
        return this;
    }
}.init();

module.exports = ModuleReferencer;
