import { React, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Chip, Dialog, DialogTitle, List, ListItem, ListItemText, Grid, IconButton, CardMedia, TextField, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import { useSocket } from '../../contexts/socketProvider';
import useRoomManager from '../../hooks/roomManager';
import PinIcon from '@mui/icons-material/Pin';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const gameDetails = { name: 'Password', description: 'Guess the password!', status: true, imageName: '/pass_word.svg', colour: '#FB587A', detailedInfo: 'In two teams, two rival wordmasters know the secret password and must provide clever clues to help their own team guess the password. However, they must not give away clues that are too obvious, to ensure that their team guesses it first!', numPlayers: '2-8'};
const gameRules = "Two teams have an elected clue giver and each team has turns guessing based on a clue given by the selected individual. The clue givers from both teams know the chosen word. The clues should be vague but not too obvious to the point where it can be easily guessed. The team to guess the word first wins!"

/**
 * PasswordDescription: information pane that contains rules about Password as well as functionality
 * options for the user to either create a room or join an existing room.
 * @param {string} nickname: the current user's nickname.
 * @param {Function} handleCreateRoom: function to handle creating a new room.
 * @param {Function} handleJoinRoom: function to join an existing room.
 */
 const PasswordDescription = ({ nickname, handleCreateRoom, handleJoinRoom }) => {
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
            onClick={() => handleCreateRoom('spyHunt')}
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
                    <IconButton onClick={() => handleJoinRoom(roomId, nickname, 'spyHunt')}>
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
 * PasswordGame: the game display pane that renders the Password game for users to play.
 * @param {string} roomId: the current id of the room.
 * @param {object} room: the room object containing details such as players, game state etc.
 * @param {string} nickname: the current user's nickname. 
 */
const PasswordGame = ({ roomId, room, nickname, socket }) => {
  const initialGameState = {
    password: '',
    clueMaster1: '',
    clueMaster2: '',
    team1: [],
    team2: [],
    log: []
  }
  const [gameStart, setGameStart] = useState(false);
  const [playerRole, setPlayerRole] = useState('');
  const [gameFinished, setGameFinished] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [currentTurn, setCurrentTurn] = useState('');
  const [gameState, setGameState] = useState(initialGameState);
  const [winner, setWinner] = useState('');
  const [message, setMessage] = useState('');
  const [log, setLog] = useState([]);
  const [team1, setTeam1] = useState([]);
  const [team2, setTeam2] = useState([]);
  const [clueMaster1, setClueMaster1] = useState('');
  const [clueMaster2, setClueMaster2] = useState('');

  useEffect(() => {
    socket.on('gameStarted', ({ gameState, currentTurn, password }) => {
      setLog([]);
      setOpenDialog(false);
      setGameStart(true);
      setGameFinished(false);
      setPassword(password);
      setCurrentTurn(currentTurn);
      setGameState(gameState);

      setTeam1(gameState.team1);
      setTeam2(gameState.team2);
      setClueMaster1(gameState.clueMaster1);
      setClueMaster2(gameState.clueMaster2);
      
      if (nickname === gameState.clueMaster1) {
        setPlayerRole('clueMaster');
      } else if (nickname === gameState.clueMaster2) {
        setPlayerRole('clueMaster');
      } else if (gameState.team1.includes(nickname)) {
        setPlayerRole('guesser');
      } else if (gameState.team2.includes(nickname)) {
        setPlayerRole('guesser');
      }
    });

    socket.on('moveMade', ({ gameState, currentTurn }) => {
      setGameState(gameState);
      setCurrentTurn(currentTurn);
      setLog(gameState.log);
    });

    socket.on('gameWon', winner => {
      setGameFinished(true);
      setWinner(winner);
      setOpenDialog(true);
    });

    return () => {
      socket.off('gameStarted');
      socket.off('moveMade');
    }
  }, [socket, nickname]);

  const handleStartGame = (roomId) => {
    socket.emit('startGame', { gameType: 'password', 'roomId': roomId });
  };

  const handleCloseDialog = (roomId) => {
    setOpenDialog(false);
    setGameStart(false);
    setGameFinished(false);
    setGameState(initialGameState);
    setPlayerRole('');
    setLog([]);
  };

  const handlePlayAgain = (roomId) => {
    handleCloseDialog(roomId);
  };

  const handleMessageSend = () => {
    if (message.trim() && gameStart) {
      const move = { player: nickname, data: message };
      socket.emit('passwordMove', { roomId, move });
      setMessage('');
    }
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
              <Box
                sx={{
                  padding: 3,
                  gap: 2,
                  display: 'flex',
                  flexDirection:'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "#FB587A",
                  marginBottom: 3,
                }}
              >
                {
                  (playerRole === 'clueMaster') && (
                    <Chip 
                      label={password}
                      icon={<PinIcon />}
                      variant="outlined"
                    />
                  )
                }
                <Typography component="div" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {`${currentTurn}'s Turn`}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {clueMaster1}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {clueMaster2}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'center' }}>
                    <Typography variant="body1">
                      {team1.length > 0 ? team1.join(', ') : 'No players yet'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'center' }}>
                    <Typography variant="body1">
                      {team2.length > 0 ? team2.join(', ') : 'No players yet'}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ width: '100%', mt: 3, bgcolor: 'background.paper', borderRadius: "10px", borderTop: "1px solid #ccc" }}>
                  <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'white' }}>
                    {log.map((item, index) => (
                      <ListItem key={index}>
                        {item.type === 'clue' && (
                          <QuestionMarkIcon 
                            sx={{
                              color: '#0F9BAF',
                            }}
                          />
                        )}
                        {item.type === 'guess' && (
                          <QuestionAnswerIcon 
                            sx={{
                              color: '#FE7492',
                            }}
                          />
                        )}
                        <ListItemText 
                          primary={`${item.player} (${item.team}):  ${item.message}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ display: 'flex', gap: 1, padding: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type a clue/guess!"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' ? handleMessageSend() : null}
                    />
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      sx={{ backgroundColor: '#0F9BAF', '&:hover': { backgroundColor: '#0a7080' } }}
                      onClick={handleMessageSend}
                    >
                      Send
                    </Button>
                  </Box>
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
 * Password: the main Password screen that handles switching between the description and 
 * game panes.
 */
const Password = () => {
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
              image="/banners/pass_word.svg"
              alt="Spy Hunt"
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
              borderColor: "#FB587A",
              marginTop: 2,
              paddingBottom: 2,
            }}
          >
            {roomJoined ?
              <PasswordGame
                roomId={roomId}
                room={room}
                nickname={nickname}
                socket={socket}
              />
              :
              <PasswordDescription
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

export default Password;