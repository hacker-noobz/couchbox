function checkGameStart(rooms, roomId) {
  if (!rooms[roomId]) {
    console.log(`Room ${roomId} does not exist.`);
    return false;
  }

  const currentRoom = rooms[roomId];
  console.log(`Checking game start for room: ${JSON.stringify(currentRoom)}`);
  if (currentRoom.players.length == 2) {
    return true;
  }

  return false;
}

function createInitialGameState() {
  return [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];
}

const initializeGame = (rooms, roomId) => {
  if (!checkGameStart(rooms, roomId)) {
      return { error: 'Could not start game, not enough players or room does not exist.' };
  }

  // Randomly choose a player to start
  const players = rooms[roomId].players;
  const startingPlayer = Math.floor(Math.random() * 2);
  const playerSymbols = ['X', 'O'];
  const firstPlayer = playerSymbols[startingPlayer];
  const secondPlayer = playerSymbols[1 - startingPlayer];

  // Reset or initialize the game state
  const gameState = createInitialGameState();
  rooms[roomId].gameState = gameState;
  rooms[roomId].playerSymbols = {
      [players[0]]: firstPlayer,
      [players[1]]: secondPlayer,
  };
  rooms[roomId].currentTurn = players[startingPlayer];

  return {
      gameState,
      playerSymbols: rooms[roomId].playerSymbols,
      currentTurn: rooms[roomId].currentTurn
  };
};

  
function joinRoom(rooms, roomId, playerId) {
  // Logic to join a room
  // Return true if the player successfully joined the room, false otherwise
  currentRoom = rooms[roomId];
  // Check if the current room has too many players
  if (currentRoom.players.length > 1) {
      return { success: false, error: 'Room is full.'};
  }

  // Add the player to the room
  currentRoom.players.push(playerId);

  return { success: true, error: 'Room joined successfully!'};
}

function checkWin(gameState, player) {
  // Check rows, columns, and diagonals for a win
  for (let i = 0; i < 3; i++) {
      // Rows
      if (gameState[i].every(cell => cell === player)) return true;
      // Columns
      if (gameState.map(row => row[i]).every(cell => cell === player)) return true;
  }
  // Diagonals
  if ([gameState[0][0], gameState[1][1], gameState[2][2]].every(cell => cell === player)) return true;
  if ([gameState[0][2], gameState[1][1], gameState[2][0]].every(cell => cell === player)) return true;

  // Game has not been won
  return false;
}

function checkDraw(gameState) {
  return gameState.flat().every(cell => cell !== '');
}

function makeMove(gameState, { row, col, player }) {
  // Update the gameState based on the move
  // Return the updated gameState
  if (gameState[row][col] === '') {
      gameState[row][col] = player;
      if (checkWin(gameState, player)) {
          return { gameState, winner: player };
      } else if (checkDraw(gameState)) {
          return { gameState, draw: true };
      }
      return { gameState };
  }
  return { gameState, error: 'Invalid move' };
}

module.exports = { createInitialGameState, joinRoom, makeMove, checkGameStart, initializeGame };
