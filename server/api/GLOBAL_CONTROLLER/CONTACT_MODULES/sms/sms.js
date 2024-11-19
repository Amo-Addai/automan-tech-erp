var twilio = require('twilio');

var env = {
    companyPhoneNumber: process.env.COMPANY_PHONE || "+1 202 350 3828",
    // TWILIO STUFF 
    twilioAccountSID: process.env.TWILIO_ACCOUNT_SID || "AC382ac76f2538ba61af41b7519a45b62b", // 
    twilioAuthToken: process.env.TWILIO_AUTHORIZATION_TOKEN || "9fa665eb4a22a7112537198ce11825ff", // 
    twilioPhoneNumbers: process.env.TWILIO_PHONE_NUMBERS || ["+1 202 350 3828"] // ["+1 256-906-5187"] // 

}, provider = "twilio", cmeth = "SMS";

var twClient = twilio(env.twilioAccountSID, env.twilioAuthToken);

exports.sendSMS = async function (recipients, data) {
    return new Promise((resolve, reject) => {
        try {
            var subject = data.subject, message = data.message, extra = data.extra, phonenumber = "",
                companyPhoneNumber = env.companyPhoneNumber || env.twilioPhoneNumbers[0];
            var str = subject + "\n\n" + message;
            var smsExtraData = extra[cmeth] || {};

            for (var recipient of recipients) {
                phonenumber = recipient.phone;
                if ((phonenumber.length > 0) && (companyPhoneNumber.length > 0)) {
                    smsToSend = {
                        body: str,
                        to: phonenumber,
                        from: companyPhoneNumber
                    };
                    console.log("\nSMS to recipient -> " + JSON.stringify(smsToSend));
                                    
                    switch(provider){ // THIS PIECE OF CODE MIGHT HAVE TO BE MOVED HIGHER UP (WHEN MORE providers COME ALONG)
                        case "twilio":
                            twClient.messages.create(smsToSend, function (err, data) {
                                if (err) {
                                    console.log('Could not send SMS');
                                    console.log(err);
                                } else {
                                    console.log('SMS sent');
                                    console.log(data);
                                }
                            });
                        break;
                        default:
                            console.log("NO PROVIDER SPECIFIED ...")
                        break;
                    }
                    
                }
            }
            resolve(true);

        } catch (e) {
            console.log("Some Error -> " + JSON.stringify(e));
            resolve(false);
        }
    });
};