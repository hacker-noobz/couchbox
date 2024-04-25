import { React, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Chip, Typography, Grid, Card, CardContent, CardMedia, CardActionArea, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useApi } from '../contexts/apiProvider';

/**
 * Games: main landing page for all games available to be played.
 * @returns 
 */
const Games = () => {
  const router = useRouter();
  const nickname = router.query;
  const { get } = useApi();
  const [games, setGames] = useState([]);
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

  // Handles closing the game information dialog
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
  
  useEffect(() => {
    get('list_games')
      .then(setGames)
      .catch(console.error);
  }, []);

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