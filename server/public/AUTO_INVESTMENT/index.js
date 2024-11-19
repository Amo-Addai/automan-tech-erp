'use strict';

var express = require('express');

var funct = {
    //      FIRST DEFINE ALL "PUBLIC" FUNCTIONS USED BY MULTIPLE MODULES (OBJECTS) WITHIN THIS FILE
    sendResponse: function (res, status, data) {
        if (res) {
            if(data.hasOwnProperty("code") && data.hasOwnProperty("index") && data.hasOwnProperty("errmsg")){
                // THEN IT MEANS MOST LIKELY THIS IS AN ERROR OBJECT
                return res.status(status).send({success: false, message: data.errmsg});
            } else return res.status(status).send(data);
        }
    }
}

var autoInvestmentFunct = require('./AutoInvestmentFunctions.js');

var obj = 'autoinvestment';

var router = express.Router();

//  REST API FOR AutoInvestment

//  REST APIs FOR Assets, Properties, Stocks, Investments, Portfolios
router.use('/assets', require('./DATA/ASSET'));
router.use('/properties', require('./DATA/PROPERTY'));
router.use('/stocks', require('./DATA/STOCK'));
router.use('/investments', require('./DATA/INVESTMENT'));
router.use('/portfolios', require('./DATA/PORTFOLIO'));

module.exports = router;
