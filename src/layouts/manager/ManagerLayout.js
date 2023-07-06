import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Box } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// auth
// components
import { useSettingsContext } from '../../components/settings';
//
import Main from './Main';
import Header from './header';
import NavMini from './nav/NavMini';
import NavVertical from './nav/NavVertical';
import NavHorizontal from './nav/NavHorizontal';
import { useAuthContext } from './auth/useAuthContext';
import NextNProgress from 'nextjs-progressbar';
// ----------------------------------------------------------------------

ManagerLayout.propTypes = {
  children: PropTypes.node,
};

export default function ManagerLayout({ children }) {
  const { themeLayout, themeMode, themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const isDesktop = useResponsive('up', 'lg');

  const [open, setOpen] = useState(false);

  const isNavHorizontal = themeLayout === 'horizontal';

  const isNavMini = themeLayout === 'mini';

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderNavVertical = <NavVertical openNav={open} onCloseNav={handleClose} />;

  const renderContent = () => {
    if (isNavHorizontal) {
      return (
        <>
          <Header onOpenNav={handleOpen} />

          {isDesktop ? <NavHorizontal /> : renderNavVertical}

          <Main>{children}</Main>
        </>
      );
    }

    if (isNavMini) {
      return (
        <>
          <Header onOpenNav={handleOpen} />
          <Box
            sx={{
              display: { lg: 'flex' },
              minHeight: { lg: 1 },
            }}
          >
            {isDesktop ? <NavMini /> : renderNavVertical}

            <Main>{children}</Main>
          </Box>
        </>
      );
    }

    return (
      <>

        <Header onOpenNav={handleOpen} />
        <Box
          sx={{
            display: { lg: 'flex' },
            minHeight: { lg: 1 },
          }}
        >
          {renderNavVertical}

          <Main>{children}</Main>
        </Box>
      </>
    );
  };

  return <>
   <NextNProgress color={themeDnsData?.theme_css?.main_color??"#000"} />
    {themeDnsData?.id > 0 && user && themeDnsData ?
      <>
        {renderContent()}
      </>
      :
      <>
      </>}
  </>
}
