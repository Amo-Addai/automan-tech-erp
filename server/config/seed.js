/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var mongoose = require('mongoose');

console.log("Seeding AUTO-DB with sample initial data");

// THESE MODELS MIGHT NOT EVEN BE NEEDED ANYMORE - BUT REQUIRE THEM ANYWAY SO THEY'LL ALL BE DEFINED WITHIN MONGOOSE
var User = require('../api/USER/user.model').Model;
// Project, Proposal, Message
//  AUTO-PAY
// Account,
//  AUTO-WEBSITE
// Prospect, Post
//  AUTO-INVESTMENT
var Asset = require('../public/AUTO_INVESTMENT/DATA/ASSET/asset.model').Model;
var Property = require('../public/AUTO_INVESTMENT/DATA/PROPERTY/property.model').Model;
var Portfolio = require('../public/AUTO_INVESTMENT/DATA/PORTFOLIO/portfolio.model').Model;
var Investment = require('../public/AUTO_INVESTMENT/DATA/INVESTMENT/investment.model').Model;
//  AUTO-RESEARCH
var Segment = require('../public/AUTO_RESEARCH/DATA/SEGMENT/segment.model').Model;
var Research = require('../public/AUTO_RESEARCH/DATA/RESEARCH/research.model').Model;
// 

var subscribers = require('./seed/prospects/subscribers.json');


