function createInitialGameState() {
    // Return the initial game state
  }
  
function joinRoom(rooms, roomId, playerId) {
  // Logic to join a room
  // Return true if the player successfully joined the room, false otherwise
  if (rooms.hasOwnProperty(roomId) && !rooms[roomId].players.includes(playerId)) {
      currentRoom = rooms[roomId];
      // Check if the current room has too many players
      if (currentRoom.players.length > 1) {
          return false;
      }

      // Add the player to the room
      currentRoom.players.push(playerId);

      return true;
  }

  return false;
}

function leaveRoom(rooms, roomId, playerId) {
  // Logic to leave a room
  // Returns true if tthe player successfully leaves the room, false otherwise
  if (rooms.hasOwnProperty(roomId)) {
    const currentRoom = rooms[roomId];
    const playerIndex = currentRoom.players.indexOf(playerId);
    if (playerIndex !== -1) {
      currentRoom.players.splice(playerIndex, 1);
    }

    // If there are no players left in the room, delete the room
    if (currentRoom.players.length === 0) {
      delete rooms[roomId];
    }

    return true;
  }

  return false;
}

function checkGameStart(rooms, roomId) {
  const currentRoom = rooms[roomId];

  if (currentRoom.players.length == 2) {
    return true;
  }

  return false;
}

function makeMove(gameState, move) {
  // Update the gameState based on the move
  // Return the updated gameState
}

module.exports = { createInitialGameState, joinRoom, leaveRoom, makeMove, checkGameStart };
