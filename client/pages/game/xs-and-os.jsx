import { React, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, IconButton, CardMedia, TextField, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';

const gameDetails = { name: 'Xs and Os', description: 'Simple naughts and crosses!', status: true, imageName: '/xs_os.svg', colour: '#25309B', detailedInfo: 'Tic-tac-toe, noughts and crosses, or Xs and Os is a paper-and-pencil game for two players who take turns marking the spaces in a three-by-three grid with X or O. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row is the winner.', numPlayers: '2'};
const gameRules = "The game is played on a grid that is 3 squares by 3 squares. One player is randomly selected as X and the other is O. Players take turns putting their marks in empty squares. The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner. When all 9 squares are full, the game is over. If no player has 3 marks in a row, the game ends in a tie."
const validRoomCode = false;

const XODescription = () => {
    const [roomCode, setRoomCode] = useState("");
    const [room, setRoom] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleCreateRoom = () => {
        setRoom(true);
        setRoomCode("abc-def");
    };
    const handleJoinRoom = (roomCode) => {
        if (!validRoomCode) {
            setAlertMessage('Invalid room code!');
            setAlertOpen(true);
        } else {
            setRoom(true);
        }
    };

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
                                <IconButton onClick={handleJoinRoom}>
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
                <XODescription />
            </Box>
        </Box>
    );
};

export default XsAndOs;