var defaultData = {

    //  AUTOMAN DEFAULT SEED OBJECTS

    "User": {
        password: '0',
        details: 'details of ...',
        home_address: 'Sample Home Address',
        postal_address: 'Sample Postal Address',
        app_id: "",
        type: "Employee",
        contact_method: 'Email',
        provider: 'local'
    },

    "Project": {
        name: "Sample Project",
        details: "Sample Seed Project",
        type: "Real Estate Investment Trust",
        start_date: Date.now(),
        end_date: Date.now(),
        type: "Building",
        stage: "Initiation",
    },

    "Proposal": {
        name: "Sample Proposal",
        details: "Sample Seed Proposal",
        type: "Property Development"
    },

    "Message": {
        name: "Sample Message",
        details: "Sample Seed Message",
        subject: "Sample Subject",
        message: "Sample Message",
        type: "Chat",
    },

    // AUTO-INVESTMENT DEFAULT SEED OBJECTS

    "Investment": {
        name: "Sample Investment",
        details: "Sample Seed Investment",
        payment: {},
    },

    "Portfolio": {
        name: "Sample Portfolio",
        details: "Sample Seed Portfolio",
        type: "Real Estate Investment Trust",
        assets: []
    },

    "Asset": {
        name: "Sample Asset",
        details: "Sample Seed Asset",
        type: "Special Purpose Vehicle"
    },

    "Property": {
        details: "",
        stage: "Initiation",
        status: "Analysis / Due-Diligence",
        investment_strategy: "Opportunistic",

        waitlist: {
            "Prospects": [],
            "Investors": []
        },
        // THESE ARE STRINGS OF OBJECT-IDs, THEREFORE IF THEY'RE EMPTY, MONGO-DB ERROR ..
        // asset: "",
        // project: "",
        investments: [],
        employees: [],
        property_developers: [],
        investors: [],
    },


    //  AUTO-PAY DEFAULT SEED OBJECTS

    "Account": {
        name: "Sample Account",
        details: "Sample Seed Account",
        type: "Bank Account"
    },

    //  AUTO-WEBSITE DEFAULT SEED OBJECTS

    "Prospect": {
        details: 'details of ...',
        home_address: 'Sample Home Address',
        postal_address: 'Sample Postal Address',
        type: "Individual",
    },

    "Post": {
        name: "Sample Post",
        details: "Sample Seed Post",
    },


    //  AUTO-RESEARCH DEFAULT SEED OBJECTS
    /*
    "Segment": {
        details: 'details of ...',
        segmentation: {
            "segments": [],
            "demographics": {},
            "geographics": {},
            "psychographics": {},
            "behaviourial": {}
        },
        users: []
    },
    "Research": {
        details: 'details of ...',
        type: "Project",
        budget: "100",
        stage: "Initiation",
        start_date: Date.now(),
        end_date: Date.now(),
        executed: false
    },
    */

},

    data = {

        //  AUTOMAN SEED OBJECT DATA

        "User": [
            {
                "username": "a",
                "first_name": "a",
                "last_name": "a",
                "other_names": "a",
                "gender": "Female",
                "nationality": "United States",
                "age": 22,
                "email": "a@a.com",
                "phone": "+233270809060",
                "contact_method": "Email"
            },
            {
                "username": "starboy",
                "first_name": "Kwadwo",
                "last_name": "Amo-Addai",
                "other_names": "Felix",
                "type": "Investor",
                "gender": "Male",
                "nationality": "Ghana",
                "age": 23,
                "email": "kwadwoamoad@gmail.com",
                "phone": "+233206998117",
                "contact_method": "Email",
                "date_of_birth": Date.parse("13-Nov-1995 18:00:00"),

                "data": {
                    "KYC": {
                        "Passport": {
                            "id": "G1937710"
                        },
                        "National ID": {
                            "id": ""
                        },
                        "Voter's ID": {
                            "id": ""
                        },
                        "SSNIT": {
                            "id": ""
                        },
                        "TIN": {
                            "id": ""
                        },
                        "Driver's License": {
                            "id": ""
                        },
                        "Health Insurance ID": {
                            "id": ""
                        },
                        "Bank Verification Number": {
                            "id": ""
                        }
                    }
                },
            },
            {
                "username": "emeka",
                "first_name": "Chukwuemeka",
                "last_name": "Ndukwe",
                "other_names": "",
                "type": "Investor",
                "gender": "Male",
                "nationality": "Nigeria",
                "age": 25,
                "email": "emeka@cofundie.com",
                "phone": "+2347033720264",
                "contact_method": "Email"
            },
            {
                "username": "zahra",
                "first_name": "Zahra",
                "last_name": "Faye",
                "other_names": "",
                "type": "Property Developer",
                "gender": "Female",
                "nationality": "United Kingdom",
                "age": 26,
                "email": "zahra@cofundie.com",
                "phone": "+447946673908",
                "contact_method": "Email"
            },
        ],

        "Project": [
            {
                name: "Sample Project",
                details: "Sample Seed Project",
                type: "Real Estate Investment Trust",
                start_date: Date.now(),
                end_date: Date.now(),
                type: "Building",
                stage: "Initiation",
            }
        ],

        "Proposal": [
            {
                name: "Sample Proposal",
                details: "Sample Seed Proposal",
                type: "Property Development"
            }
        ],

        "Message": [
            {
                name: "Sample Message",
                details: "Sample Seed Message",
                subject: "Sample Subject",
                message: "Sample Message",
                type: "Chat",
            }
        ],

        //  AUTO-INVESTMENT SEED OBJECT DATA

        "Investment": [
            {
                name: "Sample Investment",
                details: "Sample Seed Investment",
                payment_confirmed: false,
            }
        ],

        "Portfolio": [
            {
                name: "Sample Portfolio",
                details: "Sample Seed Portfolio",
                type: "Real Estate Investment Trust",
                assets: []
            }
        ],

        "Asset": [
            {
                name: "Sample Asset",
                details: "Sample Seed Asset",
                type: "Special Purpose Vehicle"
            }
        ],

        "Property": [
            {

                name: "Single-Family Home in Lagos",
                details: "Single-Family Real Estate Property located in Lagos, Nigeria. Currently being analyzed, using our stringent Due-Diligence process, and will soon be ready to receive investments.",
                type: "Single-Family",
                data: {
                    "property_details": {
                        "name": {
                            "full_name": "Single-Family House in Lagos Nigeria",
                            "nickname": ""
                        },
                        "type": {
                            "type": "Single-Family",
                            "sub_type": "Vacation Home"
                        },
                        "shares": {
                            "total": 100,
                            "available": 0,
                            "share_price": {
                                "price": 0,
                                "currency": "USD",
                                "symbol": "$",
                                "country": "United States"
                            }
                        },
                        "parameters": {
                            "materials": {
                                "primary": "Rammed Earth",
                            },
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
                            "country": "Nigeria",
                            "region": "Lagos",
                            "city": "Lagos",
                            "town": "Ibeju",
                            "street": "Lekki",
                            "number": "20",
                            "address": "Lekki Street 20, Ibeju - Lagos, Nigeria",
                            "zip": "",
                            "postal": "",
                            "geolocation": {
                                "lat": 0, "lng": 0
                            }
                        },
                        "content": {
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
                            "videos": {},
                            "documents": {}
                        }
                    },
                    "investment_analysis": {
                        "irr": 0,
                        "yield": 20,
                        "cmult": 2,
                        "npv": 0,
                        "ltv": 0,
                        "targets": {
                            "preferred_return": 10
                        },
                        "period": {
                            "duration": 9,
                            "measurement": "months"
                        }
                    },
                    "valuation": {

                        "value": {
                            value: 100, currency: "USD", symbol: "$"
                        },
                        "price": {
                            price: 120, currency: "USD", symbol: "$"
                        },
                    },
                    "returns": {

                    },
                },
            },
            {

                name: "Single-Family Home in Lagos",
                details: "Single-Family Real Estate Property located in Lagos, Nigeria. Currently being analyzed, using our stringent Due-Diligence process, and will soon be ready to receive investments.",
                type: "Single-Family",
                data: {
                    "property_details": {
                        "name": {
                            "full_name": "Single-Family House in Lagos Nigeria",
                            "nickname": ""
                        },
                        "type": {
                            "type": "Single-Family",
                            "sub_type": "Vacation Home"
                        },
                        "shares": {
                            "total": 100,
                            "available": 0,
                            "share_price": {
                                "price": 0,
                                "currency": "USD",
                                "symbol": "$",
                                "country": "United States"
                            }
                        },
                        "parameters": {
                            "materials": {
                                "primary": "Rammed Earth",
                            },
                            "area": {
                                "value": 240,
                                "unit": "square metres"
                            },
                            "beds": 4,
                            "baths": 4,
                            "garages": 1,
                            "amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck",
                                "Tennis Courts", "Internet", "Parking", "Sun Room", "Concrete Floor"]
                        },
                        "location": {
                            "country": "Nigeria",
                            "region": "Lagos",
                            "city": "Lagos",
                            "town": "Ibafo",
                            "street": "Lekki",
                            "number": "20",
                            "address": "Lekki Street 20, Ibafo - Lagos, Nigeria",
                            "zip": "",
                            "postal": "",
                            "geolocation": {
                                "lat": 0, "lng": 0
                            }
                        },
                        "content": {
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
                            "videos": {},
                            "documents": {}
                        }
                    },
                    "investment_analysis": {
                        "irr": 0,
                        "yield": 20,
                        "cmult": 2,
                        "npv": 0,
                        "ltv": 0,
                        "targets": {
                            "preferred_return": 10
                        },
                        "period": {
                            "duration": 9,
                            "measurement": "months"
                        }
                    },
                    "valuation": {

                        "value": {
                            value: 100, currency: "USD", symbol: "$"
                        },
                        "price": {
                            price: 120, currency: "USD", symbol: "$"
                        },
                    },
                    "returns": {

                    },
                },
            },
            {
                name: "Appolonia Mews - Phase 1",
                details: "Multi-Family Real Estate Property located in Appolonia City 30, Oyibi in Tema, in the Greater Accra Region of Ghana. Currently being analyzed, using our stringent Due-Diligence process, and will soon be ready to receive investments.",
                type: "Multi-Family",
                capital_structure: "Debt",
                investment_strategy: "Opportunistic",
                stage: "Ready",
                status: "Receiving Investments",
                data: {
                    "property_details": {
                        "name": {
                            "full_name": "Multi-Family House in Accra Ghana",
                            "nickname": "StarBoy Real Estate Property"
                        },
                        "type": {
                            "type": "Multi-Family",
                            "sub_type": "Vacation Home"
                        },
                        "shares": {
                            "total": 100,
                            "available": 100,
                            "share_price": {
                                "price": 250,
                                "currency": "USD",
                                "symbol": "$",
                                "country": "United States",
                                "country_symbol": "US",
                                "countries": ["Ghana", "Nigeria", "United States", "United Kingdom", "Canada", "Ivory Coast", "Kenya", "South Africa", "Rwanda", "Tanzania",
                                    "Burundi", "Congo", "Cape Verde", "Gambia", "Guinea", "Liberia", "Malawi", "Mozambique", "Sierra Leone", "Sao Tome and Principe", "Uganda", "Zambia", "Zimbabwe"],
                                //     // NOW, FOR THE OTHER COUNTRIES -> "Francophone", "Europe",
                                "payment_currencies": [
                                    {
                                        "price": 250,
                                        "currency": "USD",
                                        "symbol": "$",
                                        "country": "United States",
                                        "country_symbol": "US"
                                    },
                                    {
                                        "price": 1500,
                                        "currency": "GHS",
                                        "symbol": "Ghc",
                                        "country": "Ghana",
                                        "country_symbol": "GH"
                                    },
                                    {
                                        "price": 112500,
                                        "currency": "NGN",
                                        "symbol": "NGN",
                                        "country": "Nigeria",
                                        "country_symbol": "NG"
                                    },
                                    {
                                        "price": 200,
                                        "currency": "GBP",
                                        "symbol": "GBP",
                                        "country": "United Kingdom",
                                        "country_symbol": "UK"
                                    },
                                    {
                                        "price": 330,
                                        "currency": "CAD",
                                        "symbol": "$",
                                        "country": "Canada",
                                        "country_symbol": "CA"
                                    },
                                    {
                                        "price": 220,
                                        "currency": "EUR",
                                        "symbol": "EUR",
                                        "country": "European Union",
                                        "country_symbol": "EU"
                                    },
                                    // NOW, FOR THE OTHER COUNTRIES
                                    {
                                        "price": 1,
                                        "currency": "XOF",
                                        "symbol": "CFA",
                                        "country": "WA Francophone",
                                        "country_symbol": "FR"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "XAF",
                                        "symbol": "CFA",
                                        "country": "CA Francophone",
                                        "country_symbol": "FR"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "KES",
                                        "symbol": "KES",
                                        "country": "Kenya",
                                        "country_symbol": "KE"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "ZAR",
                                        "symbol": "ZAR",
                                        "country": "South Africa",
                                        "country_symbol": "ZA"
                                    },
                                    // 
                                    {
                                        "price": 1,
                                        "currency": "RWF",
                                        "symbol": "RWF",
                                        "country": "Rwanda",
                                        "country_symbol": "RW"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "TZS",
                                        "symbol": "TZS",
                                        "country": "Tanzania",
                                        "country_symbol": "TZ"
                                    },
                                    // 
                                    {
                                        "price": 1,
                                        "currency": "BIF",
                                        "symbol": "BIF",
                                        "country": "Burundi",
                                        "country_symbol": "BI",
                                        "name": "BIF (Burundi Franc) - Card, Mobile Money"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "CDF",
                                        "symbol": "CDF",
                                        "country": "Congo",
                                        "country_symbol": "CD",
                                        "name": "CDF (Congolese Franc) - Card, Mobile Money"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "CVE",
                                        "symbol": "CVE",
                                        "country": "Cape Verde",
                                        "country_symbol": "CV",
                                        "name": "CVE (Cape Verdean Escudo) - Card, Mobile Money"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "GMD",
                                        "symbol": "GMD",
                                        "country": "Gambia",
                                        "country_symbol": "GM",
                                    },
                                    {
                                        "price": 1,
                                        "currency": "GNF",
                                        "symbol": "GNF",
                                        "country": "Guinea",
                                        "country_symbol": "GN",
                                        "name": "GNF (Guinean Franc) - Card, Mobile Money"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "LRD",
                                        "symbol": "LRD",
                                        "country": "Liberia",
                                        "country_symbol": "LR",
                                        "name": "LRD (Liberian Dollar) - Card, Mobile Money"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "MWK",
                                        "symbol": "MWK",
                                        "country": "Malawi",
                                        "country_symbol": "MW",
                                        "name": "MWK (Malawian Kwacha) - Card, Mobile Money"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "MZN",
                                        "symbol": "MZN",
                                        "country": "Mozambique",
                                        "country_symbol": "MZ",
                                        "name": "MZN (Mozambican Metical) - Card, Mobile Money"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "SLL",
                                        "symbol": "SLL",
                                        "country": "Sierra Leone",
                                        "country_symbol": "RW",
                                        "name": "SLL (Sierra Leonean Leone) - Card, Mobile Money"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "CVE",
                                        "symbol": "STD",
                                        "country": "Sao Tome and Principe",
                                        "country_symbol": "ST",
                                        "name": "STD (Sao Tome and Principe Dobra) - Card, Mobile Money"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "UGX",
                                        "symbol": "UGX",
                                        "country": "Uganda",
                                        "country_symbol": "UG"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "ZMW",
                                        "symbol": "ZMW",
                                        "country": "Zambia",
                                        "country_symbol": "ZM"
                                    },
                                    {
                                        "price": 1,
                                        "currency": "ZWD",
                                        "symbol": "ZWD",
                                        "country": "Zimbabwe",
                                        "country_symbol": "ZW",
                                    },


                                    // 
                                    // {
                                    //     "price": 0,
                                    //     "currency": "",
                                    //     "symbol": "",
                                    //     "country": "Nigeria",
                                    //     "country_symbol": "",
                                    // },
                                ]
                            }
                        },
                        "parameters": {
                            "materials": {
                                "primary": "Traditional",
                            },
                            "area": {
                                "value": 240,
                                "unit": "square metres"
                            },
                            "beds": 4,
                            "baths": 4,
                            "garages": 1,
                            "amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck",
                                "Tennis Courts", "Internet", "Parking", "Sun Room", "Concrete Floor"]
                        },
                        "location": {
                            "country": "Ghana",
                            "region": "Greater Accra",
                            "city": "Tema",
                            "town": "Appolonia City",
                            "street": "",
                            "number": "30",
                            "address": "Appolonia City 30, Tema - Greater Accra, Ghana",
                            "zip": "",
                            "postal": "",
                            "geolocation": {
                                "lat": 0, "lng": 0
                            }
                        },
                        "content": {
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
                            "videos": {},
                            "documents": {}
                        }
                    },
                    "investment_analysis": {
                        "irr": 0,
                        "yield": 15,
                        "cmult": 1.15,
                        "npv": 0,
                        "ltv": 0,
                        "targets": {
                            "preferred_return": 10
                        },
                        "period": {
                            "duration": 9,
                            "measurement": "months"
                        }
                    },
                    "valuation": {

                        "value": {
                            value: 100, currency: "USD", symbol: "$"
                        },
                        "price": {
                            price: 60000, currency: "USD", symbol: "$"
                        },
                    },
                    "returns": {

                    },
                },
            },

            
            {
                name: "Wala Park - Landbanking in Appolonia City",
                details: "Wala Park is a new 76-acre residential neighbourhood by Appolonia Development Company Ltd \
                (ADCL), the owner and developer of Appolonia City, in partnership with Chiefs, leaders and residents \
                of the Appolonia Community. \n\n \
                Wala Park is located between Oyibi and Afienya, bordering Appolonia City, Greater Accra's new city \
                where more than 700 homes are already occupied or under development and schools and dozens of \
                businesses are under construction. \n\n  \
                Wala Park is situated 2.5km from current residential developments in Appolonia City, such as Nova \
                Ridge, The Oxford and Bijou Homes. \n\n  \
                Sales for Phase 1 of Wala Park have commenced and demand is high.",
                type: "Land",
                capital_structure: "Equity",
                investment_strategy: "Opportunistic",
                stage: "Ready",
                status: "Receiving Investments",
                data: {
                    "property_details": {
                        "name": {
                            "full_name": "Wala Park - Landbanking in Accra Ghana",
                            "nickname": "Wala Park"
                        },
                        "type": {
                            "type": "Land",
                            "sub_type": "LandBanking"
                        },
                        "shares": {
                            "total": 1000,
                            "available": 500,
                            "share_price": {
                                "price": 600,
                                "currency": "GHS",
                                "symbol": "Ghc",
                                "country": "Ghana",
                                "country_symbol": "GH",
                                "countries": ["Ghana", "Nigeria", "United States", "United Kingdom", "Canada"],
                                "payment_currencies": [
                                    {
                                        "price": 600,
                                        "currency": "GHS",
                                        "symbol": "Ghc",
                                        "country": "Ghana",
                                        "country_symbol": "GH"
                                    },
                                    {
                                        "price": 40000,
                                        "currency": "NGN",
                                        "symbol": "NGN",
                                        "country": "Nigeria",
                                        "country_symbol": "NG"
                                    },
                                    {
                                        "price": 105,
                                        "currency": "USD",
                                        "symbol": "$",
                                        "country": "United States",
                                        "country_symbol": "US"
                                    },
                                    {
                                        "price": 76,
                                        "currency": "GBP",
                                        "symbol": "GBP",
                                        "country": "United Kingdom",
                                        "country_symbol": "UK"
                                    },
                                    {
                                        "price": 135,
                                        "currency": "CAD",
                                        "symbol": "$",
                                        "country": "Canada",
                                        "country_symbol": "CA"
                                    },
                                    {
                                        "price": 89,
                                        "currency": "EUR",
                                        "symbol": "EUR",
                                        "country": "European Union",
                                        "country_symbol": "EU"
                                    },


                                    // 
                                    // {
                                    //     "price": 0,
                                    //     "currency": "",
                                    //     "symbol": "",
                                    //     "country": "",
                                    //     "country_symbol": "",
                                    // },
                                    // 

                                ]

                            }
                        },
                        "parameters": {
                            "materials": {
                                "primary": "Traditional",
                            },
                            "area": {
                                "value": 240,
                                "unit": "square metres"
                            },
                            "beds": 4,
                            "baths": 4,
                            "garages": 1,
                            "amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck",
                                "Tennis Courts", "Internet", "Parking", "Sun Room", "Concrete Floor"]
                        },
                        "location": {
                            "country": "Ghana",
                            "region": "Greater Accra",
                            "city": "Tema",
                            "town": "Appolonia City",
                            "street": "",
                            "number": "30",
                            "address": "Appolonia City 30, Tema - Greater Accra, Ghana",
                            "zip": "",
                            "postal": "",
                            "geolocation": {
                                "lat": 0, "lng": 0
                            }
                        },
                        "content": {
                            "images": {
                                "slides": [
                                    { stub: "slide-3", format: "jpg" }
                                ],
                                "pictures": [
                                    { stub: "wala-park-1", format: "jpg" },
                                    { stub: "wala-park-2", format: "jpg" }
                                ],
                                "plans": []
                            },
                            "videos": {},
                            "documents": {}
                        }
                    },
                    "investment_analysis": {
                        "irr": 0,
                        "yield": 50,
                        "cmult": 1.5,
                        "npv": 0,
                        "ltv": 0,
                        "targets": {
                            "preferred_return": 10
                        },
                        "period": {
                            "duration": 5,
                            "measurement": "years"
                        }
                    },
                    "valuation": {

                        "value": {
                            value: 100, currency: "USD", symbol: "$"
                        },
                        "price": {
                            price: 60000, currency: "USD", symbol: "$"
                        },
                    },
                    "returns": {

                    },
                },
            },

            
            {

                name: "Poddy Project",
                details: "The Poddy project is a development project within the Lekki Phase 1 area of Lagos Nigeria. This project is being developed for Short lets and consists of 2 distinct developments; Shortlet Apartments  and Coliving Spaces. The Short lets will consist of 6 studio apartments and 4 mini-flats while the Co-living space will have 32 ensuite rooms. The Poddy project is located in the prime Lekki Phase 1, and its apartments are targeted at young upwardly mobile professionals looking for affordable but luxurious housing options on the Island.",
                type: "Multi-Family",
                capital_structure: "Debt",
                investment_strategy: "Opportunistic",
                stage: "Initiation",
                status: "Analysis / Due-Diligence",
                data: {
                    "property_details": {
                        "name": {
                            "full_name": "Poddy Project - Lagos Nigeria",
                            "nickname": "Poddy Project"
                        },
                        "type": {
                            "type": "Multi-Family",
                            "sub_type": "Short-let Apartments"
                        },
                        "shares": {
                            "total": 1000,
                            "available": 0,
                            "share_price": {
                                "price": 20000,
                                "currency": "NGN",
                                "symbol": "NGN",
                                "country": "Nigeria",
                                "country_symbol": "NG",
                                "countries": ["Nigeria"], // , "Ghana", "United States"],
                                "payment_currencies": [
                                    {
                                        "price": 20000,
                                        "currency": "NGN",
                                        "symbol": "NGN",
                                        "country": "Nigeria",
                                        "country_symbol": "NG"
                                    },

                                    // {
                                    //     "price": 600,
                                    //     "currency": "GHS",
                                    //     "symbol": "Ghc",
                                    //     "country": "Ghana",
                                    //     "country_symbol": "GH"
                                    // },
                                    // {
                                    //     "price": 105,
                                    //     "currency": "USD",
                                    //     "symbol": "$",
                                    //     "country": "United States",
                                    //     "country_symbol": "US"
                                    // },


                                    // 
                                    // {
                                    //     "price": 0,
                                    //     "currency": "",
                                    //     "symbol": "",
                                    //     "country": "",
                                    //     "country_symbol": "",
                                    // },
                                    // 

                                ]
                            }
                        },
                        "parameters": {
                            "materials": {
                                "primary": "Shipping Containers",
                            },
                            "area": {
                                "value": 240,
                                "unit": "square metres"
                            },
                            "beds": 4,
                            "baths": 4,
                            "garages": 1,
                            "amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck",
                                "Tennis Courts", "Internet", "Parking", "Sun Room", "Concrete Floor"]
                        },
                        "location": {
                            "country": "Nigeria",
                            "region": "Lagos",
                            "city": "Lekki",
                            "town": "Lekki - Phase 1",
                            "street": "Phase 1",
                            "number": "",
                            "address": "Lekki - Phase 1, Lagos, Nigeria",
                            "zip": "",
                            "postal": "",
                            "geolocation": {
                                "lat": 0, "lng": 0
                            }
                        },
                        "content": {
                            "images": {
                                "slides": [
                                    { stub: "poddy-1", format: "jpg" }
                                ],
                                "pictures": [
                                    { stub: "poddy-1", format: "jpg" }
                                ],
                                "plans": []
                            },
                            "videos": {},
                            "documents": {}
                        }
                    },
                    "investment_analysis": {
                        "irr": 1.5,
                        "yield": 60,
                        "cmult": 1.6,
                        "npv": 0,
                        "ltv": 0,
                        "targets": {
                            "preferred_return": 10
                        },
                        "period": {
                            "duration": 4,
                            "measurement": "years"
                        }
                    },
                    "valuation": {

                        "value": {
                            value: 100, currency: "USD", symbol: "$"
                        },
                        "price": {
                            price: 120, currency: "USD", symbol: "$"
                        },
                    },
                    "returns": {

                    },
                },
            },

        ],

        //  AUTO-WEBSITE SEED OBJECT DATA

        "Prospect": [
            {
                first_name: "a",
                last_name: "a",
                other_names: "a",
                details: 'details of ...',
                gender: "Female",
                nationality: "Ghana",
                age: 22,
                email: "a@a.com",
                phone: "+233270809060",
                home_address: 'Sample Home Address',
                postal_address: 'Sample Postal Address',
                type: "Individual",
            }
        ],

        "Post": [
            {
                name: "Sample Post",
                details: "Sample Seed Post",
            }
        ],

        //  AUTO-PAY SEED OBJECT DATA

        "Account": [
            {
                name: "Sample Account",
                details: "Sample Seed Account",
                type: "Bank Account"
            }
        ],

        //  AUTO-RESEARCH SEED OBJECT DATA

        /*
        "Segment": [
            {
                name: "STARBOY Segment"
            },
            {
                name: "DataSight Segment"
            },
            {
                name: "MEST EITs 2019 Segment"
            }
        ],
        "Research": [
            {
                name: "Market Research on MEST EITs 2019 Segment",
                design: { // DESIGN SAMPLE RESEARCH CAMPAIGN / PROJECT RIGHT HERE ..
                    "problem": "",
                    "objectives": {},
                    "budget": 0.00,
                    "duration": 0,
                    "segmentation": {
                        "segments": [],
                        "demographics": {},
                        "geographics": {},
                        "psychographics": {},
                        "behaviourial": {}
                    },
                    "methods": { //  REMOVE THIS WHEN IT'S TIME TO DO A LIVE TEST (SO YOU'LL MANUALLY EDIT IT TO ADD "Survey")
                      "methods": [], // "Survey"
                      "Survey": { //  REMOVE THIS WHEN IT'S TIME TO DO A LIVE TEST (SO YOU'LL MANUALLY EDIT IT TO ADD "Survey")
                        "forms": [] // {"id": "BrOBfG"} //  "kEzi3P" <- NO NEED TO REMOVE THIS THOUGH, BUT REMOVE IT JUST FOR THE .data OBJECT ..
                      },
                      "Social Media": {},
                      "Web": {},
                      "Field": {},
                      "Interview": {},
                      "Focus Groups": {}
                    }
                }, // ADD .methods PROPERTY WHEN YOU'RE DONE DESIGNING IT ..
                data: {
                    "Survey": { //  REMOVE THIS WHEN IT'S TIME TO DO A LIVE TEST (SO YOU'LL MANUALLY EDIT IT TO ADD "Survey")
                        "forms": [] // {"id": "BrOBfG"}// "kk1cG0" "kEzi3P"
                    },
                    "Social Media": {},
                    "Web": {},
                    "Field": {},
                    "Interview": {},
                    "Focus Groups": {}
                }
            }
        ],
        */

    }, dataObject = {}, dataObjects = [], StarBoySegment = null, MESTSegment = null, DataSightSegment = null;

