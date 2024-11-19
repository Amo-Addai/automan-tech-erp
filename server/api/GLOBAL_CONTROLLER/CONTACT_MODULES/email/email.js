'use strict';

//////           SAMPLE NODEMAILER SMTP TRANSPORT
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

var env = {
    //  PUT PARAMS FOR EMAILING RIGHT HERE!    
    companyEmail: process.env.COMPANY_EMAIL || "Cofundie Investment Technologies <invest@cofundie.com>",
    companyEmailPassword: process.env.COMPANY_PASSWORD || "CoFundie2019!",
    sendgridApiKey: process.env.SENDGRID_API_KEY || "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",
    mailgunDomain: process.env.MAILGUN_DOMAIN || "",
    mailgunSecret: process.env.MAILGUN_SECRET || "",
    mailgunBaseUri: process.env.MAILGUN_BASE_URI || "https://api.mailgun.net/v3",

}, provider = "sendgrid", cmeth = "Email";
// var cmeth1 = "Email", cmeth2 = "Company Email";
// NO NEED FOR THESE COZ export.sendEmail() ALREADY TAKES cmeth ARGUMENT


function sendEmail(options) {
    // options = { 
    //     from: companyEmail, to: emails, // 'email, email, email, ...'
    //     subject: subject, text: message,
    //     template: template, context: context
    // }

    switch(provider){
        case "nodemailer":
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: env.companyEmail,
                    pass: env.companyEmailPassword
                }
            });
            // var options = {
            //     from: '"AUTOMAN CONGLOMERATE" <automan.co.gh@gmail.com>', // sender address
            //     to: 'kwadwoamoad@gmail.com, amegashiestephanie7@gmail.com', // list of receivers
            //     subject: 'Hello ✔', // Subject line
            //     text: 'Hello world?', // plain text body
            //     html: '<b>Hello world?</b>' // html body
            // };
            transporter.sendMail(options, (err, data) => {
                if (err) {
                    console.error('\n\nCould not send Email\n\n');
                    console.log(err);
                } else {
                    console.log('\n\nEmail sent');
                    console.log(data);
                    // Preview only available when sending through an Ethereal account
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(data) + "\n\n");
                }
            });
        break;
        case "sendgrid":
            sgMail.setApiKey(env.sendgridApiKey);
            // var options = {
            //     to: 'test@example.com',
            //     from: 'test@example.com',
            //     subject: 'Sending with Twilio SendGrid is Fun',
            //     text: 'and easy to do anywhere, even with Node.js',
            //     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            // };
            options = { ...options, to: (options.to || "").split(",") }
            for(var x of ["html", "template", "context"]) if (options.hasOwnProperty(x)) delete options[x];
            console.log("\nSENDGRID OPTIONS -> " + JSON.stringify(options));
            sgMail.sendMultiple(options); // sgMail.send(options);
        break;
        case "mailgun":
            let mailgunUri = `${env.mailgunBaseUri}/${env.mailgunDomain}/messages`;
            options = {
                method: 'POST', uri: mailgunUri, headers: { 'Authorization': `Basic ${new Buffer(`api:${env.mailgunSecret}`).toString('base64')}` },
                formData: { ...options } // FIGURE OUT WHAT TO DO WITH .html .template .context
            }
            console.log("\nMAILGUN OPTION -> " + JSON.stringify(options));
            request(options).then(() => { // FIGURE OUT HOW TO HANDLE ANY err
                console.log("\b\bEmail Sent");                
            })
        break;
        default:
            console.log("NO PROVIDER SPECIFIED ...")
        break;
    }
};

exports.sendEmail = async function (type, cmeth, recipients, data) {
    return new Promise((resolve, reject) => {
        try {

            var subject = data.subject, message = data.message, extra = data.extra,
                companyEmail = env.companyEmail;
            var emailExtraData = extra[cmeth] || {};
            var html = emailExtraData.html || "", template = emailExtraData.template || "", context = emailExtraData.context || {};

            var email = "", emails = "", emailsArr = [];

            for (var recipient of recipients) {
                console.log("\nEmail will be sent to recipient -> " + JSON.stringify(recipient));
                switch (cmeth) {
                    case "Email":
                        email = recipient.email || "";
                        break;
                    case "Company Email": // ONLY WORKS FOR USERS
                        console.log("THIS MUST ONLY RUN IF THIS AUTO-API CONTAINS USER TYPES (EMPLOYEES/CLIENTS/STAKE-HOLDERS");
                        if (type === 'user') email = recipient.company_email || "";
                        else { // IF recipient HAS NO is_user PROPERTY (eg. BANK AND COMPANY OBJECTS) THEN FALSE
                            if (recipient.is_user) email = recipient.user.company_email || "";
                            else console.log(recipient._id + " is not a user");
                        }
                        break;
                    default: continue;
                }
                if (email && (email.length > 0) && (!emailsArr.includes(email)) && (!emails.includes(email))) {
                    email = email.trim();
                    emailsArr.push(email);
                    emails += (email + ", ");
                } else console.log("Incorrect / Duplicate Email -> " + email);
            }
            emails = emails.trim().slice(0, -1); // MAKE SURE TO REMOVE THE LAST ',' THOUGH

            var emailToSend = {
                from: companyEmail,
                to: emails,
                subject: subject,
                text: message,
                html: html,
                template: template,
                context: context
            };
            console.log("\nEmail to Send -> " + JSON.stringify(emailToSend));
            sendEmail(emailToSend);
            resolve(true);

        } catch (e) {
            console.log("Some Error -> " + JSON.stringify(e));
            resolve(false);
        }
    });
};
