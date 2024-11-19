'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // Server Protocol
  protocol: 'http://', 
  
  // Server IP
  ip: 'localhost/',

  // Server Port
  port: 8080,
  
  // MongoDB connection options
  mongo: { // MONGODB URI FORMAT: mongodb+srv://username:<password>@[SAMPLE_COMPANY].sifrt.mongodb.net/<dbname>?retryWrites=true&w=majority
    uri: 'mongodb://localhost/automanapi-dev',
    options : {
      useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
    }
  },

  // Should we populate the DB with sample data?
  seedDB: false, // true, // 
  // Should we test the DB with sample data?
  testDB: false,

};
