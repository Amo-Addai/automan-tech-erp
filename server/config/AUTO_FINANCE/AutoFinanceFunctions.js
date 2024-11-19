'use strict';

var compose = require('composable-middleware');
var request = require('request');

var dataHandler = require('../../api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
var autoFinanceModelscontrollersHandler = dataHandler.modelscontrollersHandler;

var funct = require('../../functions');
var settings = funct.settings;
var config = funct.config;
var auth = funct.auth;
var InternalAutoAuditingFunct = funct.InternalAutoAuditingFunct;
funct = funct.funct;

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
//          DATA-FILE LOGGING FUNCTIONS
var DataHandlerModels = {
    "user": require('../../api/USER/user.model'),
    "account": require('./AUTO_PAY/DATA/ACCOUNT/account.model'),
    "investment": require('../../public/AUTO_INVESTMENT/DATA/INVESTMENT/investment.model'),
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS

function getDataHandlerModel(type) {
    return DataHandlerModels[type];
}

async function getAllAutoFinanceObjects(type, condition) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoFinanceModelscontrollersHandler.getAll(getDataHandlerModel(type), JSON.stringify(condition));
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

async function getAutoFinanceObject(type, id) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoFinanceModelscontrollersHandler.get(getDataHandlerModel(type), id);
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

async function saveAutoFinanceObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoFinanceModelscontrollersHandler.add(getDataHandlerModel(type), data);
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

async function updateAutoFinanceObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoFinanceModelscontrollersHandler.update(getDataHandlerModel(type), data._id, data);
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

async function deleteAutoFinanceObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoFinanceModelscontrollersHandler.delete(getDataHandlerModel(type), data._id);
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
////////        PUBLIC FUNCTIONS

var AutoFinanceFunctions = {

    

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    //  EXTRA AUTO-Finance FUNCTIONS
    
};

module.exports = AutoFinanceFunctions;
