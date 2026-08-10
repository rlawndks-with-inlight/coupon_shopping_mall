import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, CardContent, CardHeader, Stack, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { apiManager } from 'src/utils/api';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useLocales } from 'src/locales';

// 회원 탈퇴 — 프레임 구분 없는 공용 패널.
//
// 전용 탈퇴 화면은 프레임3(demo-4)과 demo-9 에만 있었고, 나머지 프레임은 전부
// 프레임3 화면으로 떨어졌다. 그 화면은 프레임3 의 좌측 회원메뉴까지 통째로 그려서
// 다른 프레임 고객에게 남의 메뉴가 그대로 보였다.
//
// Wrappers·프레임 껍데기를 갖지 않는다. 부르는 쪽이 자기 껍데기 안에 끼워 넣는다.

const ResignPanel = ({ loginPath = '/shop/auth/login' }) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const [password, setPassword] = useState('');

  const onResign = async () => {
    if (!password) return toast.error(translate('비밀번호를 입력해 주세요.'));
    let result = await apiManager('auth/resign', 'update', { password });
    if (result) {
      toast.success('탈퇴가 완료되었습니다.');
      setPassword('');
      // 탈퇴 후에도 남아 있던 토큰으로 화면이 로그인 상태처럼 보이던 문제를 피한다.
      window.location.href = loginPath;
    }
  };

  if (!user?.id) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {translate('로그인을 해주세요.')}
        </Typography>
        <Button variant="contained" onClick={() => router.push(loginPath)}>
          {translate('로그인')}
        </Button>
      </Stack>
    );
  }

  return (
    <Card>
      <CardHeader title={translate('회원 탈퇴')} />
      <CardContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{translate('회원 탈퇴를 하시면 회원 혜택을 더 이상 이용하실 수 없습니다.')}<br />{translate('탈퇴하시려면 비밀번호를 입력하고 탈퇴 버튼을 눌러 주세요.')}</Typography>
        <Stack spacing={2}>
          <TextField
            label={translate('비밀번호')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onResign(); }}
            fullWidth
          />
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="contained" color="error" onClick={onResign}>
              {translate('회원 탈퇴')}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ResignPanel;
