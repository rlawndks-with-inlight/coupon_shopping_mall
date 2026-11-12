import { useTheme } from '@emotion/react';
import { Box, Button, Card, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import styled from 'styled-components'
import { useModal } from "src/components/dialog/ModalProvider";
import { HistoryTable } from 'src/components/elements/shop/common';
import { apiManager } from 'src/utils/api';
import { commarNumber, getOrderStatusText } from 'src/utils/function';
import { useLocales } from 'src/locales';
import toast from 'react-hot-toast';
import { getOptionLabel } from 'src/utils/shop-util';
import { formatLang } from 'src/utils/format';
import PasswordField from 'src/components/elements/PasswordField';
import { 비회원조회로 } from 'src/utils/guest-lookup';

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
transition: 0.3s;
&:hover{
  color:${props => props.themeDnsData?.theme_css?.main_color};
}
`
const LoginDemo = (props) => {
  const { setModal } = useModal()
  const { user, login } = useAuthContext();
  const { presetsColor, themeDnsData, onChangeWishData } = useSettingsContext();
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();
  const { translate } = useLocales();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [noneUserObj, setNoneUserObj] = useState({
    brand_id: themeDnsData?.id,
    buyer_phone: '',
    password: ''
  })

  useEffect(() => {
    if (router.query?.scroll_to) {
      window.scrollTo(0, router.query?.scroll_to);
    }
  }, [router.query])

  const onLogin = async () => {
    try {
      let user = await login(username, password, false, otp)
      if (user) {
        onChangeWishData(user?.wish_data ?? []);
        router.push('/shop')
      }
    } catch (err) {
      toast.error(err?.message)
      console.log(err)
    }

  }
  // 비회원 주문조회는 「비회원 주문조회」 화면 한 곳에서 한다(2026-11-12, src/utils/guest-lookup.js).
  // 예전엔 여기서 조회해 이 자리에 그렸는데, 여러 건이어도 최근 한 건만 보였고 취소요청·후기가 없었다.
  const onCheckNoneUserPay = () => {
    비회원조회로(router, noneUserObj);
  }

  return (
    <>
      <Wrappers style={{ marginBottom: '0' }}>
        <Title>{translate('로그인')}</Title>
        <TextField
          label={translate('유저아이디')}
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
        <PasswordField
          label={translate('비밀번호')}
          onChange={(e) => {
            setPassword(e.target.value)
          }}

          value={password}
          style={inputStyle}
          autoComplete='new-password'
          onKeyPress={(e) => {
            if (e.key == 'Enter') {
              onLogin();
            }
          }}
        />
        {themeDnsData?.is_use_otp == 1 &&
          <>
            <TextField
              label={translate('OTP')}
              onChange={(e) => {
                setOtp(e.target.value)
              }}
              value={otp}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
          </>}
        <Button variant="contained" style={{
          height: '56px',
          marginTop: '1rem',
        }}
          onClick={onLogin}
        >{translate('로그인')}</Button>
        <Row style={{ margin: '2rem auto' }}>
          <HoverText style={{ borderRight: `1px solid ${themeObj.grey[300]}` }} themeDnsData={themeDnsData} onClick={() => { router.push(`/shop/auth/find-info?type=0`) }}>{translate('아이디 찾기')}</HoverText>
          <HoverText themeDnsData={themeDnsData} onClick={() => { router.push(`/shop/auth/find-info?type=1`) }}>{translate('비밀번호 찾기')}</HoverText>
        </Row>
        <Col style={{ alignItems: 'center', margin: '2rem auto' }}>
          <div style={{ fontSize: themeObj.font_size.size4, marginBottom: '1rem' }}>{translate('아직 회원이 아니신가요?')}</div>
          <div style={{ color: themeObj.grey[500], whiteSpace: 'pre', textAlign: 'center' }}>
            {translate('지금 회원가입을 하시면\n 다양하고 특별한 혜택이 준비되어 있습니다.')}
          </div>
          <Button variant="outlined" style={{
            height: '56px',
            marginTop: '1rem',
            maxWidth: '500px',
            width: '50%'
          }}
            onClick={() => {
              router.push('/shop/auth/sign-up')
            }}
          >{translate('회원가입')}</Button>
        </Col>
        {themeDnsData?.is_closure != 1 &&
          <>
            <Col style={{ alignItems: 'center', margin: '2rem auto 1rem auto', width: '100%' }}>
              <div style={{ fontSize: themeObj.font_size.size4, marginBottom: '1rem' }}>{translate('비회원 주문조회')}</div>
              <div style={{ color: themeObj.grey[500] }}>{translate('비회원의 경우, 주문시 입력한 전화번호와 주문비밀번호로 주문조회가 가능합니다.')}</div>
            </Col>
            <TextField
              label={translate('전화번호')}
              placeholder='010-1234-5678'
              onChange={(e) => {
                setNoneUserObj({ ...noneUserObj, ['buyer_phone']: e.target.value })
              }}
              value={noneUserObj.buyer_phone}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <PasswordField
              label={translate('비회원주문 비밀번호')}
              onChange={(e) => {
                setNoneUserObj({ ...noneUserObj, ['password']: e.target.value })
              }}

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
            }}
              onClick={() => {
                // setModal({
                //   func: () => { onCheckNoneUserPay(row?.id) },
                //   icon: 'material-symbols:delete-outline',
                //   title: '정말로 조회하시겠습니까'
                // })
                onCheckNoneUserPay();
              }}
            >{translate('조회')}</Button>
          </>}


      </Wrappers>
      <Wrappers style={{ maxWidth: '800px', minHeight: '0', marginTop: '2rem' }}>
      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default LoginDemo
