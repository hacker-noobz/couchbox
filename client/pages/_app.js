import Head from 'next/head';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '../contexts/themeProvider';
import { SocketProvider } from '../contexts/socketProvider';
import { ApiProvider } from '../contexts/apiProvider';
import '../styles/styles.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>couchbox</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <SocketProvider>
        <ApiProvider>
          <ThemeProvider>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </ApiProvider>
      </SocketProvider>
    </>
  );
}
