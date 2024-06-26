import { React, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Chip, Dialog, DialogTitle, IconButton, CardMedia, Grid, Paper, TextField, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import { useSocket } from '../../contexts/socketProvider';
import useRoomManager from '../../hooks/roomManager';

const gameDetails = { name: 'Xs and Os', description: 'Simple naughts and crosses!', status: true, imageName: '/xs_os.svg', colour: '#25309B', detailedInfo: 'Tic-tac-toe, noughts and crosses, or Xs and Os is a paper-and-pencil game for two players who take turns marking the spaces in a three-by-three grid with X or O. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row is the winner.', numPlayers: '2'};
const gameRules = "The game is played on a grid that is 3 squares by 3 squares. One player is randomly selected as X and the other is O. Players take turns putting their marks in empty squares. The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner. When all 9 squares are full, the game is over. If no player has 3 marks in a row, the game ends in a tie."

// Mapping playerSymbol to corresponding hex colors
const colourMap = {
  x: '#25309B',
  o: '#9B2530'
};

/**
 * XODescription: information pane that contains rules about XsAndOs as well as functionality
 * options for the user to either create a room or join an existing room.
 * @param {string} nickname: the current user's nickname.
 * @param {Function} handleCreateRoom: function to handle creating a new room.
 * @param {Function} handleJoinRoom: function to join an existing room.
 */
const XODescription = ({ nickname, handleCreateRoom, handleJoinRoom }) => {
  const [roomId, setRoomId] = useState('');

  return (
    <>
      <Box sx={{ padding: 3, gap: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2}}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon />
            <Typography variant='body1' sx={{ ml: 1 }}>{`${gameDetails.numPlayers} players`}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <InfoIcon sx={{ alignSelf: 'flex-start' }} />
            <Typography variant='body1' >{gameRules}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => handleCreateRoom('xsAndOs')}
            variant="outlined"
            sx={{
                mt: 2,
                height: 55,
                borderColor: gameDetails.colour,
                color: gameDetails.colour,
                '&:hover': {
                    backgroundColor: gameDetails.colour,
                    color: '#fff',
                },
            }}
          >
            Create Room
          </Button>
          <Typography variant='body1' >OR</Typography>
          <TextField
            InputProps={{
                endAdornment: (
                    <IconButton onClick={() => handleJoinRoom(roomId, nickname, 'xsAndOs')}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                ),
                style: { color: gameDetails.colour },
            }}
            sx={{
                '& label.Mui-focused': {
                    color: gameDetails.colour,
                },
                '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                        borderColor: gameDetails.colour,
                    },
                },
            }}
            label="Enter room code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </Box>
      </Box>
    </>
  );
};

/**
 * XOGame: the game display pane that renders the XsAndOs game for users to play.
 * @param {string} roomId: the current id of the room.
 * @param {object} room: the room object containing details such as players, game state etc.
 * @param {string} nickname: the current user's nickname. 
 */
