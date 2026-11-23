import PropTypes from 'prop-types';
// next
import NextLink from 'next/link';
// @mui
import { Box, Tooltip, Link, ListItemText } from '@mui/material';
// auth
import RoleBasedGuard from 'src/layouts/manager/auth/RoleBasedGuard';
//
import Iconify from '../../iconify';
//
import { StyledItem, StyledIcon, StyledDotIcon } from './styles';

// ----------------------------------------------------------------------

NavItem.propTypes = {
  open: PropTypes.bool,
  active: PropTypes.bool,
  item: PropTypes.object,
  depth: PropTypes.number,
  isExternalLink: PropTypes.bool,
};

export default function NavItem({ item, depth, open, active, isExternalLink, ...other }) {

  const { title, path, icon, info, children, disabled, caption, roles } = item;
  // infoClosed: 하위 메뉴가 있는 칸이 접혀 있을 때만 보이는 표시(관리자 메뉴 주문 건수, 2026-11-23).
  //   펼치면 하위 칸(결제완료·취소요청)이 제 숫자를 보이므로 위아래에 같은 숫자가 겹치지 않게 한다.
  const 표시 = info || (!!children && !open ? item.infoClosed : null);

  const subItem = depth !== 1;

  const renderContent = (
    <StyledItem depth={depth} active={active} disabled={disabled} caption={!!caption} {...other}>
      {icon && <StyledIcon>{icon}</StyledIcon>}

      {subItem && (
        <StyledIcon style={{ marginLeft: '0.5rem' }}>
          <StyledDotIcon active={active && subItem} />
        </StyledIcon>
      )}

      <ListItemText
        primary={title}
        secondary={
          caption && (
            <Tooltip title={`caption`} placement="top-start">
              <span>{`caption`}</span>
            </Tooltip>
          )
        }
        primaryTypographyProps={{
          noWrap: true,
          component: 'span',
          variant: active ? 'subtitle2' : 'body2',
        }}
        secondaryTypographyProps={{
          noWrap: true,
          variant: 'caption',
        }}
      />

      {표시 && (
        <Box component="span" sx={{ lineHeight: 0, ml: 1, flexShrink: 0 }}>
          {표시}
        </Box>
      )}

      {!!children && (
        <Iconify
          width={16}
          icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
          sx={{ ml: 1, flexShrink: 0 }}
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

    // Has child
    if (children) {
      return renderContent;
    }

    // Default
    return (
      <Link component={NextLink} href={path} underline="none">
        {renderContent}
      </Link>
    );
  };

  return <RoleBasedGuard roles={roles}> {renderItem()} </RoleBasedGuard>;
}
