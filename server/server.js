const express = require('express')
const http = require('http');
const { start } = require('repl');
const { Server } = require('socket.io')
// Import Games
const xsAndOs = require('./games/xsAndOs')

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8000;

const rooms = {};
const playerSessions = {};

// Auxiliary Functions
function generateRoomId() {
  // Create a room id
  return Math.random().toString(36).substring(2, 9);
}

function createRoom(roomId, gameType, playerId) {
  // Create a new room
  const gameState = {};

  return {
    id: roomId,
    gameType: gameType,
    players: [playerId],
    gameState: gameState,
  };
}

io.on('connection', (socket) => {
  console.log('A user has connected', socket.id);
  console.log(`Available Rooms: ${JSON.stringify(rooms)}`);

  socket.on('disconnect', () => {
    const playerId = playerSessions[socket.id];
    if (playerId) {
      Object.keys(rooms).forEach(roomId => {
        const room = rooms[roomId];
        const index = room.players.indexOf(playerId);
        if (index !== -1) {
          room.players.splice(index, 1);
          if (room.players.length === 0) {
            delete rooms[roomId];
          } else {
            io.to(roomId).emit('playerLeft', { playerId: playerId});
          }
        }
      });
    }
    delete playerSessions[socket.id];
  })
  // Handle creating/joining rooms and other general-purpose logic here
  // For game-specific actions, call functions from xsAndOs

  // Room Creation
  socket.on('createRoom', ({ gameType, nickname }) => {
    const roomId = generateRoomId();
    const room = createRoom(roomId, gameType, nickname);
    console.log(`Created room: ${JSON.stringify(room)}`);
    // Store the details of the new room
    rooms[roomId] = room;
    socket.join(roomId);
    socket.emit('roomCreated', { roomId, room });
  })

  // Room Joining
  socket.on('joinRoom', ({ roomId, nickname }) => {
    if (xsAndOs.joinRoom(rooms, roomId, nickname)) {
      socket.join(roomId);
      playerSessions[socket.id] = nickname;
      io.to(roomId).emit('roomJoined', rooms[roomId]);

      console.log(`Player joined room: ${JSON.stringify(rooms[roomId])}`);
    } else {
      socket.emit('error', 'Already in the room or room is full.');
    }
  });

  //Room Leaving
  socket.on('leaveRoom', ({ roomId, nickname }) => {
    if (xsAndOs.leaveRoom(rooms, roomId, nickname)) {
      socket.leave(roomId);

      if (rooms.hasOwnProperty(roomId)) {
        socket.to(roomId).emit('playerLeft', { nickname });
      }
      console.log(`Player left room: ${JSON.stringify(rooms[roomId])}`);
    } else {
      socket.emit('error', 'Could not leave room: non-existent room or error occurred.')
    }
  })

  // Game Start
  socket.on('startGame', ({gameType, roomId}) => {
    if (gameType == "xsAndOs") {
      const result = xsAndOs.initializeGame(rooms, roomId);
      if (result.error) {
        socket.emit('error', result.error);
      } else {
        io.to(roomId).emit('gameStarted', result);
      }
    }
  });

  // Game Restart
  socket.on('restartGame', roomId => {
    if (!rooms[roomId]) {
      socket.emit('error', 'Room does not exist.');
      return;
    }

    const result = xsAndOs.initializeGame(rooms, roomId);
    if (result.error) {
        socket.emit('error', result.error);
    } else {
        io.to(roomId).emit('gameStarted', result);
    }
  });

  // You can also listen for Xs and Os specific events and handle them
  socket.on('xsAndOsMove', ({ roomId, move }) => {
    const room = rooms[roomId];
    if (move.player === room.playerSymbols[room.currentTurn]) {
      const result = xsAndOs.makeMove(room.gameState, move);
      if (!result.error) {
        room.currentTurn = room.players.find(p => p !== room.currentTurn);
        io.to(roomId).emit('moveMade', { gameState: room.gameState, currentTurn: room.currentTurn });

        if (result.winner) {
          const winnerName = Object.keys(room.playerSymbols).find(key => room.playerSymbols[key] === result.winner);
          io.to(roomId).emit('gameWon', winnerName);
        } else if (result.draw) {
          io.to(roomId).emit('gameDraw');
        }
      } else {
        socket.emit('error', 'Invalid move.');
      }
    } else {
      socket.emit('error', 'Not your turn.');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});