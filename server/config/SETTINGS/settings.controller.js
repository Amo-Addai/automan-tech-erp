'use strict';

var funct = require('../../functions');
var settings = funct.settings;
funct = funct.funct;

function validate(obj, add) {
    
    return obj;
}


////////////////////////////////////////////////////////////////////////////////////////////
///////             REST API ROUTES

// Get a single obj related to the specified company
exports.getCompanySettings = async function (req, res) {
    try {
        var obj = settings.getThisCompanySettings();
        if(obj){
            return funct.sendResponse(res, 200, obj);
            // if (req.params.sub && req.params.sub.length > 0) obj = obj[req.params.sub] || {};
            // // THEREFORE IF .sub NOT SPECIFIED, JUST RETURN THE WHOLE SETTINGS OBJ
            // else return funct.sendResponse(res, 200, obj);
        } else return funct.sendResponse(res, 404, {success: false, message: "Settings not found"});
    } catch (err){
        console.log("Some error occured -> " + JSON.stringify(err));
        return funct.sendResponse(res, 403, {err: err, success: false, message: "Some error occured"});
    }
};

exports.update = async function (req, res) {
    try {
        var obj = {};
        if(req.body){
            obj = validate(req.body, false);
            var result = await settings.saveThisCompanySettings(obj);
            if(result === true) return funct.sendResponse(res, 200, {success: true, message: "Settings saved successfully"});
            else return funct.sendResponse(res, 500, {success: false, message: "Could not save settings"});
        } else return funct.sendResponse(res, 403, {success: false, message: "No request body"});
    } catch (err){
        console.log("Some error occured -> " + JSON.stringify(err));
        return funct.sendResponse(res, 403, {err: err, success: false, message: "Some error occured"});
    }
}

// Sets default settings
exports.setDefault = async function (req, res) {
    try {
        var defaultObj = settings.getThisCompanyDefaultSettings();
        console.log("SETTING DEFAULT SETTINGS -> " + Object.keys(defaultObj));
        if(defaultObj){
            defaultObj = validate(defaultObj, false);
            var result = await settings.saveThisCompanySettings(defaultObj);
            if(result === true) return funct.sendResponse(res, 200, {success: true, message: "Default Settings saved successfully"});
            else return funct.sendResponse(res, 500, {success: false, message: "Could not set default settings"});
        } else return funct.sendResponse(res, 403, {success: false, message: "No Default Settings available"});
    } catch (err){
        console.log("Some error occured -> " + JSON.stringify(err));
        return funct.sendResponse(res, 403, {err: err, success: false, message: "Some error occured"});
    }
};
