// var io = require('socket.io-client');
// // https://hazel-form-257916.appspot.com
// var socket = io.connect('https://hazel-form-257916.appspot.com',
// 	{	
// 		reconnectionDelay: 1000,
//     	reconnection:true,
//     	reconnectionAttempts: 10,
//     	transports: ['websocket'],
//     	agent: false, // [2] Please don't set this to true
//     	upgrade: false,
//     	rejectUnauthorized: false

// 	}
// );

// const readline = require('readline').createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// })

// // Add a connect listener
// socket.on('connect', function (socket) {
//     console.log('Connected!');
// });

// socket.emit('createGame', { name: "deka" });

// socket.on('newGame', (data) => {
// 	console.log(data);
// 	readline.question(`Waiting for user input:`, (name) => {
// 		console.log(`Hi ${name}!`)
// 		readline.close()
// 	})
// });


// socket.on('popup', function(msg){
//     console.log("hello: ", msg)
// });
// socket.on('connection', function() {
//     console.log("client connected");
// });

// socket.on('connect_error', function(err) {
//     console.log("client connect_error: ", err);
// });

// socket.on('connect_timeout', function(err) {
//     console.log("client connect_timeout: ", err);
// });

/**
 * A simple socket.io client for performance benchmark
 *
 * Created by redism on 2014. 4. 22..
 */

var SocketIO = require('socket.io-client');

var n = 10;
var b = 5000; // bucket-size
var host = 'https://hazel-form-257916.appspot.com/';
var sockets = [];

var msg = 1;

var connectionCount = 0;
var disconnectionCount = 0;
var reconn = 0;

var setupSocket = function setupSocket(socket, id) {
  socket.data = {id: id};
  socket.on('connect', function () {
    connectionCount++;
  });

  socket.on('disconnect', function () {
    connectionCount--;
    disconnectionCount++;
  });

  socket.on('reconnect', function () {
    reconn++;
  });

  socket.on('err', function (err) {
    //console.log('Error:', err);
  });

  socket.on('player2', (data) => {
	console.log(data);
  });

  socket.on('echo', function (msg) {
	console.log(this.data.id, 'received', msg);
  });
}

var startTest = function startTest() {
  setInterval(function () {
    // emit message once per second for each socket.
   var i, socket;
   for (i = 0; i < sockets.length; i++) {
     socket = sockets[i];
     socket.emit('joinGame', { name:"deka", room:"room-3" });
   }

    // Monitor count
    console.log('Connection count:', connectionCount, 'dis:', disconnectionCount, 're:', reconn);
  }, 1000);

//   let xx = 0;
//   while(xx++ < 10000) {
// 	let i, socket;
//    	for (i = 0; i < sockets.length; i++) {
//      	socket = sockets[i];
//      	socket.emit('joinGame', { name:"deka", room:"room-3" });
//     }
//   }

	console.log("Exp ends");
}



var socket, i;

var remaining = n * b;
var socketsToConnect = 0;

var tryMoreConnection = function tryMoreConnection() {
  // If all previous connections have been established,
  if (socketsToConnect == connectionCount) {
    // try another bucket size
    for (i = 0; i < b; i++) {
      (function (j) {
        socket = SocketIO.connect(host, {
			reconnectionDelay: 10000,
			reconnection:true,
			reconnectionAttempts: 10,
			transports: ['websocket'],
			agent: false, // [2] Please don't set this to true
			upgrade: false,
			rejectUnauthorized: false
        });
        setupSocket(socket, j);
        sockets.push(socket);
        socketsToConnect++;
        remaining--;
      })(i);
    }
  }

  // Check if we have more clients to simulate.
  if (remaining > 0) {
    setTimeout(function () {
      tryMoreConnection();
    }, 1000);
  }
}

tryMoreConnection();

console.log('Starting stress test client, host :', host + ', socket # :', n);
startTest();
