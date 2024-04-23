import Head from 'next/head';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SocketProvider } from './socketProvider';

const theme = createTheme({
  typography: {
    fontFamily: '"JetBrains Mono", monospace',
  },
});

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>couchbox</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');
          `}
        </style>
      </Head>
      <SocketProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </SocketProvider>
    </>
  );
}
