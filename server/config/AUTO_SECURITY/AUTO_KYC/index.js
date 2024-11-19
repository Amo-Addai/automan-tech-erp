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

var autoKYCFunct = require('./AutoKYCFunctions.js');

var obj = 'autokyc';

var router = express.Router();

//  REST API FOR AutoKYC

router.post('/verify/:identity/:id', autoKYCFunct.verifyKYC());


//  REST APIs FOR KYC
router.use('/kyc', require('./DATA/KYC'));

module.exports = router;