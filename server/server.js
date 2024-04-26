const express = require('express')
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors');

// Import Games
const xsAndOs = require('./games/xsAndOs');
const lineFour = require('./games/lineFour');
// Import Room Management
const roomManager = require('./roomManagement');
// Import Game Management
const gameManager = require('./gameManagement');

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: ["http://localhost:3000", "https://couchbox.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Configure CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://couchbox.netlify.app"],
    methods: ["*"]
  }
});

const PORT = process.env.PORT || 8000;

const rooms = {};
const playerSessions = {};

app.get('/config', (req, res) => {
  const config = {
    socketUrl: process.env.SOCKET_URL || "http://localhost:8000"
  };
  res.json(config);
});

app.get('/api/list_games', (req, res) => {
  const games = [
    { name: 'Xs and Os', description: 'Simple naughts and crosses!', status: true, imageName: '/xs_os.svg', colour: '#25309B', detailedInfo: 'Tic-tac-toe, noughts and crosses, or Xs and Os is a paper-and-pencil game for two players who take turns marking the spaces in a three-by-three grid with X or O. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row is the winner.', numPlayers: '2'},
    { name: 'Spy Hunt', description: 'Find the Spy!', status: false, imageName: '/spy_hunt.svg', colour: '#783035', detailedInfo: 'In Spy Hunt one person is the spy (or two if you have many players) and the rest of the players are non-spies who receive a secret location. The players ask each other questions to figure out who does not know the location (and hence, is the spy).', numPlayers: '2-8'},
    { name: 'Password', description: 'Guess the password!', status: false, imageName: '/pass_word.svg', colour: '#C98D09', detailedInfo: 'In two teams, two rival wordmasters know the secret password and must provide clever clues to help their own team guess the password. However, they must not give away clues that are too obvious, to ensure that their team guesses it first!', numPlayers: '2-8'},
    { name: 'Code Words', description: 'Find the code words!', status: false, imageName: '/code_words.svg', colour: '#963D41', detailedInfo: 'Two rival spymasters know the secret identities of 25 agents. Their teammates know the agents only by their codenames. To win the game, your team will need to contact all of your agents in the field before the other team finds their own agents. And watch out for the assassin – meet him in the field and your team is done!', numPlayers: '2-8'},
    { name: 'Line Four', description: 'Connect Four!', status: true, imageName: '/line_four.svg', colour: '#33D9B2', detailedInfo: 'Two rival players go head to head dropping tokens in a grid, fighting to be the first to form a horizontal, vertical or diagonal line of four.', numPlayers: '2'},
    { name: 'Where Wolf?', description: 'Where is the Wolf?', status: false, imageName: '/where_wolf.svg', colour: '#1E0B18', detailedInfo: 'Experience a conflict between two groups: an informed minority (the Werewolves) and an uninformed majority (the Villagers)', numPlayers: '4-8'},
  ];
  res.json(games);
});

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
    const roomId = roomManager.generateRoomId();
    const room = roomManager.createRoom(roomId, gameType, nickname);
    console.log(`Created room: ${JSON.stringify(room)}`);
    // Store the details of the new room
    rooms[roomId] = room;
    socket.join(roomId);
    socket.emit('roomCreated', { roomId, room });
  })

  // Room Joining
  socket.on('joinRoom', ({ roomId, nickname, gameType }) => {
    const { success, error } = roomManager.joinRoom(rooms, roomId, gameType, nickname);

    if (success) {
      socket.join(roomId);
      playerSessions[socket.id] = nickname;
      io.to(roomId).emit('roomJoined', rooms[roomId]);

      console.log(`Player joined room: ${JSON.stringify(rooms[roomId])}`);
    } else {
      socket.emit('error', error);
    }
  });

  //Room Leaving
  socket.on('leaveRoom', ({ roomId, nickname }) => {
    const { success, error } = roomManager.leaveRoom(rooms, roomId, nickname);
    console.log(success);
    console.log(error);
    if (success) {
      socket.leave(roomId);
      if (rooms.hasOwnProperty(roomId)) {
        // If the room still exists, notify the leftover players
        socket.to(roomId).emit('playerLeft', { nickname });
      }
      console.log(`Player left room: ${JSON.stringify(rooms[roomId])}`);
    } else {
      socket.emit('error', error)
    }
  })

  // Game Start
  socket.on('startGame', ({gameType, roomId}) => {
    const result = gameManager.startGame(rooms, roomId, gameType);
    if (result.error) {
      socket.emit('error', result.error);
    } else {
      io.to(roomId).emit('gameStarted', result);
    }
  });

  // Game Restart
  socket.on('restartGame',  ({gameType, roomId}) => {
    if (!rooms[roomId]) {
      socket.emit('error', 'Room does not exist.');
      return;
    }

    const result = gameManager.startGame(rooms, roomId, gameType);
    if (result.error) {
        socket.emit('error', result.error);
    } else {
        io.to(roomId).emit('gameStarted', result);
    }
  });

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

  socket.on('lineFourMove', ({ roomId, move }) => {
    const room = rooms[roomId];
    if (move.player === room.playerColours[room.currentTurn]) {
      const result = lineFour.makeMove(room.gameState, move);
      if (!result.error) {
        room.currentTurn = room.players.find(p => p !== room.currentTurn);
        io.to(roomId).emit('moveMade', { gameState: room.gameState, currentTurn: room.currentTurn });

        if (result.winner) {
          const winnerName = Object.keys(room.playerColours).find(key => room.playerColours[key] === result.winner);
          io.to(roomId).emit('gameWon', winnerName);
        } else if (result.draw) {
          io.to(roomId).emit('gameDraw');
        }
      } else {
        socket.emit('error', 'Invalid move.');
      }
    } else {
      socket.emit('error', 'Not your turn');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});