'use strict';

var compose = require('composable-middleware');
var request = require('request');

var dataHandler = require('../../api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
var autoResearchModelscontrollersHandler = dataHandler.modelscontrollersHandler;

var funct = require('../../functions');
var settings = funct.settings;
var config = funct.config;
var auth = funct.auth;
var InternalAutoAuditingFunct = funct.InternalAutoAuditingFunct;
funct = funct.funct;

// EXTRA IMPORTS FOR THIS AUTO-FEATURE
var userempclientstakefunct = require('../../api/GLOBAL_CONTROLLER/OTHER_FUNCTION_HELPERS/UserEmployeeClientStakeHolderServerFunctions')
var cheerio = require('cheerio');
var fs = require('fs');
var dns = require('dns');
var urlLib = require('url');


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
//          DATA-FILE LOGGING FUNCTIONS
var DataHandlerModels = {
    "user": require('../../api/USER/user.model'),
    "segment": require('./DATA/SEGMENT/segment.model'),
    "research": require('./DATA/RESEARCH/research.model'),
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS

function getDataHandlerModel(type) {
    return DataHandlerModels[type];
}

async function getAllAutoResearchObjects(type, condition) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoResearchModelscontrollersHandler.getAll(getDataHandlerModel(type), JSON.stringify(condition));
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function getAutoResearchObject(type, id) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoResearchModelscontrollersHandler.get(getDataHandlerModel(type), id);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function saveAutoResearchObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoResearchModelscontrollersHandler.add(getDataHandlerModel(type), data);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function updateAutoResearchObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoResearchModelscontrollersHandler.update(getDataHandlerModel(type), data._id, data);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function deleteAutoResearchObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await autoResearchModelscontrollersHandler.delete(getDataHandlerModel(type), data._id);
            if (result.code === 200) resolve(result.resultData);
            else resolve({
                code: 400,
                resultData: result.resultData || {success: false, message: 'Sorry, some error occurred'}
            });
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

function sendResponse(res, status, data) {
    if (res) {
        return res.status(status).send(data);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////                        WEB SCRAPING AUTO-RESEARCH FUNCTIONS ...

var WebScraping = {

    saveFile: function (url, title, html) {
        var filePath = path.normalize(__dirname + './DATA/files/');
        filePath += (url + "-" + title);
        console.log("FILE PATH -> " + filePath);
        // ADD {flag: 'wx'} TO MAKE SURE THAT html IS NOT WRITTEN IN CASE filePath DOES NOT EXIST :)
        fs.writeFile(filePath, html, {flag: 'wx'}, function write(err) {
            if (err) console.log("ERROR IN SAVING FILE -> " + err);
            else console.log("File's been saved.");
        });
    },

    getURLData: async function (url, limit = 10) {
        var _this = this, urlData = [];

        return new Promise(async (resolve, reject) => {

            function returnURLData() {
                console.log("RETURNING URL DATA (" + urlData.length + " OBJECTS) :)")
                var data = urlData;
                urlData = [];
                resolve(data);
            }

            try {
                urlData = [];
                console.log("FIRST, GETTING SERVER INFO FOR INITIAL URL -> " + url);
                var info = await getServerInfo(url);
                if (info) {
                    if (urlData.length >= limit) {
                        console.log("REACHED LIMIT -> " + limit + "; THEREFORE, NOW RESOLVING DATA AND ENDING THIS FUNCTION ..");
                        returnURLData();
                    } else {
                        console.log("APPENDING URL DATA -> " + JSON.stringify(info));
                        urlData.push(info);
                    }
                    console.log(urlData.length + " URLS");
                } else console.log("Could not get info for link -> " + url);

                console.log("NOW, GETTING HTML FOR INITIAL URL -> " + url);
                var body = await getHTML(url);
                if (!body) reject({err: {message: "No HTML body found"}});
                var $ = cheerio.load(body);
                var title = $('title').innerText;
                if (title) { // SAVE FILE NAME AS title WITH body
                    console.log("TITLE OF PAGE -> " + JSON.stringify(title));
                    // _this.saveFile(url, title, $.html()); // FOR NOW, YOU WON'T BE NEEDING THIS :)
                }
                console.log("FINDING ALL LINKS (<a> TAGS :)");
                var links = $('a'), innerURLS = [];
                if (links) {
                    console.log(links.length + " links found");
                    links.each(async function () {
                        try {
                            var text = $(this).text();
                            var link = $(this).attr('href');
                            if (link) innerURLS.push(link);
                        } catch (e) {
                            console.log("ERROR OCCURED DURING HTML PARSING -> " + JSON.stringify(e))
                        }
                    });
                    console.log(innerURLS.length + " INNER LINKS");
                    if (innerURLS.length > 0) {
                        var res = await getInnerURLSData(innerURLS);
                        if (res) {
                            returnURLData();
                        } else {
                            console.log("URL DATA NOT UP TO LIMIT, RETURNING DATA ANYWAY")
                            returnURLData();
                        }
                    }
                    else {
                        console.log("No inner links (href within <a> tags) available, returning url data anyway");
                        returnURLData();
                    }
                } else {
                    console.log("No links (<a> tags) available, returning url data anyway");
                    returnURLData();
                }
            } catch (e) {
                console.log("ERROR -> " + e);
                reject(e);
            }

            async function getInnerURLSData(urls) {
                return new Promise(async (resolve, reject) => {
                    for (var link of urls) {
                        try {
                            console.log('INNER URL -> ' + link);
                            info = await getServerInfo(link);
                            if (info) {
                                if (urlData.length >= limit) {
                                    console.log("REACHED LIMIT -> " + limit + "; THEREFORE, NOW RESOLVING DATA AND ENDING THIS FUNCTION ..");
                                    resolve(true);
                                } else {
                                    console.log("APPENDING URL DATA -> " + JSON.stringify(info));
                                    if (!urlDataExists(info)) urlData.push(info);
                                }
                                console.log(urlData.length + " URLS");
                            } else console.log("Could not get info for link -> " + link);
                        } catch (e) {
                            console.log("Error -> " + JSON.stringify(e));
                            continue;
                        }
                    }
                    resolve(true);
                });
            }

        });

        function urlDataExists(info) {
            for (var urlObj of urlData) {
                try {
                    if (urlObj.server.ip == info.server.ip) {
                        console.log("THIS URL DATA ALREADY EXISTS!!")
                        console.log(urlObj.server.ip + ' == ' + info.server.ip);
                        return true;
                    }
                } catch (e) {
                    console.log("error -> " + e);
                    continue;
                }
            }
            return false;
        }

        async function getServerInfo(url) { // GET SERVER INFO OF URL (IP ADDRESS), THEN APPEND TO urlData

            return new Promise(async (resolve, reject) => {
                try {
                    var info = null, hostname = urlLib.parse(url).hostname;
                    // GET INFORMATION FOR THE SERVER LINKED TO THIS url's IP ADDRESS
                    for (var x of ["http://", "https://"]) if (hostname.includes(x)) hostname = hostname.replace(x, "");
                    console.log("Getting ip-address for hostname -> " + hostname);
                    dns.lookup(hostname, (err, address, family) => {
                        if (err) {
                            console.log(err);
                            resolve(null);
                        }
                        console.log('address: %j family: IPv%s', address, family);
                        var ip = address; // FIND A WAY TO RETRIEVE IP ADDRESS FROM THE URL
                        request("http://ipinfo.io/" + ip + "/json", function (error, response, body) {
                            try {
                                if (!error && response.statusCode == 200) {
                                    /*
                                     var x = {
                                     "ip": "172.217.17.238", "hostname": "ber01s08-in-f238.1e100.net",
                                     "city": "Mountain View", "region": "California",
                                     "country": "US", "loc": "37.4192,-122.0570",
                                     "postal": "94043", "org": "AS15169 Google LLC"
                                     };
                                     */
                                    console.log("SERVER INFO -> " + JSON.stringify(body));
                                    body = JSON.parse(body);
                                    var coords = body.loc.split(",");
                                    info = {
                                        server: {
                                            name: "", description: "",
                                            url: url, hostname: body.hostname || '', port: "" || '',
                                            ip: body.ip || '', family: family || '',
                                            extra: {
                                                "city": body.city || '',
                                                "region": body.region || '',
                                                "country": body.country || '',
                                                "postal": body.postal || '',
                                                "org": body.org || '',
                                            }
                                        },
                                        coordinates: {
                                            latitude: coords[0], longitude: coords[1]
                                        }
                                    };
                                    console.log("RETURNING INFO -> " + JSON.stringify(info));
                                    resolve(info);
                                } else {
                                    console.log('There was an error -> ' + JSON.stringify(error));
                                    resolve(null);
                                }
                            } catch (e) {
                                console.log("ERROR DURING OBTAINING ipinfo.io INFO -> " + e);
                                resolve(null);
                            }
                        });
                    });
                } catch (e) {
                    console.log("ERROR DURING OBTAINING INFO -> " + e);
                    resolve(null);
                }
            });

        }

        function getHTML(url) {

            return new Promise((resolve, reject) => {

                request(url, function (error, response, body) {
                    try {
                        console.log("RESPONSE -> " + Object.keys(response))
                        console.log("REQUEST -> " + JSON.stringify(response.request));
                        if (!error && response.statusCode == 200) {
                            resolve(body);
                        } else {
                            console.log('There was an error -> ' + JSON.stringify(error));
                            resolve(null);
                        }
                    } catch (e) {
                        console.log(e);
                        resolve(null);
                    }
                });

            })

        }

    }

};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////                        SOCIAL MEDIA AUTO-RESEARCH FUNCTIONS ...

var SocialMediaAutoBots = {

};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////                        ONLINE SURVEY AUTO-RESEARCH FUNCTIONS ...

var OnlineSurveys = {
    Typeform: {
        typeformAPI: 'https://api.typeform.com/',
        clientId: '', // Unique Typeform client identifier. Find in the Applications section of your Typeform admin panel.
        clientSecret: '', // Unique secret identifier for Typeform clients. Find in the Applications section of your Typeform admin panel.
        redirectUri: '', // URL where the application should redirect after users log in and grant access.
        urlAuthorize: '', // https://api.typeform.com/oauth/authorize
        urlAccessToken: '', // https://api.typeform.com/oauth/token
        // 
        typeformAppWebsite: 'https://autoresearch.typeform.com',
        callbackURL: 'https://automanghana.herokuapp.com/public/autoresearch/typeform',
        clientSecret: '3KUkqaEK93bSvkL2UgENXX45WvqnWoHod5oFJuiv8xqA',
        clientID: 'B11MF2vcMg9Q5rCiEZGmUknTUnBcZ7KK3j3m9oSdZojp',
        typeformTokenName: 'AUTO_RESEARCH_TYPEfORM_TOKEN',
        typeformAccessToken: '5Y2B1qWVeVZWN59WExcoDkLy7hxAL3WqJYoKkk7s9jWp',

        makeRequest: async function(url="", method="", query=null, body=null){
            var _this = this;
            return new Promise(async (resolve, reject) => {
                try {
                    var options = {
                        headers: {
                          'Authorization': 'Bearer ' + _this.typeformAccessToken,
                          'Accept': 'application/json'
                        },
                        uri: _this.typeformAPI + url,
                        method: method
                      };
                    if(query) options["qs"] = query;
                    if(body && !(["GET", "DELETE"].includes(method)) ) options["body"] = body;
                    console.log("REQUEST OPTIONS -> " + JSON.stringify(options));
                    request(options, function (error, response, body) {
                        try {
                            if(error) reject(error);
                            else if (response.statusCode == 200) {
                                body = JSON.parse(body);
                                console.log("\nRESULT DATA -> " + JSON.stringify(body) + "\n");
                                // NOW, WORK WITH body HOWEVER YOU PREFER ..
                                resolve(body);
                            } else {
                                resolve(null);
                            }
                        } catch (e) {
                            console.log("ERROR DURING REQUEST -> " + e);
                            reject(e);
                        }
                    });
                } catch (e) {
                    console.log("ERROR DURING REQUEST -> " + e);
                    reject(e);
                }
            });
        },

        getUserData: async function () {
            var _this = this;
            return new Promise(async (resolve, reject) => {
                try {
                    var res = await _this.makeRequest('me', 'GET');
                    // res = { "alias": "Daniel", "email": "daniel@email.com", "language": "en" }
                                
                    console.log("\nRESULT -> " + JSON.stringify(SOME_RESULT));
                    resolve(SOME_RESULT);
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e));
                    reject(e);
                }
            });
        },


        CreateApi: {

        }, // CREATE API METHODS COME NEXT ..
    
        //  KNOW HOW TO USE "Hidden Fields" (PRO) FEATURE TO SEND QUERY STRING DATA WITH TYPEfORM LINKS
        //  eg. ?source=email&name=StarBoy - these query params help customize utl typeforms for respondents

        //  KNOW HOW TO USE "Logic Jumps" FEATURE TO ENHANCE TYPEfORMS IN AUTOMATION

        crudAll: async function(url="", meth="", extra={query: null, body: null}, cb=null) {
            var _this = this; 
            return new Promise(async (resolve, reject) => {
                try {
                    if(!(["", "forms", "themes", "images"].includes(url))) url = "";
                    if(!(["", "CREATE", "READ", "UPDATE", "DELETE"].includes(meth))) meth = "GET";
                    // HANDLE DATA WITHIN extra OBJECT
                    if(extra.id) url += "/" + extra.id;
                    if(extra.url) url += "/" + extra.url;
                    // 
                    var res = await _this.makeRequest(url, meth, extra.query, extra.body);
                    console.log("\nRESULT -> " + JSON.stringify(res));
                    resolve(res);
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e));
                    reject(e);
                }
            });
        },

        crudOne: async function(url="", meth="", extra={query: null, body: null}, cb=null) {
            var _this = this; 
            return new Promise(async (resolve, reject) => {
                try {
                    if(!(["", "forms", "themes", "images"].includes(url))) url = "";
                    if(!(["", "CREATE", "READ", "UPDATE", "DELETE"].includes(meth))) meth = "GET";
                    // HANDLE DATA WITHIN extra OBJECT
                    if(extra.id) url += "/" + extra.id;
                    if(extra.url) url += "/" + extra.url;
                    // 
                    var res = await _this.makeRequest(url, meth, extra.query, extra.body);
                    console.log("\nRESULT -> " + JSON.stringify(res));
                    // HANDLE RESULT USING THE CALLBACK cb
                    if(cb) cb(res);
                    resolve(res);
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e));
                    reject(e);
                }
            });
        },

        duplicateOne: async function(url="", extra={query: null, body: null}, cb=null) {
            var _this = this; 
            return new Promise(async (resolve, reject) => {
                try {
                    if(!(["", "forms", "themes", "images"].includes(url))) url = "";
                    // HANDLE DATA WITHIN extra OBJECT
                    if(extra.id) url += "/" + extra.id;
                    if(extra.url) url += "/" + extra.url;
                    // 
                    var res = await _this.makeRequest(url, 'GET');
                    console.log("\nRESULT -> " + JSON.stringify(res));
                    if(res && res !== undefined) { // JUST VALIDATE THE res OBJECT HERE 1ST
                        // NOW, MAKE A COPY, THEN DELETE ALL 'id' FIELDS WITHIN THIS res OBJECT
                        var newOne = JSON.parse(JSON.stringify(res));
                        // 
                        for(key in newOne){
                            if(key === "id") delete newOne[key];
                            else if (newOne.form && newONe.form.id) delete newONe.form.id;
                            else if (newOne.field && newONe.field.id) delete newONe.field.id;
                            else if (newOne.choices && newONe.choices.id) delete newONe.choices.id;
                        }
                        // 
                        res = await _this.makeRequest(url, 'POST', newOne);
                        // HANDLE RESULT USING THE CALLBACK cb
                        // FOR EXAMPLE, YOU CAN CHECK IF YOUR NEW FORM (COPY) EXISTS ..
                        if(cb) cb(res);
                        resolve(res);
                    }
                    resolve(null);
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e));
                    reject(e);
                }
            });
        },
        


        ResponsesApi: {
              
        }, // RESPONSES API METHODS COME NEXT
  
        getResponses: async function(form) {
            var _this = this; // https://api.typeform.com/forms/{form_id}/responses
            return new Promise(async (resolve, reject) => {
                try { // _this MIGHT NOT WORK COZ IT MAY BE REPRESENTING ResponsesAPI & NOT THE MAIN OnlineSurveys OBJECT
                    var query = {
                        page_size: 1000,
                        // since: 'SOME DATE HERE',
                        // until: 'SOME DATE HERE',
                    };
                    var res = await _this.crudAll('forms', 'GET', 
                    {id: form.id, url: 'responses', query: query, body: null}, null);
                    console.log("\nRESULT -> " + JSON.stringify(res));
                    resolve(res);
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e));
                    reject(e);
                }
            });
        },
            
        deleteResponses: async function(form) {
            var _this = this; // https://api.typeform.com/forms/{form_id}/responses
            return new Promise(async (resolve, reject) => { 
                try {
                    var query = { // THEREFORE, FIND A WAY TO GENERATE THIS csv OF TOKENS OF RESPONSES TO BE DELETED ..
                        included_tokens: 'Comma-separated list of tokens of the responses to delete. You can list up to 1000 tokens.'
                    }; // INCLUDE THIS WHEN YOU'RE READY TO USE IN THE _this.crudAll() METHOD CALL ..
                    // 
                    var res = await _this.crudAll('forms', 'DELETE', 
                    {id: form.id, url: 'responses', query: null, body: null}, null);
                    // res = {} -> WORK WITH res HOWEVER YOU PREFER
                    console.log("\nRESULT -> " + JSON.stringify(res));
                    resolve(res);
                } catch (e) {
                    console.log("ERROR -> " + JSON.stringify(e));
                    reject(e);
                }
            });
        },

        WebhooksApi: {
            
        },

    },
    AutoForm: {

    }
};

