'use strict';

// var cluster = require('cluster');
// var os = require('os');

module.exports = function (app) {

};

var ServerScaling = {
//   cluster : function(){
//       if(cluster.isMaster) {
//           var cpus = os.cpus().length;
//           for (var i = 0; i < cpus; i++) { // start as many children as the number of CPUs
//               cluster.fork();
//           }
//           // If worker dies, fork one more.Resiliency and availability with the cluster module.
//           cluster.on('exit', function(worker, code) {
//               if(code != 0 && !worker.suicide) {
//                   console.log('Worker crashed. Starting a new worker');
//                   cluster.fork();
//               }
//           });
//       } else {
//           require('../app'); //worker:start the server
//       }
//   }
};