// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Typography } from '@mui/material';
// auth
import { useAuthContext } from '../auth/useAuthContext';
// components
import { CustomAvatar } from '../../../components/custom-avatar';
import { useEffect } from 'react';
import { userLevelList } from 'src/utils/format';
import _ from 'lodash';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter,
  }),
}));

// ----------------------------------------------------------------------

export default function NavAccount() {
  const { user } = useAuthContext();

  return (
    <Link underline="none" color="inherit">
      <StyledRoot>
        <CustomAvatar src={user?.profile_img} alt={user?.user_name} name={user?.user_name} />

        <Box sx={{ ml: 2, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.user_name}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {_.find(userLevelList, { value: user?.level })?.label ?? "잘못된레벨"}
          </Typography>
        </Box>
      </StyledRoot>
    </Link>
  );
}
