'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');

var globalMM = require('../OTHER_FUNCTION_HELPERS/GlobalMarkModifiedServerFunctions');

var filedata = "data", storagebackup = "storage";

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
    //  REMOVE THIS WHEN READY TO PERFECT THIS FUNCTION
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

var DataHandler = {

    models: { // THIS CANNOT WORK COZ ALL CONTROLLER FILE ALREADY REQUIRE functions.js

        // //  REGULAR API
        // "user": require('../../../api/USER/user.model.js'),

        // //  AUTO-SECURITY API
        // "autolog": require('../../../config/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOLOG/autolog.model.js'),
        // "autoevent": require('../../../config/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOEVENT/autoevent.model.js'),

        // // CONFIG API - SETTINGS : SHOULD NOT BE USED LIKE THE OTHERS THOUGH
        // "setting": require('../../../config/SETTINGS/settings.model.js'),

    },

    modelscontrollers: { // THIS CANNOT WORK COZ ALL CONTROLLER FILE ALREADY REQUIRE functions.js

        // //  REGULAR API
        // "user": require('../../../api/USER/user.controller.js'),

        // //  AUTO-SECURITY API
        // "autolog": require('../../../config/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOLOG/autolog.controller.js'),
        // "autoevent": require('../../../config/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOEVENT/autoevent.controller.js'),

        // // CONFIG API - SETTINGS : SHOULD NOT BE USED LIKE THE OTHERS THOUGH
        // "setting": require('../../../config/SETTINGS/settings.controller.js'),

    },

    modelscontrollersHandler: {

        checkIDMatch: function (id) {
            return mongoose.Types.ObjectId.isValid(id);
            // return id.match(/^[0-9a-fA-F]{24}$/);
        },

        checkIfExists: async function (type, id = null, condition = null) {

        },

        getAll: async function (type, condition) {
            return new Promise((resolve, reject) => {
                try {
                    // var M = DataHandler.models[type];
                    var M = type; // NOW, type IS THE MODEL OBJECT ITSELF
                    if (!condition.includes("_id")) // DO THIS COZ IF IT INCLUDES "_id", IT'LL REPLACE IT WITH ANOTHER QUOTES, MESSING UP THE CONDITION
                        condition = (condition || '').replace(/([a-zA-Z0-9$\.][^:,]*)(?=\s*:)/g, '"$1"').replace(/""/igm, '"');
                    condition = JSON.parse(condition || null);
                    console.log("the current condition is ", condition);
                    // now, DO THIS TO SETUP EXTRA PARAMS
                    var extra = { limit: null, deepPop: true };
                    if (condition.hasOwnProperty("extra")) { // ASSIGNING IT DIRECTLY ASSIGNS BY REFERENCE, SO DO IT THIS WAY INSTEAD ...
                        // YOU CAN ALSO LOOK OUT FOR EXTRA EXTRA STUFF HERE
                        // eg. CHECK IF THE CALLING FUNCTION WANTS DATA TO BE DEEP-POPULATED ..
                        for (var k of ["limit", "deepPop"]) {
                            if (condition.extra.hasOwnProperty(k)) extra[k] = condition.extra[k];
                        } // DON'T DO THIS DOWN HERE, OR IF condition.extra HAS ONLY 1 PROP (eg. .limit), THE OTHER DEFAULT PROP WILL BE NULL ..
                        // extra = JSON.parse(JSON.stringify(condition.extra));
                        delete condition.extra;
                    }
                    M.Model.find(condition, M.dataToExclude || "")
                        .sort(M.sort || "")
                        .limit(extra.limit)
                        .populate(extra.deepPop ? (M.deepPop || "") : (""))
                        // .deepPopulate(extra.deepPop ? (M.deepPop || "") : (""))
                        .exec(function (err, data) {
                            if (err) reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
                            else if (!data) reject({ code: 400, resultData: { success: false, message: M.type + ' objects do not exist' } });
                            else { // THEN CALL
                                resolve({ code: 200, resultData: data });
                            }
                        });
                } catch (e) {
                    console.log('...................', e);
                    reject({ code: 400, resultData: { success: false, message: "Bad request condition" } });
                }
            });
        },

        getOne: async function (type, condition) {
            return new Promise((resolve, reject) => {
                try {
                    // var M = DataHandler.models[type];
                    var M = type; // NOW, type IS THE MODEL OBJECT ITSELF
                    if (!condition.includes("_id")) // DO THIS COZ IF IT INCLUDES "_id", IT'LL REPLACE IT WITH ANOTHER QUOTES, MESSING UP THE CONDITION
                        condition = (condition || '').replace(/([a-zA-Z0-9$\.][^:,]*)(?=\s*:)/g, '"$1"').replace(/""/igm, '"');
                    condition = JSON.parse(condition || null);
                    console.log("the current condition is ", condition);
                    M.Model.findOne(condition, function (err, obj) {
                        if (err) reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
                        else if (!obj || typeof obj == 'undefined') reject({ code: 400, resultData: { success: false, message: M.type + ' does not exist' } });
                        else {
                            console.log("the " + M.type + " is: ", obj);
                            resolve({ code: 200, resultData: obj });
                        }
                    });
                } catch (e) {
                    console.log('...................', e);
                    reject({ code: 400, resultData: { success: false, message: "Bad request condition" } });
                }
            });
        },

        get: async function (type, id) {
            return new Promise((resolve, reject) => {
                if (!this.checkIDMatch(id)) reject({ code: 400, resultData: { success: false, message: 'Incorrect ID format' } });
                //   var M = DataHandler.models[type];
                var M = type; // NOW, type IS THE MODEL OBJECT ITSELF
                M.Model.find({ _id: id }, M.dataToExclude)
                    .populate(M.deepPop || "")
                    // .deepPopulate(M.deepPop || "")
                    .exec(function (err, data) {
                        if (err) reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
                        //  MAYBE WITH THIS BELOW, YOU SHOULD resolve THE ERROR resultData & NOT reject SO THE CALLER FUNCTION CAN WORK WITH resultData
                        else if (!data || typeof data == 'undefined') resolve({ code: 400, resultData: { success: false, message: M.type + ' does not exist' } });
                        else { // MOST LIKELY, THIS NEXT VALIDATION WILL NEVER HAPPEN, BUT JUST IN CASE IT DOES :)
                            console.log("DATA RETRIEVED -> " + JSON.stringify(data));
                            if (data.length < 1) reject({ code: 400, resultData: { success: false, message: 'No ' + M.type + ' has this ID' } });
                            else if (data.length > 1) reject({ code: 400, resultData: { success: false, message: 'Multiple ' + M.type + ' have this ID' } });
                            // THIS MEANS, data.length === 1
                            console.log("the " + M.type + " is: ", data[0]); // COZ YOU USED .find({}), data RETURNED IS AN ARRAY THEREFORE ITS LENGTH MUST BE 1
                            resolve({ code: 200, resultData: data[0] }); // LENGTH = 1 COZ OF {_id : id}
                        }
                    });
            });
        },

        add: async function (type, body) {
            return new Promise((resolve, reject) => {
                var obj = {};
                if (body && Object.keys(body).length > 0) {
                    console.log("Object -> " + JSON.stringify(body));
                    // var M = DataHandler.models[type];
                    var M = type; // NOW, type IS THE MODEL OBJECT ITSELF
                    obj = M.validate(body, true); // VALIDATION
                    console.log("Validated Object -> " + JSON.stringify(obj));
                    // var schedule = funct.handleCheckSchedule(type, obj);
                    // if(schedule !== "success") resolve(schedule);
                    M.Model.create(obj, function (err, obj) {
                        if (err) {
                            console.log("Sorry, some error occurred");
                            console.log(JSON.stringify(err));
                            reject({ err: err, code: 400, resultData: { success: false, message: 'Sorry, some error occurred' } });
                        }
                        // else if (!funct.saveFile(M.imgdata, obj._id, type.toUpperCase(), settings.getDefaultFileType("image"))) {
                        //     M.Model.findByIdAndRemove(obj._id, function (err, obj) {
                        //         if (err) reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                        //     });
                        //     reject({code: 400, resultData : {success: false, message: "Could not save image"}});
                        // }
                        else {
                            globalMarkModified(M, M.deepPop, obj);
                            M.Model.findById(obj._id, M.dataToExclude)
                                .populate(M.deepPop || "")
                                // .deepPopulate(M.deepPop || "")
                                .exec(function (err, obj) {
                                    if (err) reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
                                    else {
                                        console.log("final obj -> " + JSON.stringify(obj));
                                        console.log("RETURNING RESULT ...");
                                        resolve({ code: 200, resultData: obj });
                                    }
                                });
                        }
                    });
                } else {
                    reject({
                        code: 400,
                        resultData: { success: false, message: 'No request body' }
                    });
                }
            });
        },

        update: async function (type, id, body) {
            return new Promise((resolve, reject) => {
                if (!this.checkIDMatch(id)) reject({ code: 400, resultData: { success: false, message: 'Incorrect ID format' } });
                var obj = {};
                if (body && Object.keys(body).length > 0) {
                    console.log("Object -> " + JSON.stringify(body));
                    // var M = DataHandler.models[type];
                    var M = type; // NOW, type IS THE MODEL OBJECT ITSELF
                    obj = M.validate(body, false); // VALIDATION
                    console.log("Validated Object -> " + JSON.stringify(obj));
                    // var schedule = funct.handleCheckSchedule(type, obj);
                    // if(schedule !== "success") resolve(schedule);
                    M.Model.findById(id, M.dataToExclude, function (err, oldobj) {
                        if (err) reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
                        else if (!oldobj || typeof oldobj == 'undefined') reject({ code: 400, resultData: { success: false, message: M.type + ' does not exist' } });
                        else {
                            console.log("the old " + M.type + " is: ", oldobj);
                            //
                            console.log("MAKING A COPY OF data COZ IT'S ORIGINAL WILL BE USED FOR GLOBAL MARK MODIFICATION");
                            var oldobjCopy = JSON.parse(JSON.stringify(oldobj));
                            console.log("BEFORE MM COPY -> " + JSON.stringify(oldobjCopy));
                            console.log("-----------------------------------------")
                            var updatedobj = markModified(oldobj, obj, M);
                            console.log("-----------------------------------------")
                            console.log("AFTER MM COPY -> " + JSON.stringify(oldobjCopy));
                            console.log("UPDATED -> " + updatedobj);
                            //
                            updatedobj.save(function (err) {
                                if (err) {
                                    console.log("ERROR -> " + JSON.stringify(err));
                                    reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
                                }
                                // else if (!funct.saveFile(M.imgdata, updatedobj._id, type.toUpperCase(), settings.getDefaultFileType("image"))) {
                                //     M.Model.findByIdAndRemove(oldobj._id, function (err, obj) {
                                //       if (err) reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
                                //     });
                                //     reject({code: 400, resultData : {success: false, message: "Could not save image"}});
                                // }
                                else { // DO THIS COZ EDITED (DELETED) LINKS MIGHT HAVE HAPPENED, OBSTRUCTING GLOBAL MARKMODIFICATION
                                    updatedobj["old"] = oldobjCopy;
                                    globalMarkModified(M, M.deepPop, updatedobj);
                                    delete updatedobj["old"];
                                    //
                                    console.log('updated ' + M.type + ': ' + JSON.stringify(updatedobj));
                                    M.Model.findById(updatedobj._id, M.dataToExclude)
                                        .populate(M.deepPop || "")
                                        // .deepPopulate(M.deepPop || "")
                                        .exec(function (err, obj) {
                                            if (err) reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
                                            else {
                                                console.log("final obj -> " + JSON.stringify(obj));
                                                console.log("RETURNING RESULT ...");
                                                resolve({ code: 200, resultData: obj });
                                            }
                                        });
                                }
                            });
                        }
                    });
                } else {
                    reject({
                        code: 400,
                        resultData: { success: false, message: 'No request body' }
                    });
                }
            });
        },

        delete: async function (type, id) {
            return new Promise((resolve, reject) => {
                if (!this.checkIDMatch(id)) reject({ code: 400, resultData: { success: false, message: 'Incorrect ID format' } });
                console.log("DELETE FUNCTION RUNNING NOW  ...")
                //   var M = DataHandler.models[type];
                var M = type; // NOW, type IS THE MODEL OBJECT ITSELF
                //      MAKE SURE YOU DELETE THE IMAGES CORRESPONDING TO THIS OBJECT TOO
                if (true) {
                    // if (funct.deleteFile(id, type.toUpperCase(), settings.getDefaultFileType("image"))) {
                    M.Model.findByIdAndRemove(id, function (err, oldobj) {
                        console.log("Object -> " + JSON.stringify(oldobj));
                        if (err) reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
                        else if (!oldobj || typeof oldobj == 'undefined') reject({ code: 400, resultData: { success: false, message: M.type + ' does not exist' } });
                        else { // DO THIS COZ YOU MUST DELETE LINKS MIGHT FOR GLOBAL MARK-MODIFICATION
                            var deletedobj = JSON.parse(JSON.stringify(oldobj)); // DO IT THIS WAY TO AVOID SOME SILLY FUTURE ERROR!! TRUST ME :)
                            deletedobj["deleted"] = JSON.parse(JSON.stringify(oldobj));; // MAKE A COPY OF oldobj
                            globalMarkModified(M, M.deepPop, deletedobj);
                            deletedobj = null; oldobj = null; // DELETE THE VARIABLE TOO TO BE SAFE ;)
                            //
                            console.log(M.type + " deleted from database");
                            resolve({ code: 200, resultData: { success: true } });
                        }
                    });
                } else reject({ code: 400, resultData: { success: false, message: "Could not delete image" } });
            });
        },

        count: function (type, condition) {
            return new Promise((resolve, reject) => {
                //   var M = DataHandler.models[type];
                var M = type; // NOW, type IS THE MODEL OBJECT ITSELF
                M.Model.count(condition || {},
                    function (err, count) { // don't ever give out the password or salt
                        if (err) reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
                        else if (!count) reject({ code: 400, resultData: { success: false, message: 'Cannot count ' + M.type + ' objects' } });
                        else resolve({ code: 200, resultData: { success: true, message: ' number of ' + M.type + ' objects', count: count } });
                    });
            });
        }
    },

    updateDataSecurityEncryptionObject: async function (id) {
        return new Promise((resolve, reject) => {
            // var obj = {encryption: settings.getDataSecurityTechniqueSettings("encryption", "data")};
            // var result = await this.modelscontrollersHandler.update("datasecurity", id, obj);
            resolve(true);
        });
    },

    getDataSecurityEncryptionObject: async function (id) {
        return new Promise((resolve, reject) => {
            // var result = await this.modelscontrollersHandler.get("datasecurity", id);
            // if (result.code === 200) reject(result.resultData.encryption || null);
            reject(null);
        });
    },

    encryptData: async function (type, schema) {
        return new Promise((resolve, reject) => {
            // if (settings.canEncryptDataType(type)) {
            //     // LOOP THROUGH THROUGH WHOLE SCHEMA & ENCRYPT ALL NECESSARY PROPERTIES
            //     var mainData = this.modelcontrollers[type].mainData.split(' ');
            //     for (var prop of mainData) {
            //         schema[prop] = this.EncryptionHelper.encryptData(schema[prop]);
            //     }
            //     // NOW UPDATE encryption PROPERTY OF DataSecurity PROPERTY OF THIS OBJECT
            //     if (schema["datasecurity"]) // FIGURE OUT WHAT TO DO WITH THE RETURNED VALUE OF THIS FUNCTION
            //         this.updateDataSecurityObject(schema["datasecurity"]._id);
            // }
            resolve(schema);
        });
    },

    decryptData: async function (type, schema) {
        return new Promise((resolve, reject) => {
            // if (settings.canDecryptDataType(type)) {
            //     // LOOP THROUGH THROUGH WHOLE SCHEMA & DECRYPT ALL NECESSARY PROPERTIES
            //     var mainData = this.modelcontrollers[type].mainData.split(' ');
            //     if (schema["datasecurity"]) { // IF NO datasecurity, YOU CAN'T DECRYPT DATA
            //         var encryption = await this.getDataSecurityEncryptionObject(schema["datasecurity"]._id) || null;
            //         if (encryption) {
            //             for (var prop of mainData) {
            //                 schema[prop] = this.EncryptionHelper.decryptData(schema[prop], encryption);
            //             }
            //         }
            //     }
            // }
            resolve(schema);
        });
    },

    dataExists: async function (type, id) {
        return new Promise((resolve, reject) => {
            // var M = DataHandler.models[type];
            var M = type; // NOW, type IS THE MODEL OBJECT ITSELF
            M.Model.findById(id, M.dataToExclude, function (err, obj) {
                if (err) reject(false);
                else if (!obj) reject(false);
                else {
                    console.log("the " + M.type + " is: ", obj);
                    resolve(true);
                }
            });
        });
    },

    getAllData: async function (store) {
        return new Promise((resolve, reject) => {
            // if (!store) store = settings.getStorageOrBackup(filedata, storagebackup);
            // switch (store) {
            //     case "Internal":
            //         break;
            //     case "AWS Cloud":
            //         break;
            // }
            resolve({});
        });
    },

    saveAllData: async function (store, data) {
        return new Promise((resolve, reject) => {
            // if (!store) store = settings.getStorageOrBackup(filedata, storagebackup);
            // switch (store) {
            //     case "Internal":
            //         break;
            //     case "AWS Cloud":
            //         break;
            // }
            resolve(true);
        });
    },

    deleteAllData: async function (store) {
        return new Promise((resolve, reject) => {
            // if (!store) store = settings.getStorageOrBackup(filedata, storagebackup);
            // for (var file in this.getAllData(store)) {
            //     switch (store) {
            //         case "Internal":
            //             break;
            //         case "AWS Cloud":
            //             break;
            //     }
            // }
            resolve(true);
        });
    },

    migrateAllData: async function (from, to) {
        return new Promise((resolve, reject) => {
            // if (this.saveAllData(to, this.getAllData(from))) reject(this.deleteAllData(from));
            resolve(null);
        });
    }


};

module.exports = DataHandler;
