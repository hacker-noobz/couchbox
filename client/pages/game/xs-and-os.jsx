import { React, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, IconButton, CardMedia, Grid, Paper, TextField, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import io from 'socket.io-client';

const gameDetails = { name: 'Xs and Os', description: 'Simple naughts and crosses!', status: true, imageName: '/xs_os.svg', colour: '#25309B', detailedInfo: 'Tic-tac-toe, noughts and crosses, or Xs and Os is a paper-and-pencil game for two players who take turns marking the spaces in a three-by-three grid with X or O. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row is the winner.', numPlayers: '2'};
const gameRules = "The game is played on a grid that is 3 squares by 3 squares. One player is randomly selected as X and the other is O. Players take turns putting their marks in empty squares. The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner. When all 9 squares are full, the game is over. If no player has 3 marks in a row, the game ends in a tie."
const validRoomCode = false;

const socket = io('http://localhost:8000');

const XODescription = ({ nickname }) => {
    const [roomCode, setRoomCode] = useState("");
    const [room, setRoom] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        socket.on('roomCreated', ({ roomId, gameType }) => {
            setRoomCode(roomId);
            setRoom(true);
        });

        socket.on('roomJoined', roomId => {
            setRoom(true);
        });

        socket.on('error', message => {
            setAlertMessage(message);
            setAlertOpen(true);
        });

        return () => {
            socket.off('roomCreated');
            socket.off('roomJoined');
            socket.off('error');
        }
    }, []);

    const handleCreateRoom = () => {
        socket.emit('createRoom', { gameType: 'xsAndOs'});
    };

    const handleJoinRoom = (roomCode) => {
        if (roomCode) {
            socket.emit('joinRoom', roomCode);
        } else {
            setAlertMessage('Please enter a valid room code.');
            setAlertOpen(true);
        }
    };

    if (room) {
        // If the user has created or join a room, display the game page
        return <XOGame roomCode={roomCode} nickname={nickname} />
    }

    return (
        <>
            {alertOpen && (
                <Alert 
                    severity="error" 
                    onClose={() => setAlertOpen(false)}
                    sx={{ marginBottom: 2, borderRadius: "10px" }}
                >
                    {alertMessage}
                </Alert>
            )}
            <Box sx={{ padding: 3, gap: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2}}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon />
                        <Typography sx={{ ml: 1 }}>{`${gameDetails.numPlayers} player(s)`}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <InfoIcon sx={{ alignSelf: 'flex-start' }} />
                        <Typography>{gameRules}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Button
                        onClick={handleCreateRoom}
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
                    <Typography>OR</Typography>
                    <TextField
                        InputProps={{
                            endAdornment: (
                                <IconButton onClick={() => handleJoinRoom(roomCode)}>
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
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                    />
                </Box>
            </Box>
        </>
    );
};

const XOGame = ({ roomCode, nickname }) => {
    const handleCellClick = (row, col) => {
        console.log(`Clicked cell ${row}, ${col}`);
        // Here, you would handle the game logic
    };

    return (
        <>
            <Box sx={{ padding: 3, gap: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography>Room Code: {roomCode}</Typography>
                <Typography>Nickname: {nickname}</Typography>
            </Box>
            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ maxWidth: 300, margin: 'auto', padding: 3 }}>
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                <Grid key={rowIndex} container item xs={12} spacing={2} justifyContent="center">
                    {Array.from({ length: 3 }).map((_, colIndex) => (
                    <Grid key={`${rowIndex}-${colIndex}`} item xs={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                height: 100,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                        {/* Cell Content Here */}
                        </Paper>
                    </Grid>
                    ))}
                </Grid>
                ))}
            </Grid>
        </>
    );
};

const XsAndOs = () => {
    const router = useRouter();
    const { nickname: encodedNickname } = router.query;
    const nickname = decodeURIComponent(encodedNickname || 'captain_underpants');
    // Clicking home button
    const handleClick = () => {
        router.push({
          pathname: '/games',
          query: { nickname },
        });
    };

    return (
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
                <IconButton aria-label="home" size="large" onClick={handleClick} sx={{ position: 'absolute', left: 0 }}>
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
                }}
            >
                <XODescription nickname={nickname}/>
            </Box>
        </Box>
    );
};

export default XsAndOs;