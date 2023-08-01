import PropTypes from 'prop-types';
// next
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
// @mui
import { Box, Fab } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import ScrollToTop from 'src/components/scroll-to-top';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useEffect } from 'react';
//
const Header = dynamic(() => import('./Header'), { ssr: false });
const Footer = dynamic(() => import('./Footer'), { ssr: false });

// ----------------------------------------------------------------------

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default function MainLayout({ children }) {
  const { pathname, push } = useRouter();
  const { themeLayout, themeMode, themeDnsData } = useSettingsContext();
  const isHome = pathname === '/';
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    if (window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL) {
      setLoading(false);
    }else{
      push('/shop')
    }
  },[])
 
  return (
    <>
      {!loading &&
        <>
          {themeDnsData?.id > 0 ?
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
                <Header />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    ...(!isHome && {
                      pt: { xs: 8, md: 11 },
                    }),
                  }}
                >
                  {children}
                </Box>
                <Footer />
              </Box>
              <ScrollToTop className='mui-fixed'>
                <Fab size='small' aria-label='scroll back to top'>
                  <Icon icon='tabler:arrow-up' />
                </Fab>
              </ScrollToTop>
            </>
            :
            <>
            </>}
        </>}
    </>
  );
}
