'use strict';

var source = "Nikto", triggerAPI = null, triggerType = "CLI"; // OR RPC (BUT IF SO, THEN triggerAPI MUST NOT NULL)

function prepare(extra){
    if(triggerType === "RPC") {
        if(triggerAPI) extra.api = triggerAPI;
        else return null; // RETURN NULL, COZ IF RPC IS REQUIRED, AND NO API HAS BEEN SPECIFIED, WHAT'S THE POINT???
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

};

module.exports = Helpers;