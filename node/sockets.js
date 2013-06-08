var parent = module.parent.exports 
  , app = parent.app
  , server = parent.server
  , config = parent.config
//  , Sessions = require('./models/sessions.js') //access to the DB
//  , Partida = require('./models/games.js')
  , mongooseSessionStore = parent.SessionStore
  , express = require('express')
  , parseSignedCookie = require('connect').utils.parseSignedCookie
  , cookie = require('cookie')
////  , ObjectId = require('mongoose').Types.ObjectId
  , sio = require('socket.io');

 /**
 * Socket.IO functionality
 * http://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io
 * sessionStore.get(sessionId, callback)
 * sessionStore.set(sessionId, data, callback) 
 * sessionStore.destroy(sessionId, callback) 
 * sessionStore.all(callback)    // returns all available sessions
 * sessionStore.clear(callback)  // deletes all session data
 * sessionStore.length(callback) // returns number of sessions in the 
 */

var mysql      = require('mysql');
var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'ariel159',
      database: 'zurmo'
});
connection.connect();

var io = sio.listen(server);

io.configure(function() {
  io.enable('browser client minification');
  io.enable('browser client gzip');
  //node js socketio Unexpected response code: 502
  // http://stackoverflow.com/questions/12569451/unexpected-response-code-502-error-when-using-socket-io-with-appfog
  io.set('transports', ['xhr-polling']);
  //Clear sessions when server starts
  //mongooseSessionStore.clear();
/*
  io.set('authorization', function (data, callback) {
        if(data.headers.cookie) {
            // save parsedSessionId to handshakeData
            data.cookie = cookie.parse(data.headers.cookie);
            data.sessionId = parseSignedCookie(data.cookie['connect.sid'], config.session.secret);
        }
        callback(null, true);
    });
*/
});

//console.log(mongooseSessionStore);

io.sockets.on('connection', function (socket) {
    var sessionId    = socket.handshake.sessionId; //access to the saved data.sessionId on auth

    socket.on('joinRoom', function (room) {
        socket.set('room', room, function() { console.log('room ' + room + ' saved'); } );
        socket.username = room;
        socket.join(room);
        connection.query("UPDATE _user SET isonline = 1 WHERE username = ?", [socket.username]);
        //to all sockets
	    io.sockets.emit('joinedUser', socket.username);
    });

    socket.on('sendChat', function(data){
	    //socket.broadcast.to("room_"+user["_id"]).emit('challenge request', {userChallenging:socket.handshake.userData});
        console.log(data);
        //console.log(socket);
	    socket.broadcast.to(data.user).emit('chatIn', socket.username, data);
        //io.sockets.emit('chatIn', socket.username, data);
	    //socket.broadcast.emit('chatIn', {msg:data.msg});
    });

    socket.on('askUserList', function(data){

        connection.query('SELECT username, isonline from _user', function(err, rows, fields) {
          if (err) throw err;

          socket.emit('receiveUserList', rows);
        });

        //connection.end();

    });

    socket.on('disconnect', function () {
	    io.sockets.emit('logoutUser', socket.username);
    });
});
