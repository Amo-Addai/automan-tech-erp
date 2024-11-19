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

var autoPayFunct = require('./AutoPayFunctions.js');

var obj = 'autopay';

var router = express.Router();

//  REST API FOR AutoPay


// HANDLE AUTO-PAY  FROM EXTERNAL SOURCES - Flutterwave, PayStack, ..
router.post('/confirmation/:source', autoPayFunct.confirmAutoPayment());


//  REST APIs FOR Pay, Account, 

// router.use('/payments', require('./DATA/PAYMENT'));
router.use('/accounts', require('./DATA/ACCOUNT'));


module.exports = router;
