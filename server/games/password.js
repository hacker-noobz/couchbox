const passwords = ['chocolate', 'volleyball', 'edward', 'firefighter', 'orchestra', 'universe', 'chocolate', 'adventure',
  'harmony', 'blueprint', 'avalanche', 'detective', 'symphony',
  'treasure', 'cathedral', 'avalanche', 'tornado', 'treasure',
  'pirate', 'squirrel', 'bamboo', 'rainbow', 'lighthouse',
  'whisper', 'secret', 'enigma', 'blizzard', 'galaxy',
  'serenade', 'whisper', 'jungle', 'atlantis', 'monsoon',
  'waterfall', 'symphony', 'horizon', 'butterfly', 'mirage',
  'conqueror', 'dragonfly', 'oasis', 'adventure', 'serenity',
  'phoenix', 'mirage', 'blossom', 'quest', 'eclipse',
  'paradise', 'universe', 'illusion', 'discovery', 'atlantis'
];

function checkGameStart(rooms, roomId) {
  if (!rooms[roomId]) {
    console.log(`Room ${roomId} does not exist.`);
    return false;
  }

  const currentRoom = rooms[roomId];
  console.log(`Checking game start for room: ${JSON.stringify(currentRoom)}`);
  if (currentRoom.players.length >= 4 && currentRoom.players.length <= 8) {
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

  // Randomly choose a password
  const passwordIndex = Math.floor(Math.random() * passwords.length);
  const password = passwords[passwordIndex];

  // Randomly choose two players to be the clue masters
  const players = rooms[roomId].players;
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]]; 
  }
  const clueMaster1 = players[0];
  const clueMaster2 = players[1];
  const remainingPlayers = players.slice(2);
  const halfIndex = Math.ceil(remainingPlayers.length / 2);
  const team1 = remainingPlayers.slice(0, halfIndex);
  const team2 = remainingPlayers.slice(halfIndex);

  const gameState = {
    password: password,
    clueMaster1: clueMaster1,
    clueMaster2: clueMaster2,
    team1: team1,
    team2: team2,
    log: []
  }
  rooms[roomId].gameState = gameState;
  rooms[roomId].currentTurn = 'Clue Master 1';
  rooms[roomId].password = password;

  return {
    gameState,
    currentTurn: rooms[roomId].currentTurn,
    password: rooms[roomId].password,
  };
};

function makeMove(gameState, { player, data }) {
  const move = checkMoveType(gameState, player);

  // Add the guess/clue to the log
  const message = {
    player: player,
    type: move.type,
    team: move.team,
    message: data,
  }
  gameState.log.push(message);

  if (move.type == 'guess' && gameState.password === data.toLowerCase()) {
    return { gameState, winner: move.team };
  }
  return { gameState };
}

function checkTurn(gameState, currentTurn, player) {
  if (currentTurn == 'Clue Master 1' && gameState.clueMaster1 == player) {
    return true;
  } else if (currentTurn == 'Clue Master 2' && gameState.clueMaster2 == player) {
    return true;
  } else if (currentTurn == 'Team 1' && gameState.team1.includes(player)) {
    return true;
  } else if (currentTurn == 'Team 2' && gameState.team2.includes(player)) {
    return true;
  }

  return false;
}

function updateTurn(currentTurn) {
  const turnOrder = ['Clue Master 1', 'Team 1', 'Clue Master 2', 'Team 2'];
  const turnIndex = turnOrder.indexOf(currentTurn);
  if (turnIndex === turnOrder.length - 1) {
    // Current Turn was just Team 2, so go back to Team 1's Clue Master
    return turnOrder[0];
  } else {
    // Return the next turn in the order
    return turnOrder[turnIndex + 1];
  }
}

function checkMoveType(gameState, player) {
  if (player === gameState.clueMaster1) {
    return {type: 'clue', team: 'Team 1'};
  } else if (player === gameState.clueMaster2) {
    return {type: 'clue', team: 'Team 2'};
  } else if (gameState.team1.includes(player)) {
    return {type: 'guess', team: 'Team 1'};
  } else if (gameState.team2.includes(player)) {
    return {type: 'guess', team: 'Team 2'};
  }
}

module.exports = { joinRoom, checkGameStart, initializeGame, checkTurn, makeMove, updateTurn };
