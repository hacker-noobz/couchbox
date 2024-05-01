import { React, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Chip, Dialog, DialogTitle, List, ListItem, ListItemText, IconButton, CardMedia, Grid, Paper, TextField, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import { useSocket } from '../../contexts/socketProvider';
import useRoomManager from '../../hooks/roomManager';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import FaceIcon from '@mui/icons-material/Face';
import ExploreIcon from '@mui/icons-material/Explore';
import { useApi } from '../../contexts/apiProvider';

const gameDetails = { name: 'Spy Hunt', description: 'Find the Spy!', status: true, imageName: '/spy_hunt.svg', colour: '#D88A2F', detailedInfo: 'In Spy Hunt one person is the spy (or two if you have many players) and the rest of the players are non-spies who receive a secret location. The players ask each other questions to figure out who does not know the location (and hence, is the spy).', numPlayers: '4-8'};
const gameRules = "In Spy Hunt, there are two teams: the spy the detectives. In a span of 8 minutes, each player is given a location and role except the spy. Through multiple rounds of questioning, the detectives will try to figure out who the spy is and the spy will attempt to guess the location through inference."


/**
 * SpyHuntDescription: information pane that contains rules about Spy Hunt as well as functionality
 * options for the user to either create a room or join an existing room.
 * @param {string} nickname: the current user's nickname.
 * @param {Function} handleCreateRoom: function to handle creating a new room.
 * @param {Function} handleJoinRoom: function to join an existing room.
 */
 const SpyHuntDescription = ({ nickname, handleCreateRoom, handleJoinRoom }) => {
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
 * CountdownTimer: functionality associated with the countdown timer for the game.
 * @param {boolean} gameStart: boolean value of whether the game has started.
 * @param {Function} setGameFinished: function to set if the game is finished.
 * @param {Integer} initialCount: the initial countdown value.
 * @returns 
 */
const CountdownTimer = ({ gameStart, setGameFinished, initialCount = 480 }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialCount);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let intervalId;

    if (gameStart && timerActive) {
      intervalId = setInterval(() => {
        setSecondsRemaining(seconds => {
          if (seconds - 1 === 0) {
            clearInterval(intervalId);
            setGameFinished(true);
            setTimerActive(false);
            return initialCount;
          }
          return seconds - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [gameStart, timerActive]);

  useEffect(() => {
    if (gameStart) {
      setSecondsRemaining(initialCount);
      setTimerActive(true);
    } else {
      setSecondsRemaining(initialCount);
      setTimerActive(false);
    }
  }, [gameStart, initialCount]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Box sx={{ padding: 2, textAlign: 'center' }}>
      <Typography variant="h6">
          Time Remaining: {formatTime(secondsRemaining)}
      </Typography>
    </Box>
  );
};

/**
 * LocationDialog: the dialog screen for the possible locations for the game.
 * @param {boolean} openLocationDialog: boolean value to determine whether the dialog is open.
 * @param {Function} handleCloseLocationDialog: function to handle closing the dialog.
 * @param {object} locations: the object of possible locations.
 * @returns 
 */
const LocationDialog = ({ openLocationDialog, handleCloseLocationDialog, locations }) => {
  const [crossedOutLocations, setCrossedOutLocations] = useState(new Set());

  const toggleLocation = (location) => {
    setCrossedOutLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(location)) {
        newSet.delete(location);
      } else {
        newSet.add(location);
      }
      return newSet;
    });
  };

  return (
    <Dialog open={openLocationDialog} onClose={handleCloseLocationDialog} maxWidth="sm" fullWidth>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, padding: 3 }}>
        <List>
          {locations.map((location, index) => (
            <ListItem 
              key={index} 
              button 
              onClick={() => toggleLocation(location)}
              sx={{ 
                textDecoration: crossedOutLocations.has(location) ? 'line-through' : 'none' 
              }}
            >
              <ListItemText primary={location} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Dialog>
  );
};

/**
 * SpyHuntGame: the game display pane that renders the Spy Hunt game for users to play.
 * @param {string} roomId: the current id of the room.
 * @param {object} room: the room object containing details such as players, game state etc.
 * @param {string} nickname: the current user's nickname. 
 */
const SpyHuntGame = ({ roomId, room, nickname, socket }) => {
  const { get } = useApi();
  const [gameState, setGameState] = useState({});
  const [gameStart, setGameStart] = useState(false);
  const [playerRole, setPlayerRole] = useState('');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);

  useEffect(() => {
    socket.on('gameStarted', ({ gameState, spy, location }) => {
      setOpenDialog(false);
      setGameState(gameState);
      setPlayerRole(gameState[nickname]);
      setLocation(location)
      setGameStart(true);
      setGameFinished(false);
    });

    return () => {
      socket.off('gameStarted');
    }
  }, [socket, nickname]);

  useEffect(() => {
    get('/api/spy_hunt/locations')
      .then(setLocations)
      .catch(console.error);
  }, []);

  const handleStartGame = (roomId) => {
    socket.emit('startGame', { gameType: 'spyHunt', 'roomId': roomId });
  };

  const handleCloseDialog = (roomId) => {
    setOpenDialog(false);
    setGameStart(false);
    setGameFinished(false);
    setGameState({});
    setPlayerRole('');
  };

  const handlePlayAgain = (roomId) => {
    handleCloseDialog(roomId);
  };

  const handleClickLocation = () => {
    setOpenLocationDialog(true);
  }
  
  const handleCloseLocationDialog = () => {
    setOpenLocationDialog(false);
  }

  const chipColour = playerRole !== 'Spy' ? '#D88A2F' : '#1E0B18';

  return (
    <>
      <Dialog open={gameFinished} onClose={() => handleCloseDialog(roomId)} maxWidth="sm" fullWidth>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, padding: 3 }}>
            <DialogTitle sx={{ flex: 1 }}>🥸 Game Finished! Who was the Spy? 🥸</DialogTitle>
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
      <LocationDialog openLocationDialog={openLocationDialog} handleCloseLocationDialog={handleCloseLocationDialog} locations={locations} />
      <Box sx={{ display: 'flex', flexDirection:'column' ,justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Box sx={{ padding: 3, gap: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography>Room Code: {roomId}</Typography>
          <Typography>Players: {room.players.join(',')}</Typography>
          <Chip icon={<LocationOnIcon />} label="Locations" variant="outlined" onClick={handleClickLocation} />
          <CountdownTimer gameStart={gameStart} setGameFinished={setGameFinished} />
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
              <Box sx={{ padding: 3, gap: 2, display: 'flex', flexDirection:'column' ,justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                {
                  !(playerRole === 'Spy') && (
                    <Chip 
                      label={location}
                      icon={<ExploreIcon />}
                      style={{ borderColor: chipColour }}
                      variant="outlined"
                    />
                  )
                }
                <Chip 
                  label={playerRole}
                  icon={playerRole === 'Spy' ? <GppMaybeIcon /> : <FaceIcon />}
                  style={{ borderColor: chipColour }}
                  variant="outlined"
                />
              </Box>
            )
          }
        </Box>
      </Box>  
    </>
  );
};

/**
 * SpyHunt: the main SpyHunt screen that handles switching between the description and 
 * game panes.
 */
const SpyHunt = () => {
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
              image="/banners/spy_hunt.svg"
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
              borderColor: "#D88A2F",
              marginTop: 2,
              paddingBottom: 2,
            }}
          >
            {roomJoined ?
              <SpyHuntGame
                roomId={roomId}
                room={room}
                nickname={nickname}
                socket={socket}
              />
              :
              <SpyHuntDescription
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

export default SpyHunt;