var dummyDefault = JSON.parse(JSON.stringify(defaultData));
// THIS HAS BEEN CREATED TO BE USED WITH Object.assign() COZ IT'LL BE GETTING UPDATED ..

var SeedEITUsers = []; // require('../public/AUTO_RESEARCH/DATA/files/eits-2019/eits.json');
// console.log("USERS -> " + JSON.stringify(data["User"]))
SeedEITUsers = JSON.parse(JSON.stringify(SeedEITUsers));
for (var user of SeedEITUsers) data["User"].push(JSON.parse(JSON.stringify(user)));
// console.log("USERS NOW -> " + JSON.stringify(data["User"]))

// runAutoInvestmentSeedOperation();
// runAutoResearchSeedOperation();

async function runAutoInvestmentSeedOperation() {
    for (var type of ["User", "Message", "Account", "Prospect", "Proposal", "Project", "Property", "Asset", "Portfolio", "Investment", "Post"]) {
        // "User", "Message", "Account", "Prospect", "Investment" <- NEVER AUTO-SEED THESE ONES WHEN PUSHING TO PRODUCTION !!!  !!!!
        for (var o of data[type]) {
            dataObject = JSON.parse(JSON.stringify(Object.assign(dummyDefault[type], o)));

            //  YOU CAN PUT SOME EXTRA LOGIC HERE IF YOU PLEASE ..

            dataObjects.push(dataObject);
            dataObject = {};
        }
        if (type === "Prospect") {
            for (var prosp of (subscribers || [])) dataObjects.push(JSON.parse(JSON.stringify(prosp)));
        }
        await seedDB(type, dataObjects);
        dataObjects = [];
    }
}

