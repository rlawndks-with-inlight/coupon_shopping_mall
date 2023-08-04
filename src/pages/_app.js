

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
import { ModalProvider } from 'src/components/dialog/ModalProvider';

const App = (props) => {
  const { Component, pageProps, head_data, host, ctx } = props;
  const getLayout = Component.getLayout ?? ((page) => page);

  useEffect(() => {
    console.log(head_data)
    console.log(host)
    console.log(ctx)
  }, [])
  return (
    <>
      <Head>
        <title>{head_data?.name}</title>
        <meta
          name='description'
          content={head_data?.og_description}
        />
        <link rel='shortcut icon' href={head_data?.favicon_img} />
        <link rel="apple-touch-icon" sizes="180x180" href={head_data?.favicon_img} />
        <meta name='keywords' content={head_data?.name} />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={head_data?.name} />
        <meta property="og:image" content={head_data?.og_img} />
        <meta property="og:url" content={'https://' + head_data?.dns} />
        <meta property="og:description" content={head_data?.og_description} />
        <meta name="author" content="purplevery" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={head_data?.name} />
        <meta name="theme-color" content={head_data?.theme_css?.main_color} />
      </Head>
      <AuthProvider>
        <ReduxProvider store={store}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeColorPresets>
              <ThemeContrast>
                <SettingsProvider>
                  <MotionLazyContainer>
                    <ThemeProvider>
                      <ModalProvider>
                        {getLayout(<Component {...pageProps} />)}
                      </ModalProvider>
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
App.getInitialProps = async ({ ctx }) => {
  try {
    let head_data = {}
    const host = ctx.req ? ctx.req.headers.host.split(':')[0] : '';
    const url = `${process.env.BACK_URL}/api/v1/auth/domain?dns=${host}`;
    const res = await fetch(url);
    head_data = await res.json();
    return {
      head_data: head_data,
      host,
    }
  } catch (err) {
    console.log(err)
    return {
      head_data: {},
    }
  }

};
export default App
