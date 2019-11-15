var io = require('socket.io-client');

var socket = io.connect('https://hazel-form-257916.appspot.com/', {reconnect: true});

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
})

// Add a connect listener
socket.on('connect', function (socket) {
    console.log('Connected!');
});

socket.emit('createGame', { name: "deka" });

socket.on('newGame', (data) => {
	console.log(data);
	readline.question(`What's your name?`, (name) => {
		console.log(`Hi ${name}!`)
		readline.close()
	})
});
