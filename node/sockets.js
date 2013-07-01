var parent = module.parent.exports 
  , app = parent.app
  , server = parent.server
  , config = parent.config
  , mongooseSessionStore = parent.SessionStore
  , express = require('express')
  , parseSignedCookie = require('connect').utils.parseSignedCookie
  , cookie = require('cookie')
////  , ObjectId = require('mongoose').Types.ObjectId
  , sio = require('socket.io');

 /**
 * Socket.IO functionality
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
        //Save chat in the database
        connection.query("INSERT `chat_history` (`id`, `from`, `to`, `message`, `read`) VALUES (NULL, ?, ?, ?, '0')", [socket.username, data.user, data.msg], function(err,res){
            if(err) throw err;
            data['msgid'] = res.insertId;    
	        socket.broadcast.to(data.user).emit('chatIn', socket.username, data);
        });
        //io.sockets.emit('chatIn', socket.username, data);
	    //socket.broadcast.emit('chatIn', {msg:data.msg});
    });

    socket.on('readMsg', function (idmsg) {
        connection.query("UPDATE chat_history SET `read`= 1 WHERE `to` = ? AND id = ?", [socket.username, idmsg]);
    });

    socket.on('openWindow', function (openuser) {
        connection.query("SELECT * FROM _user WHERE username = ?", [socket.username], function(err, res){
            if(err) throw err;
            //console.log(">>>>>>>>",res,res.chat_windows);
            var wins = res[0].chat_windows.split(','), exist=false;
            wins.forEach(function(v,i){
                if(openuser==v){
                    exist=true;
                }
            });  
            if(!exist){
                var str = "";
                if(res[0].chat_windows!=""){
                    str += ",";
                }
                str += openuser;
                connection.query("UPDATE _user SET chat_windows = ? WHERE username = ?", [res[0].chat_windows+str,socket.username]);
            }
        });
    });

    socket.on('closeWindow', function (closeuser) {
        connection.query("SELECT * FROM _user WHERE username = ?", [socket.username], function(err, res){
            if(err) throw err;
            connection.query("UPDATE _user SET chat_windows = ? WHERE username = ?", [res[0].chat_windows.replace(closeuser,"").replace(",,",",").replace(/^,/,"").replace(/,$/,""), socket.username]);
        });
    });


    socket.on('askOpenWindows', function (idmsg) {
        connection.query("SELECT * FROM _user WHERE username = ?", [socket.username], function(err, res){
          if (err) throw err;

          socket.emit('receiveOpenWindows', res[0].chat_windows);
        });

    });

    socket.on('askChatHistory', function (otheruser) {
        connection.query("SELECT * FROM `chat_history` WHERE ((`from`=? AND `to`=?) OR (`from`=? AND `to`=?)) AND (time >=  DATE_SUB(NOW(), INTERVAL 2 day) AND time <  NOW())",
             [socket.username, otheruser, otheruser, socket.username], function(err, res){
          if (err) throw err;

          socket.emit('receiveChatHistory', otheruser, res);
        });

    });

    socket.on('askUserList', function(data){

        connection.query('SELECT username, isonline from _user', function(err, rows, fields) {
          if (err) throw err;

          socket.emit('receiveUserList', rows);
        });

        //connection.end();

    });

    socket.on('disconnect', function () {
        console.log("Disconnected "+socket.username);
        console.log("Sockets in room "+io.sockets.clients(socket.username).length)
        if(io.sockets.clients(socket.username).length==1){
            connection.query("UPDATE _user SET isonline = 0 WHERE username = ?", [socket.username]);
        }
        //to all sockets
	    io.sockets.emit('logoutUser', socket.username);
    });
});
