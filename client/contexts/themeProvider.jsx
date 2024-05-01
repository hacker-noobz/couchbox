// contexts/themeProvider.jsx
import { createContext, useContext } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, responsiveFontSizes } from '@mui/material';

let theme = createTheme({
  typography: {
    fontFamily: '"JetBrains Mono", monospace',
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    }
  },
});

theme = responsiveFontSizes(theme, {
  breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
  factor: 2,
});

theme = createTheme(theme, {
  typography: {
    body1: {
      [theme.breakpoints.up('sm')]: {
        fontSize: '1rem',
      },
      [theme.breakpoints.up('md')]: {
        fontSize: '1.125rem',
      },
    },
  },
});



const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  return (
    <MUIThemeProvider theme={theme}>
      {children}
    </MUIThemeProvider>
  );
}
