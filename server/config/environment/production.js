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
        'cofundieapp.com/',
    // 'cofundieapp.herokuapp.com/',

    // Server Domain
    domain: process.env.OPENSHIFT_NODEJS_DOMAIN ||
        process.env.DOMAIN ||
        'www.cofundie.com/',

    // Server port
    port: process.env.OPENSHIFT_NODEJS_PORT ||
        process.env.PORT ||
        8080,

    // MongoDB connection options
    mongo: { // MONGODB URI FORMAT: mongodb+srv://mr_amoaddai:<password>@cofundie.sifrt.mongodb.net/<dbname>?retryWrites=true&w=majority
        uri: process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||

            // 'mongodb://mr_amoaddai:datasight1234@ds145895.mlab.com:45895/datasight'
            // 'mongodb://kwadwoamoad:AUTOMAN@ds233238.mlab.com:33238/automanapi'
            // 'mongodb://heroku_z8gss0n5:lvteoep29hfv8sg0ne83cme2cg@ds041494.mongolab.com:41494/heroku_z8gss0n5'

            // OLD MONGO-DB DATABASE ..
            // 'mongodb://mr_amoaddai:cofundie2019@ds259787.mlab.com:59787/cofundie'

            'mongodb+srv://mr_amoaddai:cofundie2019@cofundie.sifrt.mongodb.net/cofundie?retryWrites=true&w=majority',

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