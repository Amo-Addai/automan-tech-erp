'use strict';

var compose = require('composable-middleware');
var request = require('request');

// EXTRA IMPORTS FOR THIS AUTO-FEATURE
var userempclientstakefunct = require('../../api/GLOBAL_CONTROLLER/OTHER_FUNCTION_HELPERS/UserEmployeeClientStakeHolderServerFunctions');
var dataHandler = require('../../api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
var autoInvestmentModelscontrollersHandler = dataHandler.modelscontrollersHandler;

var funct = require('../../functions');
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
    "user": require('../../api/USER/user.model'),
    "message": require('../../api/MESSAGE/message.model'),
    "account": require('../../config/AUTO_FINANCE/AUTO_PAY/DATA/ACCOUNT/account.model'),
    "investment": require('./DATA/INVESTMENT/investment.model'),
    "portfolio": require('./DATA/PORTFOLIO/portfolio.model'),
    "asset": require('./DATA/ASSET/asset.model'),
    "property": require('./DATA/PROPERTY/property.model'),
    "stock": require('./DATA/STOCK/stock.model'),
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS

function getDataHandlerModel(type) {
    return DataHandlerModels[type];
}

async function getAllAutoInvestmentObjects(type, condition) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoInvestmentModelscontrollersHandler.getAll(getDataHandlerModel(type), JSON.stringify(condition));
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

async function getAutoInvestmentObject(type, id) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoInvestmentModelscontrollersHandler.get(getDataHandlerModel(type), id);
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

async function saveAutoInvestmentObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoInvestmentModelscontrollersHandler.add(getDataHandlerModel(type), data);
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

async function updateAutoInvestmentObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoInvestmentModelscontrollersHandler.update(getDataHandlerModel(type), data._id, data);
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

async function deleteAutoInvestmentObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoInvestmentModelscontrollersHandler.delete(getDataHandlerModel(type), data._id);
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

async function optionStock(option, stock) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(option + " OPTION ON STOCK -> " + JSON.stringify(stock));
            resolve({ code: 200, resultData: { success: true, message: "IMPLEMENT THIS FUNCTIONALITY" } });

        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}


async function joinAutoInvestmentWaitlist(type, obj, data, user) {
    return new Promise(async (resolve, reject) => {
        try { // WORK WITH data -> userData, propertyWaitlistData, messageData
            if (user && user._id) {

                // MAKE SURE THAT user EVEN EXISTS 1ST, BEFORE DOING ANYTHING ..

                let { userData, propertyWaitlistData, messageData } = data, message = null;

                /*                
                messageData: {
                    user: props.user._id, 
                    type: "Request",
                    message: "",
                    data: {
                        "senderType": "User"
                    }
                }
                */
                if (messageData && messageData.message && messageData.message.length > 0) {
                    console.log("\n\nCREATING A NEW MESSAGE OBJECT FROM USER -> " + JSON.stringify(messageData));
                    message = await saveAutoInvestmentObject("message", messageData);
                    if (message) messageData = message; // <- WORK WITH THIS HOWEVER YOU PREFER ..
                }

                /* 
                userData: {
                    type: (props.userType || (props.user || {}).type || ""),
                    data: {
                        "subscribed": true,
                        "contact_method": "",
                        "interests": {
                            "properties": [obj._id*]
                        },
                    }
                },
                */

                if (userData && userData.data && userData.data.contact_method && userData.data.contact_method.length > 0) user.contact_method = userData.data.contact_method;
                if (!user.data.interests) user.data.interests = {};
                if (!user.data.interests.properties) user.data.interests.properties = [];
                user.data.interests.properties.push(obj._id);
                console.log("\n... NOW, UPDATING THE USER'S INTEREST IN THIS PROPERTY ...\n")
                user = await updateAutoInvestmentObject("user", user);

                /*
                propertyWaitlistData: {
                    "Investors": [props.user /*._id*], // "Prospects": [], <- THIS IS FOR JOINING WAITLIST FROM THE WEBSITE ..
                }, 
                */
                // NO NEED TO ASSIGN THE ENTIRE propertyWaitlistData["Investors"] TO obj.waitlist["Investors"]
                // RATHER, YOU CAN ADD user._id TO obj ..
                if (!obj.waitlist["Investors"]) obj.waitlist["Investors"] = []
                obj.waitlist["Investors"].push(user._id);
                console.log("\n... NOW, UPDATING THE ASSET (" + type + ") WITH THE NEW WAITLIST ...\n")
                obj = await updateAutoInvestmentObject(type, obj);
                // 
                // MAKE SURE YOU ALSO SAVE ITS .asset PROP ALSO (COZ obj ISN'T THE ACTUAL ASSET ANKASA)
                // 

                resolve({ code: 200, resultData: { success: true, message: "Successfully joined the waitlist" } });

            } else resolve({ code: 400, resultData: { success: false, message: "INVESTOR DOESN'T EXIST" } });
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            console.log(e);
            reject(e);
        }
    });
}


