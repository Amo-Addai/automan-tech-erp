'use strict';

var compose = require('composable-middleware');
var request = require('request');

var dataHandler = require('../../../api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
var autoKYCModelscontrollersHandler = dataHandler.modelscontrollersHandler;

// LOCAL require's
var dateFormat = require('dateformat');

var funct = require('../../../functions');
var settings = funct.settings;
var config = funct.config;
var auth = funct.auth;
var InternalAutoAuditingFunct = funct.InternalAutoAuditingFunct;
funct = funct.funct;

let KYCService = "Appruve"; // OR -> Bace, ..

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
//          DATA-FILE LOGGING FUNCTIONS
var DataHandlerModels = {
    "kyc": require('./DATA/KYC/kyc.model'),
    "user": require('../../../api/USER/user.model'),
    "investment": require('../../../public/AUTO_INVESTMENT/DATA/INVESTMENT/investment.model'),
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS KYC

function getDataHandlerModel(type) {
    return DataHandlerModels[type];
}

async function getAllAutoKYCObjects(type, condition) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoKYCModelscontrollersHandler.getAll(getDataHandlerModel(type), JSON.stringify(condition));
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

async function getAutoKYCObject(type, id) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoKYCModelscontrollersHandler.get(getDataHandlerModel(type), id);
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

async function saveAutoKYCObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoKYCModelscontrollersHandler.add(getDataHandlerModel(type), data);
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

async function updateAutoKYCObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoKYCModelscontrollersHandler.update(getDataHandlerModel(type), data._id, data);
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

async function deleteAutoKYCObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoKYCModelscontrollersHandler.delete(getDataHandlerModel(type), data._id);
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

var KYC = {
    IDs: ["Passport", "National ID", "SSNIT", "Voter's ID", "TIN", "Bank Verification Number", "Health Insurance ID", "Driver's License"],
}

var AccessAppruveAPI = {
    tokens: {
        test: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJiZmEyMDQ3MC1lNjEzLTQyNTItYjkzZC03Y2U1ZTRhODNjYzYiLCJhdWQiOiJmNmJkN2YzMi00MTRkLTRlMTgtOWRiYS1jNmMzN2QyYzJhMjkiLCJzdWIiOiJmNjM2OWM2NC0zMjU5LTQ3NzktYmM2OS03YzExN2U2NDk0YTciLCJuYmYiOjAsInNjb3BlcyI6WyJ2ZXJpZmljYXRpb25fdmlldyIsInZlcmlmaWNhdGlvbl9saXN0IiwidmVyaWZpY2F0aW9uX2RvY3VtZW50IiwidmVyaWZpY2F0aW9uX2lkZW50aXR5Il0sImV4cCI6MzE2Mjg3OTYxOSwiaWF0IjoxNTg1MDQyODE5fQ.TBBPQhID7eJ-p0lOXD738n6ppIjHfjxAIhivf_ODXVQ",
        live: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI0OTc0OTBjNi0wZDdkLTRlYTctYmE5NC1iNWQzNzZhMmI0NzAiLCJhdWQiOiJmNmJkN2YzMi00MTRkLTRlMTgtOWRiYS1jNmMzN2QyYzJhMjkiLCJzdWIiOiJmNjM2OWM2NC0zMjU5LTQ3NzktYmM2OS03YzExN2U2NDk0YTciLCJuYmYiOjAsInNjb3BlcyI6WyJ2ZXJpZmljYXRpb25fdmlldyIsInZlcmlmaWNhdGlvbl9saXN0IiwidmVyaWZpY2F0aW9uX2RvY3VtZW50IiwidmVyaWZpY2F0aW9uX2lkZW50aXR5Il0sImV4cCI6MzE4MTcwMDI1OSwiaWF0IjoxNjAzODYzNDU5fQ.eVscl1qSxE3KbzDCqMGsX5e8ZdqNkXjARyhs7APeLs4",
    },

    env: {
        tokens: {
            test: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJiZmEyMDQ3MC1lNjEzLTQyNTItYjkzZC03Y2U1ZTRhODNjYzYiLCJhdWQiOiJmNmJkN2YzMi00MTRkLTRlMTgtOWRiYS1jNmMzN2QyYzJhMjkiLCJzdWIiOiJmNjM2OWM2NC0zMjU5LTQ3NzktYmM2OS03YzExN2U2NDk0YTciLCJuYmYiOjAsInNjb3BlcyI6WyJ2ZXJpZmljYXRpb25fdmlldyIsInZlcmlmaWNhdGlvbl9saXN0IiwidmVyaWZpY2F0aW9uX2RvY3VtZW50IiwidmVyaWZpY2F0aW9uX2lkZW50aXR5Il0sImV4cCI6MzE2Mjg3OTYxOSwiaWF0IjoxNTg1MDQyODE5fQ.TBBPQhID7eJ-p0lOXD738n6ppIjHfjxAIhivf_ODXVQ",
            live: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI0OTc0OTBjNi0wZDdkLTRlYTctYmE5NC1iNWQzNzZhMmI0NzAiLCJhdWQiOiJmNmJkN2YzMi00MTRkLTRlMTgtOWRiYS1jNmMzN2QyYzJhMjkiLCJzdWIiOiJmNjM2OWM2NC0zMjU5LTQ3NzktYmM2OS03YzExN2U2NDk0YTciLCJuYmYiOjAsInNjb3BlcyI6WyJ2ZXJpZmljYXRpb25fdmlldyIsInZlcmlmaWNhdGlvbl9saXN0IiwidmVyaWZpY2F0aW9uX2RvY3VtZW50IiwidmVyaWZpY2F0aW9uX2lkZW50aXR5Il0sImV4cCI6MzE4MTcwMDI1OSwiaWF0IjoxNjAzODYzNDU5fQ.eVscl1qSxE3KbzDCqMGsX5e8ZdqNkXjARyhs7APeLs4",
        },
        baseApi: "https://api.appruve.co/v1/",

        // FIND OUT HOW TO DO KYC FOR ALL THE OTHER CURRENCIES
        nationalities: {
            "Ghana": "gh",
            "Nigeria": "ng",
            "United States": "",
            "United Kingdom": "",
            "Canada": "",
            "Ivory Coast": "",
            "Kenya": "ke",
            "South Africa": "",
            "Rwanda": "",
            "Tanzania": "",
            "Burundi": "",
            "Congo": "",
            "Cape Verde": "",
            "Gambia": "",
            "Guinea": "",
            "Liberia": "",
            "Malawi": "",
            "Mozambique": "",
            "Sierra Leone": "",
            "Sao Tome and Principe": "",
            "Uganda": "",
            "Zambia": "",
            "Zimbabwe": "",
        },
        idTypes: {
            "Passport": "passport",
            "National ID": "national_id",
            "Voter's ID": "voter",
            "SSNIT": "ssnit",
            "TIN": "tin",
            "Driver's License": "driver_license",
            "Bank Verification Number": "bvn",
            "Health Insurance ID": "", // <- FIND OUT THE LABEL FOR THIS ..
        },

        services: {
            prefixes: {
                "ai": "AppruveIdentity",
                "aa": "AppruveAgency",
                "ab": "AppruveBusiness",
                "af": "AppruveFinancial",
                "ad": "AppruveDiligence",
            },
            AppruveIdentity: {
                apis: {
                    "verify": "verifications/",
                    "lookup": "lookups/",
                }

            },
            AppruveAgency: {
                apis: {
                    "verify": "verifications/",
                }

            },
            AppruveBusiness: {
                apis: {
                    "verify": "verifications/business/",
                }

            },
            AppruveFinancial: {
                apis: {
                }

            },
            AppruveDiligence: {
                apis: {
                }

            },
        },
    },

    getApi: function (servicePrefix, api) {
        if (!["verify", "lookup"].includes(api)) return null;
        if (!Object.keys(this.env.services.prefixes).includes(servicePrefix)) return null;
        // 
        return this.env.services[this.env.services.prefixes[servicePrefix]].apis[api];
    },

    getNationality: function (n) { return this.env.nationalities[n]; },

    getIDType: function (t) { return this.env.idTypes[t]; },

    makeRequest: async function (url = "", method = "", query = null, body = null) {
        var _this = this;
        return new Promise(async (resolve, reject) => {
            try {
                var options = {
                    headers: { // MAKE SURE YOU CHANGE THIS TO .live WHEN THE FEATURE IS READY FOR PRODUCTION ..
                        'Authorization': 'Bearer ' + _this.env.tokens.live, // test,
                        'Content-Type': "application/json",
                    },
                    uri: _this.env.baseApi + url,
                    method: method, json: true
                };
                if (query) options["qs"] = query;
                if (body && !(["GET", "DELETE"].includes(method))) options["body"] = body;
                console.log("REQUEST OPTIONS -> " + JSON.stringify(options));

                request(options, function (error, response, body) {
                    try {
                        if (error) {
                            console.log("KYC Request Error -> " + error);
                            // reject(error); // DOING THIS WILL CAUSE THE ENTIRE KYC REQUEST TO FAIL ..
                            resolve(null);
                        } else if (response.statusCode == 200) {
                            body = JSON.parse(JSON.stringify(body)); // <- NO NEED FOR THIS, COZ body MIGHT ALREADY BE JSON DATA
                            console.log("\nRESULT DATA -> " + JSON.stringify(body) + "\n");
                            // NOW, WORK WITH body HOWEVER YOU PREFER ..
                            resolve({ code: 200,  resultData: { success: true, data: body }});
                            
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
                        console.log("ERROR DURING REQUEST -> " + e);
                        reject(e);
                    }
                });

                // SAMPLE APPRUVE RESPONSE
                // body = {
                //     "id": "2233102035",
                //     "last_name": "Doe",
                //     "date_of_birth": "1986-04-05",=
                //     "is_first_name_match": true,
                //     "is_last_name_match": true,
                //     "is_full_name_match": true,
                //     "is_middle_name_match": false,
                //     "is_date_of_birth_match": true,
                //     "picture": "Base 64 Encoded String",
                //     "signature": "Base 64 Encoded String"
                // };
                // resolve({ code: 200,  resultData: { success: true, data: body}});

            } catch (e) {
                console.log("ERROR DURING REQUEST -> " + e);
                reject(e);
            }
        });
    },


    // // APPRUVE IDENTITY FUNCTIONS


    // async verifyById(user, kycID) {
    //     let _this = this;
    //     return new Promise(async (resolve, reject) => {
    //         try { // CONSTRUCT THE URL FIRST ..
    //             let url = _this.getApi("AppruveIdentity", "verify") + kycID;
    //             // THEN, SET THE query TOO ..
    //             let query = {};
    //             // 
    //             console.log("URL -> " + url + "\nQUERY -> " + JSON.stringify(query));
    //             var res = await _this.makeRequest(url, 'GET', query, null);

    //             console.log("\nRESULT -> " + JSON.stringify(res));
    //             resolve(res);
    //         } catch (e) {
    //             console.log("ERROR -> " + JSON.stringify(e));
    //             reject(e);
    //         }
    //     });
    // },

    // async verifyOrLookupUser(user, kycID, nationality, idType, extra) {
    //     let _this = this;
    //     return new Promise(async (resolve, reject) => {
    //         try { // CHECK IF extra INCLUDES .verifyOrLookup & .service
    //             for (var x of ["service", "verifyOrLookup"]) if (!Object.keys(extra).includes(x)) reject("Appruve '" + x + "' not specified ..")
    //             // CONSTRUCT THE URL FIRST ..
    //             let url = _this.getApi(extra.service, extra.verifyOrLookup) + _this.getNationality(nationality || user.nationality) + "/" + _this.getIDType(idType);
    //             // THEN, SET THE body TOO ..
    //             let body = {
    //                 [idType === "TIN" ? "tin" : "id"]: kycID || user.data.KYC[idType].id,
    //                 // THIS IS ONLY REQUIRED FOR idType = tin -> tin": kycID || user.data.KYC[idType].id,

    //                 // THIS IS ONLY REQUIRED FOR idType = ALL OTHERS
    //                 // "full_name": user.full_name,

    //                 // THESE 2 ARE ONLY REQUIRED FOR idType = passport
    //                 "first_name": user.first_name,
    //                 "last_name": user.last_name,

    //                 "date_of_birth": dateFormat(user.date_of_birth, "yyyy-mm-dd"),

    //                 "include_picture": true,
    //                 "include_signature": true,

    //             }
    //             // 
    //             console.log("URL -> " + url + "\nBODY -> " + JSON.stringify(body));
    //             var res = await _this.makeRequest(url, 'POST', null, body);
    //             console.log("\nRESULT -> " + JSON.stringify(res));
    //             /* SAMPLE RESPONSE
    //             {
    //                 "id": "2233102035",
    //                 "first_name": "John",
    //                 "last_name": "Doe",
    //                 "date_of_birth": "1986-04-05",
    //                 "is_first_name_match": true,
    //                 "is_last_name_match": true,
    //                 "is_full_name_match": true,
    //                 "is_middle_name_match": false,
    //                 "is_date_of_birth_match": true,
    //                 "picture": "Base 64 Encoded String",
    //                 "signature": "Base 64 Encoded String"
    //             }
    //             */
    //             // YOU CAN HANDLE res RIGHT HERE, OR IN THE CALLING FUNCTION LATER (WHEN EXPANDING FEATURE ..)
    //             user.data.KYC[idType] = Object.assign(user.data.KYC[idType][KYCService], res.data);
    //             // THEN SAVE THE user OBJECT (BOTH ITS MAIN PROPS & .data.KYC PROP) ..
    //             updateAutoKYCObject("user", user);
    //             // 
    //             resolve(res);
    //         } catch (e) {
    //             console.log("ERROR -> " + JSON.stringify(e));
    //             reject(e);
    //         }
    //     });
    // },


    // // APPRUVE BUSINESS FUNCTIONS


    // async verifyBusiness(user, business, kycID, nationality, idType, extra) {
    //     let _this = this;
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             if (!["Ghana"].includes(nationality) || !["TIN"].includes(idType)) reject("Incorrect inputs ..")
    //             // CONSTRUCT THE URL FIRST ..
    //             let url = _this.getApi("AppruveBusiness", "verify") + _this.getNationality(nationality || user.nationality) + _this.getIDType(idType);
    //             // THEN, SET THE body TOO ..
    //             let body = { // DECIDE WHETHER TO USE user / business (FOR PROPERTY DEVELOPERS / COMPANIES)
    //                 "tin": kycID || user.data.KYC[idType].id,
    //             }
    //             // 
    //             console.log("URL -> " + url + "\nBODY -> " + JSON.stringify(body));
    //             var res = await _this.makeRequest(url, 'POST', null, body);

    //             console.log("\nRESULT -> " + JSON.stringify(res));
    //             resolve(res);
    //         } catch (e) {
    //             console.log("ERROR -> " + JSON.stringify(e));
    //             reject(e);
    //         }
    //     });
    // },


    // // APPRUVE AGENCY FUNCTIONS


    // async sth() {

    // },


};

var AccessBaceAPI = {



};



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS


async function verifyUser(user, extra) {
    return new Promise(async (resolve, reject) => {
        try { // DECIDE WHICH KYC SERVICE TO BE USED BASED ON CONFIG settings (FEATURE TOGGLING)

            let url = "", body = {}, res = { code: 400, resultData: { success: false, message: "Some Error Occured" } },
                nationality = user.nationality, idType = "", kycID = "", idTypes = Object.keys(user.data.KYC);

            for (idType of idTypes) {
                console.log("CHECKING ID TYPE: " + idType);
                try { // FIRST, VALIDATE user.data.KYC[idType].id
                    if (!user.data.KYC[idType].id) continue;
                    kycID = user.data.KYC[idType].id || "";
                    if (kycID.length <= 0) { // PUT LENGTH & REGEX VALIDATION OF kycID HERE TOO ..
                        console.log("Invalid KYC ID -> " + kycID);
                        continue;
                    }
                    console.log("USER -> nationality: " + nationality + "; idType: " + idType + "; kycID: " + kycID);

                    KYCService = "Appruve"; // USING THE APPRUVE API BY DEFAULT ..
                    switch (KYCService) {
                        case "Appruve":
                            // CONSTRUCT THE URL FIRST ..
                            // BUT, FIND A WAY TO GENERATE extra AUTOMATICALLY ..
                            if (!extra) extra = { service: "AppruveIdentity", servicePrefix: "ai", verifyOrLookup: "verify" };
                            url = AccessAppruveAPI.getApi(extra.servicePrefix, extra.verifyOrLookup) +
                                AccessAppruveAPI.getNationality(nationality) + "/" + AccessAppruveAPI.getIDType(idType);
                            // THEN, SET THE body TOO ..
                            body = {
                                [idType === "TIN" ? "tin" : "id"]: kycID || user.data.KYC[idType].id,
                                // THIS IS ONLY REQUIRED FOR idType = tin -> tin": kycID || user.data.KYC[idType].id,

                                // THIS IS ONLY REQUIRED FOR idType = ALL OTHERS
                                // "full_name": user.full_name,

                                // THESE 2 ARE ONLY REQUIRED FOR idType = passport
                                "first_name": user.first_name,
                                "last_name": user.last_name,

                                "date_of_birth": dateFormat(user.date_of_birth, "yyyy-mm-dd"),

                                // "include_picture": true,
                                // "include_signature": true,
                                // ...
                            }
                            // 
                            console.log("URL -> " + url + "\nBODY -> " + JSON.stringify(body));
                            res = await AccessAppruveAPI.makeRequest(url, 'POST', null, body);
                            console.log("\nRESULT -> " + JSON.stringify(res));
                            /* SAMPLE APPRUVE RESPONSE
                            {
                                "id": "2233102035", 
                                "last_name": "Doe",
                                "date_of_birth": "1986-04-05",
                                "is_first_name_match": true,
                                "is_last_name_match": true,
                                "is_full_name_match": true,
                                "is_middle_name_match": false,
                                "is_date_of_birth_match": true,
                                "picture": "Base 64 Encoded String",
                                "signature": "Base 64 Encoded String"
                            }
                            */
                            break;
                        case "Bace":
                            break;
                        default:
                            break;
                    }

                    if (res && (res.hasOwnProperty("code")) && (res.code === 200) && 
                    (res.hasOwnProperty("resultData")) && (res.resultData.hasOwnProperty("data"))) {

                        // MAKE SURE THAT THE KYC VERIFICATION WAS A SUCCESS, THEN UPDATE user's data.verified PROP
                        user.data.verified = ((res.resultData.data || {}).is_first_name_match) && 
                        ((res.resultData.data || {}).is_last_name_match);
                        
                        // YOU CAN HANDLE res RIGHT HERE, OR IN THE CALLING FUNCTION LATER (WHEN EXPANDING FEATURE ..)
                        if (!user.data.KYC[idType].hasOwnProperty(KYCService)) user.data.KYC[idType][KYCService] = {};
                        user.data.KYC[idType][KYCService] = Object.assign(user.data.KYC[idType][KYCService], res.resultData.data);
                        console.log("USER KYC OBJECT NOW -> " + JSON.stringify(user.data.KYC[idType]));
                        
                        // THEN SAVE THE user OBJECT (BOTH ITS MAIN PROPS & .data.KYC PROP) ..
                        user = updateAutoKYCObject("user", user);
                        // 
    
                        console.log("\n\n\nPREPARING USER KYC RESULTS ..");
                        res.resultData.data = { KYCresults: { [KYCService]: res.resultData.data }, userData: JSON.parse(JSON.stringify(user)) };
                        resolve(res);
                        return; // break; // <- MAYBE THE LOOP SHOULD CONTINUE ? WITH OTHER VERIFICATION TYPES ???

                    } else res = { code: 400, resultData: { success: false, message: "Some Error Occured" } };

                } catch (e) {
                    console.log("\nLOOP ERROR -> " + e);
                    continue;
                }
            }

            console.log("NO ID TYPE WAS SUCCESSFUL ..")
            resolve(res); // NOT TOO SURE IF THIS IS SUPPOSED TO BE HERE THOUGH ..

        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}

async function verifyBusiness(user, business, extra) { // FIX THIS DAMN FUNCTION NOWWW !!! !!!!
    return new Promise(async (resolve, reject) => {
        try {
            if (!["Ghana"].includes(nationality) || !["TIN"].includes(idType)) reject("Incorrect inputs ..")
            // CONSTRUCT THE URL FIRST ..
            let url = AccessAppruveAPI.getApi("AppruveBusiness", "verify") + AccessAppruveAPI.getNationality(nationality || user.nationality) + AccessAppruveAPI.getIDType(idType);
            // THEN, SET THE body TOO ..
            let body = { // DECIDE WHETHER TO USE user / business (FOR PROPERTY DEVELOPERS / COMPANIES)
                "tin": kycID || user.data.KYC[idType].id,
            }
            // 
            console.log("URL -> " + url + "\nBODY -> " + JSON.stringify(body));
            var res = await AccessAppruveAPI.makeRequest(url, 'POST', null, body);

            console.log("\nRESULT -> " + JSON.stringify(res));
            resolve(res);
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PUBLIC FUNCTIONS

var AutoKYCFunctions = {


    ////////////////////////////////////////////////////////////////////////
    //  BASIC AUTO-KYC FUNCTIONS

    // router.post('/verify/:identity/:id', autoKYCFunct.verifyKYC());
    verifyKYC: function (type = "user") { // user / company / stakeholder / etc
        if (!type) throw new Error('Type needs to be set');
        if (!["user", "company"].includes(type)) throw new Error('Type needs to be valid');
        return compose()
            .use(auth.isAuthorized(['verify', type])) //
            .use(async function verify(req, res, next) {
                try {
                    console.log("...");
                    if (req.params.identity) type = req.params.identity; // IN CASE THIS COMES FORM index.js
                    if (type && req.params.id && (req.body && Object.keys(req.body).length > 0)) {

                        // if (!req.body.hasOwnProperty("extra")) // RUN SOME GENERAL VALIDATION HERE ..
                        //     return sendResponse(res, 404, { err: null, success: false, message: "Some Data not specified" });

                        // NOW RUN verify
                        var result = { code: 400, resultData: { success: false, message: "Some error occured" } };
                        console.log("TYPE -> " + type + ", & ID -> " + req.params.id);
                        console.log("BODY -> " + JSON.stringify(req.body)); // req.body ISN'T NEEDED FOR NOW ..
                        // 
                        var data = await getAutoKYCObject(type, req.params.id);
                        console.log(type + " DATA -> " + JSON.stringify(data));
                        ///////////////////////////////////////////////////////////////////
                        //  NOW, CALL A FUNCTION TO verify THIS OBJECT RETRIEVED FROM DATABASE
                        switch (type) {
                            case "user":
                                result = await verifyUser(data);
                                console.log("VERIFY USER RESULT -> " + JSON.stringify(result) + "\n\n");
                                return sendResponse(res, result.code, result.resultData);
                            case "company":
                                result = { code: 200, resultData: { success: true, message: "Verification Successful" } }; // await verifyBusiness(data);
                                return sendResponse(res, result.code, result.resultData);
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


    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    //  EXTRA AUTO-KYC FUNCTIONS

};

module.exports = AutoKYCFunctions;
