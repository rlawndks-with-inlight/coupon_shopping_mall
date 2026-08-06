import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { apiManager } from 'src/utils/api';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useLocales } from 'src/locales';
import { sanitizePhoneInput, isValidPhoneNumber } from 'src/utils/function';
import { AddressTable } from 'src/components/elements/shop/common';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';

// 회원정보 수정 — 데모 구분 없는 공용 패널.
//
// [왜 공용인가]
//  프레임마다 제각각이었다. 프레임1·2 는 읽기 전용이라 수정 수단이 아예 없었고,
//  프레임3 만 별도 화면(닉네임·휴대폰·프로필사진)이 있었으며,
//  블로그형(4~11)은 이름·연락처가 disabled 라 사실상 기본 배송지만 고를 수 있었다.
//  거기에 '변경' 버튼은 이미 있는 값을 그대로 다시 보내는 무의미한 버튼이었고,
//  SMS/E-mail 수신동의 체크박스는 저장할 컬럼조차 없었다.
//
// [무엇을 담는가 — 전 프레임 공통]
//  · 아이디·이름 : 읽기 전용 (이름은 주문자 정보·아이디 찾기에 쓰이므로 임의 변경을 막는다)
//  · 휴대폰번호  : 수정 가능
//  · 비밀번호    : 현재 비밀번호 + 새 비밀번호 2회 입력
//  · 배송지      : 추가·수정·삭제
//  · 회원 탈퇴
//  프로필 사진은 넣지 않는다.
//
// [레이아웃]
//  Wrappers·헤더를 갖지 않는다. 각 프레임이 자기 껍데기 안에 그대로 끼워 넣는다.

const PW_MIN = 8;
const PW_MAX = 20;

