import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, IconButton, TextField, Grid, Paper } from "@mui/material";
import Image from 'next/image';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

export default function Home() {
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  // Handle when the user clicks to go to the next page
  const handleClick = () => {
    router.push({
      pathname: '/games',
      query: { nickname },
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && nickname.trim()) {
      handleClick();
    }
  };

  return (
    <Box display="flex" minHeight="100vh" flexDirection="column" justifyContent="flex-start">
      <Box flexGrow={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Image 
          src="/couchbox.svg"
          alt="couchbox"
          width={500}
          height={300}
          className='bouncing'
        />
        <TextField
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={handleClick}
                disabled={!nickname.trim()}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            ),
          }}
          label="Nickname"
          color="secondary"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ width: '100%', marginTop: 2 }}>
          {['shades_tones', 'line_four', 'pass_word', 'spy_hunt', 'where_wolf', 'xs_os'].map((logo, index) => (
            <Grid item key={index}>
              <Box sx={{
                opacity: 0.3,
                transition: 'opacity 0.3s ease',
                '&:hover': { opacity: 1 },
                height: { xs: '50px', sm: '100px' },
                width: { xs: '50px', sm: '100px' }
              }}>
                <Image src={`/logos/${logo}.svg`} alt={`${logo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`} width={100} height={100} layout="intrinsic" />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box textAlign="center" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Avatar alt="Hacker Noobz" src="/hackernoobz.svg" sx={{ width: 56, height: 56 }}/>
        <Typography variant="overline" display="block" gutterBottom>
          Created by Hacker Noobz
        </Typography>
      </Box>
    </Box>
  );
}
