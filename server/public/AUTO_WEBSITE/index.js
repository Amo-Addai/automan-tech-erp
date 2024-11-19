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

var autoWebsiteFunct = require('./AutoWebsiteFunctions.js');

var obj = 'autowebsite';

var router = express.Router();

//  REST APIs FOR Prospects, Posts, 
router.use('/posts', require('./DATA/POST'));
router.use('/prospects', require('./DATA/PROSPECT'));


//  OPEN REST API FOR AutoWebsite
router.post('/new_prospect', autoWebsiteFunct.newSubscriber());
router.post('/new_waitlist', autoWebsiteFunct.newWaitlist());
router.post('/new_message', autoWebsiteFunct.newMessage());

module.exports = router;
