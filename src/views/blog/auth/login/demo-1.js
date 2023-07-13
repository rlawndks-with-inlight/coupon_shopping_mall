import { useTheme } from '@emotion/react';
import { Button, TextField, IconButton, InputAdornment } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import styled from 'styled-components'
import { Icon } from '@iconify/react';
import { Title } from 'src/components/elements/blog/demo-1';

const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin:56px auto;
width:90%;
`


const TextFieldContainer = styled.div`
width:100%;
display:flex;
flex-direction:column;
margin: 0 auto;
`

const FindInfo = styled.div`
display:flex;
font-size:1rem;
font-weight:regular;
color:${props => props.themeMode == 'dark' ? '#fff' : '#000'};
text-decoration:underline;
width:100%;
margin: 1rem auto 2.5rem auto;
`

const NotSignup = styled.div`
display:flex;
justify-content:center;
font-size:1rem;
font-weight:regular;
margin:1.5rem 0 2rem 0;
color:${props => props.themeMode == 'dark' ? '#fff' : '#000'};
text-decoration:underline;
`

const ButtonContainer = styled.div`
width:100%;
margin: 0 auto;
display:flex;
flex-direction:column;
row-gap:1rem;
`

// 로그인 김인욱
const Demo1 = (props) => {
  const { presetsColor } = useSettingsContext();
  const { user, login } = useAuthContext();
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeMode } = useSettingsContext();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [watchable, setWatchable] = useState(false)
  const [signed, setSigned] = useState(false);


  useEffect(() => {

  }, [])
  const onLogin = async () => {
    let user = await login(username, password);
    if (user) {
      router.push('/blog/auth/my-page');
    }
  }
  return (
    <>
      <Wrappers>
        <Title>로그인</Title>
        <TextFieldContainer>
          <TextField
            label='아이디'
            name='id'
            autoComplete='new-password'
            onChange={(e) => {
              setUsername(e.target.value)
            }}
          />
          <TextField
            sx={{ marginTop: '1rem' }}
            label='비밀번호'
            name='password'
            type={watchable ? '' : 'password'}
            autoComplete='new-password'
            onKeyPress={(e) => {
              if (e.key == 'Enter') {
                onLogin();
              }
            }}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Icon icon={watchable ? 'ri:eye-line' : 'ri:eye-off-line'} color='black' cursor='pointer' style={{ height: '20px', width: '20px' }} onClick={() => { setWatchable(!watchable) }} onMouseLeave={() => { setWatchable(false) }} />
                </InputAdornment>
              )
            }}
          />
        </TextFieldContainer>
        <FindInfo themeMode={themeMode}>
          <div style={{ cursor: 'pointer', marginLeft: 'auto' }} onClick={() => { router.push('/blog/auth/find-info?type=0') }}>아이디 / 비밀번호 찾기</div>
        </FindInfo>
        <ButtonContainer>
          <Button
            variant='contained'
            color='primary'
            size='large'
            style={{
              fontSize: 'large',
              height: '56px',
              width: `100%`,
            }}
            onClick={onLogin}
          >로그인</Button>
          <Button
            variant='outlined'
            color='primary'
            size='large'
            onClick={() => {
              router.push('/blog/auth/sign-up')
            }}
            style={{
              fontSize: 'large',
              height: '56px',
              width: `100%`,
            }}
          >3초만에 빠른 회원가입</Button>
        </ButtonContainer>

        <NotSignup themeMode={themeMode}><div style={{ cursor: 'pointer' }} onClick={() => { router.push('/blog/auth/my-page/order') }}>비회원 주문 조회</div></NotSignup>
      </Wrappers>
    </>
  )
}

export default Demo1
