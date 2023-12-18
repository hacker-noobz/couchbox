import { Box, IconButton, TextField } from "@mui/material";
import Image from 'next/image';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function Home() {
  return (
    <>
      <Box display="flex" minHeight={"90vh"} alignItems="center" justifyContent="center" flexDirection={"column"}>
        <Image 
          src="/couchbox.svg"
          alt="couchbox"
          width={500}
          height={300}
        />
        <TextField
          InputProps={{endAdornment: <IconButton><ArrowForwardIosIcon /></IconButton>}}
          label={"Nickname"}
          color="secondary"
        />
      </Box>
    </>
  )
}
