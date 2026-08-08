import { Box, Button, Card, Divider, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Col, Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import styled from 'styled-components'
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from 'src/utils/api';
import { commarNumber, getTrxStatusByNumber, safeRedirectPath } from 'src/utils/function';
import { useLocales } from 'src/locales';
import toast from 'react-hot-toast';
import { getOptionLabel } from 'src/utils/shop-util';

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:460px;
width:90%;
margin: 3rem auto 5rem auto;
display:flex;
flex-direction:column;
`
const ResultWrapper = styled.div`
max-width:720px;
width:90%;
margin: 0 auto 5rem auto;
`
const HoverText = styled.div`
padding:0 1rem;
color:${themeObj.grey[600]};
cursor:pointer;
font-size:14px;
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
  const { translate } = useLocales();
  const mainColor = themeDnsData?.theme_css?.main_color;
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
        // 로그인이 필요해 튕겨 나온 화면이 있으면 그리로 돌려보낸다(없으면 홈).
        router.push(safeRedirectPath(router.query?.redirect, '/shop'))
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

  const renderRow = (label, value) => (
    <>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', columnGap: '1rem', padding: '0.85rem 0' }}>
        <Typography variant='body2' sx={{ color: 'text.secondary', minWidth: '90px' }}>{label}</Typography>
        <Typography variant='body2' sx={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' }}>{value}</Typography>
      </Row>
      <Divider />
    </>
  )

  return (
    <Wrapper>
      <ContentWrapper>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant='h4' sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
            {translate('로그인')}
          </Typography>
          <Box sx={{ width: '40px', height: '2px', margin: '1rem auto 0 auto', backgroundColor: mainColor || themeObj.grey[800] }} />
        </Box>

        <Card variant='outlined' sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '4px' }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label={translate('유저아이디')}
              onChange={(e) => {
                setUsername(e.target.value)
              }}
              value={username}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <TextField
              fullWidth
              label={translate('비밀번호')}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              type='password'
              value={password}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                  onLogin();
                }
              }}
            />
            {themeDnsData?.is_use_otp == 1 &&
              <TextField
                fullWidth
                label={translate('OTP')}
                onChange={(e) => {
                  setOtp(e.target.value)
                }}
                value={otp}
                autoComplete='new-password'
                onKeyPress={(e) => {
                  if (e.key == 'Enter') {
                  }
                }}
              />}
            <Button
              variant="contained"
              color="inherit"
              fullWidth
              sx={{ height: '52px', fontWeight: 600 }}
              onClick={onLogin}
            >{translate('로그인')}</Button>
          </Stack>
          <Row style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <HoverText style={{ borderRight: `1px solid ${themeObj.grey[300]}` }} themeDnsData={themeDnsData} onClick={() => { router.push(`/shop/auth/find-info?type=0`) }}>{translate('아이디 찾기')}</HoverText>
            <HoverText themeDnsData={themeDnsData} onClick={() => { router.push(`/shop/auth/find-info?type=1`) }}>{translate('비밀번호 찾기')}</HoverText>
          </Row>
        </Card>

        <Divider sx={{ my: 5 }}><Typography variant='caption' sx={{ color: 'text.secondary', px: 1 }}>{translate('아직 회원이 아니신가요?')}</Typography></Divider>

        <Col style={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary', whiteSpace: 'pre', lineHeight: 1.7, mb: 2.5 }}>
            {translate('지금 회원가입을 하시면\n 다양하고 특별한 혜택이 준비되어 있습니다.')}
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            sx={{ height: '52px', width: '100%', fontWeight: 600 }}
            onClick={() => {
              router.push('/shop/auth/sign-up')
            }}
          >{translate('회원가입')}</Button>
        </Col>

        {themeDnsData?.is_closure != 1 &&
          <>
            <Divider sx={{ my: 5 }}><Typography variant='caption' sx={{ color: 'text.secondary', px: 1 }}>{translate('비회원 주문조회')}</Typography></Divider>
            <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', lineHeight: 1.7, mb: 3 }}>
              {translate('비회원의 경우, 주문시 입력한 전화번호와 주문비밀번호로 주문조회가 가능합니다.')}
            </Typography>
            <Card variant='outlined' sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '4px' }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label={translate('전화번호')}
                  placeholder={'010-1234-5678'}
                  onChange={(e) => {
                    setNoneUserObj({ ...noneUserObj, ['buyer_phone']: e.target.value })
                  }}
                  value={noneUserObj.buyer_phone}
                  autoComplete='new-password'
                  onKeyPress={(e) => {
                    if (e.key == 'Enter') {
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label={translate('비회원주문 비밀번호')}
                  onChange={(e) => {
                    setNoneUserObj({ ...noneUserObj, ['password']: e.target.value })
                  }}
                  type='password'
                  value={noneUserObj.password}
                  autoComplete='new-password'
                  onKeyPress={(e) => {
                    if (e.key == 'Enter') {
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="inherit"
                  fullWidth
                  sx={{ height: '52px', fontWeight: 600 }}
                  onClick={() => {
                    onCheckNoneUserPay();
                  }}
                >{translate('조회')}</Button>
              </Stack>
            </Card>
          </>}
      </ContentWrapper>

      {Object.keys(noneUserTrxObj).length > 0 &&
        <ResultWrapper>
          <Card variant='outlined' sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '4px' }}>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>{translate('주문조회 결과')}</Typography>
            <Divider sx={{ mb: 1 }} />
            {renderRow(translate('주문번호'), noneUserTrxObj?.ord_num)}
            {renderRow(translate('승인번호'), noneUserTrxObj?.appr_num)}
            {renderRow(translate('구매자명'), noneUserTrxObj?.buyer_name)}
            {renderRow(translate('구매자휴대폰번호'), noneUserTrxObj?.buyer_phone)}
            {renderRow(translate('주문현황'), getTrxStatusByNumber(noneUserTrxObj?.trx_status))}
            {renderRow(translate('송장번호'), noneUserTrxObj?.invoice_num)}
            <Row style={{ padding: '0.85rem 0', flexDirection: 'column' }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1.5 }}>{translate('주문상세')}</Typography>
              <Col style={{ rowGap: '1rem' }}>
                {noneUserTrxObj?.orders && noneUserTrxObj?.orders.map((order, index) => (
                  <Box key={index} sx={{ backgroundColor: themeObj.grey[100], borderRadius: '4px', p: 2 }}>
                    <Col style={{ rowGap: '0.35rem' }}>
                      <Row>
                        <div style={{ minWidth: '62px', fontWeight: 'bold' }}>No.{index + 1}</div>
                      </Row>
                      <Row style={{ flexWrap: 'wrap' }}>
                        <div style={{ minWidth: '62px', color: themeObj.grey[600] }}>{translate('주문명')}: </div>
                        <div style={{ wordBreak: 'break-all' }}>{order?.order_name}</div>
                      </Row>
                      {order?.groups.length > 0 &&
                        <Row>
                          <div style={{ minWidth: '62px', color: themeObj.grey[600] }}>{translate('옵션정보')}: </div>
                          <Col>
                            {order?.groups && order?.groups.map((group, idx) => (
                              <Row key={idx}>
                                <div style={{ minWidth: '62px', marginRight: '0.25rem' }}>{group?.group_name}: </div>
                                {group?.options && group?.options.map((option, idx2) => (
                                  <>
                                    <div>{getOptionLabel(option)} </div>{idx2 == group?.options.length - 1 ? '' : <>&nbsp;/&nbsp;</>}
                                  </>
                                ))}
                              </Row>
                            ))}
                          </Col>
                        </Row>}
                      <Row>
                        <div style={{ minWidth: '62px', color: themeObj.grey[600] }}>{translate('가격')}: </div>
                        <div style={{ fontWeight: 600 }}>{commarNumber(order?.order_amount)}</div>
                      </Row>
                    </Col>
                  </Box>
                ))}
              </Col>
            </Row>
          </Card>
        </ResultWrapper>}
    </Wrapper>
  )
}
export default LoginDemo
