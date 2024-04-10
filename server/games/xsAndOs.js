function createInitialGameState() {
    // Return the initial game state
  }
  
  function joinRoom(rooms, roomId, playerId) {
    // Logic to join a room
    // Return true if the player successfully joined the room, false otherwise
    if (rooms.hasOwnProperty(roomId)) {
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
  
  function makeMove(gameState, move) {
    // Update the gameState based on the move
    // Return the updated gameState
  }
  
  module.exports = { createInitialGameState, joinRoom, makeMove };
  