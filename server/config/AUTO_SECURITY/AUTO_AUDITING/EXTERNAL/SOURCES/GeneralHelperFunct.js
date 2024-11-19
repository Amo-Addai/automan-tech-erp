'use strict';

var jwt = require('jsonwebtoken');
var path = require("path");
var os = require("os");
var childProcess = require("child_process"); // WE NEED THIS IN CASE WE WANT TO MAKE A CLI ACTIVATION
var request = require("request"); // WE NEED THIS IN CASE WE WANT TO MAKE AN RPC (HTTP) ACTIVATION
//
var funct = require('../../../../../functions');
var settings = funct.settings;
var config = funct.config;
var auth = funct.auth;
funct = funct.funct;

function getAutoAuditingSleeperPath() {
    return path.normalize(__dirname + '/AUTO_AUDITING_SLEEPER/__init__.py');
}
function signTokenForAutoAuditing(autoaudit) {
    return jwt.sign({_id: autoaudit}, config.secrets.session, {expiresIn: config.autoAuditTokenExpiration});
}

var GeneralHelpers = {

    CLI: { // MAKE CMD (CLI CALL) TO THIS HOST MACHINE'S (SERVER'S) KERNEL ON WHICH THE SOURCES/TOOLS ARE RUNNING ...
        activateAutoAuditingSleeper: function (actionOrAutoAuditType, actionOrAutoAudit, sourcesWithExtra) {
            return new Promise(async (resolve, reject) => {
                try {
                    // CHECK extra PARAM TO KNOW WHAT FUNCTION TO CALL, AND WITH WHICH CORRESPONDING SOURCE ..
                    var token = signTokenForAutoAuditing(actionOrAutoAudit);
                    console.log("GENERAL HELPER!! ABOUT TO ACTIVATE AUTO-AUDITING SLEEPER THROUGH CLI ...");
                    console.log(actionOrAutoAuditType + "; " + actionOrAutoAudit + "; " + JSON.stringify(sourcesWithExtra))
                    console.log("AUTOAUDIT ACCESS-TOKEN -> " + token);
                    var params = {
                        url: config.AutoAPIURL,
                        access_token: token,
                        settings: {
                            sources: sourcesWithExtra
                        }
                    };  // NOW, SET WHETHER THIS IS AN AUTOAUDIT OR A HANDLER ACTION, THEN SET SOURCES
                    params.settings[actionOrAutoAuditType] = actionOrAutoAudit;
                    // NOW, YOU CAN SETUP COMMAND TO EXECUTE AUTO_AUDITING_SLEEPER PROGRAM
                    var goodJson = JSON.stringify(params);
                    //  NOW, CONVERT GOOD JSON INTO BAD JSON FORMAT (REPLACE ALL "s WITH '%%%QUOTATION&&&')
                    //  TO BE COMPATIBLE WITH ALL OS SHELLS (CLIs) - ESPECIALLY WINDOWS (COZ IT DOESN'T READ STRINGS WITH INNER QUOTES
                    console.log("GOOD JSON -> " + goodJson);
                    var badJson = "";
                    for (var l of goodJson) {
                        if (l == '"') badJson += '%%%QUOTATION&&&';
                        else badJson += l;
                    }
                    // var badJson = goodJson.replaceAll('"', '%%%QUOTATION&&&');
                    console.log("BAD JSON -> " + badJson);
                    var cmd = 'python ' + getAutoAuditingSleeperPath() + ' --jsonbad "' + badJson + '"';
                    console.log("COMMAND -> " + cmd);
                    /*  // BUT ALL "s WILL BE REPLACED WITH %%%QUOTATION&&&
                     python __init__.py --json '{"url":"localhost","access_token":"token","settings":{"sources":{"Bro":{},"Kismet":{}},"autoaudit":"Network Connection Tracking"}}'
                     */
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    var exec = childProcess.exec;
                    // var cmd = 'prince -v builds/pdf/book.html -o builds/pdf/book.pdf';
                    exec(cmd, function (error, stdout, stderr) {
                        // command output is in stdout
                        console.log("===============================================AUTO-AUDITING SLEEPER===============================================");
                        if (stderr) console.log("ERROR -> " + stderr);
                        console.log("")
                        console.log("OUTPUT -> " + stdout);
                        console.log("===============================================END OF AUTO-AUDITING SLEEPER===============================================");
                    });
                    /*      OTHER OPTIONS :)
                     ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                     var spawn = childProcess.spawn;
                     var child = spawn('python', [
                     '-v', 'builds/pdf/book.html',
                     '-o', 'builds/pdf/book.pdf'
                     ]);
                     child.stdout.on('data', function(chunk) {
                     // output will be here in chunks
                     });
                     // or if you want to send output elsewhere
                     child.stdout.pipe(dest);
                     ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                     //  EXECUTING A FILE
                     var execFile = childProcess.execFile;
                     execFile(file, args, options, function(error, stdout, stderr) {
                     // command output is in stdout
                     });
                     */
                    //
                    resolve(true);
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e))
                    reject(e)
                }
            });
        }
    },

    RPC: { // MAKE RPC CALL (HTTP REQUEST) TO THE HOST MACHINE (SERVER) ON WHICH THE SOURCES/TOOLS ARE RUNNING ...
        activateAutoAuditingSleeper: function (actionOrAutoAuditType, actionOrAutoAudit, sourcesWithExtra) {
            return new Promise(async (resolve, reject) => {
                try {
                    // CHECK extra PARAM TO KNOW WHAT FUNCTION TO CALL, AND WITH WHICH CORRESPONDING SOURCE ..
                    // ALSO CHECK extra TO KNOW THE NAME OF THE SERVER/API (extra.api) TO MAKE RPC CALL TO
                    var token = signTokenForAutoAuditing(actionOrAutoAudit);
                    console.log("GENERAL HELPER!! ABOUT TO ACTIVATE AUTO-AUDITING SLEEPER THROUGH RPC ...");
                    console.log(actionOrAutoAuditType + "; " + actionOrAutoAudit + "; " + JSON.stringify(sourcesWithExtra))
                    console.log("AUTOAUDIT ACCESS-TOKEN -> " + token);
                    /*
                     var params = {
                     access_token : token,
                     settings: {
                     sources: sourcesWithExtra
                     }
                     };  // NOW, SET WHETHER THIS IS AN AUTOAUDIT OR A HANDLER ACTION, THEN SET SOURCES
                     params.settings[actionOrAutoAuditType] = actionOrAutoAudit;
                     // NOW, YOU CAN SETUP REQUEST OPTIONS FOR RPC TO EXECUTE AUTO_AUDITING_SLEEPER PROGRAM
                     */
                    console.log("SORRY, RPC FUNCITONALITY HAS NOT BEEN IMPLEMENTED YET ...");
                    //
                    resolve(true);
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e))
                    reject(e)
                }
            });
        }
    },

};

module.exports = GeneralHelpers;