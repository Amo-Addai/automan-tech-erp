'use strict';

// Test specific configuration
// ===========================
module.exports = {

  // Server Protocol
  protocol: 'http://', 
  
  // Server IP
  ip: 'localhost/',

  // Server Port
  port: 8080,
  
  // MongoDB connection options
  mongo: { // MONGODB URI FORMAT: mongodb://username:password@host:port/database
    uri: 'mongodb://localhost/automanapi-test'
  },

  // Should we populate the DB with sample data?
  seedDB: false, // true, // 
  // Should we test the DB with sample data?
  testDB: true,

};