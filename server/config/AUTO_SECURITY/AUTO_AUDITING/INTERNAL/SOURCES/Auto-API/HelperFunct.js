'use strict';

var blackListed = require('./BLACKLISTEDACCESSTOKEN/blacklistedaccesstoken.model.js');
var mongoose = require('mongoose');

var source = "Auto-API", triggerAPI = null, triggerType = "CODE"; // OR RPC (BUT IF SO, THEN triggerAPI MUST NOT NULL)

function prepare(extra){
    if(triggerType === "RPC") {
        if(triggerAPI) extra.api = triggerAPI;
        else return null;
    }
    return {triggerType: triggerType, extra: extra};
}

var Helpers = {

    prePerformAction: async function(action, extra){
        return new Promise(async (resolve, reject) => {
            try { // FIRST MAKE SURE THAT THIS ACTION CAN BE PERFORMED BY THIS SOURCE
                // // CHECK SETTINGS TO KNOW ALL ACTIONS THAT CAN BE PERFORMED BY THIS SOURCE
                // if(![].includes(action)){
                //     var err = "ACTION '" + action + "' CANNOT BE PERFORMED BY SOURCE '" + source + "'";
                //     console.log(err);
                //     reject({success: false, err: err})
                // }
                console.log(source + " PERFORMING (" + action + ") WITH EXTRA PARAMS -> " + JSON.stringify(extra));
                // TRIGGER SOURCE (AUTOAUDITING SLEEPER PROGRAM IF EXTERNAL) TO PERFORM THIS ACTION BY COMMAND LINE OR RPC
                // BUT FIRST, CHECK WHAT ACTION IS TO BE PERFORMED, AND MAKE ANY NECESSARY ADJUSTMENTS :)
                // switch(action){
                //     case "":
                //     break;
                //     default:
                //     break;
                // }
                resolve(prepare(extra));
            } catch (e){
                console.log("ERROR -> " + JSON.stringify(e));
                reject(e);
            }
        });
    },
    
    preTriggerAutoAudit: async function(autoaudit, extra){
        return new Promise(async (resolve, reject) => {
            try { // FIRST MAKE SURE THAT THIS ACTION CAN BE PERFORMED BY THIS SOURCE
                // // CHECK SETTINGS TO KNOW ALL AUTOAUDITS THAT CAN BE PERFORMED BY THIS SOURCE
                // if(![].includes(autoaudit)){
                //     var err = "AUTOAUDIT '" + autoaudit + "' CANNOT BE PERFORMED BY SOURCE '" + source + "'";
                //     console.log(err);
                //     reject({success: false, err: err})
                // }
                console.log(source + " TRIGGERING AUTOAUDIT (" + autoaudit + ") WITH EXTRA PARAMS -> " + JSON.stringify(extra));
                // TRIGGER SOURCE (AUTOAUDITING SLEEPER PROGRAM IF EXTERNAL) TO PERFORM THIS AUTOAUDIT BY COMMAND LINE OR RPC
                // BUT FIRST, CHECK WHAT AUTOAUDIT IS TO BE PERFORMED, AND MAKE ANY NECESSARY ADJUSTMENTS :)
                // switch(autoaudit){
                //     case "":
                //     break;
                //     default:
                //     break;
                // }
                resolve(prepare(extra));
            } catch (e){
                console.log("ERROR -> " + JSON.stringify(e));
                reject(e);
            }
        });
    },


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    checkIfAccessTokenIsBlackListed: async function (access_token, user) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await blackListed.isBlackListed(access_token, user));
            } catch (err){
                console.log(JSON.stringify(err));
                reject(false);
            }
        });
    },

    blackListAccessTokens: async function (user, access_tokens) {
        return new Promise(async (resolve, reject) => {
            console.log("Blacklisting Access Tokens -> " + JSON.stringify(access_tokens));
            // access_token: String,
            //     expiresInMinutes: Number,
            //     user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            try {
                var data;
                for (var access_token of access_tokens) {
                    data = {
                        access_token: access_token.token,
                        expiresInMinutes: access_token.expiresInMinutes,
                        user: user._id // JUST TAKE THE USER'S ID
                    };
                    blackListed.add(data); // THIS CAN BE AWAITED IF YOU PREFER
                }
                resolve(true);
            } catch (err){
                console.log(JSON.stringify(err));
                reject(false);;
            }
        });
    },

    deleteUser: function (user) {
        return new Promise(async (resolve, reject) => {
            try {
                mongoose.model('User').findById(user._id, function (err, obj) {
                    if (err || !obj) resolve(false);
                    obj.remove(function (err) {
                        resolve(!err);
                    });
                });
            } catch (err){
                console.log(JSON.stringify(err));
                reject(false);
            }
        });
    },

    alertUserToConfirmDevice: async function(user, access_token, device){
        var userempclientstakefunct = require('../../../api/GLOBAL_CONTROLLER/OTHER_FUNCTION_HELPERS/UserEmployeeClientStakeHolderServerFunctions')
        return new Promise(async (resolve, reject) => {
            try {
                // MAKE SURE THAT contactBody HAS ALL THESE PROPERTIES BEFORE CALLING THIS FUNCTION
                // PROPERTIES: .subject .message .extra { .autoEnum .dataId (& special extra) };
                var recipientsType = "user", extra = {}; // FIND A WAY TO FILL THIS JSON OBJECT FOR ALL POSSIBLE CONTACT METHODS AVAILABLE
                var contactBody = {
                    contact_methods: ["Notification"], // FIND OUT HOW YOU CAN ADD MORE CONTACT METHODS IF POSSIBLE
                    data: { // FIND A WAY TO FILL .subject & .message PROPERTIES GENERICALLY
                        subject: "Confirm this device", // FIND A WAY TO ADD device PROPERTIES TO THE subject/message OPTIONS
                        message: "This device tried to log into the system, is this you?"
                        // , // THIS EXTRA PROPERTY CAN BE TAKEN AWAY FOR NOW, AT LEAST UNTIL IT'S REQUIRED 
                        // extra: {}
                    }
                };
                // THESE ARE JUST USER IDs, SO GET THE ENTIRE RECIPIENT OBJECTS
                var user = data.user; // ONLY WITH PROPERTIES ._id & .full_name THOUGH
                // OR, ADD MORE PROPS THAT'LL BE REQUIRED WITHIN THE .alert (.contact) FUNCTION
                // is_user, (email, phone PROPERTIES MIGHT BE NEEDED IF contact_methods INCLUDED Company Email/Email/SMS)
                user["is_user"] = true;
                //
                contactBody[recipientsType] = [user];
                var result = await userempclientstakefunct.contact(recipientsType, contactBody, false);
                // FIND OUT WHAT TO USE result FOR
            } catch (err){
                console.log(JSON.stringify(err));
                reject(false);
            }
        });
    },

    performStockOption: function(action, stock){ // stock PROPS: _id, stock_name, price
        return new Promise((resolve, reject) => {
            if( (!["CALL", "PUT", "SELL", "SHORTS", ""].includes(action)) || !stock) 
                reject(false);
            if(action !== ""){ // DO THIS, COZ AN EVENT HANDLER ACTION CAN ALSO BE ""
                // LET AutoInvestmentFunct.StockMarketMonitoring PERFORM STOCK OPTION action
                // NB: stock IS NOT THE ENTIRE STOCK OBJECT, IT JUST HAS ._id & .stock_name PROPERTIES
                var result = AutoInvestmentFunct.StockMarketMonitoring.optionStock(action, stock);
                // YOU CAN WORK WITH result HOWEVER YOU WANT, BUT YOU MUST USE await FIRST ...
            }
            resolve(true);
        });
    },

    updateGeoLocation: function(){

    },

    blockIPAddresses: function(device, sessions){
        return new Promise((resolve, reject) => {
            console.log("BLOCKING IP ADDRESSES!!! -> " + JSON.stringify(device))
            console.log("SESSIONS -> " + JSON.stringify(sessions));
            //
            resolve(true);
        });
    },
};

module.exports = Helpers;