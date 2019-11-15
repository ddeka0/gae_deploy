const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let rooms = 0;

app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

io.on('connection', (socket) => {

	// Create a new game room and notify the creator of game.
    socket.on('createGame', (data) => {
        socket.join(`room-${++rooms}`);
		socket.emit('newGame', { name: data.name, room: `room-${rooms}` });
	});

    // Connect the Player 2 to the room he requested. Show error if room full.
    socket.on('joinGame', function (data) {
		// console.log(io.nsps['/'].adapter.rooms);
        var room = io.nsps['/'].adapter.rooms[data.room];
		if (room && room.length === 1) {
			//console.log("room found");
            socket.join(data.room);
            socket.broadcast.to(data.room).emit('player1', {});
            socket.emit('player2', { name: data.name, room: data.room })
        } else {
			// console.log("Not found");
            socket.emit('err', { message: 'Sorry, The room is full!' });
        }
    });

    /**
       * Handle the turn played by either player and notify the other.
       */
    socket.on('playTurn', (data) => {
        socket.broadcast.to(data.room).emit('turnPlayed', {
            tile: data.tile,
            room: data.room
        });
    });

    /**
       * Notify the players about the victor.
       */
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data);
    });
});

server.listen(8080,()=>{
	const host = server.address().address;
	const port = server.address().port;
	console.log(`tic-tac-toe app listening at http://${host}:${port}`);
});