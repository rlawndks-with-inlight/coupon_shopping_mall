import { Icon } from "@iconify/react";
import { Button, Card, Grid } from "@mui/material";
import { useEffect } from "react";
import { Col, Row, Title } from "src/components/elements/styled-components";
import Logo from "src/components/logo";
import { useSettingsContext } from "src/components/settings";
import styled from "styled-components";


const Wrappers = styled.div`
max-width:1250px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`


const PayResultDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeDnsData } = useSettingsContext();

  const getResultContent = (type) => {
    if (type === '0000') {
      return {
        icon: <Icon icon={'mdi:success-circle-outline'} style={{ margin: 'auto', fontSize: '8rem', color: themeDnsData?.theme_css?.main_color }} />,
        title: '결제에 성공하였습니다.',
        content: '',
      }
    } else {
      return {
        icon: <Icon icon={'material-symbols:cancel-outline'} style={{ margin: 'auto', fontSize: '8rem', color: themeDnsData?.theme_css?.main_color }} />,
        title: '결제에 실패하였습니다.',
        content: '',
      }
    }
  }

  return (
    <>
      <Wrappers>
        <Title>{getResultContent(router.query?.result_cd).title}</Title>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card>
              <Col style={{ minHeight: '18rem' }}>
                <Logo />
                <div style={{ margin: 'auto' }}>
                  {getResultContent(router.query?.result_cd).icon}
                </div>
                {router.query?.ord_num &&
                  <Row style={{ margin: '1rem auto auto auto', columnGap: '1rem' }}>
                    <div>주문번호 :</div>
                    <div>{router.query?.ord_num}</div>
                  </Row>
                }
                {router.query?.acquirer &&
                  <Row style={{ margin: '1rem auto auto auto', columnGap: '1rem' }}>
                    <div>매입사 :</div>
                    <div>{router.query?.acquirer}</div>
                  </Row>
                }
                {router.query?.installment &&
                  <Row style={{ margin: '1rem auto auto auto', columnGap: '1rem' }}>
                    <div>할부기간 :</div>
                    <div>{router.query?.installment === '00' ? '일시불' : router.query?.installment.charAt(1) + '개월'}</div>
                  </Row>
                }
                {router.query?.buyer_name &&
                  <Row style={{ margin: '1rem auto auto auto', columnGap: '1rem' }}>
                    <div>구매자명 :</div>
                    <div>{router.query?.buyer_name}</div>
                  </Row>
                }
                {router.query?.buyer_phone &&
                  <Row style={{ margin: '1rem auto auto auto', columnGap: '1rem' }}>
                    <div>구매자 전화번호 :</div>
                    <div>{router.query?.buyer_phone}</div>
                  </Row>
                }
                {router.query?.trx_dttm &&
                  <Row style={{ margin: '1rem auto auto auto', columnGap: '1rem' }}>
                    <div>거래일시 :</div>
                    <div>{router.query?.trx_dttm}</div>
                  </Row>
                }
                <div style={{marginBottom:'1rem'}} />
              </Col>
            </Card>

          </Grid>
        </Grid>
        <Row style={{ margin: '1rem auto', columnGap: '0.5rem' }}>
          <Button variant="outlined" onClick={() => {router.push('/shop')}}>홈으로</Button>
          <Button variant="outlined" onClick={() => {router.push('/shop/auth/history')}}>결제내역</Button>
        </Row>
      </Wrappers>
    </>
  )
}
export default PayResultDemo