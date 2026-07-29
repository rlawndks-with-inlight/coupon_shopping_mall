import { Icon } from "@iconify/react";
import { Card, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Col, Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useLocales } from "src/locales";
import styled from "styled-components";
import Logo from "src/components/logo";


const Wrappers = styled.div`
max-width:1500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const PageTitle = styled.div`
margin: 4rem auto 2.5rem auto;
font-size:${themeObj.font_size.size2};
font-weight:bold;
letter-spacing:0.08em;
text-transform:uppercase;
text-align:center;
`
const AccentBar = styled.div`
width:48px;
height:3px;
margin:0.75rem auto 0 auto;
background:${props => props.theme?.palette?.primary?.main};
`
const ResultCard = styled(Card)`
border:1px solid ${themeObj.grey[300]};
box-shadow:none;
border-radius:4px;
`
const IconWrap = styled.div`
display:flex;
justify-content:center;
margin:2.5rem auto 1.5rem auto;
`
const ResultHeadline = styled.div`
text-align:center;
font-size:${themeObj.font_size.size4};
font-weight:bold;
margin-bottom:2rem;
`
const DetailList = styled(Col)`
max-width:420px;
width:90%;
margin:0 auto 3rem auto;
`
const DetailRow = styled(Row)`
justify-content:space-between;
align-items:center;
padding:0.9rem 0.25rem;
border-bottom:1px solid ${themeObj.grey[200]};
column-gap:1rem;
`
const DetailLabel = styled.div`
color:${themeObj.grey[600]};
font-size:${themeObj.font_size.size8};
letter-spacing:0.04em;
`
const DetailValue = styled.div`
color:${themeObj.grey[900]};
font-size:${themeObj.font_size.size7};
font-weight:500;
text-align:right;
word-break:break-all;
`
const LogoWrap = styled.div`
display:flex;
justify-content:center;
margin:2.5rem auto 0 auto;
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
  const theme = useTheme();

  const getResultContent = (type) => {
    if (themeDnsData?.id == 77) {
      return {
        icon: <Icon icon={'mdi:success-circle-outline'} style={{ margin: 'auto', fontSize: '8rem', color: themeDnsData?.theme_css?.main_color }} />,
        title: '테스트결제 진행중입니다.',
        content: '',
      }
    } else {
      if (type === '0000') {
        return {
          icon: <Icon icon={'mdi:success-circle-outline'} style={{ margin: 'auto', fontSize: '8rem', color: themeDnsData?.theme_css?.main_color }} />,
          title: translate('결제에 성공하였습니다.'),
          content: '',
        }
      } else {
        return {
          icon: <Icon icon={'material-symbols:cancel-outline'} style={{ margin: 'auto', fontSize: '8rem', color: themeDnsData?.theme_css?.main_color }} />,
          title: translate('결제에 실패하였습니다.'),
          content: '',
        }
      }
    }
  }

  return (
    <>
      <Wrappers>
        <PageTitle>
          {translate('결제결과')}
          <AccentBar theme={theme} />
        </PageTitle>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <ResultCard>
              <Col style={{ minHeight: '18rem' }}>
                <LogoWrap>
                  <Logo />
                </LogoWrap>
                <IconWrap>
                  {getResultContent(router.query?.result_cd/*type */).icon}
                </IconWrap>
                <ResultHeadline>
                  {getResultContent(router.query?.result_cd/*type */).title}
                </ResultHeadline>
                <DetailList>
                  {router.query?.ord_num &&
                    <DetailRow>
                      <DetailLabel>{translate('주문번호')}</DetailLabel>
                      <DetailValue>{router.query?.ord_num}</DetailValue>
                    </DetailRow>
                  }
                  {router.query?.acquirer &&
                    <DetailRow>
                      <DetailLabel>{translate('매입사')}</DetailLabel>
                      <DetailValue>{router.query?.acquirer}</DetailValue>
                    </DetailRow>
                  }
                  {router.query?.installment &&
                    <DetailRow>
                      <DetailLabel>{translate('할부기간')}</DetailLabel>
                      <DetailValue>{router.query?.installment === '00' ? '일시불' : router.query?.installment.charAt(1) + '개월'}</DetailValue>
                    </DetailRow>
                  }
                  {router.query?.buyer_name &&
                    <DetailRow>
                      <DetailLabel>{translate('구매자명')}</DetailLabel>
                      <DetailValue>{router.query?.buyer_name}</DetailValue>
                    </DetailRow>
                  }
                  {router.query?.buyer_phone &&
                    <DetailRow>
                      <DetailLabel>{translate('구매자 전화번호')}</DetailLabel>
                      <DetailValue>{router.query?.buyer_phone}</DetailValue>
                    </DetailRow>
                  }
                  {router.query?.trx_dttm &&
                    <DetailRow>
                      <DetailLabel>{translate('거래일시')}</DetailLabel>
                      <DetailValue>{router.query?.trx_dttm}</DetailValue>
                    </DetailRow>
                  }
                </DetailList>
              </Col>
            </ResultCard>
          </Grid>
        </Grid>
      </Wrappers>
    </>
  )
}
export default PayResultDemo
