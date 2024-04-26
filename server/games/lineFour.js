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
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
  ];
}

const initializeGame = (rooms, roomId) => {
    if (!checkGameStart(rooms, roomId)) {
        return { error: 'Could not start game, not enough players or room does not exist.' };
    }

    // Randomly choose a player to start
    const players = rooms[roomId].players;
    const startingPlayer = Math.floor(Math.random() * 2);
    const playerColours = ['green', 'yellow'];
    const firstPlayer = playerColours[startingPlayer];
    const secondPlayer = playerColours[1 - startingPlayer];

    // Reset or initialize the game state
    const gameState = createInitialGameState();
    rooms[roomId].gameState = gameState;
    rooms[roomId].playerColours = {
        [players[0]]: firstPlayer,
        [players[1]]: secondPlayer,
    };
    rooms[roomId].currentTurn = players[startingPlayer];

    return {
        gameState,
        playerColours: rooms[roomId].playerColours,
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
};

function checkWin(gameState, player) {
    const rows = gameState.length;
    const cols = gameState[0].length;

    // Horizontal check
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols - 3; j++) {
            if (gameState[i][j] === player && gameState[i][j + 1] === player &&
                gameState[i][j + 2] === player && gameState[i][j + 3] === player) {
                return true;
            }
        }
    }

    // Vertical check
    for (let j = 0; j < cols; j++) {
        for (let i = 0; i < rows - 3; i++) {
            if (gameState[i][j] === player && gameState[i + 1][j] === player &&
                gameState[i + 2][j] === player && gameState[i + 3][j] === player) {
                return true;
            }
        }
    }

    // Diagonal check (down-right and up-right)
    for (let i = 0; i < rows - 3; i++) {
        for (let j = 0; j < cols - 3; j++) {
            // Down-right
            if (gameState[i][j] === player && gameState[i + 1][j + 1] === player &&
                gameState[i + 2][j + 2] === player && gameState[i + 3][j + 3] === player) {
                return true;
            }
            // Up-right (from bottom-left to top-right)
            if (gameState[i + 3][j] === player && gameState[i + 2][j + 1] === player &&
                gameState[i + 1][j + 2] === player && gameState[i][j + 3] === player) {
                return true;
            }
        }
    }

    return false; // No win found
}

function checkDraw(gameState) {
    // Check if the top row (first row of each column) is filled
    return gameState[0].every(cell => cell !== '');
}

function makeMove(gameState, { col, player }) {
    // Find the lowest empty spot in the column
    for (let row = gameState.length - 1; row >= 0; row--) {
        if (gameState[row][col] === '') {
            gameState[row][col] = player; // Place the player's token

            // Check for a win or draw after the move
            if (checkWin(gameState, player)) {
                return { gameState, winner: player };
            } else if (checkDraw(gameState)) {
                return { gameState, draw: true };
            }
            return { gameState }; // Return the updated gameState if no win or draw
        }
    }

    // If the column is full and no spaces were available, return an error
    return { gameState, error: 'Invalid move, column is full' };
}

module.exports = { createInitialGameState, joinRoom, makeMove, checkGameStart, initializeGame };
