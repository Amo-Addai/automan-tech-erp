/**
 * Socket.io configuration
 */

'use strict';

var funct = require('../functions');
var config = funct.config;
funct = funct.funct;

// var chatio = require('chat.io');

// When the user disconnects.. perform this
function onDisconnect(socket) {
}

// When the user connects.. perform this
function onConnect(socket) {

  io.sockets.sockets["id"] = socket.id; // KNOW HOW TO MAKE ID UNIQUE TO EVERY USER

  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
  });
  // Insert sockets below
  require('../api/USER/user.socket').register(socket);
  //  AUTO-SECURITY DATA MODELS
  //  - AUTO-AUDITING
  // require('./AUTO_FEATURES/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOLOG/autolog.socket').register(socket);
  // require('./AUTO_FEATURES/AUTO_SECURITY/AUTO_AUDITING/DATA_FILE_LOGS/AUTOEVENT/autoevent.socket').register(socket);

  // chatio.createChat(io.sockets);
}

// function onChatMessage(msg){
//   console.log('message: ' + msg);
//   /// SEND MESSAGE TO RECEIPIENT
// }
// function broadcastMsg (socket, msg){
//   socket.emit('some event', msg);
//   // socket.broadcast.emit(msg);  // USE THIS TO BROADCAST TO EVERYONE EXCEPT SOME SPECIFIC SOCKET
// }
// function sendMessageToSpecificReceipient(socket, msg){
//   io.sockets.sockets["id"].emit('chat message', msg); // KNOW HOW TO GET UNIQUE ID FOR USER
// }

var io = null;
module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));
  io = socketio;
  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] HAS DISCONNECTED FROM AUTOMAN SERVER', socket.address);
    });

    // // Call onChatMessage.
    // socket.on('chat message', function(msg){
    //   onChatMessage(msg);
    // });

    // Call onConnect.
    onConnect(socket);
    console.info('[%s] HAS CONNECTED TO AUTOMAN API_MAIN SERVER', socket.address);
  });
};