const XOGame = ({ roomId, room, nickname, socket }) => {
  const [gameStart, setGameStart] = useState(false);
  const initialGameState = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];
  
  const [gameState, setGameState] = useState(initialGameState);
  const [playerSymbol, setPlayerSymbol] = useState('');
  const [currentTurn, setCurrentTurn] = useState('');
  const [gameDraw, setGameDraw] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    socket.on('gameStarted', ({ gameState, playerSymbols, currentTurn}) => {
      setOpenDialog(false);
      setGameState(gameState);
      setPlayerSymbol(playerSymbols[nickname]);
      setCurrentTurn(currentTurn);
      setGameStart(true);
    });

    socket.on('moveMade', ({ gameState, currentTurn }) => {
      setGameState(gameState);
      setCurrentTurn(currentTurn);
    });

    socket.on('gameWon', winner => {
      setGameWon(true);
      setWinner(winner);
      setOpenDialog(true);
    })

    socket.on('gameDraw', _ => {
      setGameDraw(true);
      setOpenDialog(true);
    })

    return () => {
      socket.off('gameStarted');
      socket.off('moveMade');
    }
  }, [socket, nickname]);

  const handleStartGame = (roomId) => {
      socket.emit('startGame', { gameType: 'xsAndOs', 'roomId': roomId });
  };

  const handleCloseDialog = (roomId) => {
    setOpenDialog(false);
    setGameStart(false);
    setGameState(initialGameState);
    setPlayerSymbol('');
    setCurrentTurn('');
    setGameDraw(false);
    setGameWon(false);
    setWinner('');
    socket.emit('restartGame', { gameType: 'xsAndOs', 'roomId': roomId });
  };

  const handlePlayAgain = (roomId) => {
    handleCloseDialog(roomId);
  };

  const handleCellClick = (row, col) => {
    if (gameState[row]?.[col] === '' && gameStart && currentTurn === nickname) {
      const move = { row, col, player: playerSymbol };
      socket.emit('xsAndOsMove', { roomId, move });
    };
  };

  const chipColour = colourMap[playerSymbol.toLowerCase()] || '#666';

  return (
    <>
      <Dialog open={(gameWon || gameDraw) && openDialog} onClose={() => handleCloseDialog(roomId)} maxWidth="sm" fullWidth>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, padding: 3 }}>
            {gameWon && (
              <DialogTitle sx={{ flex: 1 }}>🎉 {winner} Won 🎉</DialogTitle>
            )}
            {gameDraw && (
              <DialogTitle sx={{ flex: 1 }}>😁 Game Draw 😁</DialogTitle>
            )}
            <Button
              onClick={() => handlePlayAgain(roomId)}
              variant="outlined"
              sx={{
                mt: 2,
                height: 40,
                borderColor: gameDetails.colour,
                color: gameDetails.colour,
                '&:hover': {
                    backgroundColor: gameDetails.colour,
                    color: '#fff',
                },
              }}
            >
              Play Again?
            </Button>
        </Box>
      </Dialog>
      <Box sx={{ padding: 3, gap: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography>Room Code: {roomId}</Typography>
        <Typography>Players: {room.players.join(',')}</Typography>
          {
            !gameStart ? (
              <Button
                onClick={() => handleStartGame(roomId)}
                variant="outlined"
                sx={{
                  mt: 2,
                  height: 40,
                  borderColor: gameDetails.colour,
                  color: gameDetails.colour,
                  '&:hover': {
                      backgroundColor: gameDetails.colour,
                      color: '#fff',
                  },
                }}
              >
                Start Game
              </Button>
            ) : (
              <Typography component="div" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentTurn === nickname ? "Your Turn" : "Opponent's Turn"}
                <Chip 
                  label={`${playerSymbol} (You)`}
                  style={{ backgroundColor: chipColour, color: '#fff', borderColor: chipColour }}
                  variant="outlined"
                />
              </Typography>
            )
          }
      </Box>
      <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ maxWidth: 400, margin: 'auto', padding: 3 }}>
        {Array.from({ length: 3 }).map((_, rowIndex) => (
          <Grid key={`row-${rowIndex}`} container item xs={12} spacing={2} justifyContent="center">
            {Array.from({ length: 3 }).map((_, colIndex) => (
              <Grid key={`cell-${rowIndex}-${colIndex}`} item xs={4}>
                <Paper
                  elevation={3}
                  sx={{
                      width: '15vw',
                      height: '15vw',
                      maxWidth: '100px',
                      maxHeight: '100px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      backgroundImage: gameState[rowIndex]?.[colIndex] ? `url(/xsAndOs/${gameState[rowIndex][colIndex].toLowerCase()}.svg)` : 'none',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                  }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                />
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </>
  );
};

/**
 * XsAndOs: the main XsAndOs screen that handles switching between the description and 
 * game panes.
 */
const XsAndOs = () => {
  const router = useRouter();
  const { nickname: encodedNickname } = router.query;
  const nickname = decodeURIComponent(encodedNickname);

  const socket = useSocket();
  const {
    roomId,
    room,
    roomJoined,
    alertMessage,
    alertOpen,
    setAlertOpen,
    handleJoinRoom,
    handleLeaveRoom,
    handleCreateRoom
  } = useRoomManager(nickname);
    
  const handleNavigateHome = () => {
    if (roomJoined) {
      handleLeaveRoom();
    } else {
      const gamesPath = `/games?nickname=${encodeURIComponent(nickname)}`;
      router.push(gamesPath);
    }
  };

  return (
    <>
      {alertOpen && (
        <Alert 
          severity="error"
          onClose={() => setAlertOpen(false)}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            marginBottom: 2
          }}
        >
          {alertMessage}
        </Alert>
      )}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexGrow: 1, 
        p: 3,
        width: '100%',
        maxHeight: '100vh',
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%',
          position: 'relative',
        }}>
          <IconButton aria-label="home" size="large" onClick={() => handleNavigateHome(roomId, nickname)} sx={{ position: 'absolute', left: 0 }}>
            <ArrowBackIcon fontSize="inherit"/>
          </IconButton>
          <CardMedia
            component="img"
            image="/banners/xs_os.svg"
            alt="Xs and Os"
            sx={{ maxWidth: "60%", height: "20vh" }}
          />
          <Box sx={{ 
              position: 'absolute', 
              right: 0,
              display: 'flex',
              alignItems: 'center',
          }}>
            <PersonIcon />
            <Typography>{nickname}</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: "75vw",
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "primary.main",
            marginTop: 2,
            paddingBottom: 0,
          }}
        >
          {roomJoined ?
            <XOGame
              roomId={roomId}
              room={room}
              nickname={nickname}
              socket={socket}
            />
            :
            <XODescription
              nickname={nickname}
              handleCreateRoom={handleCreateRoom}
              handleJoinRoom={handleJoinRoom}
            />
          }
        </Box>
      </Box>
    </>
  );
};

export default XsAndOs;