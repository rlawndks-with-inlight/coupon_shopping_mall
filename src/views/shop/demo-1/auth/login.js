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
import { commarNumber, getTrxStatusByNumber } from 'src/utils/function';
import { useLocales } from 'src/locales';
import toast from 'react-hot-toast';

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
    ord_num: '',
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
        router.push('/shop/auth/my-page')
      }
    } catch (err) {
      toast.error(err?.message)
      console.log(err)
    }

  }
  const onCheckNoneUserPay = async () => {
    let data = await apiManager(`transactions/0`, 'get', noneUserObj);
    if (data) {
      setNoneUserTrxObj(data);
    }
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
        <TextField
          label={translate('비밀번호')}
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
              <div style={{ color: themeObj.grey[500] }}>{translate('비회원의 경우, 주문시의 주문번호로 주문조회가 가능합니다.')}</div>
            </Col>
            <TextField
              label={translate('주문번호(하이픈(-) 포함)')}
              onChange={(e) => {
                setNoneUserObj({ ...noneUserObj, ['ord_num']: e.target.value })
              }}
              value={noneUserObj.ord_num}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <TextField
              label={translate('비회원주문 비밀번호')}
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
            >{translate('조회')}</Button>
          </>}


      </Wrappers>
      <Wrappers style={{ maxWidth: '800px', minHeight: '0', marginTop: '2rem' }}>
        {Object.keys(noneUserTrxObj).length > 0 &&
          <>
            <Card style={{ margin: 'auto', width: '100%', display: 'flex', flexDirection: 'column', rowGap: '1rem', padding: '1rem 0' }}>
              <Col style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
                <Typography variant='subtitle1'>{translate('주문번호')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.ord_num}</Typography>
              </Col>
              <Col style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
                <Typography variant='subtitle1'>{translate('승인번호')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.appr_num}</Typography>
              </Col>
              <Col style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
                <Typography variant='subtitle1'>{translate('구매자명')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.buyer_name}</Typography>
              </Col>
              <Col style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
                <Typography variant='subtitle1'>{translate('구매자휴대폰번호')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.buyer_phone}</Typography>
              </Col>
              <Col style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
                <Typography variant='subtitle1'>{translate('주문현황')}</Typography>
                <Typography variant='body2'>{getTrxStatusByNumber(noneUserTrxObj?.trx_status)}</Typography>
              </Col>
              <Col style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
                <Typography variant='subtitle1'>{translate('송장번호')}</Typography>
                <Typography variant='body2'>{noneUserTrxObj?.invoice_num}</Typography>
              </Col>
              <Col style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
                <Typography variant='subtitle1'>{translate('주문상세')}</Typography>
                <Typography variant='body2'>
                  <Col>
                    {noneUserTrxObj?.orders && noneUserTrxObj?.orders.map((order, index) => (
                      <>
                        <Col>
                          <Row>
                            <div style={{ minWidth: '62px', fontWeight: 'bold' }}>No.{index + 1}</div>
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
                                        <div style={{ minWidth: '62px', marginRight: '0.25rem' }}>{group?.group_name}: </div>
                                        {group?.options && group?.options.map((option, idx2) => (
                                          <>
                                            <div>{option?.option_name ?? option.value} {/*({option?.option_price > 0 ? '+' : ''}{option?.option_price}) */}</div>{idx2 == group?.options.length - 1 ? '' : <>&nbsp;/&nbsp;</>}                                          </>
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
              </Col>
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
