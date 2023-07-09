import { useTheme } from '@emotion/react';
import { Box, Button, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import styled from 'styled-components'

const Wrappers = styled.div`
max-width:500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const HoverText = styled.div`
padding:0 1rem;
color:${themeObj.grey[500]};
cursor:pointer;
&:hover{
  color:${props => props.presetsColor?.main};
}
`
const Demo1 = (props) => {
  const { user, login } = useAuthContext();
  const { presetsColor } = useSettingsContext();
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [noneUserObj, setNoneUserObj] = useState({
    name: '',
    orderNum: '',
    password: ''
  })
  useEffect(() => {
    if (router.query?.scroll_to) {
      window.scrollTo(0, router.query?.scroll_to);
    }
  }, [router.query])

  const onLogin = async () => {
    let user = await login(username, password)
    if (user) {
      router.push('/shop/auth/my-page')
    }
  }
  return (
    <>
      <Wrappers>
        <Title>로그인</Title>
        <TextField
          label='아이디'
          onChange={(e) => {
            setUsername(e.target.value)
          }}
          value={username}
          style={inputStyle}
          autoComplete='new-password'
          onKeyPress={(e) => {
            if (e.key == 'Enter') {
            }
          }}
        />
        <TextField
          label='비밀번호'
          onChange={(e) => {
            setPassword(e.target.value)
          }}
          type='password'
          value={password}
          style={inputStyle}
          autoComplete='new-password'
          onKeyPress={(e) => {
            if (e.key == 'Enter') {
              onLogin();
            }
          }}
        />
        <Button variant="contained" style={{
          height: '56px',
          marginTop: '1rem',
        }}
          onClick={onLogin}
        >로그인</Button>
        <Row style={{ margin: '2rem auto' }}>
          <HoverText style={{ borderRight: `1px solid ${themeObj.grey[300]}` }} presetsColor={presetsColor} onClick={() => { router.push(`/shop/auth/find-info?type=0`) }}>아이디 찾기</HoverText>
          <HoverText presetsColor={presetsColor} onClick={() => { router.push(`/shop/auth/find-info?type=1`) }}>비밀번호 찾기</HoverText>
        </Row>
        <Col style={{ alignItems: 'center', margin: '2rem auto' }}>
          <div style={{ fontSize: themeObj.font_size.size4, marginBottom: '1rem' }}>아직 회원이 아니신가요?</div>
          <div style={{ color: themeObj.grey[500] }}>지금 회원가입을 하시면</div>
          <div style={{ color: themeObj.grey[500] }}>다양하고 특별한 혜택이 준비되어 있습니다.</div>
          <Button variant="outlined" style={{
            height: '56px',
            marginTop: '1rem',
            maxWidth: '500px',
            width: '50%'
          }}
            onClick={() => {
              router.push('/shop/auth/sign-up')
            }}
          >회원가입</Button>
        </Col>
        <Col style={{ alignItems: 'center', margin: '2rem auto 1rem auto', width: '100%' }}>
          <div style={{ fontSize: themeObj.font_size.size4, marginBottom: '1rem' }}>비회원 주문조회</div>
          <div style={{ color: themeObj.grey[500] }}>비회원의 경우, 주문시의 주문번호로 주문조회가 가능합니다.</div>
        </Col>
        <TextField
          label='주문자명'
          onChange={(e) => {
            setNoneUserObj({ ...noneUserObj, ['name']: e.target.value })
          }}
          value={noneUserObj.name}
          style={inputStyle}
          autoComplete='new-password'
          onKeyPress={(e) => {
            if (e.key == 'Enter') {
            }
          }}
        />
        <TextField
          label='주문번호(하이픈(-) 포함)'
          onChange={(e) => {
            setNoneUserObj({ ...noneUserObj, ['orderNum']: e.target.value })
          }}
          value={noneUserObj.orderNum}
          style={inputStyle}
          autoComplete='new-password'
          onKeyPress={(e) => {
            if (e.key == 'Enter') {
            }
          }}
        />
        <TextField
          label='비회원주문 비밀번호'
          onChange={(e) => {
            setNoneUserObj({ ...noneUserObj, ['password']: e.target.value })
          }}
          type='password'
          value={noneUserObj.password}
          style={inputStyle}
          autoComplete='new-password'
          onKeyPress={(e) => {
            if (e.key == 'Enter') {
            }
          }}
        />
        <Button variant="contained" style={{
          height: '56px',
          marginTop: '1rem',
        }}>조회</Button>
      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default Demo1