async function makeAutoInvestment(type, obj, data, user) {
    return new Promise(async (resolve, reject) => {
        try { // WORK WITH data -> investmentData, accountData
            if (user && user._id) {

                // MAKE SURE THAT user EVEN EXISTS 1ST, BEFORE DOING ANYTHING ..

                let { investmentData, accountData } = data, investment = null, account = null;
                var baseUrl = config.protocol + (config.ip === "localhost/" ? "localhost:" + config.port + "/" : config.ip),
                    source = "flutterwave"; // KNOW HOW TO MAKE THIS HERE GENERIC eg. flutterwave / paystack / stripe / etc
                    // source CAN BE FEATURE-TOGGLED, OR THE USER CAN SELECT THE PAYMENT PROVIDER OPTION FOR THE REQUEST

                //  BEFORE ANYTHING ELSE, SAVE THE account WITH accountData ONLY IF IT DIDN'T ALREADY EXIST ..
                /* // THIS IS THE FORMAT OF accountData, COMING FROM THE CLIENT ..
                    accountData: { _id: "", type: "", name: "", user: props.user._id,
                        data: {
                            "ownerType": "User", "type": "",
                            "Bank Account": { "name": "", "number": "", "cvc": "" },
                            "Mobile Money": { "name": "", "number": "", "pin": "" }
                        }
                    } 
                */
                if (accountData && accountData._id && accountData._id.length > 0) {
                    // FIND A MUCH MORE OPTIMIZED WAY TO CHECK IF account ALREADY EXISTS IN THE DATABASE ..
                    // FOR NOW, IF account EXISTS, THEN EVEN THOUGH accountData HAS OTHER DATA, IT'LL BE DISCARDED ..
                    let result = await getAutoInvestmentObject("account", accountData._id);
                    if ((result.code && result.code === 400) || (result.resultData && !result.resultData.success)) {
                        console.log("ACCOUNT DOESN'T EXIST -> " + accountData._id);
                        delete accountData._id; // SO DELETE ._id FROM accountData
                        account = await saveAutoInvestmentObject("account", accountData);
                        if (account) accountData = account;
                    } else if (result && result._id) {
                        console.log("ACCOUNT ALREADY EXISTS -> " + result._id);
                        accountData = account = result;
                    } else console.log("POSSIBLE BUG RIGHT HERE !!!")
                    console.log("ACCOUNT DATA NOW -> " + JSON.stringify(accountData));
                } else if (accountData && accountData.name && accountData.name.length > 0) {
                    console.log("ACCOUNT DOESN'T EXIST -> " + accountData.name);
                    delete accountData._id; // SO DELETE ._id FROM accountData
                    account = await saveAutoInvestmentObject("account", accountData);
                    if (account) accountData = account;

                } else console.log("\n\nNOTHING TO DO ABOUT accountData YET ..\n\n");


                //  NOW FIRST, CHECK IF THE AUTOINVESTMENT MEETS ALL REQUIREMENTS ..
                // THEN MAKE IT WITH AUTO-PAY, USING investmentData & accountData

                /*
                investmentData: {
                    payment_confirmed: false,
                    investor: props.user._id,
                    property: obj._id,
                    data: {
                        "shares": {
                            "number": 1,
                            "share_price": {
                                ...obj.data.property_details.shares.share_price,
                                // "price": obj.data.property_details.shares.share_price.price || 0,
                                // "currency": obj.data.property_details.shares.share_price.currency || "USD",
                                // "symbol": obj.data.property_details.shares.share_price.symbol || "$",
                                "total": obj.data.property_details.shares.share_price.price * 1,
                            }
                        },
                        "payment": {
                            "method": ""
                        }
                    }
                },
                */

                if (true) { // WORK WITH investmentData RIGHT HERE, TO CHECK IVNESTMENT REQUIREMENTS ...

                    // BEFORE MOVING FORWARD, VERIFY THAT THE AUTOINVESTMENT WAS INDEED SUCCESSFUL FROM AUTO-PAY

                    //  THEN, SAVE THE investment WITH investmentData, THEN SAVE THE type WITH obj
                    investmentData["transaction_id"] = user.full_name + " - " + user._id + " - " +
                        obj.name + " - " + obj._id + " - " + Date(Date.now()).toString();
                    investment = await saveAutoInvestmentObject("investment", investmentData);

                } else resolve({ code: 400, resultData: { success: false, message: "INVESTMENT ISN'T VALID" } });

                if (investment && investment._id) {
                    console.log("NEW investment -> " + investment._id);
                    // NB: investmentData & investment ARE 2 DIFFERENT VARS
                    // 

                    // NOW, YOU CAN UPDATE type WITH obj (obj IS A PROPERTY)
                    console.log("\n... NOW, UPDATING THE ASSET (" + type + ") WITH THE NEW INVESTMENT ...\n")
                    obj.investments.push(investment._id);
                    obj.investors.push(user._id);

                    try {
                        switch (type) {
                            case "property":
                                let numShares = investment.data.shares.number || 0;
                                if (obj.data.property_details.shares.available >= numShares) {
                                    console.log("\nDEDUCTING " + numShares + " SHARE(S) FROM PROPERTY -> " + obj.name +
                                        "(" + obj.data.property_details.shares.available + ")");
                                    obj.data.property_details.shares.available -= numShares;
                                    console.log("AVAILABLE SHARES NOW -> " + obj.data.property_details.shares.available);
                                } else {
                                    console.log("INSUFFICIENT AVAILABLE SHARES")
                                    resolve({ code: 400, resultData: { success: false, message: "INSUFFICIENT AVAILABLE SHARES" } });
                                }
                                console.log("\n\n")
                                break;
                            default:
                                break;
                        }
                    } catch (e) {
                        console.log("ERROR -> " + JSON.stringify(e));
                    }

                    obj = await updateAutoInvestmentObject(type, obj);
                    // 
                    // MAKE SURE YOU ALSO SAVE ITS .asset PROP ALSO (COZ obj ISN'T THE ACTUAL ASSET ANKASA)
                    // 

                    try {
                        if(investmentData.data.payment.process === "paylater") {
                            let user = investment.investor || {}, 
                            investmentDetails = {
                                deal_name: investmentData.data.deal_name || "",
                                // 
                                total_payment_amount: investmentData.data.payment.payment_amount.total_amount || "",
                                total_payment_amount_currency: investmentData.data.payment.payment_amount.currency || "",
                                // 
                                total_return: investmentData.data.shares.projected_return.total_return || "",
                                total_returns: investmentData.data.shares.projected_return.total_returns || "",
                                total_return_currency: investmentData.data.shares.projected_return.currency || "",
                            };

                            console.log("ALERTING USER -> " + user.full_name + " (" + user.email + ")");
                            if (user && user._id) {
                                var recipientsType = "user", contactBody = {
                                    contact_methods: ["Email"],
                                    data: {
                                        subject: "Cofundie Sponsorship Confirmation !!", message: "Congratulations " + (user.full_name || user.first_name || "") + "!"
                                            + "\n\nYou just became a Sponsor in 1 of our projects!\n\n"
                                            
                                            // + "Visit Your Dashboard (using the link below) to view Your Sponsorship in Real Estate!\n\n"
                                            // + "https://app.cofundie.com\n\n"

                                            + "Here are your Sponsorship Details ..\n\n"
                                            + "Deal Name: " + ((investmentDetails || {}).deal_name || "") + "\n"

                                            + "Total Payment Amount: " + ((investmentDetails || {}).total_payment_amount || "") + "\n"
                                            + "Currency: " + ((investmentDetails || {}).total_payment_amount_currency || "") + "\n\n"
                
                                            + "Projected Return (Yield): " + ((investmentDetails || {}).total_return || "") + "\n"
                                            + "Total Projected Returns: " + ((investmentDetails || {}).total_returns || "") + "\n"
                                            + "Currency: " + ((investmentDetails || {}).total_return_currency || "") + "\n\n"            

                                            + "Ghana Bank Account(s) \n\n"

                                            + "Bank: Stanbic Bank Ghana ltd \n"
                                            + "Branch: Stanbic Heights Branch \n\n"
                                            
                                            + "Account Name: Cofundie Investment Technologies \n\n"

                                            + "USD - 9040008579002 \n"
                                            + "GHS - 9040008578596 \n"

                                            + "Swift Code: SBICGHAC \n"
                                            + "\n\n"


                                            + "Nigeria Bank Account(s) \n\n"

                                            + "Bank: Zenith Bank PLC \n"
                                            + "Branch: Warehouse II Apapa Lagos \n\n"

                                            + "Account Name: Cofundie Investment Technologies \n\n"

                                            + "USD - 5071190647 \n"
                                            + "NGN - 1016638074 \n"

                                            + "Swift Code: ZEIBNGLA \n"
                                            + "\n\n"


                                            + "Mobile Money Account (Vodafone) \n\n"

                                            + "Till Number: 976593 \n"
                                            + "Phone Number: 0509772406 \n"
                                            + "Account Name: Cofundie Investment Technologies \n\n"
                                            
                                            + "Vodafone Users - Dial *110#; Choose \"Make Payments\"; Select \"Buy goods\"; Choose 1 to Enter Till number (976593); "
                                            + "Enter the Amount, then the Name of Project as the reference; Confirm the Account name (Cofundie Investment Technologies); "
                                            + "Enter your pin to confirm and complete the transaction. \n\n"

                                            + "Non-Vodafone Users - Perform a normal mobile money transfer to Vodafone Mobile Money number 0509772406 \n\n"
                                            
                                            + "\n\n"

                                            + "Follow These Instructions, To Make Payment, and Confirm Your Sponsorship: \n\n"

                                            + "1. Take note of the Deal Name, Total Payment Amount, Account Number(s), with their Swift Code(s) and other details. \n\n"                    
                                            + "2. Take these details to your bank and make payment directly to the bank account. \n"
                                            + "Or, make payment by Online Bank Transfer (using our Swift Code), or Mobile Money (using our ..).\n\n"
                                            + "3. Remember to use the Deal name as the reference. \n\n"
                                            + "4. You will be issued a payment confirmation notification at the bank. \n\n"

                                            + "5. Send the following information to the email invest@cofundie.com: \n\n"
                                            + "- Full Name \n"
                                            + "- Email Address (same email used for your cofundie.com account) \n"
                                            + "- Phone Number \n\n"
                                            + "6. Attach a clear image of the payment confirmation slip (or screenshot). \n\n"

                                            + "7. You will receive an email immediately your payment is confirmed and your Cofundie dashboard will be automatically updated to reflect your sponsorship. \n\n" 
                                            + "8. Please give 5 working days for the payment to be confirmed.\n\n\n"
                                            
                                            + "NOTE: If you have any questions or complaints please send an email to support@cofundie.com or Call / WhatsApp +233 24 014 3392",

                                        extra: { autoEnum: "User" }
                                    }
                                }; // THESE MIGHT BE RECIPIENT OBJECTS / MIGHT JUST BE IDs
                                contactBody[recipientsType] = [user];
                                console.log("CONTACT BODY -> " + JSON.stringify(contactBody));
                                /* result = NO NEED TO await */ contactRecipient(recipientsType, contactBody, false);
                                // console.log("\CONTACT RESULT -> " + JSON.stringify(result));
                            } else console.log("investment HAS NO investor PROPERTY (weird ??)");
                        }
                    } catch (e) {
                        console.log("Some Error Occurred ..\n" + e);
                    }
    
                    resolve({
                        code: 200, resultData: {
                            success: true, message: "INVESTMENT SUCCESSFUL", data: {
                                redirectURL: "https://app.cofundie.com/app/dashboard",
                                callbackURL: baseUrl + "api/autofinance/autopay/confirmation/" + source,
                                transaction: { transaction_id: investmentData["transaction_id"], investment_id: investmentData["_id"] }
                            }
                        }
                    });

                } else resolve({ code: 400, resultData: { success: false, message: "INVESTMENT FAILED" } });

            } else resolve({ code: 400, resultData: { success: false, message: "INVESTOR DOESN'T EXIST" } });
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PUBLIC FUNCTIONS

var AutoInvestmentFunctions = {

    ////////////////////////////////////////////////////////////////////////
    //  FINANCIAL (ASSET) MARKET AUTO-INVESTMENT FUNCTIONS



    ////////////////////////////////////////////////////////////////////////
    //  REAL ESTATE (PROPERTY) MARKET AUTO-INVESTMENT FUNCTIONS

    // router.put('/:joinOrInvest/:id', autoInvestmentfunct.joinOrInvestAutoInvestment(obj));
    joinOrInvestAutoInvestment: function (type) {
        if (!type) throw new Error('Type needs to be set');
        if (!["asset", "property", "stock"].includes(type)) throw new Error('Type needs to be valid');
        return compose()
            .use(auth.isAuthorized(['joinOrInvest', type])) //
            .use(async function joinOrInvest(req, res, next) {
                try {
                    console.log("...");
                    if ((req.params.joinOrInvest) && (req.params.id) && (req.body && Object.keys(req.body).length > 0)) {
                        // if (!req.body.hasOwnProperty("extra")) // RUN SOME GENERAL VALIDATION HERE ..
                        //     return sendResponse(res, 404, { err: null, success: false, message: "Some Data not specified" });
                        // NOW RUN join/invest 
                        var result = { code: 400, resultData: { success: false, message: "Some error occured" } };
                        console.log("FUNCTION -> " + req.params.joinOrInvest + ", TYPE -> " + type
                            + ", & ID -> " + req.params.id);
                        console.log("BODY -> " + JSON.stringify(req.body));
                        var data = await getAutoInvestmentObject(type, req.params.id);
                        console.log(type + " DATA -> " + JSON.stringify(data)); // RESEARCH DATA
                        ///////////////////////////////////////////////////////////////////
                        //  NOW, CALL A FUNCTION TO join/invest THIS RESEARCH OBJECT RETRIEVED FROM DATABASE

                        switch (req.params.joinOrInvest) {
                            case "join": // WORK WITH req.body -> userData, propertyWaitlistData, messageData
                                result = await joinAutoInvestmentWaitlist(type, data, req.body, req.user);
                                return sendResponse(res, 200 /*result.code*/, {} /*result.resultData*/);
                                break;
                            case "invest": // WORK WITH req.body -> investmentData, accountData
                                result = await makeAutoInvestment(type, data, req.body, req.user);
                                return sendResponse(res, result.code, result.resultData);
                                break;
                        }
                    } else return sendResponse(res, 404, {
                        success: false,
                        message: "Options not specified"
                    });
                } catch (err) {
                    console.log("ERROR -> " + (err));
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, { err: err, success: false, message: "Some Error Occurred" });
                }
            });
    },


    ////////////////////////////////////////////////////////////////////////
    //  STOCK MARKET AUTO-INVESTMENT FUNCTIONS

    option: function (type) { // PERFORM A STOCK OPTION ON A PARTICULAR STOCK
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'stock') throw new Error('Type needs to be either autolog/autoevent');
        return compose()
            .use(auth.isAuthorized(['option', type])) //
            .use(async function option(req, res, next) {
                try {
                    if (req.body && Object.keys(req.body).length > 0) {
                        if (!req.body.option) return sendResponse(res, 404, { success: false, message: "No Stock Option Specified" });
                        var result = { code: 400, resultData: { success: false, message: "Some error occured" } };
                        console.log("TYPE -> " + type + " & ID -> " + req.params.id);
                        var data = await getAutoInvestmentObject(type, req.params.id);
                        console.log("DATA -> " + JSON.stringify(data));
                        ///////////////////////////////////////////////////////////////////
                        //  NOW, CALL A FUNCTION TO OPTION THIS STOCK RETRIEVED FROM DATABASE
                        result = await optionStock(req.body.option, data);
                        ///////////////////////////////////////////////////////////////////
                        console.log("RESULT -> " + JSON.stringify(result));
                        return sendResponse(res, result.code, result.resultData);
                    } else return sendResponse(res, 404, { success: false, message: "No Request Body" });
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, { err: err, success: false, message: "Some Error Occurred" });
                }
            });
    },

    StockMarketMonitoring: {

        optionStock: async function (option, stock) {
            return new Promise(async (resolve, reject) => {
                try {
                    var result = await optionStock(option, stock);
                    // WORK WITH THIS HOWEVER YOU WANT :)
                    console.log("RESULT -> " + JSON.stringify(result));

                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e));
                    reject(e);
                }
            });
        },

        monitorStockMarket: function () {

            async function getData(url) {
                return new Promise((resolve, reject) => {
                    const options = {
                        url: url,
                        method: 'GET',
                        // host: "",
                        // port: 443,
                        // path: "",
                        // headers: {},
                        // body: {},
                        // json: true,
                    };
                    request(options, function (error, response, body) {
                        if (error) {
                            console.log("Error", error);
                            resolve(null); // OR INSTEAD, CALL reject(error);
                        } else if (body) {
                            console.log("Response: ", JSON.stringify(body));
                            resolve(JSON.parse(body));
                        }
                    });
                });
            }
            function stockMarketAPIs(key) {
                var APIs = {
                    "GHANA STOCK EXCHANGE": "https://dev.kwayisi.org/apis/gse/",
                    "ALPHA VANTAGE": "https://",
                };
                return APIs[key];
            }
            function preprocessStockData(stock, data, source) {
                if (data) {
                    console.log("PREPROCESSING STOCK DATA (" + source + ") -> " + JSON.stringify(data));
                    console.log("INTO AUTO-STOCK OBJECT ->" + JSON.stringify(stock));
                    switch (source) {
                        case "GHANA STOCK EXCHANGE":
                            if (data.price) stock.price = data.price;
                            break;
                        case "GHANA STOCK EXCHANGE - EQUITY":
                            console.log("PREPROCESSING GSE EQUITY DATA!!!!");
                            // if(data.price) stock.price = data.price; // YOU CAN RE-SET THE VALUE FOR stock.price
                            break;
                    }
                    stock.data = Object.assign(stock.data || {}, data); // ASSIGN STOCK MARKET DATA TO THIS STOCK OBJECT
                    console.log("PREPROCESSED STOCK OBJECT -> " + JSON.stringify(stock));
                }
                return stock;
            }

            async function getGSEData() {
                try {
                    var key = "GHANA STOCK EXCHANGE";
                    var gseURL = stockMarketAPIs(key);
                    console.log(key + " URL -> " + gseURL);
                    //
                    var data = await getData(gseURL + "live");
                    if (data) { // VALIDATE STOCK data HOWEVER POSSIBLE
                        // data = validateStockData(data);
                        console.log(data.length + " DATA OBJECTS RETURNED, NOW PARSING ...");
                        for (var obj of data) {
                            console.log("STOCK OBJECT -> " + JSON.stringify(obj));
                            if (obj.name) {
                                var stocks = await getAllAutoInvestmentObjects("stock", { stock_name: obj.name });
                                console.log(stocks.length + " STOCKS RELATED TO " + obj.name)
                                for (var stock of stocks) { // NOW, GET STANDARD STOCK DATA INTO YOUR MONGOOSE OBJECT
                                    stock = preprocessStockData(stock, obj, key);
                                    // SAVE THIS STOCK FOR NOW, IN CASE THE PERSONAL EQUITY DATA REQUEST FAILS
                                    stock = await updateAutoInvestmentObject("stock", stock);
                                    console.log("UPDATED STOCK OBJECT FOR NOW -> " + JSON.stringify(stock));
                                    console.log("NOW, GETTING PERSONAL EQUITY DATA FOR STOCK -> " + stock.stock_name);
                                    var dataObject = await getData(gseURL + "equities/" + stock.stock_name);
                                    if (dataObject) {
                                        console.log("EQUITY DATA -> " + JSON.stringify(dataObject));
                                        // NOW, GET STANDARD STOCK DATA INTO YOUR MONGOOSE OBJECT
                                        stock = preprocessStockData(stock, dataObject, key + " - EQUITY");
                                        // NOW, YOU CAN GO AHEAD AND SAVE THE DATA ...
                                        stock = await updateAutoInvestmentObject("stock", stock);
                                        console.log("UPDATED STOCK OBJECT AGAIN -> " + JSON.stringify(stock));
                                        // NOW, YOU CAN SEND "Stock Market Monitoring" AUTO-AUDIT ...
                                        console.log("NOW, SENDING 'Stock Market Monitoring' AUTO-AUDIT ...");
                                        InternalAutoAuditingFunct.sendStockMarketMonitoringAutoAudit(stock); // MAKE SURE YOU PASS IN THE RIGHT PARAMS
                                    }
                                }
                            } else console.log("THIS STOCK OBJECT HAS NO NAME");
                        }
                    } else console.log("NO DATA AVAILABLE");
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e));
                    console.log("ERROR -> " + e);
                }
            } // NOW, YOU CAN FINALLY CALL THIS FUNCTION RIGHT HERE (YOU CAN await IT'S EXECUTION IF YOU PREFER :)
            console.log("GATHERING DATA FOR STOCK MARKET MONITORING!!!");
            getGSEData();

        },


    },

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    //  EXTRA AUTO-INVESTMENT FUNCTIONS

};

module.exports = AutoInvestmentFunctions;