async function runAutoResearchSeedOperation() {
    for (var type of ["Segment", "Research", "User"]) {
        for (var o of data[type]) {
            dataObject = JSON.parse(JSON.stringify(Object.assign(dummyDefault[type], o)));
            if (MESTSegment || DataSightSegment || StarBoySegment) {
                switch (type) {
                    case "Research": // MAKE SURE THAT ALL THE SEED RESEARCHES ARE TARGETING THE MEST SEGMENT 
                        // if(!dataObject.design.segmentation.segments.includes(StarBoySegment))
                        //     dataObject.design.segmentation.segments.push(StarBoySegment);
                        // if(!dataObject.design.segmentation.segments.includes(DataSightSegment))
                        //     dataObject.design.segmentation.segments.push(DataSightSegment);
                        // if(!dataObject.design.segmentation.segments.includes(MESTSegment))
                        //     dataObject.design.segmentation.segments.push(MESTSegment);
                        break;
                    case "User": // MAKE SURE THAT ALL THE SEED USERS ARE WITHIN THE MEST SEGMENT
                        if (dataObject.username == "mr_amoaddai")
                            if (!dataObject.segmentation.segments.includes(StarBoySegment))
                                dataObject.segmentation.segments.push(StarBoySegment);
                        if (["mr_amoaddai", "ulrich.mabou", "wilson.busaka"].includes(dataObject.username))
                            if (!dataObject.segmentation.segments.includes(DataSightSegment))
                                dataObject.segmentation.segments.push(DataSightSegment);
                        if (!dataObject.segmentation.segments.includes(MESTSegment))
                            dataObject.segmentation.segments.push(MESTSegment);
                        break;
                }
            }
            dataObjects.push(dataObject);
            dataObject = {};
        }
        await seedDB(type, dataObjects);
        dataObjects = [];
    }
}

