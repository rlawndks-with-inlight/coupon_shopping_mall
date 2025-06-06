import PropTypes from 'prop-types';
// @mui
import { useTheme } from '@mui/material/styles';
import { Stack, AppBar, Toolbar, IconButton, Badge } from '@mui/material';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// hooks
import useOffSetTop from '../../../hooks/useOffSetTop';
import useResponsive from '../../../hooks/useResponsive';
// config
import { HEADER, NAV } from '../../../config-global';
// components
import Logo from '../../../components/logo';
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import ContactsPopover from './ContactsPopover';
import NotificationsPopover from './NotificationsPopover';
import { Icon } from '@iconify/react';
import SvgColor from 'src/components/svg-color/SvgColor';
import LanguagePopover from './LanguagePopover';

// ----------------------------------------------------------------------

Header.propTypes = {
  onOpenNav: PropTypes.func,
};

export default function Header({ onOpenNav }) {
  const theme = useTheme();

  const { themeLayout, themeMode, onToggleMode, themeDnsData } = useSettingsContext();

  const isNavHorizontal = themeLayout === 'horizontal';

  const isNavMini = themeLayout === 'mini';

  const isDesktop = useResponsive('up', 'lg');

  const isOffset = useOffSetTop(HEADER.H_MANAGER_DESKTOP) && !isNavHorizontal;

  const renderContent = (
    <>
      {isDesktop && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!isDesktop && (
        <IconButton onClick={onOpenNav} sx={{ mr: 1, color: 'text.primary' }}>
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>
      )}

      <Searchbar />

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1.5 }}
      >
        123
        {themeDnsData?.setting_obj?.is_use_lang == 1 &&
          <>
            <LanguagePopover />
          </>}
        <IconButton
          onClick={() => onToggleMode()}
        >
          <SvgColor
            src={`/assets/icons/setting/${themeMode === 'light' ? 'ic_sun' : 'ic_moon'}.svg`}
          />
        </IconButton>
        {/*<NotificationsPopover /> */}

        {/* <ContactsPopover /> */}

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        boxShadow: 'none',
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(isDesktop && {
          width: `calc(100% - ${NAV.W_MANAGER + 1}px)`,
          height: HEADER.H_MANAGER_DESKTOP,
          ...(isOffset && {
            height: HEADER.H_MANAGER_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_MANAGER_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MANAGER_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