async function contactRecipient(type, contactBody, defaultCmeth=false) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try {
            var result = await userempclientstakefunct.contact(type, contactBody, defaultCmeth);
            resolve(result);
        } catch (err) {
            console.log("ERROR -> " + JSON.stringify(err));
            reject({code: 400, resultData: {err: err, success: false, message: 'Sorry, some error occurred'}});
        }
    });
}

async function getResearchSurveyDesignData(sources=[], research, extra=null){
    return new Promise(async (resolve, reject) => {
        try { // LOOK AT research.design TO KNOW HOW EXACTLY TO EXECUTE THE RESEARCH USING ONLINE SURVEYS WITH INTERNAL & EXTERNAL SOURCES
            var surveySource = null, forms = null, iteration = 0, links = [], linkObj = null, data = null;
            for(var source of sources){
                console.log("")
                console.log("\nWORKING WITH ONLINE SURVEY SOURCE -> " + source);
                switch(source){
                    case "Typeform":
                    surveySource = JSON.parse(JSON.stringify(OnlineSurveys.Typeform));
                    // console.log(JSON.stringify(surveySource));
                    // 
                    // FIRSTLY, YOU PROBABLY ALREADY KNOW THAT research HAS .design.segmentation
                    // & .design.methods.Survey.forms (COZ IT HAS ALREADY PASSED VALIDATIONS IN executeResearch())
                    forms = research.design.methods.Survey.forms;
                    if(forms.length > 0){ // YOU EVEN ALREADY KNOW THAT THIS VALIDATION IS SUCCESSFUL TOO
                        data = await OnlineSurveys.Typeform.crudAll("forms", "GET"); // THIS REQUEST DOESN'T NEET extra
                        if(data && data.items){
                            console.log("\nTOTAL FORMS AVAILABLE -> " + data.total_items);
                            console.log("TOTAL PAGE COUNT -> " + data.page_count + "\n");
                            for(var formResponseObject of data.items){
                                /* var sampleformResponseObject = {
                                    "id": "abc123", // or "kEzi3P"
                                    "title": "My first typeform!",
                                    "last_updated_at": "2017-07-24T13:10:54.000Z",
                                    "self": {
                                      "href": "https://api.typeform.com/forms/abc123"
                                    },
                                    "theme": {
                                      "href": "https://api.typeform.com/themes/ghi789"
                                    },
                                    "_links": { <- .link.link_html
                                      "display": "https://subdomain.typeform.com/to/abc123"
                                    }
                                  }; */
                                  /* var AutoFormObject = {
                                        "id": "", "name": "", "message": "", "source": "Typeform", "link": "", "language": "English", 
                                        "questions": [{ "id": "", "question": "", "questionType": "", "acceptedAnswerType": "" }],
                                        "validations": { }
                                    };
                                  */
                                if(formResponseObject.hasOwnProperty("id")){
                                    iteration = 0; // START FROM 0
                                    for(var form of forms){
                                        if(form.hasOwnProperty("id")){ // NOT ._id COZ IT'S NOT A MONGO-DB OBJECT
                                            if(form.id == formResponseObject.id){
                                                // PREPROCESS formResponseObject TO MATCH form's STRUCTURE ..
                                                console.log("\nFORM TO BE UPDATED (index " + iteration + ") -> " + JSON.stringify(form));
                                                console.log("WITH NEW FORM DATA -> " + JSON.stringify(formResponseObject) + "\n");
                                                form = JSON.parse(JSON.stringify({
                                                    "id": form.id || formResponseObject.id, "name": formResponseObject.title || "",
                                                    "message": "", "source": source || "Typeform", 
                                                    "link": {"link_api": formResponseObject.self.href, "link_page": formResponseObject._links.display},
                                                    "language": "English", // USE research.segments TO PERFORM LANGUAGE TRANSALATION FOR NEW FORMS
                                                    "questions": [], "validations": {}, "formData": {} }));
                                                console.log("UPDATED (BASIC LEVEL) FORM DATA -> " + JSON.stringify(form) + "\n\n");
                                                // 
                                                try { // THIS IS "NOT TOO GOOD" CODE, COZ AUTO-API WILL MAKE SOOOOO MANY REQUESTS TO TYPEfORM
                                                    // HOWEVER, SPECIFIC FORM REQUESTS RETURN A LOT MORE DATA ON THAT FORM THAN DOES THE "ALL FORMS" REQUEST
                                                    // SO THIS CODE'S MAIN USE IS TO SET THE .formData PROPERTY OF form
                                                    data = await OnlineSurveys.Typeform.crudOne("forms", "GET", {id: form.id}, null, null); // THIS REQUEST DOESN'T NEET extra
                                                    if(data){
                                                        console.log("\nFULL FORM DATA -> " + JSON.stringify(data));
                                                        form.formData = JSON.parse(JSON.stringify(data))
                                                    }
                                                } catch(e){ // In case of any error, just log the error and move on (coz this functionality is not even that important yet ..   )
                                                    console.log("error -> " + JSON.stringify(e));
                                                }
                                                // 
                                                // NOW, UPDATE THAT PARTICULAR form WITHIN THE research .design
                                                // NO NEED TO CREATE A newforms ARRAY TO HOLD NEW FORMS
                                                // COZ THE ONLY FORMS REQUIRED BY research ARE THE ONES WHOSE IDs IT HAS
                                                // UNLESS LATER, YOU DECIDE THAT research MUST HAVE NEW forms COMING FROM TYPEfORM
                                                // 
                                                research.design.methods.Survey.forms[iteration] = form;
                                                console.log("UPDATED (FULL LEVEL) FORM (" + iteration + ") -> " + JSON.stringify(
                                                    research.design.methods.Survey.forms[iteration]) + "\n");

                                                // NOW, FIND THE .segments OF research & THE OPTIMAL MEANS 
                                                if (! (links.filter(e => e.link === form.link.link_page).length > 0) ) {
                                                    console.log("LINK HAS NOT BEEN CAPTURED YET, THEREFORE ADDING ..")
                                                    linkObj = JSON.parse(JSON.stringify({ link: form.link.link_page, link_api: form.link.link_api, 
                                                        formId: form.id, segmentation: research.design.segmentation,
                                                        segments: research.design.segmentation.segments }));
                                                    links.push(linkObj);
                                                }
                                            }

                                            // NOW, CONSIDER POPULATING ALL NEW / EXISTING FORMS WITHIN research.data.Survey.forms ARRAY TOO ..
                                            // FOR NOW, IT'S BEING DONE WITHIN THE CLIENT WITH THE formId FIELD (IN THE CREATE/UPDATE RESEARCH FORM)
                                            // THIS IS NOT IDEAL AT ALL!!!! AUTO-API MUST DO ALL THIS WITH INTEGRATION WITH source (eg. Typeform :)
                                            // UPDATING OF .design.methods.Survey.forms & .data.Survey.forms SHOULD BE AUTOMATED

                                        }
                                        iteration++; // INCREMENT THE ITERATION HERE ..
                                    }
                                }
                            }
                        }
                        console.log("\nNEW TYPEfORM FORMS DATA -> " + JSON.stringify(research.design.methods.Survey.forms));
                        console.log("\nNEW TYPEfORM LINKS DATA -> " + JSON.stringify(links) + "\n");
                    } else {
                        console.log("NO FORMS (IDs) SPECIFIED");
                        resolve(null);
                    }
                    break;
                    default:
                        console.log("NO FUNCTIONALITY FOR SOURCE '" + source + "' IS AVAILABLE YET")
                    break;
                }
            }

            console.log("\n\nNOW, FINAL RESEARCH DATA -> " + JSON.stringify(research));
            console.log("\nNOW, FINAL LINKS DATA -> " + JSON.stringify(links) + "\n\n");
            resolve({ refinedResearch: research, surveyFormsLinks: links})
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}

async function getResearchSocialMediaDesignData(sources, research){

}

async function getResearchWebScrapingDesignData(sources, research){

}

async function executeResearch(research, extra) {
    return new Promise(async (resolve, reject) => {
        try { // LOOK AT research.design TO KNOW HOW EXACTLY TO EXECUTE THE RESEARCH
            if(research.design && research.design.segmentation && research.design.methods) {
                var design = research.design, segmentation = research.design.segmentation, methods = research.design.methods;
                // NOW, DO SOME MORE VALIDATIONS TO KNOW WHICH RESEARCH METHODS & SEGMENTATIONS TO USE
                if(methods.methods && (methods.methods.length > 0)) {
                    for(var researchMethod of methods.methods){
                        console.log("\n\nWORKING WITH RESEARCH METHOD -> " + researchMethod);
                        switch(researchMethod){
                            case "Survey": // BUT FOR NOWWWWW, JUST WORK WITH ONLINE SURVEYS
                                if(methods.methods.includes("Survey") && methods.Survey && 
                                methods.Survey.forms && (methods.Survey.forms.length > 0)){
                                    console.log("Research methods are fine ..")
                                    if (segmentation.segments && (segmentation.segments.length > 0)){
                                        console.log("Research Target Segments are fine too ..")
                                        var surveyMethod = methods.Survey, segments = segmentation.segments;
                                        console.log("\nSurvey Data -> " + JSON.stringify(surveyMethod));
                                        console.log("Target Segments -> " + JSON.stringify(segments));
            
                                        ////////////////////////////////////////////////////////////////////////////////////////////////////
                                        ////////////////////////////////////////////////////////////////////////////////////////////////////
                                        ////////////////////////////////////////////////////////////////////////////////////////////////////
                                        // GET SURVEY FORMS' DATA FROM TYPEfORM
                                        var researchData = await getResearchSurveyDesignData(["Typeform"], research); // THIS SHOULD CALL AN ERROR FOR NOW ..
                                        research = researchData.refinedResearch; // OR = Object.assign(research, researchData.refinedResearch)
                                        // 
                                        console.log("\nUPDATING THE NEW research OBJECT WITH ITS RESEARCH DATA")
                                        var updateResult = await updateAutoResearchObject("research", research);
                                        console.log("\n\nUPDATED RESULT -> " + JSON.stringify(updateResult));
                                        // WORK WITH updatedResult HOWEVER YOU PREFER ..
                                        // 
                                        // links MUST HAVE ACTUAL LINKS TO FORMS (IDs), SPECIFIC SEGMENTS, & SEGMENTATION OF TARGET AUDIENCE ..
                                        // ALL THAT STUFF CAN BE DECIDED BY AUTOMAN-AI MODELS UP THERE ..
                                        var links = researchData.surveyFormsLinks || []; // GET THESE LINKS FROM researchData
                                        console.log("\nONLINE SURVEY LINKS -> " + JSON.stringify(links));// THEN PUSH THE SURVEY LINKS TO THE TARGET SEGMENTS ..
                                        // 
                                        // DIFFERENT LINKS (TO DIFFERENT SURVEYS) CAN GO TO DIFFERENT TARGET SEGMENTS, BASED ON AUTOMAN-AI
                                        
                                        // IF NO LINKS ARE AVAILABLE, JUST END THE EXECUTION RIGHT HERE ..
                                        if(! (links && (links.length) > 0) ){
                                            console.log("NO RESEARCH LINKS RETRIEVED, CONTINUING ON TO THE NEXT RESEARCH METHOD");
                                            continue;
                                        }

                                        // MAKE SURE YOU PERFORM DISTRIBUTION OF ALL SURVEY LINKS IN THEIR OWN SPECIAL WAY
                                        // BASED ON THE SEGMENTS, SEGMENTATION, RESEARCH, CONTACT METHODS, etc

                                        /* In actual fact, Auto-API must contact AUTOMAN-AI for the right contact methods 
                                        for each target Segment / User, and even which Research Method(s) to use too .. */
                                        // 
                                        var contactSettings = { recipientsType: "Users" }; // FIND A WAY TO MAKE THIS GENERIC OR STH ..
                                        // 
                                        ////////////////////////////////////////////////////////////////////////////////////////////////////
                                        var subject = contactSettings.subject || "Fill Survey, Win REWARDS!!!",
                                        message = contactSettings.message || "Hello!! Please help us fill this survey -> " + links[0].link;

                                        message = ""; // JUST DO THIS FOR NOW, BUT KNOW THAT IT'LL HAVE TO CHANGE LATER ..
                                        for(var link of links){
                                            message += "\nHello!! Please help us fill this survey -> " + link.link + "\n"
                                            + "You stand a chance to win a VERY HUUUUGE reward !! Thank You Very Much!\n";
                                        }
                                        ////////////////////////////////////////////////////////////////////////////////////////////////////
                                        




                                        // Get recipients from target segments' users, & contactMethods from their contact_method preferences
                                        var contactMethods = contactSettings.contactMethods || ["Email"],
                                        // You can also just set defaultCmeth=true of .contact() function (users' preferred contact meths are used)
                                        recipientsType = "user", // THIS MUST BE EDITED TO WORK PERFECTLY
                                        recipients = contactSettings.recipients || [];
                                        ////////////////////////////////////////////////////////////////////////////////////////////////////
                                        ////////////////////////////////////////////////////////////////////////////////////////////////////
                                        ////////////////////////////////////////////////////////////////////////////////////////////////////
                                        
                                        // HOWEVER, IT'S BEST TO STILL GET ALL RECIPIENTS (FROM segments)
                                        console.log("")
                                        console.log("NOW, WORKING WITH (" + segments.length + ") SEGMENT(s) ...")
                                        var segment = null, uid = null, segmentObjects = [];
                                        try {
                                            for(var segmentId of segments){ // GET THIS segment's .users
                                                // MAKE SURE THE ._id PARAMETER IS A STRING, & NOT OBJECT-ID
                                                segment = await getAutoResearchObject("segment", segmentId);
                                                console.log("\nWORKING WITH segment -> " + JSON.stringify(segment) + "\n");
                                                // CHECK, COZ segment OBJECT WILL BE DEEP POPULATED BY DEFAULT ..
                                                if(segment && segment.users && (segment.users.length > 0))  {
                                                    console.log("SEGMENT HAS " + segment.users.length + " RECIPIENTS");
                                                    for(var userObj of segment.users) {
                                                        uid = userObj._id.toString();
                                                        if(uid && !recipients.includes(uid)) {
                                                            console.log("ADDING (" + recipientsType + 
                                                            ") RECIPIENT (" + userObj.full_name + ") -> " + uid);
                                                            recipients.push(uid);
                                                        } else console.log("recipients ALREADY INCLUDES (" + userObj.full_name + ") UID -> " + uid);
                                                        console.log("\n\nRECIPIENTS NOW (" + recipients.length + ") -> " + JSON.stringify(recipients) + "\n\n");
                                                    }
                                                }
                                                segmentObjects.push(JSON.parse(JSON.stringify(segment)));
                                            }
                                        } catch (e){
                                            console.log("ERROR WHEN RETRIEVING SEGMENT -> " + JSON.stringify(e));
                                            continue;
                                        }

                                        // OR GET ALL USERS WITH segmentation CORRESPONDING TO EACH SEGMENT
                                        console.log("")
                                        console.log("NOW, WORKING WITH SEGMENTATION ...") 
                                        console.log("SEGMENT OBJECTS (" + segmentObjects.length + ") -> " + JSON.stringify(segmentObjects))
                                        var allUsers = await getAllAutoResearchObjects("user", {});
                                        for(userObj of allUsers){
                                            for(var segObj of segmentObjects){
                                                // NOW, MATCH uObj WITH sObj, THEN ADD TO recipients ARRAY IF NOT ALREADY INSIDE
                                                if( false // USE THIS FOR NOW, TO PREVENT SOME COMPLICATIONS, UNTIL YOU'RE READY TO PERFECT IT!!!
                                                    || (userObj.segmentation.segments.includes(segObj._id.toString()))
                                                    // || userObj.segmentation.USE_ANY_OF_SEGMENTATION_CATEGORIES === segObj.segmentation.STH ..
                                                ){
                                                    uid = userObj._id.toString();
                                                    if(uid && !recipients.includes(uid)) {
                                                        console.log("ADDING (" + recipientsType + 
                                                        ") RECIPIENT (" + userObj.full_name + ") -> " + uid);
                                                        recipients.push(uid);
                                                    } else console.log("recipients ALREADY INCLUDES (" + userObj.full_name + ") UID -> " + uid);
                                                    console.log("\n\nRECIPIENTS NOW (" + recipients.length + ") -> " + JSON.stringify(recipients) + "\n\n");
                                                }
                                            }
                                        }                                 
                                        // 
                                        console.log("\n\nSUBJECT -> " + subject);
                                        console.log("MESSAGE -> " + message);
                                        console.log("RECIPIENTS (" + recipients.length + ") -> " + JSON.stringify(recipients));
                                        
                                        switch (contactSettings.recipientsType) {
                                            case "Users":
                                                recipientsType = "user";
                                                break;
                                            // 
                                            // case "Customers": recipientsType = "customer";
                                            // case "Respondents": recipientsType = "respondent";
                                            // case "Prospects": recipientsType = "prospect";
                                            // 
                                            // case "Employees": recipientsType = "employee";
                                            // case "Clients": recipientsType = "client";
                                            // case "Stake Holders": recipientsType = "stakeholder";
                                            default:
                                                recipientsType = "user";
                                        }
                            
                                        // MAKE SURE THAT contactBody HAS ALL THESE PROPERTIES BEFORE CALLING THIS FUNCTION
                                        // PROPERTIES: .subject .message .extra { .autoEnum .dataId (& special extra) };
                            
                            
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        // KNOW HOW YOU CAN USE .extraData PROPERTY OF contactSettings TO AFFECT MESSAGE INFORMATION subject/message
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        //  OR MAYBE YOU CAN USE .extraData TO FILL THIS extra OBJECT INSTEAD, THINK ABOUT IT PLEASE :)
                            
                                        var extra = {}; // FIND A WAY TO FILL THIS JSON OBJECT FOR ALL POSSIBLE CONTACT METHODS AVAILABLE
                                        var contactBody = {
                                            contact_methods: contactMethods,
                                            data: {
                                                subject: subject, message: message,
                                                extra: {
                                                    autoEnum: "Research", dataId: research._id
                                                    // , // THE REST OF THIS DATA CAN BE SAVED FOR LATER, WHEN extra JSONOBJECT HAS BEEN FILLED BY .extraData
                                                    // "Notification": extra[""] || {
                                                    //     notificationType: null, send_after: null, delayed_option: null, delivery_time_of_day: null,
                                                    //     segments: null, player_ids: null, include_player_ids: null, send_after: null, send_after: null,
                                                    // },
                                                    // "SMS": extra["SMS"] || {  },
                                                    // "Email": extra["Email"] || { template: null, context: null },
                                                    // "Company Email": extra["Company Email"] || { template: null, context: null },
                                                    // "USSD": extra["USSD"] || {  },
                                                    // "Post Mail": extra["Post Mail"] || {  }
                                                }
                                            }
                                        }; // THESE MIGHT BE RECIPIENT OBJECTS / MIGHT JUST BE IDs
                                        contactBody[recipientsType] = recipients;
                                        console.log("CONTACT BODY -> " + JSON.stringify(contactBody));
                                        var result = await contactRecipient(recipientsType, contactBody, true);
            
                                        // THIS SHOULDN'T resolve RIGHT NOW, COZ THIS IS A LOOK FOR ALL researchMethods ..
                                        // THEREFORE, ALL OTHER researchMethods MUST EXECUTED FIRST, BEFORE ANY result IS resolve()d
                                        // THEN RETURN A SUCCESS / FAILURE MESSAGE
                                        console.log("\CONTACT RESULT -> " + JSON.stringify(result));
                                        resolve(result);
            
                                        // ANOTHER ROUTE / WEBHOOK WILL WAIT FOR RESPONSES FROM TYPEFORM
                                        // OR, YOU CAN MANUALLY AUTO-REQUEST RESPONSES FROM TYPEfORM IN SPECIFIC INTERVALS
            
                                    } else resolve({ code: 400,
                                        resultData: {success: false, message: 'Sorry, please specify "Target Segmentation'}
                                    });
                                } else resolve({ code: 400,
                                    resultData: {success: false, message: 'Sorry, please specify "Survey Forms (IDs)"'}
                                });
                            break;
                            default:
                                console.log("FUNCTIONALITY FOR '" + researchMethod + "' RESEARCH METHOD IS NOT READY YET ..")
                            break;
                        }
                    }


                    // PUT STH HERE, COZ ALL researchMethods HAVE BEEN LOOPED THROUGH, THEREFORE THE EXECUTION MUST END ..
                    resolve({code: 200, resultData: {success: true, message: "Not all research methods have their functionalities implemented .."}})


                } else resolve({ code: 400,
                    resultData: {success: false, message: 'Sorry, please specify "Research Methods"'}
                });
            } else resolve({ code: 400,
                resultData: {success: false, message: 'Sorry, please specify "Research Design"'}
            });
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}


// formData IS USED FOR THIS FUNCTION, COZ IT'S IN THE .forms ARRAY WITHIN research.data
async function getSurveyFormResponses(sources=[], formData, research){
    return new Promise(async (resolve, reject) => {
        try { // CONTACT ITS SOURCES FOR REALTIME (eg.WEBHOOKS) / UP-TO-DATE DATA, THEN UPDATE .data.forms ARRAY
            // WITH THE WEBHOOKS, ANOTHER ROUTE HAS TO BE AVAILABLE TO RECEIVE UPDATES ON RESPONSES DATA FROM SOURCES
            var result = { code: 200, resultData: { refinedFormData: formData, refinedResearch: research } };
            // THIS UP HERE IS THE DEFAULT RESULT / RESPONSE TO SEND TO THIS FUNCTION'S CALLER
            var surveySource = null;
            // 
            if(!formData.source || !["Typeform", "AutoForm"].includes(formData.source)) {
                console.log("THIS FORM HAS NO SOURCE, THEREFORE RETURNING IT")
                result.resultData.refinedFormData = JSON.parse(JSON.stringify(formData));
                resolve(result);
            } else { // IF IT HAS A SOURCE, THEN PROCEED TO GET THE REALTIME / LATEST UPDATE ON ITS RESPONSES ..
                switch(formData.source) {
                    case "Typeform":
                        surveySource = JSON.parse(JSON.stringify(OnlineSurveys.Typeform));
                        // console.log(JSON.stringify(surveySource));
                        // 
                        var data = await OnlineSurveys.Typeform.getResponses(formData);
                        // res = {} -> WORK WITH res HOWEVER YOU PREFER
                        // eg. UPDATE .responsesData & OTHER PROP OF formData WITH ALL THE NEW RESPONSES FROM THIS REQUEST
                        if(data && data.items){
                            console.log("\nTOTAL FORMS AVAILABLE -> " + data.total_items);
                            console.log("TOTAL PAGE COUNT -> " + data.page_count + "\n");
                            var obj = null, responseToAdd = null, answerToAdd = null, iteration = 0;  // START FROM 0
                            console.log("\nFIRST, UPDATING THE .responsesData PROP WITH THE ENTIRE DATA ..")
                            formData.responsesData = data; // FIRST, UPDATING THE .responsesData WITH THE ENTIRE REPONSES DATA
                            console.log("NOW, UPDATING ALL THE .responses IN formData -> WITH PROPS .respondent .metadata .answers")
                            for(var formResponseAnswersObject of data.items){
                                /* var TypeformResponseAnswersObject = {
                                    "landing_id": "21085286190ffad1248d17c4135ee56f",
                                    "token": "21085286190ffad1248d17c4135ee56f",
                                    "landed_at": "2017-09-14T22:33:59Z",
                                    "submitted_at": "2017-09-14T22:38:22Z",
                                    "metadata": {
                                        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8",
                                        "platform": "other",
                                        "referer": "https://user_id.typeform.com/to/lR6F4j",
                                        "network_id": "responsdent_network_id",
                                        "browser": "default"
                                    },
                                    "answers": [
                                        {
                                        "field": {
                                            "id": "hVONkQcnSNRj",
                                            "type": "dropdown",
                                            "ref": "my_custom_dropdown_reference"
                                        },
                                        "type": "text",
                                        "text": "Job opportunities"
                                        },
                                    ],
                                    "hidden": {},
                                    "calculated": {
                                        "score": 2
                                    }
                                }; 
                                var AutoFormResponseObject = { "id": "", "name": "", "message": "", "source": "Typeform", 
                                "link": "", "language": "English", "questions": [{ "id": "", "question": "", "questionType": "", 
                                "acceptedAnswerType": "", "reference": "", "answers": [ {"id": "", "answerType": "", "answer": {} } ] }],
                                    "validations": { }, "responsesData": {} };
                                */
                                // 0. Set the entire 'data' to formData.responsesData prop (must be done before this loop)
                                // 1. Hope & Pray that first props have been handled in calling function
                                // (By merging of a dummy response obj with the question-form object, or just going with what already existed)
                                // NB: PROPS -> "id": "", "question": "", "questionType": "", "acceptedAnswerType": "", "reference": "",
                                // THEREFORE, KNOW HOW TO MATCH THIS RESPONSE-FORM'S .questions OBJECTS TO THE QUESTION-FORM'S .questions OBJECTS ..

                                // 2. Now, go into the .reponses array, and check if this 'formResponseAnswersObject' already exists ...
                                obj = {}; // THIS IS FOR .respondent PROP OF formData.responses
                                for(var key of ["landing_id", "token", "response_id", "landed_at", "submitted_at", 
                                "hidden", "calculated"]) {
                                    obj[key] = formResponseAnswersObject[key] || "";
                                }
                                responseToAdd = {
                                    "respondent": JSON.parse(JSON.stringify(obj)),
                                    "metadata": JSON.parse(JSON.stringify(formResponseAnswersObject.metadata || {})),
                                    "answers": []
                                }; // NOW, ADD formResponseAnswersObject.answers IF THEY DON'T ALREADY EXIST IN responseToAdd.answers
                                console.log("\n\nOBJECT WITH PROPS .respondent & .metadata -> " + JSON.stringify(responseToAdd));
                                // 
                                console.log("\nNOW, ADDING ALL THE AVAILABLE (" + 
                                (formResponseAnswersObject.answers || []).length + ") ANSWERS ......")
                                // 
                                if( (formResponseAnswersObject.answers || []).length > 0 ) {
                                    for(var ans of formResponseAnswersObject.answers){
                                        console.log("\nANSWER TO ADD -> " + JSON.stringify(ans));
                                        answerToAdd = { // .field = .id .type & .ref
                                            "field": JSON.parse(JSON.stringify(ans["field"] || {})),
                                            "answer": {
                                                "type": ans["type"],
                                                "value": ans[ans["type"]] || {}
                                            }
                                        }
                                        responseToAdd.answers.push(JSON.parse(JSON.stringify(answerToAdd)));
                                        console.log("ANSWER ADDED  -> " + JSON.stringify(answerToAdd));
                                        answerToAdd = null;
                                    } // NOW, YOUR responseToAdd SHOULD BE READY
                                } else console.log("NO (0) ANSWERS, THEREFORE NOTHING TO ADD .")
                                // 
                                console.log("\nNOW OBJECT (RESPONSE-FORM TO ADD/EDIT) IS READY -> " + JSON.stringify(responseToAdd));

                                // KNOW HOW TO MATCH THE 'TypeformResponseAnswersObject' WITH formData.responses[index] ..
                                if(!formData.responses) formData.responses = []; 
                                console.log("\n\nNOW, CHECKING IF RESPONSE'S RESPONDENT ALREADY EXISTS IN formData\nDATA -> " + JSON.stringify(obj));
                                // NOW, CHECK IF formResponseAnswersObject / obj ALREADY EXISTS IN formData.responses ARRAY OR NOT ..
                                // IF IT DOESN'T ALREADY EXIST IN THE formData.responses ARRAY, BE SURE TO ADD IT ..
                                var filter = formData.responses.filter(e => (e.respondent) && (e.respondent.landing_id) && 
                                (e.respondent.token) &&  (e.respondent.landing_id === obj.landing_id) && 
                                (e.respondent.token === obj.token) );
                                console.log("\nNUMBER OF ALREADY EXISTING RESPONSES MATCHED -> " + JSON.stringify(filter));
                                if (filter.length > 0) {
                                    // THEREFORE, IT ALREADY EXISTS, SO FIND IT'S INDEX, & UPDATE IT WITH NEW RESPONSES DATA ..
                                    console.log("\nTHIS REPONSE IS ALREADY SAVED IN formData, THEREFORE UPDATING IT WHILST IN formData ..");
                                    var i = 0;
                                    for(var e of filter ){
                                        i = 0; // NOW, FIND AND UPADTE ALL THE RESPONSE-FORMS THAT MATCHED ..
                                        for(var r of formData.responses){ // RESPONSE TO BE (POSSIBLY) UPDATED -> r / formData.responses[i]
                                            if( (r.respondent) && (r.respondent.landing_id) && (r.respondent.token) &&  
                                            (r.respondent.landing_id === e.respondent.landing_id) && (r.respondent.token === e.respondent.token) ){
                                                formData.responses[i] = JSON.parse(JSON.stringify( Object.assign(r, responseToAdd) ));
                                                console.log("UPDATED RESPONSE AT INDEX " + i + " -> " + JSON.stringify(formData.responses[i]));
                                            }
                                            i++;
                                        }
                                    }
                                } else { // THIS CODE WILL ONLY RUN IF obj DOESN'T ALREADY EXIST IN formData.responses
                                    console.log("\nFORM RESPONSE NOT SAVED YET, THEREFORE ADDING ..")
                                    formData.responses.push(JSON.parse(JSON.stringify(responseToAdd)));
                                }
                            }
                        } else {
                            console.log("NO RESEARCH RESPONSE DATA FROM formData's '" + formData.source + "' SOURCE")
                        }
                    break;
                    case "AutoForm":
                    break;
                    default:
                        console.log("FORM HAS NO SPECIFIC SOURCE SUPPORTED BY AUTO-RESEARCH ..")
                    break;
                }
                // 
                console.log("\n\n\n\nTHIS FORM HAS NOW BEEN UPDATED, THEREFORE RETURNING IT")
                result.resultData.refinedFormData = JSON.parse(JSON.stringify(formData));
                // FIND OUT IF YOU CAN EDIT / REFINE research TOO -> .refinedResearch: research
                console.log("NOW, RESOLVING & RETURNING result TO THE CALLING FUNCTION ..")
                console.log("result BEING RETURNED -> " + JSON.stringify(result));
                resolve(result);
            }
            // 
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}
// 


async function getResearchResponsesData(research, extra){
    return new Promise(async (resolve, reject) => {
        try { // LOOK AT research.design TO KNOW HOW EXACTLY TO EXECUTE THE RESEARCH
            if(research.design && research.design.segmentation && research.design.methods) {
                var design = research.design, segmentation = research.design.segmentation, methods = research.design.methods;
                var result = null, updateResult = null;
                // NOW, DO SOME MORE VALIDATIONS TO KNOW WHICH RESEARCH METHODS & SEGMENTATIONS TO USE
                if(methods.methods && (methods.methods.length > 0)) {
                    if(!research.data) research.data = {};
                    for(var researchMethod of methods.methods){
                        console.log("\n\nWORKING WITH RESEARCH METHOD -> " + researchMethod);
                        if(!research.data[researchMethod]) {
                            console.log(researchMethod + "'s DATA DOESN'T EXISTS FOR THIS OBJECT, THEREFORE INITIALIZING ..")
                            research.data[researchMethod] = {};
                        } 
                        console.log(researchMethod + "'s RESEARCH DATA -> " + JSON.stringify(research.data[researchMethod]));
                        switch(researchMethod){
                            case "Survey": // BUT FOR NOWWWWW, JUST WORK WITH ONLINE SURVEYS
                                // 
                                if(!research.data[researchMethod].forms) {
                                    console.log(researchMethod + "'s FORMS DATA DOESN'T EXISTS FOR THIS OBJECT, THEREFORE INITIALIZING ..")
                                    research.data[researchMethod].forms = [];
                                } 
                                if(methods.methods.includes("Survey") && methods.Survey && methods.Survey.forms){
                                    console.log("Research methods are fine, proceeding to retrieving response data ..")
                                    // JUST GET ALL THE FORMS, MATCH THEIR IDs WITH .design.methods.Survey.forms.ids
                                    // MAKE A COPY OF THE forms IN THE RESPONSE DATA TO BE USED FOR LOGIC 
                                    // BUT ONLY UPDATE THE MAIN research.data[researchMethod].forms DATA THOUGH
                                    var aformsCopy = JSON.parse(JSON.stringify(research.data[researchMethod].forms)),
                                    newAformToAdd = null, dummyForm = { "id": "", "name": "", "message": "", "source": "", "language": "", 
                                    "link": {"link_api": "", "link_page": ""}, "questions": [], "validations": {}, "responses": [], "responsesData": {} },
                                    iteration = 0, i = 0, IDsOfFormsToWorkWith = [], formToWorkWith = null, refinedFormData = null, aformsFilter = null;
                                    console.log("\nCOPY OF RESEARCH RESPONSE-FORMS DATA -> " + JSON.stringify(aformsCopy) + "\n");
                                    // 
                                    for(var qform of methods.Survey.forms){
                                        console.log("WORKING WITH QUESTION-FORM '" + (qform.name || "-") + "' (" + 
                                        (qform.id || "-") + ") -> " + JSON.stringify(qform));

                                        aformsFilter = aformsCopy.filter(e => (e.id === qform.id) && 
                                        (true) // PUT PROPER VALIDATION HERE, THAT ALSO CHECKS THE ENTIRE aform 'e' OBJECT & ITS PROPERTIES ..
                                        );
                                        console.log("\nRESPONSE FORMS THAT MATCH QUESTION FORM -> " + JSON.stringify(aformsFilter));
                                        // 
                                        // CHECK IF THIS qform ALREADY HAS RESPONSE DATA .. 
                                        if (! (aformsFilter.length > 0) ) {
                                            // IF THIS FORM HAS NO CORRESPONDING RESPONSE DATA, ADD A NEW ONE ..
                                            console.log("\nQUESTION-FORM HAS NO RESPONSE-FORMS DATA YET, THEREFORE ADDING ..")
                                            newAformToAdd = JSON.parse(JSON.stringify(Object.assign(dummyForm, qform)));
                                            console.log("NEW FORM TO ADD -> " + JSON.stringify(newAformToAdd));
                                            //
                                            research.data[researchMethod].forms.push(newAformToAdd);
                                            // 
                                            console.log("ALSO, ADDING THE FORM'S .id -> " + qform.id);
                                            if(!IDsOfFormsToWorkWith.includes(qform.id)) IDsOfFormsToWorkWith.push(qform.id);
                                            // 
                                        } else { // BUT MAYBE YOU SHOULD STILL CONSIDER THAT .id PROP MUST MATCH WITH BOTH QUESTION & RESPONSE FORMS
                                            console.log("\nFORM ALREADY HAS SOME RESPONSE DATA, THEREFORE NO NEED TO UPDATE IT WITH THE QUESTION-FORM DATA ..")
                                            console.log("NOW, CHECKING IF FORM HAS OTHER (BASIC QUESTION FORM) PROPERTIES OF RESPONSE DATA, & UPDATING THEM ACCORDINGLY ..")
                                            // BUT OTHER PROPS (eg. .name, .message, .source, .language, etc) MIGHT NOT MATCH OR NOT BE AVAILABLE SEF ..
                                            i = 0; // THEREFORE, CHECK & BE SURE THAT THOSE OTHER PROPS ARE ALL AVAILABLE
                                            for(var aform of research.data[researchMethod].forms){
                                                if(aform.id && (aform.id  == qform.id)){
                                                    aform = JSON.parse(JSON.stringify(aform));
                                                    for(var key of ["name", "message", "source", "language", "link", "questions", "validations"]){
                                                        if(!aform.hasOwnProperty(key) && qform.hasOwnProperty(key)){
                                                            aform[key] = qform[key];
                                                        }
                                                    }
                                                    aform = JSON.parse(JSON.stringify(aform));
                                                    research.data[researchMethod].forms[i] = aform;
                                                    console.log("UPDATED RESPONSE-FORM DATA WITH BASIC QUESTION-FORM DATA (index " + 
                                                    i + ") -> " + JSON.stringify(research.data[researchMethod].forms[i]))
                                                    // 
                                                    console.log("ALSO, ADDING THE FORM'S .id -> " + qform.id);
                                                    if(!IDsOfFormsToWorkWith.includes(qform.id)) IDsOfFormsToWorkWith.push(qform.id);
                                                }
                                                i++;
                                            }
                                        } // NOW THAT WE'VE THE IDs OF FORMS TO WORK WITH, LET'S DO SOME WORK ..
                                        console.log("\n\nNOW, IDs OF (.data) RESPONSE-FORMS TO WORK WITH -> " + JSON.stringify(IDsOfFormsToWorkWith) + "\n");
                                        // BUT NOTE THAT iteration IS SUPPOSED TO BE FOR THE .forms IN .data OBJECT (NOT .design OBJECT)
                                        // THEREFORE, IN CASES WHERE THEY CONFLICT / MIS-ALIGN, THE DATA MIGHT BE CORRUPTED .. 
                                        // THEREFORE, FIND ALL INDICES OF .forms IN .data OBJECT, COZ THOSE ARE THE ONES TO WORK WITH
                                        for(var ID of IDsOfFormsToWorkWith){
                                            iteration = 0;
                                            console.log("\nFINALLY, WORKING WITH ID -> " + ID); 
                                            for(var aform of research.data[researchMethod].forms){
                                                if(aform.id && (aform.id  === ID)){
                                                    // NOW, GET THE FORM THAT WE'RE CURRENTLY WORKIN WITH, USING iteration ..
                                                    formToWorkWith = research.data[researchMethod].forms[iteration];
                                                    formToWorkWith = JSON.parse(JSON.stringify(formToWorkWith));
                                                    console.log("\nNOW, FORM WE'RE WORKING WITH -> " + JSON.stringify(formToWorkWith) + "\n");
                                                    //  NOW, WORK WITH THIS formToWorkWith TO GET ALL SURVEY RESPONSES
                                                    result = await getSurveyFormResponses(["Typeform"], formToWorkWith, research);
                                                    // WORK WITH result NOW (eg. RE-ASSIGN / UPDATE research OBJECT)
                                                    refinedFormData = JSON.parse(JSON.stringify(result.resultData.refinedFormData));
                                                    // 
                                                    // IN CASE research WAS ALSO REFINED TO .refinedResearch, THEN UPDATE research OBJECT..
                                                    // research = JSON.parse(JSON.stringify(result.resultData.refinedResearch));
                                                    // 
                                                    console.log("\n\nFINAL REFINED FORM DATA -> " + JSON.stringify(refinedFormData) + "\n\n");
                                                    research.data[researchMethod].forms[iteration] = refinedFormData; 
                                                    // NOW UPDATE THIS, NOT aformsCopy
                                                } // NOW, MOVE ON TO THE NEXT .data FORM ..
                                                iteration++;
                                            }
                                        }
                                        console.log("EMPTYING THE IDs OF FORMS TO WORK WITH ..\n\n\n");
                                        IDsOfFormsToWorkWith = [];
                                    } //
                                    iteration = 0;
                                    // NOW THAT YOU'VE ALL UP-TO-DATE RESPONSES DATA, SAVE research WITHIN THE DATABASE
                                    console.log("NOW, UPDATING research OBJECT IN THE DATABASE -> " + JSON.stringify(research) + "\n\n\n");
                                    updateResult = updateAutoResearchObject("research", research); // DO NOT await IT
                                    // COZ THE CALL ABOVE IS NOT await'ed updateResult WILL BE null (MULTITHREADING ..)
                                    // console.log("\n\nUPDATED RESULT -> " + JSON.stringify(updateResult)); 
                                    // WORK WITH updateResult HOWEVER YOU PREFER ..
                                    // THEN, MOVE ON TO THE NEXT RESEARCH METHOD
                                    // NOTE THAT research MUST BE UPDATED AFTER ALL researchMethod's EXECUTIONS ARE COMPLETED ..
                                    
                                    // AND MAKE SURE THAT THE PARALLEL (MULTITHREADING) COMPUTING EFFECT DOESN'T CAUSE CONFLICTS IN UPDATING research
                                    // THEREFORE, ONLY THE PART OF research's .data WILL BE UPDATED IN THE DATABASE (& NOT THE ENTIRE .data OBJECT)
                                    // BASICALLY, MAKE SURE THAT THE Object.assign() ONLY MERGES THE OLD .data & NEW .data (& NOT REPLACES THE WHOLE .data OBJECT)

                                    // THEREFORE, DO NOT await updateAutoResearchObject("research", research); 
                                    // SO THIS FUNCTION MOVES STRAIGHT TO THE NEXT researhMethod (COZ IT'S PARALLEL COMPUTING :)

                                } else console.log("ISSUE ENCOUNTERED WHEN WORKING WITH RESEARCH METHOD -> " + researchMethod);
                            break;
                            default:
                                console.log("FUNCTIONALITY FOR '" + researchMethod + "' RESEARCH METHOD IS NOT READY YET ..")
                            break;
                        }
                    } // THIS IS WHERE THE LOOP ENDS, THEREFORE RETURN SUCCESS/FAILURE RESULT FROM HERE .. 
                    
                    // NOW, RETURN research OBJECT TO CLIENTS
                    resolve({ code: 200, resultData: { success: true, message: "Retrieving responses for research '" + research.name + "'" }});

                } else resolve({ code: 400,
                    resultData: {success: false, message: 'Sorry, "Research Methods" not available for this research'}
                });
            } else resolve({ code: 400,
                resultData: {success: false, message: 'Sorry, "Research Design" not available for this research'}
            });
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            console.log(e);
            reject(e);
        }
    });
}

async function stopResearch(research, extra) {
    return new Promise(async (resolve, reject) => {
        try { // LOOK AT research.SOME_PROP TO KNOW HOW EXACTLY TO STOP THE RESEARCH
            if(true) {
                console.log("   STOPPING AUTO-RESEARCH NOWWWW !!!!!     ");
                resolve({ code: 200, resultData: {success: true, message: 'Research has been halted' }});
            }
        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////                        OTHER AUTO-RESEARCH FUNCTIONS ...


async function optionStock(option, stock) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(option + " OPTION ON STOCK -> " + JSON.stringify(stock));
            resolve({code: 200, resultData: {success: true, message: "IMPLEMENT THIS FUNCTIONALITY"}});

        } catch (e) {
            console.log("ERROR -> " + JSON.stringify(e));
            reject(e);
        }
    });
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////                             PUBLIC AUTO-RESEARCH FUNCTIONS

var AutoResearchFunctions = {

    updateResearchSurvey: function (type){
        // UPDATE RESEARCH SURVEY DETAILS
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'research') throw new Error('Type needs to be research');
        return compose()
            .use(auth.isAuthorized(['updateSurvey', type])) //
            .use(async function updateSurvey(req, res, next) {
                try {
                    // ALL THE CODE COMES RIGHT HERE ...
                } catch (err) {
                    console.log("ERROR -> " + (err));
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    // router.put('/:executeOrStop/:id', autoResearchfunct.executeOrStopAutoResearch(obj));
    executeOrStopAutoResearch: function (type){
        // EXECUTE THE RESEARCH OBJECT, BASED ON THE CURRENT STAGE THAT IT'S AT ATM
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'research') throw new Error('Type needs to be research');
        return compose()
            .use(auth.isAuthorized(['executeOrStop', type])) //
            .use(async function executeOrStop(req, res, next) {
                try {
                    console.log("...");
                    if ((req.params.executeOrStop) && (req.params.id) && 
                    (req.body && Object.keys(req.body).length > 0)) {
                        if (!req.body.hasOwnProperty("extra")) // PUT THIS PROPERTY HERE FOR NOW ..
                            return sendResponse(res, 404, {
                                err: null,
                                success: false,
                                message: "Some Data not specified"
                            });
                        // NOW RUN EXECUTION/STOP 
                        var result = {code: 400, resultData: {success: false, message: "Some error occured"}};
                        console.log("FUNCTION -> " + req.params.executeOrStop + ", TYPE -> " + type 
                        + ", & ID -> " + req.params.id);
                        console.log("BODY -> " + JSON.stringify(req.body));
                        var data = await getAutoResearchObject(type, req.params.id);
                        console.log("RESEARCH DATA -> " + JSON.stringify(data)); // RESEARCH DATA
                        ///////////////////////////////////////////////////////////////////
                        //  NOW, CALL A FUNCTION TO EXECUTION/STOP THIS RESEARCH OBJECT RETRIEVED FROM DATABASE
                        switch(req.params.executeOrStop){
                            case "execute":
                                result = await executeResearch(data, req.body);
                                if(result.code === 200 & result.resultData.success){
                                    console.log("\n\nDONE EXECUTING RESEARCH, NOW UPDATING ITS .executed (& .forms) PROPERTIES ..\n")
                                    data.executed = false; // true; // SE THIS PROPERTY TO true, THEN SAVE THE RESEARCH OBJECT :)
                                    var updateResult = await updateAutoResearchObject(type, data);
                                    console.log("\n\nUPDATED RESULT -> " + JSON.stringify(updateResult));
                                }
                                ///////////////////////////////////////////////////////////////////
                                console.log("\nEXECUTION RESULT -> " + JSON.stringify(result));
                                if(result && result.code && (result.code === 200) && result.resultData && (result.resultData.success) 
                                    && (result.resultData.message) ){
                                    var extra_message = "";
                                    if(result.resultData.message.includes("No recipients specified"))
                                        extra_message = ", but no recipients/segments specified";
                                    result.resultData.message = "Research is being executed" + extra_message;
                                    console.log("EXECUTION RESPONSE -> " + JSON.stringify(result));
                                    return sendResponse(res, result.code, result.resultData);
                                } else return sendResponse(res, 404, {
                                    success: false,
                                    message: (result.resultData.message && result.resultData.message.length > 0) ? 
                                    result.resultData.message : "Research could not be executed"
                                });
                            break;
                            case "stop":
                                result = await stopResearch(data, req.body);
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
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    }, 

    // router.post('/:id/survey/get_responses', autoResearchfunct.getResearchResponses(obj));
    getResearchResponses: function (type){
        // RECEIVE RESEARCH RESPONSE FROM EXTERNAL SOURCES / PLATFORMS (ONLINE SURVEYS, SOCIAL MEDIA, WEB SCRAPERS, etc)
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'research') throw new Error('Type needs to be research');
        return compose()
            .use(auth.isAuthorized(['getResearchData', type])) //
            .use(async function getResearchData(req, res, next) {
                try {
                    console.log("...");
                    req.body = { extra: { sth: "DUMMY REQUEST DATA FOR NOW .."} };  // REMOVE THIS WHEN EXPANDING ..
                    // 
                    if ( (req.params.id) && (req.body && Object.keys(req.body).length > 0) ) {
                        if (!req.body.hasOwnProperty("extra")) // PUT THIS PROPERTY HERE FOR NOW ..
                            return sendResponse(res, 404, {
                                err: null,
                                success: false,
                                message: "Some Data not specified"
                            });
                        // DEFAULT "FAILURE" RESULT / RESPONSE TO REQUEST
                        var result = {code: 400, resultData: {success: false, message: "Some error occured"}};
                        // 
                        console.log("FUNCTION -> GETTING RESPONSES, TYPE -> " + type 
                        + ", & ID -> " + req.params.id);
                        console.log("BODY -> " + JSON.stringify(req.body) + "\n\n");
                        var data = await getAutoResearchObject(type, req.params.id);
                        console.log("\nRESEARCH DATA -> " + JSON.stringify(data)); // RESEARCH DATA
                        ///////////////////////////////////////////////////////////////////
                        //  NOW, CALL A FUNCTION TO FETCH RESEARCH OBJECT'S RESPONSE DATA FROM INTERNAL DATABASE & EXTERNAL SOURCES
                        result = await getResearchResponsesData(data, req.body);
                        console.log("\nRESULT -> " + JSON.stringify(result));
                        // 
                        if(result && result.code && (result.code === 200) && result.resultData && (result.resultData.success) ){
                            result.resultData.message = "Retrieving responses for research '" + data.name + "'";
                            return sendResponse(res, result.code, result.resultData);
                        } else return sendResponse(res, 404, {
                            success: false,
                            message: "Research could not be executed"
                        });                     
                    } else return sendResponse(res, 404, {
                        success: false,
                        message: "Options not specified"
                    });
                } catch (err) {
                    console.log("ERROR -> " + (err));
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    receiveResearchResponse: function (type){
        // RECEIVE RESEARCH RESPONSE FROM EXTERNAL SOURCES / PLATFORMS (ONLINE SURVEYS, SOCIAL MEDIA, WEB SCRAPERS, etc)
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'research') throw new Error('Type needs to be research');
        return compose()
            .use(auth.isAuthorized(['receiveResponse', type])) //
            .use(async function receiveResponse(req, res, next) {
                try {
                    //  PUT WHATEVER LOGIC YOU PREFER RIGHT HERE ..
                } catch (err) {
                    console.log("ERROR -> " + (err));
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    handleTypeformApp: function(type){
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'typeform') throw new Error('Type needs to be typeform');
        return compose()
            .use(auth.isAuthorized(['receiveResponse', type])) //
            .use(async function receiveResponse(req, res, next) {
                try {
                    // ALL THE CODE COMES RIGHT HERE ...
                } catch (err) {
                    console.log("ERROR -> " + (err));
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    //  AUTO-AUDITING FUNCTIONS FOR AUTO-RESEARCH
    option: function (type) { // PERFORM A STOCK OPTION ON A PARTICULAR STOCK
        if (!type) throw new Error('Type needs to be set');
        if (type !== 'stock') throw new Error('Type needs to be either stock/sth');
        return compose()
            .use(auth.isAuthorized(['option', type])) //
            .use(async function option(req, res, next) {
                try {
                    if (req.body && Object.keys(req.body).length > 0) {
                        if (!req.body.option) return sendResponse(res, 404, {
                            success: false,
                            message: "No Stock Option Specified"
                        });
                        var result = {code: 400, resultData: {success: false, message: "Some error occured"}};
                        console.log("TYPE -> " + type + " & ID -> " + req.params.id);
                        var data = await getAutoResearchObject(type, req.params.id);
                        console.log("DATA -> " + JSON.stringify(data));
                        ///////////////////////////////////////////////////////////////////
                        //  NOW, CALL A FUNCTION TO OPTION THIS STOCK RETRIEVED FROM DATABASE
                        result = await optionStock(req.body.option, data);
                        ///////////////////////////////////////////////////////////////////
                        console.log("\nRESULT -> " + JSON.stringify(result));
                        return sendResponse(res, result.code, result.resultData);
                    } else return sendResponse(res, 404, {success: false, message: "No Request Body"});
                } catch (err) {
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                }
            });
    },

    StockMarketMonitoring: {

        optionStock: async function (option, stock) {
            return new Promise(async (resolve, reject) => {
                try {
                    var result = await optionStock(option, stock);
                    // WORK WITH THIS HOWEVER YOU WANT :)
                    console.log("\nRESULT -> " + JSON.stringify(result));

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
                                var stocks = await getAllAutoResearchObjects("stock", {stock_name: obj.name});
                                console.log(stocks.length + " STOCKS RELATED TO " + obj.name)
                                for (var stock of stocks) { // NOW, GET STANDARD STOCK DATA INTO YOUR MONGOOSE OBJECT
                                    stock = preprocessStockData(stock, obj, key);
                                    // SAVE THIS STOCK FOR NOW, IN CASE THE PERSONAL EQUITY DATA REQUEST FAILS
                                    stock = await updateAutoResearchObject("stock", stock);
                                    console.log("UPDATED STOCK OBJECT FOR NOW -> " + JSON.stringify(stock));
                                    console.log("NOW, GETTING PERSONAL EQUITY DATA FOR STOCK -> " + stock.stock_name);
                                    var dataObject = await getData(gseURL + "equities/" + stock.stock_name);
                                    if (dataObject) {
                                        console.log("EQUITY DATA -> " + JSON.stringify(dataObject));
                                        // NOW, GET STANDARD STOCK DATA INTO YOUR MONGOOSE OBJECT
                                        stock = preprocessStockData(stock, dataObject, key + " - EQUITY");
                                        // NOW, YOU CAN GO AHEAD AND SAVE THE DATA ...
                                        stock = await updateAutoResearchObject("stock", stock);
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
    GeoSpatialMonitoring: {

        getGeoJson: function (type = "url") {

            return compose()
                .use(auth.isAuthorized(['scrape', type])) //
                .use(async function scrape(req, res, next) {
                    try {
                        if (req.body && Object.keys(req.body).length > 0) {
                            if (!req.body.url) return sendResponse(res, 404, {
                                success: false,
                                message: "No URL Specified"
                            });
                            var result = {code: 400, resultData: {success: false, message: "Some error occured"}};
                            var url = req.body.url;
                            console.log("URL -> " + JSON.stringify(url));
                            ///////////////////////////////////////////////////////////////////
                            //  NOW, CALL A FUNCTION TO SCRAPE THIS URL
                            result = await getGEO_JSONData(url);
                            if (result && result.hasOwnProperty("features")) result = {code: 200, resultData: result};
                            else result = {code: 500, resultData: {success: false, message: "Web Scraper failed"}};
                            ///////////////////////////////////////////////////////////////////
                            console.log("\nRESULT -> " + JSON.stringify(result));
                            return sendResponse(res, result.code, result.resultData);
                        } else return sendResponse(res, 404, {success: false, message: "No Request Body"});
                    } catch (err) {
                        console.log("ERROR -> " + JSON.stringify(err));
                        return sendResponse(res, 404, {err: err, success: false, message: "Some Error Occurred"});
                    }
                });


            async function getGEO_JSONData(url) {
                return new Promise(async (resolve, reject) => {
                    try {
                        var GEO_JSON_DATA = {
                            "type": "FeatureCollection",
                            "crs": {
                                "type": "name",
                                "properties": {"name": "Web Scraping Geo-Spatial (GeoJSON) Data for URL '" + url + "'"}
                            },
                            "features": []
                        }, geoJSONObject = {}, id = 0;
                        var urlData = await WebScraping.getURLData(url);
                        if (urlData) {
                            console.log("URL DATA (" + urlData.length + ") RETURNED -> " + JSON.stringify(urlData));
                            for (var urlObject of urlData) {
                                try {
                                    console.log("URL OBJ " + id + " -> " + JSON.stringify(urlObject));
                                    // FROM urlObject, OBTAIN GeoJSON OBJECT
                                    geoJSONObject = {
                                        "type": "Feature", "id": id,
                                        "properties": {
                                            "id": id,
                                            "name": urlObject.server.name,
                                            "description": urlObject.server.description,
                                            // NOW, YOU CAN ADD EXTRA PROPS TO BE USED BY AUTO-MAP :)
                                            "icon": "",
                                            "marker-size": "medium",
                                            "marker-symbol": ""
                                        },
                                        "geometry": {
                                            "type": "Point",
                                            "coordinates": [urlObject.coordinates.latitude, urlObject.coordinates.longitude]
                                        }
                                    };
                                    GEO_JSON_DATA["features"].push(geoJSONObject);
                                    id++;
                                } catch (e) {
                                    console.log("error -> " + e);
                                    continue;
                                }
                            }
                            id = 0;
                            console.log("GEO-JSON NOW -> " + JSON.stringify(GEO_JSON_DATA));
                            /*
                             // SAMPLE GEO-JSON DATA
                             var geoJSON = {
                             "type": "Feature", "id": 0,
                             "properties": {"id": 0, "name": "Dinagat Islands"},
                             "geometry": {"type": "Point", "coordinates": [125.6, 10.1]}
                             }, GEO_JSON = {
                             "type": "FeatureCollection",
                             "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
                             "features": [
                             {
                             "type": "Feature", "id": 1,
                             "properties": {"id": 1, "name": "Vorg"},
                             "geometry": {"type": "Polygon", "coordinates": []}
                             },
                             {
                             "type": "Feature", "id": 2,
                             "properties": {"id": 2, "name": "Loka"},
                             "geometry": {"type": "Polygon", "coordinates": []}
                             },
                             {
                             "type": "Feature", "id": 3,
                             "properties": {"id": 3, "name": "Cato"},
                             "geometry": {"type": "Polygon", "coordinates": []}
                             },
                             {
                             "type": "Feature", "id": 4,
                             "properties": {"id": 4, "name": "Tharv"},
                             "geometry": {"type": "Polygon", "coordinates": []}
                             },
                             //
                             {
                             "type": "Feature",
                             "properties": {
                             "marker-color": "#7e7e7e",
                             "marker-size": "medium",
                             "marker-symbol": "",
                             "icon": "http://maps.google.com/mapfiles/kml/pal3/icon0.png",
                             "description": "The Technology Sandbox, where a group of UCLA sandboxers reside"
                             },
                             "geometry": {"type": "Point", "coordinates": [-118.44319581985474, 34.06958255998611]}
                             },
                             {
                             "type": "Feature",
                             "properties": {
                             "marker-color": "#7e7e7e",
                             "marker-size": "medium",
                             "marker-symbol": "",
                             "icon": "http://maps.google.com/mapfiles/kml/pal3/icon1.png",
                             "description": "Rolfe Lab"
                             },
                             "geometry": {"type": "Point", "coordinates": [-118.44172596931456, 34.07389279840181]}
                             },
                             {
                             "type": "Feature",
                             "properties": {
                             "marker-color": "#7e7e7e",
                             "marker-size": "medium",
                             "marker-symbol": "",
                             "icon": "http://maps.google.com/mapfiles/kml/pal3/icon2.png",
                             "description": "North Athletic Field"
                             },
                             "geometry": {"type": "Point", "coordinates": [-118.44672560691835, 34.07208874591519]}
                             },
                             ]
                             }, TOPO_JSON = {
                             "type": "Topology",
                             "transform": {
                             "scale": [1, 1],
                             "translate": [0, 0]
                             },
                             "objects": {
                             "two-squares": {
                             "type": "GeometryCollection",
                             "geometries": [
                             {"type": "Polygon", "arcs": [[0, 1]], "properties": {"name": "Left_Polygon"}},
                             {"type": "Polygon", "arcs": [[2, -1]], "properties": {"name": "Right_Polygon"}}
                             ]
                             },
                             "one-line": {
                             "type": "GeometryCollection",
                             "geometries": [
                             {"type": "LineString", "arcs": [3], "properties": {"name": "Under_LineString"}}
                             ]
                             },
                             "two-places": {
                             "type": "GeometryCollection",
                             "geometries": [
                             {"type": "Point", "coordinates": [0, 0], "properties": {"name": "Origine_Point"}},
                             {"type": "Point", "coordinates": [0, -1], "properties": {"name": "Under_Point"}}
                             ]
                             }
                             },
                             "arcs": [
                             [[1, 2], [0, -2]],
                             [[1, 0], [-1, 0], [0, 2], [1, 0]],
                             [[1, 2], [1, 0], [0, -2], [-1, 0]],
                             [[0, -1], [2, 0]]
                             ]
                             };
                             // END OF SAMPLE GEO-JSON DATA
                             */

                            // NOW, RETURN GEO_JSON_DATA BACK TO CALLER OF THIS FUNCITON :)
                            resolve(GEO_JSON_DATA);
                        } else {
                            console.log("NO URL DATA RETURNED :(")
                            resolve([]);
                        }
                    } catch (e) {
                        console.log("ERROR -> " + JSON.stringify(e))
                        reject(e);
                    }
                });
            }
        }

    },

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    //  EXTRA AUTO-RESEARCH FUNCTIONS

};

module.exports = AutoResearchFunctions;
