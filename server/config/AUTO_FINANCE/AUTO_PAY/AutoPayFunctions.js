'use strict';

var compose = require('composable-middleware');
var request = require('request');

var userempclientstakefunct = require('../../../api/GLOBAL_CONTROLLER/OTHER_FUNCTION_HELPERS/UserEmployeeClientStakeHolderServerFunctions');
var dataHandler = require('../../../api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
var autoPayModelscontrollersHandler = dataHandler.modelscontrollersHandler;

var funct = require('../../../functions');
var settings = funct.settings;
var config = funct.config;
var auth = funct.auth;
var InternalAutoAuditingFunct = funct.InternalAutoAuditingFunct;
funct = funct.funct;

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
//          DATA-FILE LOGGING FUNCTIONS
var DataHandlerModels = {
    "account": require('./DATA/ACCOUNT/account.model'),
    "user": require('../../../api/USER/user.model'),
    "investment": require('../../../public/AUTO_INVESTMENT/DATA/INVESTMENT/investment.model'),
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS

function getDataHandlerModel(type) {
    return DataHandlerModels[type];
}

async function getAllAutoPayObjects(type, condition) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoPayModelscontrollersHandler.getAll(getDataHandlerModel(type), JSON.stringify(condition));
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || { success: false, message: 'Sorry, some error occurred' }
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
        }
    });
}

async function getAutoPayObject(type, id) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoPayModelscontrollersHandler.get(getDataHandlerModel(type), id);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || { success: false, message: 'Sorry, some error occurred' }
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
        }
    });
}

async function saveAutoPayObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoPayModelscontrollersHandler.add(getDataHandlerModel(type), data);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || { success: false, message: 'Sorry, some error occurred' }
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
        }
    });
}

async function updateAutoPayObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoPayModelscontrollersHandler.update(getDataHandlerModel(type), data._id, data);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || { success: false, message: 'Sorry, some error occurred' }
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
        }
    });
}

async function deleteAutoPayObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoPayModelscontrollersHandler.delete(getDataHandlerModel(type), data._id);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || { success: false, message: 'Sorry, some error occurred' }
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
        }
    });
}

function sendResponse(res, status, data) {
    if (res) {
        return res.status(status).send(data);
    }
}


async function contactRecipient(type, contactBody, defaultCmeth = false) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await userempclientstakefunct.contact(type, contactBody, defaultCmeth);
            resolve(result);
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({ code: 400, resultData: { err: err, success: false, message: 'Sorry, some error occurred' } });
        }
    });
}

