var hubtel = require('twilio') // hubtel

var env = {
    companyPhoneNumber: process.env.COMPANY_PHONE || "+1 202 350 3828",
    // HUBTEL STUFF 
    hubtelAccountSID: process.env.HUBTEL_ACCOUNT_SID || "AC382ac76f2538ba61af41b7519a45b62b", // 
    hubtelAuthToken: process.env.HUBTEL_AUTHORIZATION_TOKEN || "9fa665eb4a22a7112537198ce11825ff", // 
    hubtelPhoneNumbers: process.env.HUBTEL_PHONE_NUMBERS || ["+1 202 350 3828"] // ["+1 256-906-5187"] // 

}, provider = "hubtel", cmeth = "USSD";

var hubClient = hubtel(env.hubtelAccountSID, env.hubtelAuthToken);

exports.sendUSSD = async function (recipients, data) {
    return new Promise((resolve, reject) => {
        try {
            var subject = data.subject, message = data.message, extra = data.extra, phonenumber = "",
                companyPhoneNumber = env.companyPhoneNumber || env.hubtelPhoneNumbers[0];
            var str = subject + "\n\n" + message;
            var ussdExtraData = extra[cmeth] || {};

            for (var recipient of recipients) {
                phonenumber = recipient.phone;
                if ((phonenumber.length > 0) && (companyPhoneNumber.length > 0)) {
                    ussdToSend = {
                        body: str,
                        to: phonenumber,
                        from: companyPhoneNumber
                    };
                    console.log("\nUSSD to recipient -> " + JSON.stringify(ussdToSend));
                                    
                    switch(provider){ // THIS PIECE OF CODE MIGHT HAVE TO BE MOVED HIGHER UP (WHEN MORE providers COME ALONG)
                        case "hubtel":
                            hubClient.messages.create(ussdToSend, function (err, data) {
                                if (err) {
                                    console.log('Could not send USSD');
                                    console.log(err);
                                } else {
                                    console.log('USSD sent');
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