'use strict';

var jwt = require('jsonwebtoken');
var path = require("path");
var os = require("os"); // WE NEED THIS IN CASE WE WANT TO MAKE A CLI ACTIVATION
var request = require("request"); // WE NEED THIS IN CASE WE WANT TO MAKE AN RPC (HTTP) ACTIVATION
//
var funct = require('../../../../../functions');
var settings = funct.settings;
var config = funct.config;
var auth = funct.auth;
funct = funct.funct;
//
var AutoInvestmentFunct = require('../../../../../public/AUTO_INVESTMENT/AutoInvestmentFunctions')

var GeneralHelpers = {

    CODE : { 
        performAutoAuditOrAction:  function (actionOrAutoAuditType, actionOrAutoAudit, sourcesWithExtra){
            return new Promise(async (resolve, reject) => {
                // CHECK extra PARAM TO KNOW WHAT FUNCTION TO CALL, AND WITH WHICH CORRESPONDING SOURCE ..
                console.log("GENERAL HELPER!! ABOUT TO PERFORM AUTOAUDIT / HANDLER ACTION THROUGH CODE ...");
                console.log(actionOrAutoAuditType + "; " + actionOrAutoAudit + "; " + JSON.stringify(sourcesWithExtra))
                // IMPLEMENT CASES FOR ALL POSSIBLE AUTOAUDITS, & THE HANDLER ACTIONS OF ALL AUTOEVENTS OF EACH OF THE AUTOAUDITS
                switch(actionOrAutoAudit){
                    case "Stock Market Monitoring":
                        // // TRIGGER AutoInvestmentFunctions.js TO RUN THIS AUTO-AUDIT
                        var result = AutoInvestmentFunct.StockMarketMonitoring.monitorStockMarket();
                        // // WORK WITH result HOWEVER YOU WANT, BUT USE AN await FIRST :)
                    break;
                }
                
                resolve(true);
            });
        }
    },

    RPC : { // MAKE RPC CALL (HTTP REQUEST) TO THE HOST MACHINE (SERVER) TO RUN TASK ...
        performAutoAuditOrAction:  function (actionOrAutoAuditType, actionOrAutoAudit, sourcesWithExtra){
            return new Promise(async (resolve, reject) => {
                // CHECK extra PARAM TO KNOW WHAT FUNCTION TO CALL, AND WITH WHICH CORRESPONDING SOURCE ..
                console.log("GENERAL HELPER!! ABOUT TO PERFORM AUTOAUDIT / HANDLER ACTION THROUGH RPC ...");
                console.log(actionOrAutoAuditType + "; " + actionOrAutoAudit + "; " + JSON.stringify(sourcesWithExtra))
                console.log("SORRY, RPC FUNCITONALITY HAS NOT BEEN IMPLEMENTED YET ...");
                
                resolve(true);
            });
        }
    },
    
};

module.exports = GeneralHelpers;