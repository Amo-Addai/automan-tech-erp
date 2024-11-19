var request = require('request');
var Parse = require('node-parse-api').Parse;
var notiModel = require('./NOTIFICATION/notification.model.js');

var env = {
    // ONE SIGNAL STUFF
    oneSignalAppID: process.env.ONESIGNAL_APP_ID || "c26dcb7f-d29f-4063-9d00-307d49ea26ed",
    oneSignalAPIKey: process.env.ONESIGNAL_API_KEY || "Mzg4ZmJkYzUtMGJiNy00M2EwLWJlYjgtMDIzZDcyN2VhNWE2",
    oneSignalMasterKey: process.env.ONESIGNAL_MASTER_KEY || "",

    notificationTypesDefault: "Multiple"

}, provider = "onesignal", cmeth = "Notification";

// var options = {
//     app_id: env.oneSignalAppID,
//     master_key: env.oneSignalMasterKey // NOT SURE ABOUT THIS SHIT
// };
// function parse () {
//     return new Parse(options);
// }

function storeNotification (data){
    // data HAS .id & .recipients
    // STORE THE NOTIFICATION IN SOME SESSION STORE
    try {
        var noti = {
            notification_id : data.id,
            recipients : data.recipients,
            date_created : Date.now()
        }
        return notiModel.add(data);
    } catch (e) {
        return false;
    }
}


