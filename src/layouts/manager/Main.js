import PropTypes from 'prop-types';
// @mui
import { Box } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// config
import { HEADER, NAV } from '../../config-global';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

const SPACING = 8;

Main.propTypes = {
  sx: PropTypes.object,
  children: PropTypes.node,
};

export default function Main({ children, sx, ...other }) {
  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = false;

  const isNavMini = themeLayout === 'mini';

  const isDesktop = useResponsive('up', 'lg');


  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: `${HEADER.H_MOBILE + SPACING}px`,
        ...(isDesktop && {
          px: 2,
          py: `${HEADER.H_MANAGER_DESKTOP + SPACING}px`,
          width: `calc(100% - ${NAV.W_MANAGER}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MANAGER_MINI}px)`,
          }),
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
