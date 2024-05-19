import React from 'react';
import { Box, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function Scoreboard({ scores }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, padding: 3 }}>
      <DialogTitle sx={{ flex: 1 }}>💯 Scoreboard 💯</DialogTitle>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 300 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(scores).map(([playerName, score], index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {playerName}
                </TableCell>
                <TableCell align="right">{score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Scoreboard;