async function confirmAutoPaymentForAutoInvestment(type, data, extra) {
    return new Promise(async (resolve, reject) => {
        try { // 
            if (type && (type === "investment") && data && extra && extra["source"]) {

                switch (extra.source) {
                    case "flutterwave":
                        if (data["event.type"] && data["event.type"].length > 0) {
                            console.log("x")
                            let eType = data["event.type"], transactionSuccessful = false, txRef = null;
                            console.log("FLUTTERWAVE EVENT TYPE -> " + eType);
                            if (eType === "Transfer") { // FOR BANK TRANSFER TRANSACTIONS ..
                                transactionSuccessful = (data.transfer && data.transfer.status && (data.transfer.status === "SUCCESSFUL"));
                                if (data.transfer && data.transfer.reference) txRef = data.transfer.reference;
                                console.log("a")
                            } else if (["CARD_TRANSACTION", "ACCOUNT_TRANSACTION", "MOBILEMONEYGH_TRANSACTION", "MPESA_TRANSACTION"].includes(eType)) {
                                // FOR OTHER METHODS -> CARD, ACCOUNT, GH - MOMO, KENYA - MPESA, ..
                                transactionSuccessful = (data.status && (data.status === "successful"));
                                if (data.txRef) txRef = data.txRef;
                                console.log("b")
                            }
                            // 
                            if (transactionSuccessful && txRef) { // IF SUCCESSFULL, JUST UPDATE THE investment OBJECT USING THE .txRef IN data ..
                                console.log("TRANSACTION WAS SUCCESSFUL !!! !!!!");
                                console.log("REFERENCE -> " + txRef);
                                // THEREFORE, NOW GET THE INVESTMENT WITH txRef === .transaction_id
                                let result = await getAllAutoPayObjects(type, { "transaction_id": txRef });
                                // console.log("RESULT -> " + JSON.stringify(result));
                                let investment = result[0];
                                console.log("INVESTMENT -> " + JSON.stringify(investment));
                                if (investment && investment._id) {
                                    console.log("c")
                                    investment.payment_confirmed = true;
                                    /*                                    
                                        "payment": {
                                            "process": "",
                                            "method": "",
                                            "payment_amount": {
                                                "price": 0,
                                                "total_price": 0,
                                                "total_amount": 0,
                                                "currency": "USD",
                                                "symbol": "$",
                                                "country": "United States",
                                                "country_symbol": "US"
                                            },
                                            "payment_confirmed": false,
                                            "transaction": {
                                                "transaction_id": "",
                                                "transaction_data": {}
                                            }
                                        }
                                    */
                                    // THIS IS A VERY STUPID ISSUE WITH MONGO-DB, IT CAN'T TAKE JSON WITH A KEY WITH '.' OPERATOR
                                    // data HAS A KEY "event.type" SO THIS CAUSES AN ERROR WITH MONGO-DB, THEREFORE MODIFYING IT ..
                                    if (data["event.type"]) {
                                        data["event_type"] = data["event.type"];
                                        delete data["event.type"];
                                    }
                                    investment.data.payment = {
                                        ...(investment.data.payment || {}),
                                        
                                        // SO NOW, ONLY UPDATE WHAT YOU NEED TO ..
                                        "method": extra.source || "",
                                        "payment_confirmed": true,
                                        "transaction": { "transaction_id": investment.transaction_id, "transaction_data": data },

                                        // NO NEED TO UPDATE THESE ONES, COZ THEY WERE ALREADY DONE IN THE FRONT-END
                                        // "process": "paynow",
                                        // "payment_amount": {
                                        //     "price": data.amount || 0,
                                        //     "total_price": data.amount || 0,
                                        //     "total_amount": data.amount || 0,
                                        //     "currency": data.currency || "",
                                        //     "symbol": data.currency || "",
                                        //     "country": data.country || "United States",
                                        //     "country_symbol": data.country || "US"
                                        // },

                                    }
                                    console.log("INVESTMENT PAYMENT DATA NOW ...");
                                    console.log(investment.data.payment);
                                    investment = await updateAutoPayObject(type, investment);
                                    console.log("\n\nINVESTMENT OBJECT UPDATED ..");
                                    console.log(investment);

                                } else {
                                    console.log("SORRY, CANNOT FIND investment ..")
                                    console.log("THEREFORE, SAVING THE TRANSACTION FOR FUTURE REFERENCE ..")

                                    // MAKE SURE YOU SAVE THE TRANSACTION data IN CASE YOU MIGHT NEED IT TO VERIFY INVESTMENT TRANSACTIONS MANUALLY !!!  !!!!

                                }
                            } else console.log("SORRY, TRANSACTION WAS NOT SUCCESSFUL ..")
                        }
                        break;
                    case "paystack":
                        break;
                    case "stripe":
                        break;
                }
                // 
                console.log("\n\nDONE CONFIRMING AUTO-PAYMENT FOR AUTO-INVESTMENT !!! !!!!")
                
                let user = investment.investor || {};
                console.log("ALERTING USER -> " + user.full_name + " (" + user.email + ")");
                if (user && user._id) {
                    var recipientsType = "user", contactBody = {
                        contact_methods: ["Email"],
                        data: {
                            subject: "[SAMPLE_COMPANY] Sponsorship Payment Confirmation !!", message: "Congratulations " + (user.full_name || user.first_name || "") + "!!"
                                + "\n\nYou just became a Sponsor in 1 of our projects!.\n\nVisit Your Dashboard (using the link below) to view Your Sponsorship in Real Estate!!\n\n"
                                + "https://app.[SAMPLE_COMPANY].com",
                            extra: { autoEnum: "User" }
                        }
                    }; // THESE MIGHT BE RECIPIENT OBJECTS / MIGHT JUST BE IDs
                    contactBody[recipientsType] = [user];
                    console.log("CONTACT BODY -> " + JSON.stringify(contactBody));
                    /* result = NO NEED TO await */ contactRecipient(recipientsType, contactBody, false);
                    // console.log("\CONTACT RESULT -> " + JSON.stringify(result));
                } else console.log("investment HAS NO investor PROPERTY (weird ??)");

                console.log("RETURNING SUCCESS NOW ...")
                resolve({ code: 200, resultData: { success: true, message: "Transaction Received" } });
                // 
            } else resolve({ code: 400, resultData: { success: false, message: "Incorrect Data input" } });
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PUBLIC FUNCTIONS

var AutoPayFunctions = {


    ////////////////////////////////////////////////////////////////////////
    //  RAUTO-INVESTMENT FUNCTIONS

    // router.put('/confirmation/:source', autoPayFunct.confirmAutoPayment(type));
    confirmAutoPayment: function (type = "investment") {
        if (!type) throw new Error('Type needs to be set');
        if (!["investment"].includes(type)) throw new Error('Type needs to be valid');
        return compose()
            // .use(auth.isAuthorized(['confirm', type])) //
            .use(async function confirm(req, res, next) {
                try {
                    if ((req.params.source) && (req.body && Object.keys(req.body).length > 0)) {
                        console.log("RECEIVING A PAYMENT CONFIRMATION FROM -> " + req.params.source);
                        if (!["flutterwave", "paystack", "stripe"].includes(req.params.source)) {
                            return sendResponse(res, 404, { success: false, message: "Incorrect / Unauthorized Source" });
                        }

                        var extra = { source: req.params.source };
                        // LATER THIS WILL HAVE TO BE MADE GENERIC (WHEN AUTO-PAY ALLOWS PAYMENT FOR OTHER AUTO-SERVICES :)

                        switch (extra.source) {
                            case "flutterwave":
                                break;
                            case "paystack":
                                break;
                            case "stripe":
                                break;
                        }

                        console.log("NOW, ABOUT TO CONFIRM AUTO-PAYMENT ..");
                        var result = await confirmAutoPaymentForAutoInvestment(type, req.body, extra);
                        return sendResponse(res, result.code, result.resultData);
                    } else return sendResponse(res, 404, {
                        success: false,
                        message: "Data not specified"
                    });
                } catch (err) {
                    console.log("ERROR -> " + (err));
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, { err: err, success: false, message: "Some Error Occurred" });
                }
            });
        return;
    },


    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    //  EXTRA AUTO-Pay FUNCTIONS

};

module.exports = AutoPayFunctions;

/*
// FLUTTERWAVE PAYMENT CONFIRMATION WEBHOOK HTTP PAYLOAD DATA

{
  "id": 126122,
  "txRef": "rave-pos-121775237991",
  "flwRef": "FLW-MOCK-72d0b2d66273fad0bb32fdea9f0fa298",
  "orderRef": "URF_1523185223111_833935",
  "paymentPlan": null,
  "createdAt": "2018-04-08T11:00:23.000Z",
  "amount": 1000,
  "charged_amount": 1000,
  "status": "successful",
  "IP": "197.149.95.62",
  "currency": "NGN",
  "customer": {
    "id": 22836,
    "phone": null,
    "fullName": "Anonymous customer",
    "customertoken": null,
    "email": "salesmode@ravepay.co",
    "createdAt": "2018-04-08T11:00:22.000Z",
    "updatedAt": "2018-04-08T11:00:22.000Z",
    "deletedAt": null,
    "AccountId": 134
  },
  "entity": {

    //   CARD TRANSACTIONS
    "card6": "539983",
    "card_last4": "8381"


    //  ACCOUNT TRANSACTIONS
    "account_number": "0690000037",
    "first_name": "Dele Moruf",
    "last_name": "Quadri"
      
    //   GH MOBILE MONEY TRANSACTIONS
    "id": "NO-ENTITY"
      
    //   KENYA - MPESA MOBILE MONEY TRANSACTIONS
    "id": "NO-ENTITY"
      
    //   CARD TRANSACTIONS
      
    //   CARD TRANSACTIONS

  },
  "event.type": "CARD_TRANSACTION"
}


*/