async function seedDB(type, data) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("");
            console.log("Now populating data for Table - " + type + " : " + data.length + " object(s)");
            console.log("DATA OBJECTS -> " + JSON.stringify(data));
            console.log("");
            // 
            var M = mongoose.model(type);
            M.find({}).remove(function () {
                console.log(type + " Table has been emptied, now populating with new " + type + "(s) ...");
                M.create(data, function (err) {
                    if (err) {
                        console.log('Some error occurred during population of ' + type + 's');
                        console.log(err);
                        reject(err);
                    } else console.log('Finished populating ' + type + ' data');
                    console.log("");

                    if ((type == "Segment") && (true)) { // THIS IS SOME Global Mark Modification STUFF FOR AUTO-RESEARCH
                        M.findOne({ name: "STARBOY Segment" }, function (err, obj) {
                            if (!err && obj) StarBoySegment = obj._id.toString();
                            resolve(true);
                        });
                        M.findOne({ name: "DataSight Segment" }, function (err, obj) {
                            if (!err && obj) DataSightSegment = obj._id.toString();
                            resolve(true);
                        });
                        M.findOne({ name: "MEST EITs 2019 Segment" }, function (err, obj) {
                            if (!err && obj) MESTSegment = obj._id.toString();
                            resolve(true);
                        });
                    } else resolve(true);

                });
            });
        } catch (e) {
            console.log("ERROR -> " + e);
            reject(e);
        }
    });
}