import { useTheme } from '@emotion/react';
import { Box, Button, Card, TextField, Typography, Dialog } from '@mui/material';
import { useEffect, useState } from 'react';
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import styled from 'styled-components'
import { useModal } from "src/components/dialog/ModalProvider";
import { HistoryTable } from 'src/components/elements/shop/common';
import { apiManager } from 'src/utils/api';
import { commarNumber, safeRedirectPath, getOrderStatusText } from 'src/utils/function';
import { Icon } from '@iconify/react';
import { getOptionLabel } from 'src/utils/shop-util';
import { formatLang } from 'src/utils/format';
import { useLocales } from 'src/locales';
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
  const { translate } = useLocales();
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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dialogOpen, setDialogOpen] = useState("");

  const [noneUserObj, setNoneUserObj] = useState({
    brand_id: themeDnsData?.id,
    buyer_phone: '',
    password: ''
  })

  useEffect(() => {
    //console.log(themeDnsData)
    if (router.query?.scroll_to) {
      window.scrollTo(0, router.query?.scroll_to);
    }
  }, [router.query])

  const onLogin = async () => {
    let user = await login(username, password)
    if (user) {
      onChangeWishData(user?.wish_data ?? []);
      // 로그인이 필요해 튕겨 나온 화면이 있으면 그리로 돌려보낸다(없으면 홈).
      router.push(safeRedirectPath(router.query?.redirect, '/shop'))
    }
  }
  // 비회원 주문조회는 「비회원 주문조회」 화면 한 곳에서 한다(2026-11-12, src/utils/guest-lookup.js).
  // 예전엔 여기서 조회해 이 자리에 그렸는데, 여러 건이어도 최근 한 건만 보였고 취소요청·후기가 없었다.
  const onCheckNoneUserPay = () => {
    비회원조회로(router, noneUserObj);
  }

  const handleClose = () => {
    setDialogOpen(false)
  }

  return (
    <>
      <Wrappers style={{ marginBottom: '0' }}>
        <Title
          style={{
            borderTop: '1px solid #cccccc',
            width: '100%',
            textAlign: 'center',
            fontFamily: 'Playfair Display',
            fontSize: '40px',
            paddingTop: '1rem'
          }}>
          Welcome to {themeDnsData?.id == 74 ? 'The grazia' : themeDnsData?.company_name}
        </Title>
        <div style={{ width: '100%', textAlign: 'center', marginBottom: '1rem' }}>{translate('가입 또는 로그인 해주세요.')}</div>
        <TextField
          label={translate('아이디')}
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
        <Button variant="contained" style={{
          height: '60px',
          marginTop: '1rem',
          borderRadius: '0',
          backgroundColor: `${themeDnsData?.theme_css.main_color}`,
          fontSize: '18px'
        }}
          onClick={onLogin}
        >{translate('로그인')}</Button>
        <Row style={{ margin: '1rem 0 2rem auto' }}>
          {/* 찾기 링크가 통째로 주석 처리돼 있어 프레임3에서는 아이디·비밀번호를 찾을 방법이 없었다.
              (/shop/auth/find-info 페이지 자체는 정상 동작한다) */}
          <HoverText style={{ borderRight: `1px solid ${themeObj.grey[300]}` }} themeDnsData={themeDnsData} onClick={() => { router.push(`/shop/auth/find-info?type=0`) }}>{translate('아이디 찾기')}</HoverText>
          <HoverText style={{ paddingRight: '0' }} themeDnsData={themeDnsData} onClick={() => { router.push(`/shop/auth/find-info?type=1`) }}>{translate('비밀번호 찾기')}</HoverText>
        </Row>
        <Row style={{ margin: '1rem auto', marginTop: '10rem', justifyContent: 'space-between', width: '100%', display: `${themeDnsData?.id == 74 && !themeDnsData?.seller_id ? 'none' : ''}` }}>
          {/* 아래 '회원가입' 버튼으로 유도하는 안내 문구. 링크는 중복이라 두지 않는다.
              (themeDnsData 는 styled 컴포넌트가 아닌 div 에 넘기면 React 경고가 나므로 제거) */}
          <div>{translate('아직 회원이 아니신가요?')}</div>
          {/* 아래 Dialog(open={dialogOpen})를 여는 유일한 트리거였는데 주석 처리돼 있어
              비회원 주문조회 화면을 띄울 방법이 없었다. */}
          <HoverText style={{ paddingRight: '0' }} themeDnsData={themeDnsData} onClick={() => { setDialogOpen(true) }}>{translate('비회원 주문조회')}</HoverText>
        </Row>
        <Button variant="contained" style={{
          height: '60px',
          borderRadius: '0',
          backgroundColor: `${themeDnsData?.theme_css.main_color}`,
          fontSize: '18px',
          display: `${themeDnsData?.id == 74 && !themeDnsData?.seller_id ? 'none' : ''}`
        }}
          onClick={() => { router.push(`/shop/auth/sign-up`) }}
        >{translate('회원가입')}</Button>
        <Dialog fullWidth open={dialogOpen} onClose={handleClose}>
          <Col style={{ alignItems: 'center', margin: '2rem auto' }}>
            <Icon
              icon={'material-symbols:close'}
              style={{ position: 'absolute', right: '1rem', top: '1rem', width: '24px', height: '24px', cursor: 'pointer' }}
              onClick={() => {
                setDialogOpen(false)
              }}
            />
            <Col style={{ alignItems: 'center', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '22px', marginBottom: '1rem' }}>{translate('비회원 주문조회')}</div>
            </Col>
            <div>{translate('지금 회원가입을 하시면')}</div>
            <div>{translate('다양하고 특별한 혜택이 준비되어 있습니다.')}</div>
            <TextField
              label={translate('전화번호')}
              placeholder='010-1234-5678'
              onChange={(e) => {
                setNoneUserObj({ ...noneUserObj, ['buyer_phone']: e.target.value })
              }}
              value={noneUserObj.buyer_phone}
              style={{ ...inputStyle, width: '100%' }}
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
              style={{ ...inputStyle, width: '100%' }}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <Button variant="contained" style={{
              height: '56px',
              marginTop: '1rem',
              width: '100%',
              borderRadius: '0',
              backgroundColor: `${themeDnsData?.theme_css.main_color}`,
              fontSize: '18px'
            }}
              onClick={() => {
                //setModal({
                //func: () => { onCheckNoneUserPay(row?.id) },
                //icon: 'material-symbols:delete-outline',
                //title: '정말로 조회하시겠습니까'
                //})
                onCheckNoneUserPay();
              }}
            >{translate('조회하기')}</Button>
            <Row style={{ margin: '1rem auto', marginTop: '10rem', justifyContent: 'space-between', width: '100%' }}>
              {/* 문구는 '회원이 아니신가요?' 인데 '아이디 찾기'로 보내던 잘못된 링크였다.
                  바로 아래 회원가입 버튼이 있으므로 안내 문구로만 둔다. */}
              <div>{translate('아직 회원이 아니신가요?')}</div>
            </Row>
            <Button variant="contained" style={{
              height: '60px',
              borderRadius: '0',
              backgroundColor: `${themeDnsData?.theme_css.main_color}`,
              fontSize: '18px',
              width: '100%'
            }}
              onClick={() => { router.push(`/shop/auth/sign-up`) }}
            >{translate('회원가입')}</Button>
          </Col>
        </Dialog>
        {/*<Col style={{ alignItems: 'center', margin: '2rem auto' }}>
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
          <div style={{ color: themeObj.grey[500] }}>비회원의 경우, 주문시 입력한 전화번호와 주문비밀번호로 주문조회가 가능합니다.</div>
        </Col>
        <TextField
          label='전화번호'
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
        }}
          onClick={() => {
            // setModal({
            //   func: () => { onCheckNoneUserPay(row?.id) },
            //   icon: 'material-symbols:delete-outline',
            //   title: '정말로 조회하시겠습니까'
            // })
            onCheckNoneUserPay();
          }}
        >조회</Button>*/}
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
