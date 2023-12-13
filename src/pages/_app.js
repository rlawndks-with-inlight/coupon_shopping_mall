import Head from 'next/head'
import '../../styles/globals.css'
import { SettingsProvider, useSettingsContext } from 'src/components/settings'
import ThemeColorPresets from 'src/components/settings/ThemeColorPresets'
import ThemeProvider from 'src/theme'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from '../redux/store'
import { CacheProvider } from '@emotion/react';
// editor
import 'react-quill/dist/quill.snow.css'

// slick-carousel
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
//react-cards
import 'react-credit-cards/es/styles-compiled.css'

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from 'src/layouts/manager/auth/JwtContext'
import { useEffect } from 'react'
import ThemeContrast from 'src/components/settings/ThemeContrast'
import { MotionLazyContainer } from 'src/components/animate'
import { ModalProvider } from 'src/components/dialog/ModalProvider'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { getLocalStorage } from 'src/utils/local-storage'
import ThemeLocalization from 'src/locales/ThemeLocalization'
import ThemeRtlLayout from 'src/components/settings/ThemeRtlLayout';
import createEmotionCache from '../utils/createEmotionCache';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from 'src/locales/i18n';
import { allLangs } from 'src/locales'

const clientSideEmotionCache = createEmotionCache();

const App = props => {
  const { Component, pageProps, head_data = {}, emotionCache = clientSideEmotionCache } = props
  const getLayout = Component.getLayout ?? (page => page)

  const router = useRouter();
  const [headData, setHeadData] = useState({})
  useEffect(() => {
    if (Object.keys(head_data).length > 0) {
      if (!allLangs.map(itm => {
        return itm.value
      }).includes(localStorage.getItem('i18nextLng'))) {
        localStorage.setItem(`i18nextLng`, head_data?.setting_obj?.default_lang || 'ko')
      }
      setHeadData(head_data)
    }
  }, [])
  useEffect(() => {
    let route_list = router.asPath.split('/');
    let is_normal_page = true;
    if (route_list[1] == 'shop' && route_list[2] == 'item' && !isNaN(parseInt(route_list[3]))) {
      is_normal_page = false;
    }
    if (route_list[1] == 'shop' && route_list[2] == 'service' && !isNaN(parseInt(route_list[3])) && !isNaN(parseInt(route_list[4]))) {
      is_normal_page = false;
    }
    if (route_list[1] == 'shop' && route_list[2] == 'seller' && !isNaN(parseInt(route_list[3]))) {
      is_normal_page = false;
    }
    if (is_normal_page) {
      let brand_data = getLocalStorage('themeDnsData');
      brand_data = JSON.parse(brand_data ?? '{}');
      setHeadData(brand_data);
    }
  }, [router.asPath])
  return (
    <>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{head_data?.name || headData?.name}</title>
          <meta name='description' content={head_data?.og_description || headData?.og_description} />
          <link rel='shortcut icon' href={head_data?.favicon_img || headData?.favicon_img} />
          <link rel='apple-touch-icon' sizes='180x180' href={head_data?.favicon_img || headData?.favicon_img} />
          <meta name='keywords' content={head_data?.name || headData?.name} />
          <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
          <meta property='og:type' content='website' />
          <meta property='og:title' content={head_data?.name || headData?.name} />
          <meta property='og:image' content={head_data?.og_img || headData?.og_img} />
          <meta property='og:url' content={'https://' + head_data?.dns || headData?.dns} />
          <meta property='og:description' content={head_data?.og_description || headData?.og_description} />
          <meta name='author' content='purplevery' />
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=0'
          />
          <meta name="referrer" content="no-referrer" />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
          <meta name='apple-mobile-web-app-title' content={head_data?.name || headData?.name} />
          <meta name='theme-color' content={head_data?.theme_css?.main_color || headData?.theme_css?.main_color} />
          <meta
            name='naver-site-verification'
            content={head_data?.seo_obj?.naver_token || headData?.seo_obj?.naver_token}
          />
          <meta
            name='google-site-verification'
            content={head_data?.seo_obj?.google_token || headData?.seo_obj?.google_token}
          />
        </Head>
        <AuthProvider>
          <ReduxProvider store={store}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <SettingsProvider>
                <ThemeColorPresets>
                  <ThemeContrast>
                    <ThemeRtlLayout>
                      <MotionLazyContainer>
                        <ThemeProvider>
                          <ThemeLocalization>
                            <I18nextProvider i18n={i18n}>
                              <ModalProvider>
                                {getLayout(<Component {...pageProps} />)}
                                <Toaster position={'right-top'} toastOptions={{ className: 'react-hot-toast' }} />
                              </ModalProvider>
                            </I18nextProvider>
                          </ThemeLocalization>
                        </ThemeProvider>
                      </MotionLazyContainer>
                    </ThemeRtlLayout>
                  </ThemeContrast>
                </ThemeColorPresets>
              </SettingsProvider>
            </LocalizationProvider>
          </ReduxProvider>
        </AuthProvider>
      </CacheProvider>
    </>
  )
}
App.getInitialProps = async context => {
  const { ctx } = context
  try {
    let head_data = {}
    const host = ctx?.req?.headers?.host ? ctx?.req?.headers.host.split(':')[0] : '';
    let product_id = -1;
    let post_id = -1;
    let seller_id = -1;
    let uri = ctx?.req?.headers['x-invoke-path'] ?? "";
    let route_list = uri.split('/');
    if (route_list[1] == 'shop' && route_list[2] == 'item' && !isNaN(parseInt(route_list[3]))) {
      product_id = parseInt(route_list[3]);
    }
    if (route_list[1] == 'shop' && route_list[2] == 'service' && !isNaN(parseInt(route_list[3])) && !isNaN(parseInt(route_list[4]))) {
      post_id = parseInt(route_list[4]);
    }
    if (route_list[1] == 'shop' && route_list[2] == 'seller' && !isNaN(parseInt(route_list[3]))) {
      seller_id = parseInt(route_list[3]);
    }
    if (host) {
      const url = `${process.env.BACK_URL}/api/domain?dns=${host}&product_id=${product_id}&post_id=${post_id}&seller_id=${seller_id}`;
      const res = await fetch(url)
      head_data = await res.json()
      let dns_data = head_data?.data
      return {
        head_data: dns_data
      }
    } else {
      return {
        head_data: {}
      }
    }
  } catch (err) {
    console.log(err)
    return {
      head_data: {}
    }
  }
}
export default App
