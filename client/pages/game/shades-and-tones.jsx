import { React, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Chip, Dialog, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  Grid, IconButton, CardMedia, Paper, TextField, Tooltip, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import { useSocket } from '../../contexts/socketProvider';
import useRoomManager from '../../hooks/roomManager';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import SportsScoreIcon from '@mui/icons-material/SportsScore';

// Components
import Scoreboard from '@/components/shadesAndTones/Scoreboard';
import ColourGrid from '@/components/shadesAndTones/ColourGrid';

const gameDetails = { name: 'Shades and Tones', description: 'Connect colours to words!', status: true, imageName: '/shades_tones.svg', colour: '#FFAA64', detailedInfo: 'Using only one and two-word cues, players try to get others to guess a specific hue from the 480 colors on the game board. The closer the guesses are to the target, the more points you earn.', numPlayers: '2-8'};
const gameRules = "First, a “cue giver” hides a specific color they’ve chosen out of a deck of cards. There are 480 shades on the board in front of you! After getting one- and two-word cues, everyone places their marker on which color they think is being described. “Coffee.” Is it dark brown, as in freshly brewed? “Au lait.” With milk. That means I should pick a lighter shade!"

/**
 * ShadesAndTonesDescription: information pane that contains rules about Shades and Tones as well as functionality
 * options for the user to either create a room or join an existing room.
 * @param {string} nickname: the current user's nickname.
 * @param {Function} handleCreateRoom: function to handle creating a new room.
 * @param {Function} handleJoinRoom: function to join an existing room.
 */
 const ShadesAndTonesDescription = ({ nickname, handleCreateRoom, handleJoinRoom }) => {
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
            onClick={() => handleCreateRoom('shadesAndTones')}
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
                    <IconButton onClick={() => handleJoinRoom(roomId, nickname, 'shadesAndTones')}>
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
 * ShadesAndTonesGame: the game display pane that renders the Shades and Tones game for users to play.
 * @param {string} roomId: the current id of the room.
 * @param {object} room: the room object containing details such as players, game state etc.
 * @param {string} nickname: the current user's nickname. 
 */
const ShadesAndTonesGame = ({ roomId, room, nickname, socket }) => {
  const initialGameState = {
    colourGrid: [],
    currentColour: '',
    clueMaster: '',
    currentTurn: '',
    scores: {},
    clues: [],
  }
  const [gameStart, setGameStart] = useState(false);
  const [clueMaster, setClueMaster] = useState('');
  const [gameFinished, setGameFinished] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentColour, setCurrentColour] = useState('');
  const [colourGrid, setColourGrid] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('');
  const [turnOrder, setTurnOrder] = useState([]);
  const [gameState, setGameState] = useState(initialGameState);
  const [winner, setWinner] = useState('');
  const [scores, setScores] = useState({});
  const [clues, setClues] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [round, setRound] = useState(1);
  const [numRounds, setNumRounds] = useState(0);
  const [selectedColour, setSelectedColour] = useState('');
  const [selectedRow, setSelectedRow] = useState('');
  const [selectedCol, setSelectedCol] = useState('');
  const [message, setMessage] = useState('');
  const [scoreOpen, setScoreOpen] = useState(false);

  useEffect(() => {
    socket.on('gameStarted', ({ gameState, currentTurn, currentColour, colourGrid }) => {
      console.log('game started');
      setOpenDialog(false);
      setGameStart(true);
      setGameFinished(false);
      
      setGameState(gameState);
      setClueMaster(gameState.clueMaster);
      setCurrentTurn(currentTurn);
      setTurnOrder(gameState.turnOrder);
      setCurrentColour(currentColour);
      setColourGrid(colourGrid);

      setScores(gameState.scores);
      setClues(gameState.clues);
      setGuesses(gameState.guesses);
      setRound(gameState.round);
      setNumRounds(gameState.numRounds);
    });

    socket.on('moveMade', ({ gameState, currentTurn }) => {
      setGameState(gameState);
      setCurrentTurn(currentTurn);
      setClues(gameState.clues);
      setGuesses(gameState.guesses);
    });

    socket.on('newRound', ({ gameState, currentTurn }) => {
      handleOpenScores();
      setGameState(gameState);
      setCurrentTurn(currentTurn);
      setScores(gameState.scores);
      setClues(gameState.clues);
      setGuesses(gameState.guesses);
      setRound(gameState.round);
      setClueMaster(gameState.clueMaster);
      setTurnOrder(gameState.turnOrder);
      setCurrentColour(gameState.currentColour);
    })

    socket.on('gameOver', ({ winner, scores }) => {
      setGameFinished(true);
      setWinner(winner);
      setScores(scores);
      setOpenDialog(true);
    });

    return () => {
      socket.off('gameStarted');
      socket.off('moveMade');
      socket.off('newRound');
      socket.off('gameOver');
    }
  }, [socket, nickname]);

  const handleStartGame = (roomId) => {
    socket.emit('startGame', { gameType: 'shadesAndTones', 'roomId': roomId });
  };

  const handleCloseDialog = (roomId) => {
    setOpenDialog(false);
    setGameStart(false);
    setGameFinished(false);
    setGameState(initialGameState);
  };

  const handlePlayAgain = (roomId) => {
    handleCloseDialog(roomId);
  };

  const handleClickColour = (colour, rowIndex, colourIndex) => {
    setSelectedColour(colour);
    setSelectedRow(rowIndex);
    setSelectedCol(colourIndex);
  };

  const handleGuessSubmit = () => {
    const data = {
      colour: selectedColour,
      row: selectedRow,
      col: selectedCol,
    };
    const move = { player: nickname, data: data }
    socket.emit('shadesAndTonesMove', { roomId, move });
    setSelectedColour('');
    setSelectedRow('');
    setSelectedCol('');
  };

  const handleMessageSend = () => {
    const move = { player: nickname, data: message };
    socket.emit('shadesAndTonesMove', { roomId, move });
    setMessage('');
  };

  const handleOpenScores = () => {
    setScoreOpen(true);
  };

  const handleCloseScores = () => {
    setScoreOpen(false);
  };

  const getGuessInitial = (row, col) => {
    const found = guesses.find(guess => guess.guess.colour === colourGrid[row][col] && guess.guess.row === row && guess.guess.col === col);
    return found ? found.player[0].toUpperCase() : '';
  };

  return (
    <>
      <Dialog open={gameFinished} onClose={() => handleCloseDialog(roomId)} maxWidth="sm" fullWidth>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, padding: 3 }}>
            <DialogTitle sx={{ flex: 1 }}>🎉 {winner} Won 🎉</DialogTitle>
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
            <Scoreboard scores={scores} />
        </Box>
      </Dialog>
      <Dialog open={scoreOpen} onClose={() => handleCloseScores()} maxWidth="sm" fullWidth>
        <Scoreboard scores={scores} />
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
              <Box display='flex' flexDirection='row' >
                <ColourGrid colourGrid={colourGrid} getGuessInitial={getGuessInitial} handleClickColour={handleClickColour} />
                <Box flex={1} display='flex' flexDirection='column' justifyContent='center' alignItems='center' gap={2}>
                  <Box display='flex' flexDirection='row' justifyContent='center' alignItems='center' gap={2}>
                    <Chip 
                      label={clueMaster}
                      icon={<PsychologyAltIcon />}
                      variant="outlined"
                    />
                    <Chip 
                      label={currentTurn}
                      icon={<RotateRightIcon />}
                      variant="outlined"
                    />
                    <Chip
                      label='Score'
                      icon={<SportsScoreIcon />}
                      variant="outlined"
                      onClick={() => {handleOpenScores()}}
                    />
                  </Box>
                  {
                    clueMaster === nickname && (
                      <Box display='flex' flexDirection='row' alignItems='center' gap={2}>
                        <Typography>
                          The chosen colour is
                        </Typography>
                        <Tooltip title={currentColour} placement="top" enterDelay={300} leaveDelay={200}>
                          <Box
                            sx={{
                              backgroundColor: currentColour,
                              width: '20px',
                              height: '20px',
                              border: '1px solid black',
                            }}
                          />
                        </Tooltip>
                      </Box>
                    )
                  }
                  {
                    clues.length > 0 && (
                      <Box
                        sx={{
                          borderRadius: "10px",
                          border: "1px solid",
                          borderColor: gameDetails.colour,
                          padding: '10px'
                        }}
                      >   
                        <Typography>
                          Clues: {clues.join(',')}
                        </Typography>
                      </Box>
                    )
                  }
                  {
                    guesses.length > 0 && (
                      <Box
                        display='flex'
                        flexDirection='column'
                        alignItems='center'
                        gap={2}
                        sx={{
                          borderRadius: "10px",
                          border: "1px solid",
                          borderColor: gameDetails.colour,
                          padding: '10px'
                        }}
                      >
                        {guesses.map((guess, index) => (
                          <Box key={index} display='flex' flexDirection='row' alignItems='center' gap={1}>
                            <Typography>
                              {guess.player} guessed
                            </Typography>
                            <Tooltip title={guess.guess.colour} placement="top" enterDelay={300} leaveDelay={200}>
                              <Box
                                sx={{
                                  backgroundColor: guess.guess.colour,
                                  width: '20px',
                                  height: '20px',
                                  border: '1px solid black',
                                }}
                              />
                            </Tooltip>
                          </Box>
                        ))}
                      </Box>
                    )
                  }
                  {
                    clueMaster !== nickname && (
                      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' gap={1}>
                        <Box display='flex' flexDirection='row' alignItems='center' gap={2}>
                          <Typography>
                            You have selected
                          </Typography>
                          <Tooltip title={selectedColour} placement="top" enterDelay={300} leaveDelay={200}>
                            <Box
                              sx={{
                                backgroundColor: selectedColour,
                                width: '20px',
                                height: '20px',
                                border: '1px solid black',
                              }}
                            />
                          </Tooltip>
                        </Box>
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: gameDetails.colour,
                            '&:hover': { backgroundColor: '#FFC085' }
                          }}
                          disabled={currentTurn !== nickname && selectedColour === ''}
                          onClick={handleGuessSubmit}
                        >
                          Submit
                        </Button>
                      </Box>
                    )
                  }
                  {
                    clueMaster === nickname && (
                      <Box sx={{ display: 'flex', gap: 1, padding: 2 }}>
                        <TextField
                          size="small"
                          fullWidth
                          variant="outlined"
                          placeholder="Type a clue!"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' ? handleMessageSend() : null}
                        />
                        <Button
                          variant="contained"
                          endIcon={<SendIcon />}
                          sx={{ backgroundColor: gameDetails.colour, '&:hover': { backgroundColor: '#FFC085' } }}
                          onClick={handleMessageSend}
                          disabled={currentTurn !== nickname}
                        >
                          Send
                        </Button>
                      </Box>
                    )
                  }
                </Box>
              </Box>
            )
          }
        </Box>
      </Box>  
    </>
  );
};

/**
 * ShadesAndTones: the main Shades and Tones screen that handles switching between the description and 
 * game panes.
 */
const ShadesAndTones = () => {
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
              image="/banners/shades_tones.svg"
              alt="Shades and Tones"
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
              borderColor: "#FFAA64",
              marginTop: 2,
              paddingBottom: 2,
            }}
          >
            {roomJoined ?
              <ShadesAndTonesGame
                roomId={roomId}
                room={room}
                nickname={nickname}
                socket={socket}
              />
              :
              <ShadesAndTonesDescription
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

export default ShadesAndTones;