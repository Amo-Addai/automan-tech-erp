'use strict';

// Production specific configuration
// =================================
module.exports = {

    // Server Protocol
    protocol: process.env.OPENSHIFT_NODEJS_PROTOCOL ||
        process.env.PROTOCOL ||
        'https://',

    // Server IP
    ip: process.env.OPENSHIFT_NODEJS_IP ||
        process.env.IP ||
        '[SAMPLE_COMPANY]app.com/',
    // '[SAMPLE_COMPANY]app.herokuapp.com/',

    // Server Domain
    domain: process.env.OPENSHIFT_NODEJS_DOMAIN ||
        process.env.DOMAIN ||
        'www.[SAMPLE_COMPANY].com/',

    // Server port
    port: process.env.OPENSHIFT_NODEJS_PORT ||
        process.env.PORT ||
        8080,

    // MongoDB connection options
    mongo: { // MONGODB URI FORMAT: mongodb+srv://username:<password>@[SAMPLE_COMPANY].sifrt.mongodb.net/<dbname>?retryWrites=true&w=majority
        uri: process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||

            'mongodb+srv://username:[SAMPLE_COMPANY]2019@[SAMPLE_COMPANY].sifrt.mongodb.net/[SAMPLE_COMPANY]?retryWrites=true&w=majority',

        options: {
            useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
        }
    },

    // OR IF YOU WANT TO SET CONFIG VARS LOCALLY, YOU CAN RUN THESE COMMANDS ..
    // LINUX: export MONGOLAB_URI="heroku_z8gss0n5:lvteoep29hfv8sg0ne83cme2cg@ds041494.mongolab.com:41494/heroku_z8gss0n5"
    // WINDOWS: SET MONGOLAB_URI="heroku_z8gss0n5:lvteoep29hfv8sg0ne83cme2cg@ds041494.mongolab.com:41494/heroku_z8gss0n5"

    // Should we populate the DB with sample data?
    seedDB: false,
    // Should we test the DB with sample data?
    testDB: false,

};