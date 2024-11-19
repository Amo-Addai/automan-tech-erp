'use strict';

var path = require('path');
var ejs = require('ejs');
var compose = require('composable-middleware');
var request = require('request');

var dataHandler = require('../api/GLOBAL_CONTROLLER/DATABASE_SYSTEM_HANDLERS/DataHandler');
var autoViewModelscontrollersHandler = dataHandler.modelscontrollersHandler;

var funct = require('../functions');
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
    "property": require('../public/AUTO_INVESTMENT/DATA/PROPERTY/property.model'),
    "prospect": require('../public/AUTO_WEBSITE/DATA/PROSPECT/prospect.model'),
    "post": require('../public/AUTO_WEBSITE/DATA/POST/post.model'),
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PRIVATE FUNCTIONS

function getDataHandlerModel(type) {
    return DataHandlerModels[type];
}

async function getAllAutoViewObjects(type, condition) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoViewModelscontrollersHandler.getAll(getDataHandlerModel(type), JSON.stringify(condition));
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

async function getAutoViewObject(type, id) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoViewModelscontrollersHandler.get(getDataHandlerModel(type), id);
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

async function saveAutoViewObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoViewModelscontrollersHandler.add(getDataHandlerModel(type), data);
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

async function updateAutoViewObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoViewModelscontrollersHandler.update(getDataHandlerModel(type), data._id, data);
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

