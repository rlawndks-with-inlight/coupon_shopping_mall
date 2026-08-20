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

const Wrappers = styled.div`
max-width:460px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
padding-top:2rem;
`
const SectionTitle = styled.div`
font-size:${themeObj.font_size.size3};
font-weight:bold;
text-transform:uppercase;
letter-spacing:0.18em;
text-align:center;
margin: 2.5rem auto 0.75rem auto;
`
const AccentBar = styled.div`
width: 44px;
height: 3px;
margin: 0 auto 2rem auto;
background:${props => props.color};
`
const BlockTitle = styled.div`
font-size:${themeObj.font_size.size6};
font-weight:bold;
text-transform:uppercase;
letter-spacing:0.1em;
text-align:center;
margin-bottom:0.5rem;
`
const Helper = styled.div`
color:${themeObj.grey[500]};
font-size:${themeObj.font_size.size8};
text-align:center;
line-height:1.6;
white-space:pre-line;
`
const Divider = styled.div`
width:100%;
height:1px;
background:${themeObj.grey[300]};
margin: 2.5rem 0;
`
const HoverText = styled.div`
padding:0 1rem;
color:${themeObj.grey[500]};
font-size:${themeObj.font_size.size8};
letter-spacing:0.02em;
cursor:pointer;
transition: 0.3s;
&:hover{
  color:${props => props.themeDnsData?.theme_css?.main_color};
}
`
const OrderRow = styled.div`
display:flex;
justify-content:space-between;
align-items:flex-start;
column-gap:1rem;
padding:0.85rem 1.25rem;
border-bottom:1px solid ${themeObj.grey[200]};
&:last-child{
  border-bottom:none;
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
  const mainColor = theme.palette.primary.main;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [noneUserObj, setNoneUserObj] = useState({
    brand_id: themeDnsData?.id,
    buyer_phone: '',
    password: ''
  })
  const [noneUserTrxObj, setNoneUserTrxObj] = useState({});

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
  const onCheckNoneUserPay = async () => {
    let data = await apiManager(`transactions/0`, 'get', noneUserObj);
    if (data) {
      // 전화번호 조회는 여러 건(배열)을 반환할 수 있어 안전하게 처리한다.
      const trx = Array.isArray(data) ? (data[0] ?? {}) : data;
      setNoneUserTrxObj(trx ?? {});
    }
  }

  return (
    <>
      <Wrappers>
        <SectionTitle>{translate('로그인')}</SectionTitle>
        <AccentBar color={mainColor} />
        <TextField
          label={translate('유저아이디')}
          onChange={(e) => {
            setUsername(e.target.value)
          }}
          value={username}
          style={inputStyle}
          fullWidth
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
          fullWidth
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
              fullWidth
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
          </>}
        <Button variant="contained" style={{
          height: '54px',
          marginTop: '1.5rem',
          borderRadius: 0,
          letterSpacing: '0.1em',
          fontWeight: 'bold',
        }}
          onClick={onLogin}
        >{translate('로그인')}</Button>
        <Row style={{ margin: '1.75rem auto', justifyContent: 'center' }}>
          <HoverText style={{ borderRight: `1px solid ${themeObj.grey[300]}` }} themeDnsData={themeDnsData} onClick={() => { router.push(`/shop/auth/find-info?type=0`) }}>{translate('아이디 찾기')}</HoverText>
          <HoverText themeDnsData={themeDnsData} onClick={() => { router.push(`/shop/auth/find-info?type=1`) }}>{translate('비밀번호 찾기')}</HoverText>
        </Row>
        <Divider />
        <Col style={{ alignItems: 'center', rowGap: '0.75rem' }}>
          <BlockTitle>{translate('아직 회원이 아니신가요?')}</BlockTitle>
          <Helper>
            {translate('지금 회원가입을 하시면\n 다양하고 특별한 혜택이 준비되어 있습니다.')}
          </Helper>
          <Button variant="outlined" style={{
            height: '54px',
            marginTop: '1rem',
            width: '100%',
            borderRadius: 0,
            letterSpacing: '0.1em',
            fontWeight: 'bold',
          }}
            onClick={() => {
              router.push('/shop/auth/sign-up')
            }}
          >{translate('회원가입')}</Button>
        </Col>
        {themeDnsData?.is_closure != 1 &&
          <>
            <Divider />
            <Col style={{ alignItems: 'center', rowGap: '0.5rem', marginBottom: '1.25rem' }}>
              <BlockTitle>{translate('비회원 주문조회')}</BlockTitle>
              <Helper>{translate('비회원의 경우, 주문시 입력한 전화번호와 주문비밀번호로 주문조회가 가능합니다.')}</Helper>
            </Col>
            <TextField
              label={translate('전화번호')}
              placeholder={'010-1234-5678'}
              onChange={(e) => {
                setNoneUserObj({ ...noneUserObj, ['buyer_phone']: e.target.value })
              }}
              value={noneUserObj.buyer_phone}
              style={inputStyle}
              fullWidth
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
              fullWidth
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <Button variant="contained" style={{
              height: '54px',
              marginTop: '1.5rem',
              borderRadius: 0,
              letterSpacing: '0.1em',
              fontWeight: 'bold',
            }}
              onClick={() => {
                onCheckNoneUserPay();
              }}
            >{translate('조회')}</Button>
          </>}


      </Wrappers>
      <Wrappers style={{ maxWidth: '800px', minHeight: '0', marginTop: '0', paddingTop: '0', marginBottom: '10vh' }}>
        {Object.keys(noneUserTrxObj).length > 0 &&
          <>
            <Card style={{ margin: 'auto', width: '100%', borderRadius: 0, border: `1px solid ${themeObj.grey[300]}`, boxShadow: 'none' }}>
              <div style={{ borderTop: `3px solid ${mainColor}` }} />
              <OrderRow>
                <Typography variant='subtitle2' style={{ color: themeObj.grey[600], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{translate('주문번호')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.ord_num}</Typography>
              </OrderRow>
              <OrderRow>
                <Typography variant='subtitle2' style={{ color: themeObj.grey[600], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{translate('승인번호')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.appr_num}</Typography>
              </OrderRow>
              <OrderRow>
                <Typography variant='subtitle2' style={{ color: themeObj.grey[600], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{translate('구매자명')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.buyer_name}</Typography>
              </OrderRow>
              <OrderRow>
                <Typography variant='subtitle2' style={{ color: themeObj.grey[600], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{translate('구매자휴대폰번호')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.buyer_phone}</Typography>
              </OrderRow>
              <OrderRow>
                <Typography variant='subtitle2' style={{ color: themeObj.grey[600], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{translate('주문현황')}</Typography>
                <Typography variant='body2'>{getOrderStatusText(noneUserTrxObj)}</Typography>
              </OrderRow>
              <OrderRow>
                <Typography variant='subtitle2' style={{ color: themeObj.grey[600], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{translate('송장번호')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.invoice_num}</Typography>
              </OrderRow>
              <OrderRow style={{ flexDirection: 'column', rowGap: '0.75rem' }}>
                <Typography variant='subtitle2' style={{ color: themeObj.grey[600], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{translate('주문상세')}</Typography>
                <Typography variant='body2' component='div' style={{ width: '100%' }}>
                  <Col>
                    {noneUserTrxObj?.orders && noneUserTrxObj?.orders.map((order, index) => (
                      <>
                        <Col>
                          <Row>
                            <div style={{ minWidth: '62px', fontWeight: 'bold', color: mainColor }}>No.{index + 1}</div>
                          </Row>
                          <Row style={{ flexWrap: 'wrap' }}>
                            <div style={{ minWidth: '62px' }}>{translate('주문명')}: </div>
                            <div style={{ wordBreak: 'break-all' }}>{order?.order_name}</div>
                          </Row>
                          {order?.groups.length > 0 &&
                            <>
                              <Row>
                                <div style={{ minWidth: '62px' }}>{translate('옵션정보')}: </div>
                                <Col>
                                  {order?.groups && order?.groups.map((group, idx) => (
                                    <>
                                      <Row>
                                        <div style={{ minWidth: '62px', marginRight: '0.25rem' }}>{formatLang(group, 'group_name')}: </div>
                                        {group?.options && group?.options.map((option, idx2) => (
                                          <>
                                            <div>{getOptionLabel(option)} {/*({option?.option_price > 0 ? '+' : ''}{option?.option_price}) */}</div>{idx2 == group?.options.length - 1 ? '' : <>&nbsp;/&nbsp;</>}                                          </>
                                        ))}
                                      </Row>
                                    </>
                                  ))}
                                </Col>
                              </Row>
                            </>}
                          <Row>
                            <div style={{ minWidth: '62px' }}>{translate('가격')}: </div>
                            <div>{commarNumber(order?.order_amount)}</div>
                          </Row>
                        </Col>
                        <br />
                      </>
                    ))}
                  </Col>
                </Typography>
              </OrderRow>
            </Card>
          </>}
      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default LoginDemo
