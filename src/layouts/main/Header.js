import PropTypes from 'prop-types';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Button, AppBar, Toolbar, Container, Link, IconButton } from '@mui/material';
// hooks
import useOffSetTop from '../../hooks/useOffSetTop';
import useResponsive from '../../hooks/useResponsive';
// utils
import { bgBlur } from '../../utils/cssStyles';
// config
import { HEADER } from '../../config-global';
// routes
import Logo from '../../components/logo';
import Label from '../../components/label';
//
import NavMobile from './nav/mobile';
import navConfig from './nav/config-navigation';
import NavDesktop from './nav/desktop';
import { useRouter } from 'next/router';
import { logoSrc } from 'src/data/data';
import { useSettingsContext } from 'src/components/settings';
import SvgColor from 'src/components/svg-color/SvgColor';

// ----------------------------------------------------------------------

export default function Header() {

  const { themeMode, onToggleMode } = useSettingsContext();
  const theme = useTheme();
  const router = useRouter();
  const isDesktop = useResponsive('up', 'md');

  const isOffset = useOffSetTop(HEADER.H_MAIN_DESKTOP);

  return (
    <AppBar color="transparent" sx={{ boxShadow: 0 }}>
      <Toolbar
        disableGutters
        sx={{
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_MAIN_DESKTOP,
          },
          transition: theme.transitions.create(['height', 'background-color'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(isOffset && {
            ...bgBlur({ color: theme.palette.background.default }),
            height: {
              md: HEADER.H_MAIN_DESKTOP - 16,
            },
          }),
        }}
      >
        <Container sx={{ height: 1, display: 'flex', alignItems: 'center' }}>
          <img src={logoSrc} style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
            onClick={() => {
              router.push('/')
            }}
          />
          <Box sx={{ flexGrow: 1 }} />

          {isDesktop && <NavDesktop isOffset={isOffset} data={navConfig} />}
          <IconButton color={themeMode === 'dark' ? 'warning' : 'default'} onClick={onToggleMode} style={{ marginRight: '1rem' }}>
            <SvgColor
              src={`/assets/icons/setting/ic_${themeMode === 'light' ? 'moon' : 'sun'}.svg`}
            />
          </IconButton>
          <Button variant="contained" target="_blank" rel="noopener" href='/manager/login?is_first=1'>
            신청하러 가기
          </Button>

          {/* {!isDesktop && <NavMobile isOffset={isOffset} data={navConfig} />} */}
        </Container>
      </Toolbar>

      {isOffset && <Shadow />}
    </AppBar>
  );
}

// ----------------------------------------------------------------------

Shadow.propTypes = {
  sx: PropTypes.object,
};

function Shadow({ sx, ...other }) {
  return (
    <Box
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        height: 24,
        zIndex: -1,
        m: 'auto',
        borderRadius: '50%',
        position: 'absolute',
        width: `calc(100% - 48px)`,
        boxShadow: (theme) => theme.customShadows.z8,
        ...sx,
      }}
      {...other}
    />
  );
}
