'use strict';

var push = require('../CONTACT_MODULES/push_notification/push'); // onesignal, 
var sms = require('../CONTACT_MODULES/sms/sms'); // twilio, 
var email = require('../CONTACT_MODULES/email/email'); // sendgrid, nodemailer, 
var ussd = require('../CONTACT_MODULES/ussd/ussd'); // hubtel, africas_token, 

var mongooseHandler = require('../DATABASE_SYSTEM_HANDLERS/MongooseHandler');

module.exports = {

    contact: async function (type, body, defaultCmeth) {
        return new Promise(async (resolve, reject) => {
            console.log("\nPARAMS ...");
            console.log("Type -> " + type + "; Default CMeth -> " + (defaultCmeth));
            console.log("Body -> " + JSON.stringify(body) + "\n");

            // Type is either user/employee/client/stakeholder/bank/company
            var recipients = body[type], data = body.data, cmeths = body.contact_methods || [];
            var recipientObjects = [], recipientsPreferredCMeths = { "Email": [], "SMS": [] }; // , "Notification": [] };
            
            if(recipients.length <= 0){ // DON'T WORRY ABOUT ANY CONFUSION WITH recipientsPreferredCMeths (SAME SHIT!!)
            // COZ recipients HAS ALL RECIPIENTS, & recipientsPreferredCMeths HAS RECIPIENTS BASED ON CMeths CATEGORIES 
                console.log("NO RECIPIENT OBJECTS IN ARRAY");
                resolve({code: 200, resultData: {success: true, message: 'No recipients specified'}});
            } 

            for (var recipient of recipients) { // SET UP ALL RECIPIENT OBJECTS HERE FIRST
                try {
                    // recipient MIGHT BE A RECIPIENT OBJECT / JUST THE ID STRING
                    recipient = await mongooseHandler.getPropAsObjectOrId(type, recipient, "obj");
                    console.log("\nRecipient -> " + JSON.stringify(recipient));
                    // CALLING THIS FUNCTION UP HERE MUST WHOLE RECIPIENT (USER/EMPLOYEE/CLIENT/STAKEHOLDER) OBJECT
                    if (recipient && Object.keys(recipient).length > 0) {
                        recipientObjects.push(recipient);
                        console.log("\nADDED TO THE GENERAL recipients ARRAY")
                    } else console.log("\nALREADY EXISTS IN GENERAL recipients ARRAY")
                    
                    // cmeths IS NOW AN ARRAY SO EDIT THIS CODE ACCORDINGLY
                    if (defaultCmeth || cmeths.length <= 0) { // RUN THIS FOR RECIPIENTS WITH PREFERRED (DEFAULT) CMETH ONLY ..
                        //  NOW PUSH THIS recipient INTO THE recipientsPreferredCMeths OBJECT, BASED ON PREFERRED CMeth
                        if(!recipient.contact_method) {
                            recipient.contact_method = "Email"; // EVEN CONSIDER UPDATING THIS ON THE DB SEF ..
                            console.log("RECIPIENT HAS NO PREFERRED / DEFAULT CONTACT METHOD, THEREFORE, MAKING IT -> "
                             + recipient.contact_method);
                        }
                        if(recipient.contact_method && !recipientsPreferredCMeths.hasOwnProperty(recipient.contact_method)) {
                            recipientsPreferredCMeths[recipient.contact_method] = [];
                            console.log("\nADDED A NEW CONTACT METHOD (" + recipient.contact_method + ") TO recipientsPreferredCMeths -> "
                             + JSON.stringify(recipientsPreferredCMeths[recipient.contact_method]));
                        }
                        if(!recipientsPreferredCMeths[recipient.contact_method].includes(recipient)) { // THIS IS A POTENTIAL BUG
                            // IT'S POSSIBLE THAT CALLING .includes() ON A WHOLE (MONGO-DB) OBJECT MIGHT RETURN A MISLEADING BOOLEAN RESULT
                            recipientsPreferredCMeths[recipient.contact_method].push(JSON.parse(JSON.stringify(recipient)));
                            console.log("\nAdded Recipient with CMeth (" + recipient.contact_method + ") -> " 
                            + JSON.stringify(recipientsPreferredCMeths[recipient.contact_method]));
                        }
                    }

                    console.log("\n\nrecipients : " + recipientObjects.length + "\nrecipients with cmeth (" + recipient.contact_method 
                    + ") : " + recipientsPreferredCMeths[recipient.contact_method].length + "\n\n")
                } catch(err) {
                    console.log("ERROR -> " + JSON.stringify(err))
                    continue;
                }
            }
            recipients = JSON.parse(JSON.stringify(recipientObjects)); 
            console.log("\n\n\nRECIPIENTS ARRAY (" + recipients.length + ") -> " + JSON.stringify(recipients))
            console.log("\n\nRECIPIENTS (" + Object.keys(recipientsPreferredCMeths).length +
            ") CMETHS ARRAYS -> " + JSON.stringify(recipientsPreferredCMeths) + "\n\n\n")
            
            if (defaultCmeth || cmeths.length <= 0) { // RUN THIS FOR RECIPIENTS WITH PREFERRED CMETH ONLY ..
                // NOW, IN CASE SOME RECIPIENTS IN recipientObjects HAPPEN TO NOT BE IN ANY OF THE CMeth CATEGORIES OF recipientsPreferredCMeths
                // THEN ADD THEM TO THE DEFAULT 'Email' CATEGORY OF recipientsPreferredCMeths
                var isLonely = true;
                for(var r of recipients){
                    console.log("Checking if " + r.full_name + " is lonely ..");
                    isLonely = true;
                    for(var cat in recipientsPreferredCMeths){
                        if ( (recipientsPreferredCMeths[cat].filter(e => e._id.toString() == r._id.toString()).length > 0) ) {
                            isLonely = false;
                            console.log(r.full_name + " is not lonely, checking the next recipient ..");
                            break;
                        }
                        // if(recipientsPreferredCMeths[cat].includes(r)) {
                        //     isLonely = false;
                        //     console.log(recipient.full_name + " is not lonely, checking the next recipient ..")
                        //     break;
                        // }
                    } // IT'S VERY POSSIBLE THAT isLonely IS NOT EVEN NEEDED AT ALL IN THIS 2D LOOP
                    if(isLonely) {
                        console.log(r.full_name + " is very lonely :( adding to email recipients ..")
                        recipientsPreferredCMeths["Email"].push(JSON.parse(JSON.stringify(r)));
                    }
                }
            }

            if(recipients.length <= 0){ // DON'T WORRY ABOUT ANY CONFUSION WITH recipientsPreferredCMeths (SAME SHIT!!)
            // COZ recipients HAS ALL RECIPIENTS, & recipientsPreferredCMeths HAS RECIPIENTS BASED ON CMeths CATEGORIES 
                console.log("RECIPIENT OBJECTS ARRAY IS EMPTY");
                resolve({code: 200, resultData: {success: false, message: 'Recipients not available'}});
            } else {
                // DO THIS TO MAKE SURE THAT THE CONTACT METHODS NOT WITHIN cmeths ARRAY ..
                // BUT ARE WITHIN THE recipientsPreferredCMeths OBJECT ARE ADDED TO cmeths ..
                // BUUUUTTTTT, ONLY IF THE defaultCmeth IS true (FOR PREFERRED / DEFAULT CONTACT METHODS)
                if(defaultCmeth){
                    for(var cm in recipientsPreferredCMeths){
                        if(!cmeths.includes(cm)) {
                            cmeths.push(cm);
                            console.log("\nADDING CMETH (" + cm + ") TO cmeths -> " + JSON.stringify(cmeths));
                        }
                    }
                }
                              
                console.log("\n\nNOW, CONTACT METHODS -> " + JSON.stringify(cmeths));
                console.log("NOW, CONTACT DATA -> " + JSON.stringify(data));
                console.log("\n\nNOW, RECIPIENTS OBJECTS (" + recipients.length + ") ...");
                console.log(JSON.stringify(recipients));
                console.log("\n\nNOW, RECIPIENTS (WITH CMETH) OBJECTS (" + Object.keys(recipientsPreferredCMeths).length + ") ...");
                console.log(recipientsPreferredCMeths);      
                console.log("\n\n\n")

                var errmsgs = [], success = {value : false, contact_method : ""}, successes = [{value : false, contact_method : ""}];
                for (var cmeth of cmeths) { // []) { //
                    try {
                        var recipientsToContact = [];
                        if(defaultCmeth && recipientsPreferredCMeths.hasOwnProperty(cmeth)) 
                            recipientsToContact = recipientsPreferredCMeths[cmeth];
                        else recipientsToContact = recipients;
                        // 
                        console.log("\n\nWorking with Contact Method -> " + cmeth);
                        console.log("Recipients to Contact (" + recipientsToContact.length + ") -> " + JSON.stringify(recipientsToContact));
                        if(recipientsToContact.length <= 0) {
                            console.log("NO RECIPIENTS FOR " + cmeth + " CONTACT METHOD, MOVING ON ..")
                            continue; // IF NO RECIPIENTS, THEN CONTINUE TO NEXT ITERATION ..
                        }
                        // 
                        // FIRST, SET THE CONTACT METHOD PROPERTY, & IT'S VALUE TO false, JUST IN CASE
                        success.contact_method = cmeth; success.value = false;
                        console.log("\nDEFAULT RETURN VALUE -> " + JSON.stringify(success) + "\n");
                        // 
                        switch (cmeth) {
                            case "Notification": // ONLY WORKS FOR USERS
                                var canNotify = false, users = [];
                                if (type === 'user') {
                                    // THEN ALL recipientsToContact ARE ALREADY USER OBJECTS
                                    canNotify = true;
                                    users = recipientsToContact;
                                } else { // THIS CODE SNIPPET IS FOR CASES WHERE recipientsToContact AREN'T USERS
                                    // eg. COMPANIES, BANKS, etc
                                    canNotify = true; // YOU MUST SET THIS TO TRUE FIRST!! (YOU'LL KNOW WHY LATER)
                                    for (var recipient of recipientsToContact) {
                                        if (recipient && recipient.is_user === true) {
                                            users.push(recipient.user); // ADD THE USER OBJECT OF THE RECIPIENT
                                        } else canNotify = canNotify ? false : false;
                                        // SO canNotify GETS TO BE TRUE ONLY ONCE
                                    }
                                }
                                if (canNotify) success.value = await push.sendPushNotification(users, data);
                                else errmsgs.push('Only users can receive  Mobile app Notifications');
                                break;
                            case "SMS":
                                if (data.hasOwnProperty("message")) success.value = await sms.sendSMS(recipientsToContact, data);
                                else {
                                    success.value = false;
                                    errmsgs.push('No message in data object');
                                }
                                console.log(success.value);
                                break;
                            case "USSD": // USE THE TELECOM COMPANIES AVAILABLE
                                success.value = false;
                                errmsgs.push('USSD communication has not been implemented yet');
                                // PUT ALL THE USSD CODE RIGHT HERE ...
                                if (data.hasOwnProperty("USSD DATA CAN COME HERE"))
                                    success.value = await ussd.DOSOMETHINGHERE(recipientsToContact, data);
                                else {
                                    success.value = false;
                                    errmsgs.push('USSD ERROR MESSAGE COMES RIGHT HERE');
                                }
                                console.log(success.value);
                                break;
                            case "Post Mail":
                                success.value = false;
                                errmsgs.push('Post Mails must be sent by P.O. Box');
                                break;
                            default: // LEAVE THE default OPTION FOR "Email" & "Company Email"
                                success.value = false;
                                if (cmeth === "Email" || cmeth === "Company Email") {
                                    if (data.hasOwnProperty("subject") && data.hasOwnProperty("message"))
                                        success.value = await email.sendEmail(type, cmeth, recipientsToContact, data);
                                } 
                                console.log(success.value);
                        }
                        console.log("\nAPPENDING SUCCESS VALUE -> " + JSON.stringify(success) + "\n");
                        successes.push(success); // RESET success AFTER YOU APPEND IT BTW (JUST IN CASE)
                        success = JSON.parse(JSON.stringify({value : false, contact_method : ""}));
                    } catch(err){ // IF THIS ERR OCCURRED, THEN ONE OF THE CONTACT MODULES HAS RETURNED false VALUE
                        console.log("LOOP ERROR -> " + JSON.stringify(err));
                        continue; // THEREFORE JUST CONTINUE ONTO THE NEXT AVAILABLE CONTACT METHOD ...
                    }
                }
                
                // THEREFORE, NOW CHECK IF THERE WERE ANY SUCCESSES TO KNOW WHETHER MESSAGE WAS SENT OR NOT
                var shouldSendSuccess = false, cmethsSent = "";
                console.log("Now Checking Successess ..." + JSON.stringify(successes));
                for(var x of successes){
                    if (x.value) {
                        console.log('Message Sent by ' + x.contact_method);
                        cmethsSent += (x.contact_method + ", ");
                        shouldSendSuccess = true;
                    }
                }
                cmethsSent = cmethsSent.trim().slice(0, -1); // MAKE SURE TO REMOVE THE LAST ',' THOUGH
                if(shouldSendSuccess) resolve({code: 200, resultData: {success: true, message: 'Message Sent by ' + cmethsSent}});
                else {
                    console.log("REJECTING!!!");
                    reject({code: 400, resultData: {success: false, message: 'Sorry, some error occurred', errmsgs: errmsgs}});
                }
            }
        });
    },
      
};
