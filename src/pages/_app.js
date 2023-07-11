

import Head from 'next/head';
import '../../styles/globals.css'
import { SettingsProvider, useSettingsContext } from 'src/components/settings';
import ThemeColorPresets from 'src/components/settings/ThemeColorPresets';
import ThemeProvider from 'src/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../redux/store';
// editor
import 'react-quill/dist/quill.snow.css';

// slick-carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from 'src/layouts/manager/auth/JwtContext';
import NextNProgress from 'nextjs-progressbar';
import { useEffect } from 'react';
import ThemeContrast from 'src/components/settings/ThemeContrast';
import { MotionLazyContainer } from 'src/components/animate';

const App = (props) => {
  const { Component, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <AuthProvider>
        <ReduxProvider store={store}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeColorPresets>
              <ThemeContrast>
                <SettingsProvider>
                <MotionLazyContainer>
                  <ThemeProvider>
                    {getLayout(<Component {...pageProps} />)}
                    <Toaster position={'right-top'} toastOptions={{ className: 'react-hot-toast' }} />
                  </ThemeProvider>
                  </MotionLazyContainer>
                </SettingsProvider>
              </ThemeContrast>
            </ThemeColorPresets>
          </LocalizationProvider>
        </ReduxProvider>
      </AuthProvider>
    </>
  );
}
export default App
