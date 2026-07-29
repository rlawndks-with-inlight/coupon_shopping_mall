import { Icon } from "@iconify/react";
import { Button, Divider, Typography } from "@mui/material";
import { Col, Row } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useLocales } from "src/locales";
import styled from "styled-components";
import Logo from "src/components/logo";

const Wrappers = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:560px;
width:90%;
margin: 4rem auto;
`
const ResultCard = styled.div`
border: 1px solid #eee;
border-radius: 12px;
padding: 3rem 2.5rem;
display:flex;
flex-direction:column;
@media (max-width:600px) {
  padding: 2.5rem 1.5rem;
}
`

const PayResultDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const mainColor = themeDnsData?.theme_css?.main_color;

  const getResultContent = (type) => {
    if (themeDnsData?.id == 77) {
      return {
        icon: <Icon icon={'mdi:success-circle-outline'} style={{ margin: 'auto', fontSize: '6rem', color: mainColor }} />,
        title: '테스트결제 진행중입니다.',
        content: '',
      }
    } else {
      if (type === '0000') {
        return {
          icon: <Icon icon={'mdi:success-circle-outline'} style={{ margin: 'auto', fontSize: '6rem', color: mainColor }} />,
          title: translate('결제에 성공하였습니다.'),
          content: '',
        }
      } else {
        return {
          icon: <Icon icon={'material-symbols:cancel-outline'} style={{ margin: 'auto', fontSize: '6rem', color: mainColor }} />,
          title: translate('결제에 실패하였습니다.'),
          content: '',
        }
      }
    }
  }

  const result = getResultContent(router.query?.result_cd/*type */);

  const infoRows = [
    { label: translate('주문번호'), value: router.query?.ord_num },
    { label: translate('매입사'), value: router.query?.acquirer },
    { label: translate('할부기간'), value: router.query?.installment ? (router.query?.installment === '00' ? '일시불' : router.query?.installment.charAt(1) + '개월') : undefined },
    { label: translate('구매자명'), value: router.query?.buyer_name },
    { label: translate('구매자 전화번호'), value: router.query?.buyer_phone },
    { label: translate('거래일시'), value: router.query?.trx_dttm },
  ].filter((row) => row.value);

  return (
    <>
      <Wrappers>
        <ContentWrapper>
          <ResultCard>
            <Col style={{ alignItems: 'center', rowGap: '1.5rem' }}>
              <Logo />
              <div style={{ display: 'flex' }}>
                {result.icon}
              </div>
              <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {result.title}
              </Typography>
            </Col>
            {infoRows.length > 0 &&
              <div style={{ marginTop: '2.5rem' }}>
                {infoRows.map((row, idx) => (
                  <div key={idx}>
                    {idx !== 0 && <Divider sx={{ my: 1.5 }} />}
                    <Row style={{ justifyContent: 'space-between', alignItems: 'center', columnGap: '1rem' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {row.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {row.value}
                      </Typography>
                    </Row>
                  </div>
                ))}
              </div>
            }
            <div style={{ marginTop: '2.5rem' }}>
              <Button
                fullWidth
                variant="contained"
                color="inherit"
                onClick={() => router.push('/shop')}
                sx={{ height: '48px', fontWeight: 600 }}
              >
                {translate('쇼핑 계속하기')}
              </Button>
            </div>
          </ResultCard>
        </ContentWrapper>
      </Wrappers>
    </>
  )
}
export default PayResultDemo