async function deleteAutoViewObject(type, data) {
    return new Promise(async (resolve, reject) => { // ERRORS CAN BE HANDLED FIRST OVER HERE
        try { 
            var result = await autoViewModelscontrollersHandler.delete(getDataHandlerModel(type), data._id);
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

var DefaultAutoViewContentData = {
    data: {

		limits: {
			latestProperties: 5
		},

		properties: [
			{
				name: "Residential Apartment",
				details: "",
				
				type: "Residential",
				stage: "Initiation",
				investment_strategy: "Value-Added",
				
				data: {
					"property_details": {
						"name": {
							"full_name": "Residential Apartment in Accra Ghana",
							"nickname": ""
						},
						"shares": {
							"total": 100,
							"available": 0,
							"share_price": 1
						},
						"parameters": {
							"area": {
								"value": 240,
								"unit": "square metres"
							},
							"beds": 4,
							"baths": 4,
							"garages": 1,
                            "amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck", 
                            "Tennis Courts", "Internet", "Parking", "Sun Room"]
						},
						"location": {
							"country" : "Ghana", 
						    "region" : "Greater Accra",
							"city" : "Accra",
							"town" : "East Legon",
							"street" : "Abelemkpe St",
							"number" : "20",
							"address" : "Abelemkpe St 20, East Legon - Accra, Ghana",
							"zip" : "",
							"postal" : "",
							"geolocation" : {
								"lat" : 0, "lng" : 0
							}
						},
                        "images": {
                            "slides": [
                                { stub: "slide-1", format: "jpg" }
                            ],
                            "pictures": [
                                { stub: "property-1", format: "jpg" }, 
                                { stub: "property-2", format: "jpg" }, 
                                { stub: "property-3", format: "jpg" }
                            ],
                            "plans": []
                        },
                        "videos": {}
					},
					"investment_analysis": {
						"irr": 10,
						"yield": 15,
						"cmult": 2.5
					},
					"valuation": {
							
						"value": {
							value: 100, currency: "USD"
						},
						"price": {
							price: 120, currency: "USD"
						},
					},
					"returns": {
	
					},
				},

				waitlist: {
					"Prospects": [],
					"Investors": []
				},
				asset: "",
				project: "",				
				investments: [],
				employees: [],
				property_developers: [],
				investors: [],
			},
			{
				name: "Office Building",
				details: "",
				
				type: "Commercial",
				stage: "Initiation",
				investment_strategy: "Value-Added",
				
				data: {
					"property_details": {
						"name": {
							"full_name": "Office Building in Lagos, Nigeria",
							"nickname": ""
						},
						"shares": {
							"total": 100,
							"available": 0,
							"share_price": 1
						},
						"parameters": {
							"area": {
								"value": 240,
								"unit": "square metres"
							},
							"beds": 4,
							"baths": 4,
							"garages": 1,
                            "amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck", 
                            "Tennis Courts", "Internet", "Parking", "Sun Room"]
						},
						"location": {
							"country" : "Nigeria", 
						    "region" : "Lagos",
							"city" : "Lagos",
							"town" : "Lagos",
							"street" : "Banana Street",
							"number" : "20",
							"address" : "Banana Street 20, Lagos - Lagos, Nigeria",
							"zip" : "",
							"postal" : "",
							"geolocation" : {
								"lat" : 0, "lng" : 0
							}
						},
                        "images": {
                            "slides": [
                                { stub: "slide-2", format: "jpg" }
                            ],
                            "pictures": [
                                { stub: "property-4", format: "jpg" }, 
                                { stub: "property-5", format: "jpg" }, 
                                { stub: "property-6", format: "jpg" }
                            ],
                            "plans": []
                        },
                        "videos": {}
					},
					"investment_analysis": {
						"irr": 10,
						"yield": 15,
						"cmult": 2.5
					},
					"valuation": {
							
						"value": {
							value: 100, currency: "USD"
						},
						"price": {
							price: 120, currency: "USD"
						},
					},
					"returns": {
	
					},
				},

				waitlist: {
					"Prospects": [],
					"Investors": []
				},
				asset: "",
				project: "",				
				investments: [],
				employees: [],
				property_developers: [],
				investors: [],
			},
			{
				name: "Star Heights",
				details: "",
				
				type: "Commercial",
				stage: "Initiation",
				investment_strategy: "Value-Added",
				
				data: {
					"property_details": {
						"name": {
							"full_name": "StarBoy Real Estate Property",
							"nickname": ""
						},
						"shares": {
							"total": 100,
							"available": 0,
							"share_price": 1
						},
						"parameters": {
							"area": {
								"value": 240,
								"unit": "square metres"
							},
							"beds": 4,
							"baths": 4,
							"garages": 1,
                            "amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck", 
                            "Tennis Courts", "Internet", "Parking", "Sun Room"]
						},
						"location": {
							"country" : "Ghana", 
						    "region" : "Western",
							"city" : "Takoradi",
							"town" : "Takoradi",
							"street" : "Lagos Avenue",
							"number" : "30",
							"address" : "Lagos Avenue 30, Takoradi - Takoradi, Ghana",
							"zip" : "",
							"postal" : "",
							"geolocation" : {
								"lat" : 0, "lng" : 0
							}
						},
                        "images": {
                            "slides": [
                                { stub: "slide-3", format: "jpg" }
                            ],
                            "pictures": [
                                { stub: "property-7", format: "jpg" }, 
                                { stub: "property-8", format: "jpg" }, 
                                { stub: "property-9", format: "jpg" }
                            ],
                            "plans": []
                        },
                        "videos": {}
					},
					"investment_analysis": {
						"irr": 10,
						"yield": 15,
						"cmult": 2.5
					},
					"valuation": {
							
						"value": {
							value: 100, currency: "USD"
						},
						"price": {
							price: 120, currency: "USD"
						},
					},
					"returns": {
	
					},
				},

				waitlist: {
					"Prospects": [],
					"Investors": []
				},
				asset: "",
				project: "",				
				investments: [],
				employees: [],
				property_developers: [],
				investors: [],
			},
		]

    },
    content: {
		
    },
    
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        OTHER PRIVATE FUNCTIONS

function returnPath(p, isStatic = false){
    var pp = path.join(__dirname + p);
    var pathToReturn = isStatic ? express.static(pp) : pp;
    console.log("RETURNING PATH -> " + JSON.stringify(pathToReturn));
    return pathToReturn;
}

function sendErrorFile(res, status = 404, data = {success: false, message: "Some Error Occurred"}){
    if(res) return res.sendFile(returnPath("/404.html"));
}

function sendFile(path, res, status = 200, data = {success: true, message: "Successful!"}){
    if(res) return res.sendFile(returnPath(path));
}

function renderFile(path, res, data = {}, options = {}){
    if(res) return res.render(path, data); 
}

var CallAPIFunctions = {
    
    async makeRequest(url="", method="", query=null, body=null){
        var _this = this;
        return new Promise(async (resolve, reject) => {
            try {
                var options = {
                    headers: {
                    //   'Authorization': 'Bearer ' + STH_COMES_HERE,
                      'Accept': 'application/json'
                    },
                    uri: "SOME DOMAIN URL COMES HERE .." + url,
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

    async getData(type, condition){ 
        return new Promise(async (resolve, reject) => { 
            try { // EITHER CONTACT AUTO-WEBSITE API FOR ALL THE DATA ..
                // OR, GET IT STRAIGHT AWAY THIS WAY ..
                var data = await getAllAutoViewObjects(type, condition);
                // 
                resolve(data);
            } catch (e){
                console.log("ERROR -> " + JSON.stringify(e));
                // reject(e); // DON'T DO THIS !!! RETURN DEFAULT AUTO-WEBSITE DATA !!!
                resolve(DefaultAutoViewContentData.data.properties);
            }
        });
    },

    async getObject(type, id){
        return new Promise(async (resolve, reject) => {
            try { // EITHER CONTACT AUTO-WEBSITE API FOR THE DATA ..
                // OR, GET IT STRAIGHT AWAY THIS WAY ..
                var obj = await getAutoViewObject(type, id);
                // 
                resolve(obj);
            } catch (e){
                console.log("ERROR -> " + JSON.stringify(e));
                reject(e); // D THIS !!! DON'T RETURN DEFAULT AUTO-WEBSITE DATA !!!
                // resolve(DefaultAutoViewContentData.data.properties[0]);
            }
        })
    }

};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////        PUBLIC FUNCTIONS

var AutoViewFunctions = {

    sendView: function(type = "index"){
        if (!type) throw new Error('Type needs to be set');
        return compose()
            // .use(auth.isAuthorized(['sendView', type])) //
            .use(async function send(req, res, next) {
                try { // ALL THE CODE COMES RIGHT HERE ...
                    var requestId = "", 
                    webPages = ["index", "about", "services", "properties", "contact",
                    "agents", "agent", "blogposts", "blogpost", "property", ""],
                    dashboardPages = ["login", "app", "dashboard"];
                    if(req.params.page) type = req.params.page;
                    if(["agent", "blogpost", "property"].includes(type)) {
                        if(req.query.id && (req.query.id.length > 0)) 
                            requestId = req.query.id;
                        else return sendErrorFile(res);
                    }
                    console.log("TYPE '" + type + "' WITH ID -> '" + requestId + "'");
                    // 
                    // if(req.params.page) type = req.params.page;
                    if (type === "resetpassword") {
                        
                        return sendFile("/resetpassword/resetpassword.html", res);
                    } else if(dashboardPages.includes(type)) return sendFile('/dashboard/react-material-admin/build/index.html', res);
                    else if(!webPages.includes(type)) return sendErrorFile(res);
                    else {
                        var path = 'website/pages/' + type;
                        // var path = '/website/pages/' + type + '.ejs';
                        // PICK UP ALL PARTIALS YOU'LL NEED AND INCLUDE THEM INTO .ejs TEMPLATE FILE
                        
                        var companyInfo = {
                            name: config.companyName, details: config.companyDetails, email: config.companyEmail, 
                            phone: config.companyPhoneNumber, address: config.companyHomeAddress, location: config.companyLocation,
                        }, content = {};
                        var data = { companyInfo }; // DATA TO BE RENDERED

                        switch(type){ // GET ALL DATA REQUIRED FOR EACH OF THESE PAGES ..
                            case "index": // 1ST GET PROPERTY DATA
                                content = {
                                    limits: {
                                        latestProperties: 5,
                                        topAgents: 5
                                    },
                                    carousel: [],
                                    valueProps: {
                                        "one": {
                                            title: "Data - Driven",
                                            text: "We employ a data-driven approach towards investment strategy, making strategic decisions based on data analysis and interpretation. With the goal of better serving you."
                                        },
                                        "two": {
                                            title: "Analysed Deals",
                                            text: "All our deals have been put through a rigorous due diligence and analysis process to make sure we are offering only the best and most profitable investment options."
                                        },
                                        "three": {
                                            title: "Manage Portfolio",
                                            text: "The dashboard is Intuitively designed both for experienced & less experienced investors alike, We give you a clear picture of your portfolio’s performance over time."
                                        },
                                    }
                                }; 
                                for(var t of [ {type: "property", cond: { extra: { limit: content.limits.latestProperties } }, label: "properties" }
                                /*, { type: "employee", cond: { FIND A WAY TO GET -> content.limits.topAgents } }, label: "employees" }*/ ])
                                    data[t.label] = await CallAPIFunctions.getData(t.type, t.cond);
                                // console.log("\nRENDERING CONTENT -> " + JSON.stringify(content))
                                // console.log("\nRENDERING DATA -> " + JSON.stringify(data))
                                return renderFile(path, res, { ...data, content });
                            case "about":
                                content = {
                                    about1: "We are a real estate investment platform, our goal is to provide institutional grade real estate investment options to people who have traditionally lacked access to these deals.",
                                    about2: "We invest in strictly eco-friendly alternative materials which are better for the environment, sustainable and capable of providing high yield returns.",
                                    about3: "Our team brings in depth experience & knowledge in real estate investment, management & development & Software engineering which enables us to bring you institutional grade investments with greater transparency."
                                };
                                return renderFile(path, res, { ...data, content });
                            case "services":
                                content = {
                                    steps: {
                                        "one": {
                                            title: "Create your account & browse",
                                            text: "Our platform lists every opportunity available for investment, with full information & details available for review. \
                                                    Our investments team is always available to answer questions. \
                                                    Create an account and choose the opportunity you think is right for your profile."
                                        },
                                        "two": {
                                            title: "Fund & Close",
                                            text: "Upon confirming your investment option you will be asked to complete a digital payment process using your credit/debit card. \
                                                There is also an option for people without cards to make payments into the bank and update the details."
                                        },
                                        "three": {
                                            title: "Track your Investments.",
                                            text: "You can view your dashboard at all times to see how your portfolio is doing. \
                                            You will also receive quarterly reporting through your personalized portfolio page."
                                        },
                                    }
                                };
                                return renderFile(path, res, { ...data, content });
                            case "contact":
                                content = {
                                    location: { // YOU MIGHT NOT EVEN NEED THIS THO'
                                        geolocation: { // COZ IT'S ALREADY IN data.companyInfo.location
                                            lat: "", lng: ""
                                        }
                                    }
                                };
                                return renderFile(path, res, { ...data, content });
                            case "properties":
                                // content = {

                                // };
                                // for(var t of [ {type: "property", cond: {}, label: "properties" } ])
                                //     data[t.label] = await CallAPIFunctions.getData(t.type, t.cond);
                                // console.log("\nRENDERING CONTENT -> " + JSON.stringify(content))
                                // console.log("\nRENDERING DATA -> " + JSON.stringify(data))
                                return renderFile(path, res, { ...data, content });
                            case "property":
                                content = {

                                };
                                for(var t of [ {type: "property", id: requestId, label: "property" } ])
                                    data[t.label] = await CallAPIFunctions.getObject(t.type, t.id);
                                console.log("\nRENDERING CONTENT -> " + JSON.stringify(content));
                                console.log("\nRENDERING DATA -> " + JSON.stringify(data));
                                return renderFile(path, res, { ...data, content });
                            case "blogposts":
                                // content = {

                                // };
                                // for(var t of [ {type: "post", cond: {}, label: "blogposts" } ])
                                //     data[t.label] = await CallAPIFunctions.getData(t.type, t.cond);
                                // console.log("\nRENDERING CONTENT -> " + JSON.stringify(content))
                                // console.log("\nRENDERING DATA -> " + JSON.stringify(data))
                                return renderFile(path, res, { ...data, content });
                            case "blogpost":
                                // content = {

                                // };
                                // for(var t of [ {type: "post", id: requestId, label: "blogpost" } ])
                                //     data[t.label] = await CallAPIFunctions.getObject(t.type, t.id);
                                // console.log("\nRENDERING CONTENT -> " + JSON.stringify(content));
                                // console.log("\nRENDERING DATA -> " + JSON.stringify(data));
                                return renderFile(path, res, { ...data, content });
                            case "agents":
                                // content = {

                                // };
                                // for(var t of [ {type: "user", cond: { type: "Employee" }, label: "agents" } ])
                                //     data[t.label] = await CallAPIFunctions.getData(t.type, t.cond);
                                // console.log("\nRENDERING CONTENT -> " + JSON.stringify(content))
                                // console.log("\nRENDERING DATA -> " + JSON.stringify(data))
                                return renderFile(path, res, { ...data, content });
                            case "agent":
                                // content = {

                                // }; // OR RATHER, CALL .getData() WITH cond: { _id: requestId, extra: { type: "Employee" } }
                                // for(var t of [ {type: "user", id: requestId, label: "agent" } ])
                                //     data[t.label] = await CallAPIFunctions.getObject(t.type, t.id);
                                // console.log("\nRENDERING CONTENT -> " + JSON.stringify(content));
                                // console.log("\nRENDERING DATA -> " + JSON.stringify(data));
                                return renderFile(path, res, { ...data, content });
                            default:
                                return renderFile(path, res, { ...data, content });
                        }
                    }
                } catch (err) {
                    console.log("ERROR -> " + err);
                    console.log("ERROR -> " + JSON.stringify(err));
                    return sendErrorFile(res);
                }
            });
    },



    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    //  EXTRA AUTO-VIEW FUNCTIONS
    
};

module.exports = AutoViewFunctions;
