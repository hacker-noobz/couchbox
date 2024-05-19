function interpolate(start, end, step, max) {
  return start + ((end - start) * step / max);
}

function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function generateColourGrid(rows, cols) {
  let colourGrid = [];
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      let r = Math.round(interpolate(0, 255, j, cols - 1));
      let g = Math.round(interpolate(0, 255, i, rows - 1));
      let b = Math.round(interpolate(255, 0, j, cols - 1));
      let hex = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
      row.push(hex);
    }
    colourGrid.push(row);
  }
  return colourGrid;
}

// Function to randomly choose a colour from the colour grid
function chooseRandomColour(colourGrid) {
  // Generate random row and column indices within the grid dimensions
  let randomRow = Math.floor(Math.random() * colourGrid.length);
  let randomCol = Math.floor(Math.random() * colourGrid[0].length);
  
  // Get the color at the randomly chosen position
  let randomColour = colourGrid[randomRow][randomCol];
  
  return { randomColour, pos: [randomRow, randomCol]};
}

// Function to generate the turn order
function generateTurnOrder(clueMaster, players) {
  // Filter out the starting player from the list to get the remaining players
  const remainingPlayers = players.filter(player => player !== clueMaster);

  // Create the turn order by concatenating:
  // 1. clueMaster
  // 2. Remaining players
  // 3. clueMaster again
  // 4. Reversed order of remaining players
  const turnOrder = [clueMaster, ...remainingPlayers, clueMaster, ...remainingPlayers.reverse()];

  return turnOrder;
}

function checkGameStart(rooms, roomId) {
  if (!rooms[roomId]) {
    console.log(`Room ${roomId} does not exist.`);
    return false;
  }

  const currentRoom = rooms[roomId];
  console.log(`Checking game start for room: ${JSON.stringify(currentRoom)}`);
  if (currentRoom.players.length >= 2 && currentRoom.players.length <= 8) {
    return true;
  }

  return false;
}

function joinRoom(rooms, roomId, playerId) {
  // Logic to join a room
  // Return true if the player successfully joined the room, false otherwise
  currentRoom = rooms[roomId];
  // Check if the current room has too many players
  if (currentRoom.players.length > 7) {
    return { success: false, error: 'Room is full.'};
  }

  // Add the player to the room
  currentRoom.players.push(playerId);

  return { success: true, error: 'Room joined successfully!'};
}

const initializeGame = (rooms, roomId) => {
  if (!checkGameStart(rooms, roomId)) {
      return { error: 'Could not start game, not enough players or room does not exist.' };
  }

  // The turn order will be based on the order the players joined the room
  const players = rooms[roomId].players;
  const firstClueMaster = players[0];
  const currentTurn = firstClueMaster;

  // Initialize initial scores
  let scores = {};
  players.forEach(player => {
    scores[player] = 0;
  });

  // Choose a random colour
  const colourGrid = generateColourGrid(20, 20);
  const chosenColour = chooseRandomColour(colourGrid);
  const currentColour = chosenColour.randomColour;
  const colourPosition = chosenColour.pos;

  // Generate turn order
  const turnOrder = generateTurnOrder(firstClueMaster, players);
  
  // Record the maximum number of rounds to be played
  const numRounds = players.length;

  const gameState = {
    colourGrid: colourGrid,
    currentColour: currentColour,
    clueMaster: firstClueMaster,
    currentTurn: currentTurn,
    turnOrder: turnOrder,
    scores: scores,
    numRounds: numRounds,
    round: 1,
    turnIndex: 0,
    clues: [],
    guesses: [],
    colourPosition: colourPosition,
  }

  rooms[roomId].gameState = gameState;
  rooms[roomId].currentTurn = firstClueMaster;
  rooms[roomId].currentColour = currentColour;
  rooms[roomId].colourGrid = colourGrid;

  return {
    gameState,
    currentTurn: firstClueMaster,
    currentColour: currentColour,
    colourGrid: colourGrid,
  };
};

function calculateScores(guesses, chosenColourCoordinates, scores, clueMaster) {
  const [chosenRow, chosenCol] = chosenColourCoordinates;

  const isWithinOneBlock = (row, col) => {
    return Math.abs(row - chosenRow) <= 1 && Math.abs(col - chosenCol) <= 1;
  };

  guesses.forEach(guess => {
    const player = guess.player;
    const [guessRow, guessCol] = [guess.guess.row, guess.guess.col];

    if (guessRow === chosenRow && guessCol === chosenCol) {
      scores[player] = (scores[player] || 0) + 3;
      scores[clueMaster] = (scores[clueMaster] || 0) + 1;
    } else if (isWithinOneBlock(guessRow, guessCol)) {
      scores[player] = (scores[player] || 0) + 2;
      scores[clueMaster] = (scores[clueMaster] || 0) + 1;
    } else {
      const dist = Math.max(Math.abs(guessRow - chosenRow), Math.abs(guessCol - chosenCol));
      if (dist === 2) {
        scores[player] = (scores[player] || 0) + 1;
      }
    }
  })

  return scores;
}

function generateNewRound(rooms, roomId, gameState) {
  const room = rooms[roomId];
  const newColour = chooseRandomColour(gameState.colourGrid);

  gameState.round += 1;
  const newClueMaster = room.players[gameState.round - 1];
  const newCurrentTurn = newClueMaster;
  const newTurnOrder = generateTurnOrder(newClueMaster, room.players);

  // Calculate the scores
  gameState.scores = calculateScores(gameState.guesses, gameState.colourPosition, gameState.scores, gameState.clueMaster);

  gameState.clues = [];
  gameState.guesses = [];
  gameState.colourPosition = newColour.pos;
  gameState.currentColour = newColour.randomColour;
  gameState.clueMaster = newClueMaster;
  gameState.currentTurn = newCurrentTurn;
  gameState.turnOrder = newTurnOrder;
  gameState.turnIndex = 0;

  return { gameState };
}

function makeMove(gameState, { player, data }) {
  const type = checkMoveType(gameState, player);

  if (type === 'clue') {
    gameState.clues.push(data);
  } else if (type === 'guess') {
    gameState.guesses.push(
      {
        player: player,
        guess: data,
      }
    );
  }

  return { gameState };
}

function calculateWinner(gameState) {
  // Calculate the final scores
  const finalScores = calculateScores(gameState.guesses, gameState.colourPosition, gameState.scores, gameState.clueMaster);
  
  let scoreEntries = Object.entries(finalScores);
  scoreEntries.sort((a, b) => b[1] - a[1]);

  let sortedScores = {};
  scoreEntries.forEach(([player, score]) => {
    sortedScores[player] = score;
  });

  let highestScorer = scoreEntries[0][0];

  return {
    winner: highestScorer,
    scores: sortedScores,
  }
}

function checkTurn(currentTurn, player) {
  if (currentTurn === player) {
    return true;
  }

  return false;
}

function updateTurn(gameState, currentTurn) {
  const turnOrder = gameState.turnOrder;
  const turnIndex = gameState.turnIndex
  if (turnIndex === turnOrder.length - 1) {
    // End of the turn order, generate new round
    return { roundOver: true }
  } else {
    // Return the next turn in the order
    return turnOrder[turnIndex + 1];
  }
}

function checkMoveType(gameState, player) {
  if (player === gameState.clueMaster) {
    return 'clue';
  } else {
    return 'guess';
  }
}

module.exports = { joinRoom, checkGameStart, initializeGame, checkTurn, makeMove, updateTurn, generateNewRound, calculateWinner };
