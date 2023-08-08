import { useTheme } from '@emotion/react';
import { Box, Button, Card, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { getPayHistoryByNoneUser } from 'src/utils/api-shop';
import styled from 'styled-components'
import { useModal } from "src/components/dialog/ModalProvider";
import { HistoryTable } from 'src/components/elements/shop/common';

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
const TABLE_HEAD = [
  { id: 'product', label: '상품' },
  { id: 'amount', label: '총액' },
  { id: 'buyer_name', label: '구매자명' },
  { id: 'trx_status', label: '배송상태' },
  { id: 'date', label: '업데이트일', align: 'right' },
  { id: '' },
];
const Demo1 = (props) => {
  const { setModal } = useModal()
  const { user, login } = useAuthContext();
  const { presetsColor, themeDnsData } = useSettingsContext();
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
    let user = await login(username, password)
    if (user) {
      router.push('/shop/auth/my-page')
    }
  }
  const onCheckNoneUserPay = async () => {
    let data = await getPayHistoryByNoneUser(noneUserObj);
    if (data) {
      setNoneUserTrxObj(data);
    }
  }
  return (
    <>
      <Wrappers style={{ marginBottom: '0' }}>
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
          label='주문번호(하이픈(-) 포함)'
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
        >조회</Button>
      </Wrappers>
      <Wrappers style={{ maxWidth: '1600px', minHeight: '0' }}>
        {Object.keys(noneUserTrxObj).length > 0 &&
          <>
            <Card>
              <HistoryTable historyContent={noneUserTrxObj} headLabel={TABLE_HEAD} />
            </Card>
          </>}
      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default Demo1
