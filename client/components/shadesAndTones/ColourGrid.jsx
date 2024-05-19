import React from 'react';
import { Box, Grid, Button } from '@mui/material';

function ColourGrid({ colourGrid, getGuessInitial, handleClickColour }) {
  return (
    <Box flex={1}>
      <Grid container style={{ maxWidth: '100vw', margin: 0 }} spacing={0}>
        {colourGrid.map((row, rowIndex) => (
          <Grid key={rowIndex} item xs={12} style={{ padding: 0, margin: 0 }} container spacing={0}>
            {row.map((colour, colourIndex) => {
              const initial = getGuessInitial(rowIndex, colourIndex);
              const isGuessed = initial !== '';

              return (
                <Grid key={colourIndex} item xs style={{ padding: 0, margin: 0, height: '20px', flexGrow: 1, minWidth: '10px', maxWidth: '20px' }}>
                  <Button
                    style={{
                      backgroundColor: colour,
                      width: '100%',
                      height: '100%',
                      minWidth: 0,
                      padding: 0,
                      borderRadius: 0,
                      position: 'relative',
                    }}
                    disabled={isGuessed}
                    onClick={() => handleClickColour(colour, rowIndex, colourIndex)}
                  >
                    {isGuessed && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        pointerEvents: 'none',
                      }}>
                        {initial}
                      </span>
                    )}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ColourGrid;
