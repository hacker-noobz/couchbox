const xsAndOs = require('./games/xsAndOs')
const lineFour = require('./games/lineFour')

function startGame(rooms, roomId, gameType) {
    if (gameType == 'xsAndOs') {
        return xsAndOs.initializeGame(rooms, roomId);
    } else if (gameType == 'lineFour') {
        return lineFour.initializeGame(rooms, roomId);
    }
}

module.exports = { startGame };
