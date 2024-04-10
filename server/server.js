const express = require('express')
const http = require('http');
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

  // Handle creating/joining rooms and other general-purpose logic here
  // For game-specific actions, call functions from xsAndOs

  // Room Creation
  socket.on('createRoom', ({ gameType }) => {
    const roomId = generateRoomId();
    const room = createRoom(roomId, gameType, socket.id);
    console.log(`Created room: ${JSON.stringify(room)}`);
    // Store the details of the new room
    rooms[roomId] = room;
    socket.join(roomId);

    socket.emit('roomCreated', { roomId, gameType });
  })

  // Room Joining
  socket.on('joinRoom', (roomId) => {
    if (xsAndOs.joinRoom(rooms, roomId, socket.id)) {
      socket.join(roomId);
      io.to(roomId).emit('roomJoined', roomId);
    } else {
      socket.emit('error', 'Room is full or does not exist');
    }
  });

  // You can also listen for Xs and Os specific events and handle them
  socket.on('xsAndOsMove', ({roomId, move}) => {
    const result = xsAndOs.makeMove(rooms[roomId].gameState, move);
    io.to(roomId).emit('moveMade', result);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});