const AccountEditPanel = ({ loginPath = '/shop/auth/login' }) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { translate } = useLocales();

  const [phoneNum, setPhoneNum] = useState('');
  const [pw, setPw] = useState({ password: '', new_password: '', new_password_check: '' });
  const [resignOpen, setResignOpen] = useState(false);
  const [resignPw, setResignPw] = useState('');

  const [addressContent, setAddressContent] = useState({});
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [updateAddressOpen, setUpdateAddressOpen] = useState(false);
  const [addressId, setAddressId] = useState();
  const [searchObj, setSearchObj] = useState({ page: 1, page_size: 10, search: '', user_id: user?.id });

  useEffect(() => {
    if (!user?.id) return;
    setPhoneNum(user?.phone_num ?? '');
    onChangePage({ page: 1, page_size: 10, search: '', user_id: user?.id });
  }, [user?.id]);

  const onChangePage = async (search_obj) => {
    setSearchObj(search_obj);
    setAddressContent({ ...addressContent, content: undefined });
    let data = await apiManager('user-addresses', 'list', search_obj);
    if (data) setAddressContent(data);
  };

  const onAddAddress = async (address_obj) => {
    let result = await apiManager('user-addresses', 'create', { ...address_obj, user_id: user?.id });
    if (result) onChangePage(searchObj);
  };
  const onUpdateAddress = async (id) => {
    setAddressId(id);
    setUpdateAddressOpen(true);
  };
  const onDeleteAddress = async (id) => {
    let result = await apiManager('user-addresses', 'delete', { id });
    if (result) onChangePage(searchObj);
  };

  const onSaveInfo = async () => {
    if (!phoneNum) return toast.error(translate('휴대폰번호를 입력해 주세요.'));
    if (!isValidPhoneNumber(phoneNum)) return toast.error(translate('휴대폰번호를 정확히 입력해 주세요.'));
    // nickname 은 그대로 다시 보낸다 — 이 API 는 넘어온 값으로 덮어쓰므로 빼면 지워진다.
    let result = await apiManager('auth/change-info', 'update', {
      nickname: user?.nickname,
      phone_num: phoneNum,
    });
    if (result) {
      toast.success(translate('성공적으로 변경되었습니다.'));
      // 백엔드가 토큰을 재발급한다(payload 에 phone_num 이 들어 있다).
      // 헤더·주문서가 새 값을 읽도록 새로고침한다.
      router.reload();
    }
  };

  const onChangePassword = async () => {
    if (!pw.password) return toast.error(translate('현재 비밀번호를 입력해 주세요.'));
    if (!pw.new_password || !pw.new_password_check) return toast.error(translate('새 비밀번호를 입력해 주세요.'));
    if (pw.new_password.length < PW_MIN || pw.new_password.length > PW_MAX) {
      return toast.error(`새 비밀번호는 ${PW_MIN}~${PW_MAX}자로 입력해 주세요.`);
    }
    if (pw.new_password !== pw.new_password_check) {
      return toast.error(translate('비밀번호 확인란을 똑같이 입력했는지 확인해주세요'));
    }
    if (pw.password === pw.new_password) {
      return toast.error('현재 비밀번호와 다른 비밀번호를 입력해 주세요.');
    }
    let result = await apiManager('auth/change-password', 'update', {
      password: pw.password,
      new_password: pw.new_password,
    });
    if (result) {
      toast.success(translate('성공적으로 변경되었습니다.'));
      setPw({ password: '', new_password: '', new_password_check: '' });
    }
  };

  const onResign = async () => {
    if (!resignPw) return toast.error(translate('비밀번호를 입력해 주세요.'));
    let result = await apiManager('auth/resign', 'update', { password: resignPw });
    if (result) {
      toast.success('탈퇴가 완료되었습니다.');
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
    <>
      <DialogAddAddress
        addAddressOpen={addAddressOpen}
        setAddAddressOpen={setAddAddressOpen}
        onAddAddress={onAddAddress}
      />
      <DialogAddAddress
        addAddressOpen={updateAddressOpen}
        setAddAddressOpen={setUpdateAddressOpen}
        onAddAddress={onAddAddress}
        type={'update'}
        id={addressId}
        onDeleteAddress={onDeleteAddress}
      />

      <Stack spacing={3}>
        {/* ── 회원정보 ─────────────────────────────── */}
        <Card>
          <CardHeader title={translate('회원정보')} />
          <CardContent>
            <Stack spacing={2.5}>
              <TextField label={translate('아이디')} value={user?.user_name ?? ''} disabled fullWidth />
              {/* 이름은 주문자 정보와 아이디 찾기에 쓰인다. 임의로 바꾸면 곤란하므로 읽기 전용. */}
              <TextField
                label={translate('이름')}
                value={user?.name ?? ''}
                disabled
                fullWidth
                helperText={user?.name ? '' : '이름이 등록되어 있지 않습니다. 고객센터로 문의해 주세요.'}
              />
              <TextField
                label={translate('휴대폰번호')}
                value={phoneNum}
                onChange={(e) => setPhoneNum(sanitizePhoneInput(e.target.value))}
                placeholder="숫자와 하이픈(-)만 입력"
                fullWidth
              />
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={onSaveInfo}>{translate('저장')}</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* ── 비밀번호 변경 ─────────────────────────── */}
        <Card>
          <CardHeader title={translate('비밀번호 변경')} />
          <CardContent>
            <Stack spacing={2.5}>
              <TextField
                label="현재 비밀번호"
                type="password"
                value={pw.password}
                onChange={(e) => setPw({ ...pw, password: e.target.value })}
                fullWidth
              />
              <Divider />
              <TextField
                label="새 비밀번호"
                type="password"
                value={pw.new_password}
                onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
                placeholder={`${PW_MIN}~${PW_MAX}자`}
                fullWidth
              />
              <TextField
                label="새 비밀번호 확인"
                type="password"
                value={pw.new_password_check}
                onChange={(e) => setPw({ ...pw, new_password_check: e.target.value })}
                placeholder="새 비밀번호를 다시 입력해 주세요"
                fullWidth
                // 두 칸이 다르면 입력 중에 바로 알려준다(저장 눌러보고 알 필요 없게).
                error={!!pw.new_password_check && pw.new_password !== pw.new_password_check}
                helperText={
                  !!pw.new_password_check && pw.new_password !== pw.new_password_check
                    ? '새 비밀번호가 서로 다릅니다.'
                    : ''
                }
              />
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={onChangePassword}>{translate('변경')}</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* ── 배송지 ───────────────────────────────── */}
        <Card>
          <CardHeader
            title={translate('배송지 관리')}
            action={
              <Button variant="outlined" onClick={() => setAddAddressOpen(true)}>
                {translate('배송지 추가')}
              </Button>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <AddressTable
              addressContent={addressContent}
              onUpdate={onUpdateAddress}
              onDelete={onDeleteAddress}
            />
          </CardContent>
        </Card>

        {/* ── 회원 탈퇴 ─────────────────────────────── */}
        <Card>
          <CardHeader title={translate('회원 탈퇴')} />
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              회원 탈퇴를 하시면 회원 혜택을 더 이상 이용하실 수 없습니다.
            </Typography>
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="outlined" color="error" onClick={() => setResignOpen(true)}>
                {translate('회원 탈퇴')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={resignOpen} onClose={() => setResignOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{translate('회원 탈퇴')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            탈퇴하시려면 비밀번호를 입력해 주세요.
          </Typography>
          <TextField
            label={translate('비밀번호')}
            type="password"
            value={resignPw}
            onChange={(e) => setResignPw(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setResignOpen(false)}>{translate('취소')}</Button>
          <Button variant="contained" color="error" onClick={onResign}>{translate('탈퇴')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountEditPanel;