module.exports = {

    sendPushNotification: async function (recipients, data) {
        return new Promise((resolve, reject) => {
            try {
                console.log("ABOUT TO SEND PUSH NOTIFICATION NOW")
                console.log(JSON.stringify(data))
                console.log("RECIPIENTS -> " + JSON.stringify(recipients))
                //
                // recipients ARE ALL USERS OVER HERE
                var title = data.subject, message = data.message, extra = data.extra;
                var notificationExtraData = extra[cmeth] || {};
                // IF notificationType IS NOT SPECIFIED, SELECT DEFAULT NOTIFICATION TYPE - Multiple
                var  notificationType = "Multiple";
                console.log("NOTIFICATION EXTRA DATA -> " + JSON.stringify(notificationExtraData))
                if(!notificationExtraData.notificationType || notificationExtraData.notificationType.length <= 0){ 
                    notificationType = notificationExtraData.notificationType || env.notificationTypesDefault || "Multiple";
                }

                
                switch(provider){ // THIS PIECE OF CODE MIGHT HAVE TO BE MOVED HIGHER UP (WHEN MORE providers COME ALONG)
                    case "onesignal":
                                
                        var requestData = {
                            // app_ids: [env.oneSignalAppID], // JUST IN CASE YOU HAVE MULTIPLE ONE SIGNAL APPS
                            app_id: env.oneSignalAppID, // USE THIS ONE COZ WITH THE ONE ABOVE, YOU CANNOT ADD FILTERS/SEGMENTS 
                            // COZ ALL APPS MIGHT HAVE DIFFERENT SEGMENTS / FILTERS SETUP WITHIN THE ONE-SIGNAL DASHBOARD
                            headings: {en: title},
                            subtitle: {en: "Read message"},
                            contents: {en: message},

                            data: { // EXTRA DATA, NEEDED TO ACCESS NEXT VIEW WITHIN THE CLIENT APPLICATIONS
                                title: title,
                                message: message,
                                object: {
                                    autoEnum: extra.autoEnum || "", // PASS THE DOMAIN TYPE (eg: 'Project' / 'Task' / 'Chat')
                                    id: extra.dataId || "" // PASS THE ID OF THE OBJECT (OR '')
                                }
                            },

                            // content_available: true, // wakes your app from background to run custom native code FOR IOS 10+
                            // mutable_content: true, // allows you to change the notification content in your app before it is displayed FOR IOS 10+
                            // // template_id: "",

                            // // APPEARANCE (ICONS AND SOUND OF NOTIFICATION)

                            // // GROUPING AND COLLAPSING (COMBINING MULTIPLE NOTIFICATIONS OF THE SAME "GROUP"
                            // android_group: "AUTOMAN_API_NOTIFICATION", //  FOR ANDROID
                            // android_group_message: {"en": "You have $[notif_count] new messages"},
                            // adm_group: "AUTOMAN_API_NOTIFICATION", // FOR AMAZON
                            // adm_group_message: {"en": "You have $[notif_count] new messages"},

                            // // DELIVERY TIMING
                            // send_after: notificationExtraData.send_after || "" + Date.now, // Schedule notification for future delivery eg. "Thu Sep 24 2015 14:00:00 GMT-0700 (PDT)"
                            // // timezone (Deliver at a specific time-of-day in each users own timezone)
                            // // OR: last-active  (Deliver at the same time of day as each user last used your app)
                            // // If send_after is used, this takes effect after the send_after time has elapsed
                            // delayed_option: notificationExtraData.delayed_option || "last-active",
                            // delivery_time_of_day: notificationExtraData.delivery_time_of_day || "" + Date.now, // Use with delayed_option=timezone eg. "9:00AM"


                            // /////////////////////////////////////////////////////////////////////////
                            // // EXTRA STUFF THAT CAN BE ADDED (ABOVE THERE)
                            // url: "", // The URL to open in the browser when a user clicks on the notification
                            // ios_attachments: {},
                            // // THE NEXT TWO CAN BE RESOURCE NAMES, OR URLS
                            // big_picture: "", // FOR ANDROID: Picture to display in the expanded view
                            // chrome_big_picture: "", // FOR CHROME APP: Large picture to display below the notification text

                            // // BUTTONS
                            // buttons: []

                        };

                        switch(notificationType){
                            case "Global":
                                requestData.included_segments = ['All'];
                                break;
                            case "Multiple": // ['UserIDSegment', 'Active Users']
                                if(notificationExtraData.segments){
                                    requestData.included_segments = notificationExtraData.segments || []; // OR: "Active Users", "Inactive Users", etc
                                } else if(notificationExtraData.player_ids){
                                    // OR ["6392d91a-b206-4b7b-a620-cd68e32c3a76","76ece62b-bcfe-468c-8a78-839aeaa8c5fa","8e0f21fa-9a5a-4ae7-a9a6-ca1f24294b86"]
                                    requestData.include_player_ids = notificationExtraData.include_player_ids || [];
                                } else { // MULTIPLE USER IDs
                                    console.log("NEITHER SEGMENTS NOR PLAYER IDs HAVE BEEN SPECIFIED, THEREFORE FILTERING BY TAGS")
                                    requestData.filters = [];
                                    for(var r of recipients) {
                                        requestData.filters.push({"field": "tag", "key": "user._id", "relation": "=", "value": r._id || ""});
                                    }
                                }
                                break;
                            case "Single":
                                requestData.filters = [
                                    {"field": "tag", "key": "user._id", "relation": "=", "value": recipients[0]._id || ""}
                                ];
                        }

                        console.log("REQUEST DATA -> " + JSON.stringify(requestData))

                        const headers = {
                            ContentType : "application/json; charset=utf-8",
                            Authorization: 'Basic ' + env.oneSignalAPIKey
                        };
                        const options = {
                            url: 'https://onesignal.com/api/v1/notifications', //THIS MIGHT NOT BE NEEDED
                            host: "onesignal.com",
                            port: 443,
                            path: "/api/v1/notifications",
                            method: 'POST',
                            headers: headers,
                            body: requestData,
                            json: true
                        };
                        request(options, function (error, response, body) {
                            if (error) {
                                console.log("PUSH Error", error);
                            } else if(body.hasOwnProperty("id") && body.hasOwnProperty("recipients")) {
                                // FIND A WAY TO STORE THE .id OF THE NOTIFICATION
                                storeNotification(body);
                                // IN CASE YOU MIGHT WANT TO DELETE LATER IN THE FUTURE
                                console.log("Response: ", JSON.stringify(body));
                                resolve(true);
                            } else {
                                console.log("SOMETHING WRONG HAPPENED!!!")
                                console.log("error -> " + JSON.stringify(error))
                                console.log("response -> " + JSON.stringify(response))
                                console.log("body -> " + JSON.stringify(body))
                                resolve(false);
                            }
                        });
                    break;
                    default:
                        console.log("NO PROVIDER SPECIFIED ...")
                    break;
                }
                
            } catch (e){
                console.log("Some Error -> " + JSON.stringify(e));
                resolve(false);
            }
        });
    },

    cancelNotification: function(id){  // NOTE THAT THIS id HASN'T BEEN USED WITHIN THE FUNCTION
        return new Promise((resolve, reject) => {
            const headers = {
                ContentType : "application/json; charset=utf-8",
                Authorization: 'Basic ' + env.oneSignalAPIKey
            };
            const options = {
                url: 'https://onesignal.com/api/v1/notifications' + '/' + id + '?app_id=' + env.oneSignalAppID, //THIS MIGHT NOT BE NEEDED
                host: "onesignal.com",
                port: 443,
                path: "/api/v1/notifications" + "/" + id + "?app_id=" + env.oneSignalAppID,
                method: 'DELETE',
                headers: headers,
                json: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log("PUSH Error", error);
                } else if(body.hasOwnProperty("success") && (body.success == true) ) {
                    console.log("Response: ", JSON.stringify(body));
                    resolve(true);
                }
                resolve(false);
            });
        });
    }
};