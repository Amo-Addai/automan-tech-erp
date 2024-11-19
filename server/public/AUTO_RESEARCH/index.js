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

var autoResearchFunct = require('./AutoResearchFunctions.js');

var obj = 'autoresearch';

var router = express.Router();

//  REST API FOR AutoResearch
router.use('/researches', require('./DATA/RESEARCH'));
router.use('/segments', require('./DATA/SEGMENT'));
router.post('/typeform', autoResearchFunct.handleTypeformApp("typeform"));

//  REST APIs FOR AutoMap,
router.use('/geospatial', require('./DATA/GEOSPATIAL'));
router.post('/scrape_test', autoResearchFunct.GeoSpatialMonitoring.getGeoJson());

module.exports = router;
