import { useState } from 'react';
// next
import { useRouter } from 'next/router';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Button, Typography, Stack, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from '@mui/material';
// routes
import { PATH_AUTH } from '../../../data/manager-data';
// auth
import { useAuthContext } from '../auth/useAuthContext';
// components
import { CustomAvatar } from '../../../components/custom-avatar';
import { useSnackbar } from '../../../components/snackbar';
import MenuPopover from '../../../components/menu-popover';
import { IconButtonAnimate } from '../../../components/animate';

import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { userLevelList } from 'src/utils/format';
import { apiManager } from 'src/utils/api';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------

const OPTIONS = [
  /*{
    label: '프로필',
    linkTo: '/',
  },
  {
    label: '설정',
    linkTo: '/',
  },*/
  {
    label: '비밀번호 변경',

  }
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const { replace, push } = useRouter();

  const { user, logout } = useAuthContext();
  const { onChangeCartData, onChangeWishData } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [openPopover, setOpenPopover] = useState(null);

  const [dialogObj, setDialogObj] = useState({
    changePassword: false,
  })
  const [changePasswordObj, setChangePasswordObj] = useState({
    id: '',
    user_pw: ''
  })

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleLogout = async () => {
    try {
      let result = await logout();
      onChangeCartData([]);
      onChangeWishData([]);
      replace('/manager/login');
      handleClosePopover();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  const handleClickItem = (path) => {
    handleClosePopover();
    push(path);
  };

  const onChangeUserPassword = async () => {
    let result = await apiManager(`users/change-pw`, 'update', changePasswordObj);
    if (result) {
      setDialogObj({
        ...dialogObj,
        changePassword: false
      })
      toast.success("성공적으로 변경 되었습니다.");
    }
  }

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpenPopover}
        sx={{
          p: 0,
          ...(openPopover && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <CustomAvatar src={user?.profile_img} alt={user?.user_name} name={user?.user_name} />
      </IconButtonAnimate>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 200, p: 0 }}>
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.user_name}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {_.find(userLevelList, { value: user?.level })?.label ?? "잘못된레벨"}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => {
              //handleClickItem(option.linkTo)
              setDialogObj({ ...dialogObj, changePassword: true })
              setChangePasswordObj({
                user_pw: '',
                id: user?.id
              })
            }}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />
        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          로그아웃
        </MenuItem>
      </MenuPopover>
      <Dialog
        open={dialogObj.changePassword}
      >
        <DialogTitle>{`비밀번호 변경`}</DialogTitle>

        <DialogContent>
          <DialogContentText>
            새 비밀번호를 입력 후 확인을 눌러주세요.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={changePasswordObj.user_pw}
            type="password"
            margin="dense"
            label="새 비밀번호"
            onChange={(e) => {
              setChangePasswordObj({
                ...changePasswordObj,
                user_pw: e.target.value
              })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onChangeUserPassword}>
            변경
          </Button>
          <Button color="inherit" onClick={() => {
            setDialogObj({
              ...dialogObj,
              changePassword: false
            })
          }}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
