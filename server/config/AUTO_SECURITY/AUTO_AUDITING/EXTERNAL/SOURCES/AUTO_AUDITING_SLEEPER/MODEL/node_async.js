var childProcess = require("child_process");
var path = require("path");
var os = require("os");

console.log("NODE ASYNCHRONOUS PROGRAM!!");
var args = process.argv;
console.log(args.length + " ARGS -> " + args);

try {
    if (args.length >= 4) {
        if ((args[2] === "--cmd") && (args[3].length > 0)) {
            var exec = childProcess.exec, cmd = args[3], commands = [];
            if (cmd.includes("dummy_collector.py") && cmd.includes("--jsonbad")) {
                console.log("CALLING THE DUMMY COLLECTOR ASYNC'LY ..");
                var badJson = cmd.trim().split(" --jsonbad ")[1];
                cmd = cmd.substr(0, cmd.indexOf(" --jsonbad "));
                console.log("COMMAND NOW -> " + cmd);
                console.log("BAD JSON -> " + badJson);
                while (badJson.includes('%%%QUOTATION&&&')) {
                    badJson = badJson.replace('%%%QUOTATION&&&', '"');
                    badJson = badJson.replace("'", "").trim();
                }
                // var goodJson = badJson.replaceAll('"', '%%%QUOTATION&&&');
                var goodJson = JSON.parse(badJson);
                console.log("GOOD JSON -> " + JSON.stringify(goodJson));
                for (var source in goodJson) {
                    files = goodJson[source];
                    for (var file of files) commands.push(cmd + " " + source + " " + file);
                }
            } else commands.push(cmd);
            //
            console.log("COMMANDS TO RUN -> " + commands);
            for (var c of commands) {
                console.log("EXECUTING ASYNC COMMAND -> " + c);
                // exec(c);
                exec(c, function (error, stdout, stderr) {
                    // command output is in stdout
                    console.log("");
                    console.log("===============================================NODE ASYNC PROGRAM===============================================");
                    if (stderr) console.log("ERROR -> " + stderr);
                    console.log("");
                    console.log("OUTPUT -> " + stdout);
                    console.log("===============================================END OF NODE ASYNC PROGRAM===============================================");
                });
            }
            console.log("ENDING NODE PROGRAM SYNCHRONOUSLY :)");
        } else console.log("INCORRECT ARGUMENTS :(");
    } else console.log("INSUFFICIENT ARGUMENTS :(");
} catch (e) {
    console.log("ERROR OCCURED ...");
    console.log(e);
}