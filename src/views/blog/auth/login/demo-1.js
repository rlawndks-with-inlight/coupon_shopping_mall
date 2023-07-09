import { useTheme } from '@emotion/react';
import { Button, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import styled from 'styled-components'

const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin:56px auto 0 auto;
width:90%;
@media (max-width:798px){
  width:100%;
}
`

const TitleBox = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
@media (max-width:798px){
    padding: 0 5% 0 5%;
}
`

const TextFieldContainer = styled.div`
width:100%;
display:flex;
flex-direction:column;
margin: 0 auto;
@media (max-width:798px){
  padding:5%;
}
`

const FindInfo = styled.div`
display:flex;
justify-content:right;
font-size:1rem;
font-weight:regular;
margin:1.5rem 0 2rem 0;
color:${props=>props.themeMode=='dark'?'#fff':'#000'};
text-decoration:underline;
`

const NotSignup = styled.div`
display:flex;
justify-content:center;
font-size:1rem;
font-weight:regular;
margin:1.5rem 0 2rem 0;
color:${props=>props.themeMode=='dark'?'#fff':'#000'};
text-decoration:underline;
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
        <TitleBox>로그인</TitleBox>
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
            type='password'
            autoComplete='new-password'
            onKeyPress={(e) => {
              if (e.key == 'Enter') {
                onLogin();
              }
            }}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
          />
          </TextFieldContainer>
          <FindInfo themeMode={themeMode}><div style={{cursor:'pointer'}} onClick={() => { router.push('/blog/auth/find-info') }}>아이디 / 비밀번호 찾기</div></FindInfo>
          <Button
            variant='contained'
            color='primary'
            size='large'
            style={{
              marginTop: '1rem',
              fontSize: 'large',
              height: '56px'
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
              marginTop: '1rem',
              fontSize: 'large',
              height: '56px'
            }}
          >3초만에 빠른 회원가입</Button>
          <NotSignup themeMode={themeMode}><div style={{cursor:'pointer'}} onClick={() => { router.push('/blog/auth/find-info') }}>비회원 주문 조회</div></NotSignup>
      </Wrappers>
    </>
  )
}

export default Demo1
