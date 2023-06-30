

import Head from 'next/head';
import '../../styles/globals.css'
import { SettingsProvider } from 'src/components/settings';
import ThemeColorPresets from 'src/components/settings/ThemeColorPresets';
import ThemeProvider from 'src/theme';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

// editor
import 'react-quill/dist/quill.snow.css';

// slick-carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from 'src/layouts/manager/auth/JwtContext';
const App = (props) => {
  const { Component, pageProps } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <AuthProvider>
        <ThemeColorPresets>
          <SettingsProvider>
            <ThemeProvider>
                {getLayout(<Component {...pageProps} />)}
              <Toaster position={'right-top'} toastOptions={{ className: 'react-hot-toast' }} />
            </ThemeProvider>
          </SettingsProvider>
        </ThemeColorPresets>
      </AuthProvider>

    </>
  );
}
export default App
