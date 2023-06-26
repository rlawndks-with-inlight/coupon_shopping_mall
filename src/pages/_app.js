

import Head from 'next/head';
import '../../styles/globals.css'
import { SettingsProvider } from 'src/components/settings';

const App = (props) => {
  const { Component, pageProps } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <SettingsProvider>
        {getLayout(<Component {...pageProps} />)}
      </SettingsProvider>
    </>
  );
}
export default App
