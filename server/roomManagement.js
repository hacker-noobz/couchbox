const xsAndOs = require('./games/xsAndOs')
const lineFour = require('./games/lineFour')

/**
 * generateRoomId: Creates a room ID
 * @returns A randomly generated room ID
 */
function generateRoomId() {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}

/**
 * createRoom: Creates a new room based on the given id, game type and player.
 * @param {string} roomId 
 * @param {string} gameType 
 * @param {string} nickname 
 * @returns 
 */
function createRoom(roomId, gameType, nickname) {
    // Create a new room
    const gameState = {};

    return {
        id: roomId,
        gameType: gameType,
        players: [nickname],
        gameState: gameState,
    };
}

/**
 * joinRoom: Checks whether the room exists and if the player already exists in that room.
 * Then it hands it off to the game specific room handler.
 * @param {Object} rooms 
 * @param {string} roomId 
 * @param {string} gameType
 * @param {string} nickname 
 */
function joinRoom(rooms, roomId, gameType, nickname) {
    if (!rooms.hasOwnProperty(roomId) || rooms[roomId].players.includes(nickname)) {
        // If the room does not exist or the player trying to join the room is already
        // in the room, return false.
        let errorMessage = 'Player already exists in this room.';
        if (!rooms.hasOwnProperty(roomId)) {
            errorMessage = 'Room does not exist.'
        }
        return { success: false, error: errorMessage };
    }

    if (gameType == 'xsAndOs') {
        return xsAndOs.joinRoom(rooms, roomId, nickname);
    } else if (gameType == 'lineFour') {
        return lineFour.joinRoom(rooms, roomId, nickname);
    }
}

/**
 * leaveRoom: Checks whether the room exists and handles the player leaving the room. It will
 * also delete the room if it is then empty.
 * @param {*} rooms 
 * @param {*} roomId 
 * @param {*} nickname 
 * @returns An object containing success and an error message if applicable.
 */
function leaveRoom(rooms, roomId, nickname) {
    if (!rooms.hasOwnProperty(roomId)) {
        return { success: false, error: 'Room does not exist.'};
    }

    const currentRoom = rooms[roomId];
    const playerIndex = currentRoom.players.indexOf(nickname);
    if (playerIndex !== -1) {
        currentRoom.players.splice(playerIndex, 1);
    }

    // If there are no players left in the room, delete the room
    if (currentRoom.players.length === 0) {
        delete rooms[roomId];
    }

    return { success: true, error: 'Room left successfully!'};
}

module.exports = { generateRoomId, createRoom, joinRoom, leaveRoom };
