'use strict';

var express = require('express');
var path = require('path');

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

// function returnPath(p, isStatic = false){
//     var pp = path.join(__dirname + p);
//     console.log("STATIC PATH -> " + pp);
//     return isStatic ? express.static(pp) : pp;
// }

function returnPath(p, isStatic = false){
    var pp = path.join(__dirname + p);
    var pathToReturn = isStatic ? express.static(pp) : pp;
    console.log("RETURNING PATH FROM INDEX -> " + JSON.stringify(pathToReturn));
    return pathToReturn;
}

var autoViewFunct = require('./AutoViewFunctions.js');

var obj = 'autoview';

var router = express.Router(); 

router.use(returnPath('/resetpassword', true));
router.get('/resetpassword', autoViewFunct.sendView("resetpassword"));

//  SETUP WEBSITE & DASHBOARD ROUTES
router.use(returnPath('/website', true));
router.get('/', autoViewFunct.sendView("index"));
router.get('/:page', autoViewFunct.sendView());
//     THESE 2 BELOW PREVENT THE SERVER FORM SERVING FILES
// router.get('/:page/:extra', autoViewFunct.sendView());
// router.get('/:page/:extra/:url', autoViewFunct.sendView());
// 
router.use(returnPath('/dashboard/react-material-admin/build', true));
router.get('/login', autoViewFunct.sendView("login"));
router.get('/app/dashboard', autoViewFunct.sendView());


module.exports = router;
