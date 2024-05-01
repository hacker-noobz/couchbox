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

const gameDetails = { name: 'Line Four', description: 'Connect Four!', status: true, imageName: '/line_four.svg', colour: '#33D9B2', detailedInfo: 'Two rival players go head to head dropping tokens in a grid, fighting to be the first to form a horizontal, vertical or diagonal line of four.', numPlayers: '2'};
const gameRules = "Line Four is a game in which the players choose a color and then take turns dropping colored tokens into a six-row, seven-column vertically suspended grid. The pieces fall straight down, occupying the lowest available space within the column. The objective of the game is to be the first to form a horizontal, vertical, or diagonal line of four of one's own tokens."

// Mapping playerColour to corresponding hex colors
const colourMap = {
  green: '#00BF63',
  yellow: '#FFA000'
};

/**
 * LineFourDescription: information pane that contains rules about Line Four as well as functionality
 * options for the user to either create a room or join an existing room.
 * @param {string} nickname: the current user's nickname.
 * @param {Function} handleCreateRoom: function to handle creating a new room.
 * @param {Function} handleJoinRoom: function to join an existing room.
 */
 const LineFourDescription = ({ nickname, handleCreateRoom, handleJoinRoom }) => {
  const [roomId, setRoomId] = useState('');

  return (
    <>
      <Box sx={{ padding: 3, gap: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2}}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon />
            <Typography sx={{ ml: 1 }}>{`${gameDetails.numPlayers} players`}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <InfoIcon sx={{ alignSelf: 'flex-start' }} />
            <Typography>{gameRules}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => handleCreateRoom('lineFour')}
            variant="outlined"
            sx={{
                mt: 2,
                height: 55,
                borderColor: gameDetails.colour,
                color: gameDetails.colour,
                '&:hover': {
                    backgroundColor: gameDetails.colour,
                    borderColor: gameDetails.colour,
                    color: '#fff',
                },
            }}
          >
            Create Room
          </Button>
          <Typography>OR</Typography>
          <TextField
            InputProps={{
                endAdornment: (
                    <IconButton onClick={() => handleJoinRoom(roomId, nickname, 'lineFour')}>
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
 * LineFourGame: the game display pane that renders the Line Four game for users to play.
 * @param {string} roomId: the current id of the room.
 * @param {object} room: the room object containing details such as players, game state etc.
 * @param {string} nickname: the current user's nickname. 
 */
const LineFourGame = ({ roomId, room, nickname, socket }) => {
  const [gameStart, setGameStart] = useState(false);
  const initialGameState = [
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
  ];

  const [gameState, setGameState] = useState(initialGameState);
  const [playerColour, setPlayerColour] = useState('');
  const [currentTurn, setCurrentTurn] = useState('');
  const [gameDraw, setGameDraw] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    socket.on('gameStarted', ({ gameState, playerColours, currentTurn}) => {
      setOpenDialog(false);
      setGameState(gameState);
      setPlayerColour(playerColours[nickname]);
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
    socket.emit('startGame', { gameType: 'lineFour', 'roomId': roomId });
  };

  const handleCloseDialog = (roomId) => {
    setOpenDialog(false);
    setGameStart(false);
    setGameState(initialGameState);
    setPlayerColour('');
    setCurrentTurn('');
    setGameDraw(false);
    setGameWon(false);
    setWinner('');
    socket.emit('restartGame', { gameType: 'lineFour', 'roomId': roomId });
  };

  const handlePlayAgain = (roomId) => {
    handleCloseDialog(roomId);
  };

  const handleCellClick = (col) => {
    // Check if the top cell of the selected column is empty and it's the player's turn
    if (gameState[0][col] === '' && gameStart && currentTurn === nickname) {
        const move = { col, player: playerColour };
        socket.emit('lineFourMove', { roomId, move });
    };
  };

  const chipColour = colourMap[playerColour.toLowerCase()] || '#666';

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
                    borderColor: gameDetails.colour,
                    backgroundColor: gameDetails.colour,
                    color: '#fff',
                },
              }}
            >
              Play Again?
            </Button>
        </Box>
      </Dialog>
      <Box sx={{ display: 'flex', flexDirection:'column' ,justifyContent: 'center', alignItems: 'center', width: '100%' }}>
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
                        borderColor: gameDetails.colour,
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
                    label={`${playerColour} (You)`}
                    style={{ backgroundColor: chipColour, color: '#fff', borderColor: chipColour }}
                    variant="outlined"
                  />
                </Typography>
              )
            }
        </Box>
        <Grid container spacing={1} justifyContent="center" alignItems="center" sx={{ maxWidth: 800, margin: 'auto', padding: 1 }}>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <Grid key={`row-${rowIndex}`} container item xs={16} spacing={1} justifyContent="center">
              {Array.from({ length: 7 }).map((_, colIndex) => (
                <Grid key={`cell-${rowIndex}-${colIndex}`} item xs={1}>
                  <Paper
                    elevation={3}
                    sx={{
                        width: '100%',
                        paddingTop: '100%',
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        minHeight: '20px',
                        minWidth: '20px',
                        backgroundImage: gameState[rowIndex]?.[colIndex] ? `url(/lineFour/${gameState[rowIndex][colIndex].toLowerCase()}.svg)` : 'none',
                        backgroundSize: '60%',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                    }}
                    onClick={() => handleCellClick(colIndex)}
                  />
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Box>  
    </>
  );
};

/**
 * LineFour: the main LineFour screen that handles switching between the description and 
 * game panes.
 */
const LineFour = () => {
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
          maxHeight: '100vh'
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
              image="/banners/line_four.svg"
              alt="Line Four"
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
              borderColor: "#33D9B2",
              marginTop: 2,
              paddingBottom: 2,
            }}
          >
            {roomJoined ?
              <LineFourGame
                roomId={roomId}
                room={room}
                nickname={nickname}
                socket={socket}
              />
              :
              <LineFourDescription
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

export default LineFour;