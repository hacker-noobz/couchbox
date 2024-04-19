import { React, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Chip, Typography, Grid, Card, CardContent, CardMedia, CardActionArea, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const games = [
    { name: 'Xs and Os', description: 'Simple naughts and crosses!', status: true, imageName: '/xs_os.svg', colour: '#25309B', detailedInfo: 'Tic-tac-toe, noughts and crosses, or Xs and Os is a paper-and-pencil game for two players who take turns marking the spaces in a three-by-three grid with X or O. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row is the winner.', numPlayers: '2'},
    { name: 'Spy Hunt', description: 'Find the Spy!', status: false, imageName: '/spy_hunt.svg', colour: '#783035', detailedInfo: 'In Spy Hunt one person is the spy (or two if you have many players) and the rest of the players are non-spies who receive a secret location. The players ask each other questions to figure out who does not know the location (and hence, is the spy).', numPlayers: '2-8'},
    { name: 'Password', description: 'Guess the password!', status: false, imageName: '/pass_word.svg', colour: '#C98D09', detailedInfo: 'In two teams, two rival wordmasters know the secret password and must provide clever clues to help their own team guess the password. However, they must not give away clues that are too obvious, to ensure that their team guesses it first!', numPlayers: '2-8'},
    { name: 'Code Words', description: 'Find the code words!', status: false, imageName: '/code_words.svg', colour: '#963D41', detailedInfo: 'Two rival spymasters know the secret identities of 25 agents. Their teammates know the agents only by their codenames. To win the game, your team will need to contact all of your agents in the field before the other team finds their own agents. And watch out for the assassin – meet him in the field and your team is done!', numPlayers: '2-8'},
    { name: 'Line Four', description: 'Connect Four!', status: false, imageName: '/line_four.svg', colour: '#33D9B2', detailedInfo: 'Two rival players go head to head dropping tokens in a grid, fighting to be the first to form a horizontal, vertical or diagonal line of four.', numPlayers: '2'},
];

const Games = () => {
    const router = useRouter();
    const nickname = router.query;
    const [openDialog, setOpenDialog] = useState(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Clicking home button
    const handleClick = () => {
        router.push({
          pathname: '/',
        });
    };

    // Clicking on a game
    const handleClickOpenDialog = (gameName) => {
        setOpenDialog(gameName);
    }
    const handleCloseDialog = () => {
        setOpenDialog(null);
        setAlertOpen(false);
    }

    // Clicking play
    const handleClickPlay = (game) => {
        if (game.status) {
            const gamePath = `/game/${game.name.replace(/\s+/g, '-').toLowerCase()}?nickname=${encodeURIComponent(nickname.nickname || '')}`;
            router.push(gamePath);
        } else {
            setAlertMessage('Sorry this game is currently unavailable.');
            setAlertOpen(true);
        }
    }
    // Retrieve games

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <IconButton aria-label="home" size="large" onClick={handleClick}>
                    <HomeIcon fontSize="inherit"/>
                </IconButton>
                
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#66509F',
                    }}
                    >
                    Available Games
                </Typography>
                <Box sx={{ width: 48, height: 48 }}/>
            </Box>
            
            <Grid container spacing={4}>
                {games.map((game, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ "&:hover": { boxShadow: 8 } }}>
                        <CardActionArea onClick={() => handleClickOpenDialog(game.name)}>
                            <CardMedia
                            component="img"
                            height="140"
                            image={`/logos${game.imageName}`}
                            alt={game.name}
                            sx={{
                                objectFit: 'contain',
                            }}
                            />
                            <CardContent>
                            <Typography gutterBottom variant="h5" component="div" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {game.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {game.description}
                            </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    <Dialog open={openDialog === game.name} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                        {alertOpen && (
                            <Alert 
                                severity="error" 
                                onClose={() => setAlertOpen(false)}
                                sx={{ marginBottom: 2 }}
                            >
                                {alertMessage}
                            </Alert>
                        )}
                        <Box sx={{ padding: 2 }}>
                            {
                                !game.status && (
                                <Chip label="Coming Soon!" color="secondary"/>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', gap: 1 }}>
                                <DialogTitle sx={{ flex: 1 }}>{game.name}</DialogTitle>
                                <PeopleIcon />
                                <DialogContentText>
                                    {game.numPlayers} player(s)
                                </DialogContentText>
                            </Box>
                            <DialogContent>
                                <DialogContentText>
                                    {game.detailedInfo}
                                </DialogContentText>
                            </DialogContent>
                            <Button
                                fullWidth
                                variant="contained"
                                endIcon={<PlayCircleOutlineIcon />}
                                sx={{
                                    mt: 2,
                                    backgroundColor: '#66509F',
                                    '&:hover': {
                                        backgroundColor: '#56427C',
                                    },
                                }}
                                onClick={() => handleClickPlay(game)}
                            >
                                Play
                            </Button>
                        </Box>
                    </Dialog>
                </Grid>
                ))}
            </Grid>
        </Box>
      );
};

export default Games;