const xsAndOs = require('./games/xsAndOs')
const lineFour = require('./games/lineFour')
const spyHunt = require('./games/spyHunt')
const password = require('./games/password')
const shadesAndTones = require('./games/shadesAndTones');

function startGame(rooms, roomId, gameType) {
    if (gameType == 'xsAndOs') {
        return xsAndOs.initializeGame(rooms, roomId);
    } else if (gameType == 'lineFour') {
        return lineFour.initializeGame(rooms, roomId);
    } else if (gameType == 'spyHunt') {
        return spyHunt.initializeGame(rooms, roomId);
    } else if (gameType == 'password') {
        return password.initializeGame(rooms, roomId);
    } else if (gameType == 'shadesAndTones') {
        return shadesAndTones.initializeGame(rooms, roomId);
    }
}

module.exports = { startGame };
