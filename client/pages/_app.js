import Head from 'next/head';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SocketProvider } from '../contexts/socketProvider';
import { ApiProvider } from '../contexts/apiProvider';
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
      </Head>
      <SocketProvider>
        <ApiProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </ApiProvider>
      </SocketProvider>
    </>
  );
}
