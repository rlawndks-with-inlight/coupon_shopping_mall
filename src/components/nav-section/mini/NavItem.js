import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// next
import NextLink from 'next/link';
// @mui
import { Box, Tooltip, Link, ListItemText } from '@mui/material';
// locales
// auth
import RoleBasedGuard from 'src/layouts/manager/auth/RoleBasedGuard';
//
import Iconify from '../../iconify';
import { StyledItem, StyledIcon } from './styles';

// ----------------------------------------------------------------------

const NavItem = forwardRef(({ item, depth, open, active, isExternalLink, ...other }, ref) => {
  const { title, path, icon, info, children, disabled, caption, roles } = item;

  const subItem = depth !== 1;
  // 숫자 표시(관리자 메뉴 주문 건수, 2026-11-23). 아이콘만 남은 맨 위 칸은 하위 숫자(infoClosed)를 늘 아이콘 옆에 띄운다 —
  //   하위 목록은 마우스를 올렸을 때만 잠깐 뜨므로 그때 숨기면 깜빡인다. 그 안의 하위 칸은 펼친 세로 메뉴와 같은 규칙.
  const 표시 = subItem ? (info || (!!children && !open ? item.infoClosed : null)) : (info || item.infoClosed || null);

  const renderContent = (
    <StyledItem ref={ref} open={open} depth={depth} active={active} disabled={disabled} {...other}>
      {icon && <StyledIcon>{icon}</StyledIcon>}

      <ListItemText
        primary={title}
        primaryTypographyProps={{
          noWrap: true,
          sx: {
            width: 72,
            fontSize: 10,
            lineHeight: '16px',
            textAlign: 'center',
            ...(active && {
              fontWeight: 'fontWeightMedium',
            }),
            ...(subItem && {
              fontSize: 14,
              width: 'auto',
              textAlign: 'left',
            }),
          },
        }}
      />

      {/* 하위 칸: 하위가 있으면 오른쪽 화살표(절대 위치) 자리를 비운다.
          맨 위 칸: 아이콘 오른쪽 위 모서리 — 오른쪽 화살표(right 6)를 가리지 않게 */}
      {표시 && (
        <Box
          component="span"
          sx={subItem
            ? { ml: 1, mr: children ? 2 : 0, lineHeight: 0, flexShrink: 0 }
            : { position: 'absolute', top: 0, left: 'calc(50% + 2px)', lineHeight: 0 }}
        >
          {표시}
        </Box>
      )}

      {caption && (
        <Tooltip title={`caption`} arrow placement="right">
          <Iconify
            icon="eva:info-outline"
            width={16}
            sx={{
              top: 11,
              left: 6,
              position: 'absolute',
            }}
          />
        </Tooltip>
      )}

      {!!children && (
        <Iconify
          width={16}
          icon="eva:chevron-right-fill"
          sx={{
            top: 11,
            right: 6,
            position: 'absolute',
          }}
        />
      )}
    </StyledItem>
  );

  const renderItem = () => {
    // ExternalLink
    if (isExternalLink)
      return (
        <Link href={path} target="_blank" rel="noopener" underline="none">
          {renderContent}
        </Link>
      );

    // Default
    return (
      <Link component={NextLink} href={path} underline="none">
        {renderContent}
      </Link>
    );
  };

  return <RoleBasedGuard roles={roles}> {renderItem()} </RoleBasedGuard>;
});

NavItem.propTypes = {
  open: PropTypes.bool,
  active: PropTypes.bool,
  item: PropTypes.object,
  depth: PropTypes.number,
  isExternalLink: PropTypes.bool,
};

export default NavItem;
