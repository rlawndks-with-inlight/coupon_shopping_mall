import PropTypes from 'prop-types';
// @mui
import { Box } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// config
import { HEADER, NAV } from '../../config-global';
// components
import { useSettingsContext } from '../../components/settings';
import SecurityQuestionBanner from 'src/components/elements/shop/SecurityQuestionBanner';

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
      {/* 보안질문 미설정 안내 배너. 자체 게이팅(로그인 + SHOPGO 본사·산하 가맹점 + has_security_question === 0)이라 조건 래핑 금지 */}
      <SecurityQuestionBanner sx={{ mb: 2 }} />
      {children}
    </Box>
  );
}
