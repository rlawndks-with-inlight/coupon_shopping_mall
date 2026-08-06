import { Title } from 'src/components/elements/blog/demo-1';
import { Checkbox, TextField, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Typography } from '@mui/material';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useState, useEffect } from 'react';
import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import toast from 'react-hot-toast';

// 공지사항, faq 등 상세페이지 김인욱
const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin: 56px auto;
width: 90%;
`

const TextFieldTitle = styled.label`
font-size:1rem;
font-weight:regular;
margin:1.5rem 0 1rem 0;
`

const TextFieldContainer = styled.div`
display:flex;
flex-direction:column;
`

const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const { onChangeCartData, onChangeWishData } = useSettingsContext();
  const { user, logout } = useAuthContext();
  const [checkboxObj, setCheckboxObj] = useState({
    check_0: false,
    check_1: false,
  })
  // 실 user 값을 담는 폼 state (초기값을 user에서 세팅)
  const [userObj, setUserObj] = useState({})
  // 기본 배송지 Select 옵션(실 주소 목록)
  const [addressList, setAddressList] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  // 비밀번호 변경 / 회원탈퇴 인라인 섹션 토글
  const [authMode, setAuthMode] = useState(null)

  useEffect(() => {
    if (user) {
      setUserObj({
        name: user?.name ?? '',
        phone_num: user?.phone_num ?? '',
        nickname: user?.nickname ?? '',
      });
      onLoadAddresses();
    }
  }, [user])

  const onLoadAddresses = async () => {
    if (!user?.id) {
      return;
    }
    let data = await apiManager('user-addresses', 'list', {
      page: 1,
      page_size: 100,
      search: '',
      user_id: user?.id,
    });
    if (data?.content) {
      setAddressList(data.content);
    }
  }

  const onChangeUserInfo = async () => {
    let result = await apiManager('auth/change-info', 'update', {
      nickname: userObj?.nickname,
      phone_num: userObj?.phone_num,
    });
    if (result) {
      toast.success('성공적으로 변경되었습니다.');
    }
  }

  const onChangePassword = async () => {
    if (!userObj?.password) {
      return toast.error('현재비밀번호를 입력해주세요.');
    }
    if (!userObj?.new_password) {
      return toast.error('새비밀번호를 입력해주세요.');
    }
    if (userObj.new_password != userObj.new_password_check) {
      return toast.error('비밀번호가 일치하지 않습니다.');
    }
    let result = await apiManager('auth/change-password', 'update', {
      password: userObj.password,
      new_password: userObj.new_password,
    });
    if (result) {
      toast.success('성공적으로 비밀번호가 변경되었습니다.');
      setAuthMode(null);
      setUserObj({ ...userObj, password: '', new_password: '', new_password_check: '' });
    }
  }

  const onResign = async () => {
    if (!userObj?.resign_password) {
      return toast.error('비밀번호를 입력해주세요.');
    }
    let result = await apiManager('auth/resign', 'update', {
      password: userObj.resign_password,
    });
    if (result) {
      toast.success('회원탈퇴가 완료되었습니다.');
      onChangeCartData([]);
      onChangeWishData([]);
      await logout();
      router.push('/blog/auth/login');
    }
  }

  const onLogout = async () => {
    let user = await logout();
    onChangeCartData([]);
    onChangeWishData([]);
    if (user) {
      router.push('/blog/auth/my-page');
    }
  }

  return (
    <>
      <Wrappers>
        <Title>개인정보 관리</Title>
        <TextFieldContainer>
          <TextFieldTitle>이름</TextFieldTitle>
          <TextField
            disabled
            name='name'
            value={userObj?.name ?? ''}
            placeholder='홍길동'
            sx={{
              marginBottom: '1%',
              backgroundColor: '#F6F6F6'
            }}
          />
          <TextFieldTitle>연락처</TextFieldTitle>
          <div style={{ display: 'flex' }}>
            <TextField
              disabled
              name='phone_num'
              value={userObj?.phone_num ?? ''}
              placeholder='01012345678'
              sx={{
                marginBottom: '1%',
                backgroundColor: '#F6F6F6',
                width: '100%'
              }}
            />
          </div>
          <TextFieldTitle>기본 배송지</TextFieldTitle>
          {addressList.length > 0 ? (
            <FormControl sx={{ width: '100%' }}>
              <InputLabel>기본 배송지를 선택해주세요</InputLabel>
              <Select
                label='기본 배송지를 선택해주세요'
                value={selectedAddressId}
                sx={{
                  width: '100%'
                }}
                onChange={async (e) => {
                  let id = e.target.value
                  setSelectedAddressId(id)
                  let result = await apiManager('user-addresses', 'update', {
                    id,
                    is_default: 1,
                  })
                  if (result) {
                    toast.success('기본 배송지로 설정되었습니다.')
                  }
                }}
              >
                {addressList.map((address) => (
                  <MenuItem key={address?.id} value={address?.id}>
                    {address?.addr} {address?.detail_addr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography style={{ color: 'gray', margin: '0.5rem 0' }}>
              등록된 배송지가 없습니다. 배송지를 추가해주세요.
            </Typography>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant='contained'
              style={{
                marginTop: '1rem',
                height: '56px',
                width: '19%',
                whiteSpace: 'nowrap'
              }}
              onClick={() => {
                router.push('/blog/auth/my-page/address')
              }}
            >배송지<br />추가</Button>
          </div>
          <TextFieldTitle>마케팅 수신 동의</TextFieldTitle>
          <div style={{ display: 'flex' }}>
            <FormControlLabel label={<Typography>SMS</Typography>} control={<Checkbox checked={checkboxObj.check_0} />} onChange={(e) => {
              setCheckboxObj({ ...checkboxObj, ['check_0']: e.target.checked })
            }} />
            <FormControlLabel label={<Typography>E-mail</Typography>} control={<Checkbox checked={checkboxObj.check_1} />} onChange={(e) => {
              setCheckboxObj({ ...checkboxObj, ['check_1']: e.target.checked })
            }} />
          </div>
          <Button
            variant='contained'
            style={{
              marginTop: '2rem',
              height: '56px',
              fontSize: 'large'
            }}
            onClick={() => {
              onChangeUserInfo()
            }}
          >변경사항 저장</Button>
          <Button
            variant='contained'
            style={{
              marginTop: '1rem',
              height: '56px',
              fontSize: 'large'
            }}
            onClick={() => {
              onLogout()
            }}
          >로그아웃</Button>
          <div style={{
            display: 'flex',
            textDecoration: 'underline',
            color: 'gray',
            marginTop: '16px'
          }}>
            <div
              style={{ marginRight: '5%', cursor: 'pointer' }}
              onClick={() => {
                setAuthMode(authMode === 'password' ? null : 'password')
              }}
            >비밀번호 변경</div>
            <div
              style={{ marginRight: '5%', cursor: 'pointer' }}
              onClick={() => {
                setAuthMode(authMode === 'resign' ? null : 'resign')
              }}
            >회원탈퇴</div>
          </div>
          {authMode === 'password' &&
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
              <TextField
                type='password'
                name='password'
                placeholder='현재 비밀번호'
                value={userObj?.password ?? ''}
                onChange={(e) => {
                  setUserObj({ ...userObj, password: e.target.value })
                }}
                sx={{ marginBottom: '1%' }}
              />
              <TextField
                type='password'
                name='new_password'
                placeholder='새 비밀번호'
                value={userObj?.new_password ?? ''}
                onChange={(e) => {
                  setUserObj({ ...userObj, new_password: e.target.value })
                }}
                sx={{ marginBottom: '1%' }}
              />
              <TextField
                type='password'
                name='new_password_check'
                placeholder='새 비밀번호 확인'
                value={userObj?.new_password_check ?? ''}
                onChange={(e) => {
                  setUserObj({ ...userObj, new_password_check: e.target.value })
                }}
                sx={{ marginBottom: '1%' }}
              />
              <Button
                variant='contained'
                style={{ height: '56px', marginTop: '1rem' }}
                onClick={() => {
                  onChangePassword()
                }}
              >비밀번호 변경</Button>
            </div>
          }
          {authMode === 'resign' &&
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
              <Typography style={{ color: 'gray', marginBottom: '0.5rem' }}>
                회원 탈퇴를 하시면 회원 혜택을 더 이상 이용하실 수 없습니다. 계속하시려면 비밀번호를 입력해주세요.
              </Typography>
              <TextField
                type='password'
                name='resign_password'
                placeholder='비밀번호를 입력해주세요'
                value={userObj?.resign_password ?? ''}
                onChange={(e) => {
                  setUserObj({ ...userObj, resign_password: e.target.value })
                }}
                sx={{ marginBottom: '1%' }}
              />
              <Button
                variant='contained'
                color='error'
                style={{ height: '56px', marginTop: '1rem' }}
                onClick={() => {
                  onResign()
                }}
              >회원탈퇴</Button>
            </div>
          }
        </TextFieldContainer>
      </Wrappers >
    </>
  )
}

export default Demo1
