

import Head from 'next/head';
import '../../styles/globals.css'
import { SettingsProvider } from 'src/components/settings';
import ThemeColorPresets from 'src/components/settings/ThemeColorPresets';
import ThemeProvider from 'src/theme';

const App = (props) => {
  const { Component, pageProps } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeColorPresets>
        <SettingsProvider>
          <ThemeProvider>
          {getLayout(<Component {...pageProps} />)}
          </ThemeProvider>
        </SettingsProvider>
      </ThemeColorPresets>
    </>
  );
}
export default App
