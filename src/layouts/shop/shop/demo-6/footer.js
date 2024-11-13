import { useTheme } from "@emotion/react"
import { useSettingsContext } from "src/components/settings"
import { useLocales } from "src/locales"
import styled from "styled-components"

const Wrapper = styled.footer`
width:100%;
padding: 3rem 0 3rem 0;
margin-top: auto;
`
const ContentWrapper = styled.div`
display:flex;
flex-direction:column;
width:90%;
max-width:1300px;
margin: 0 auto;
row-gap: 0.25rem;
`
const Row = styled.div`
display:flex;
`
const Bold = styled.div`
font-weight:bold;
margin-right:0.5rem;
`
const MarginRight = styled.div`
margin-right:0.5rem;
`
const Footer = (props) => {
  const {
    data: {
    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const {
    company_name,
    addr,
    business_num,
    ceo_name,
    phone_num,
    fax_num,
    pvcy_rep_name,
    mail_order_num
  } = themeDnsData;
  return (
    <>
      <div style={{ marginTop: '2rem' }} />
      <Wrapper style={{ background: `${theme.palette.mode == 'dark' ? '' : 'white'}` }}>
        <ContentWrapper>

          <Row>
            <Bold>{translate('회사명')}</Bold>
            <MarginRight>{company_name}</MarginRight>
          </Row>
          <Row>
            <Bold>{translate('주소')}</Bold>
            <MarginRight>{addr}</MarginRight>
          </Row>
          <Row>
            <Bold>{translate('사업자등록번호')}</Bold>
            <MarginRight>{business_num}</MarginRight>
          </Row>
          <Row>
            <Bold>{translate('대표')}</Bold>
            <MarginRight>{ceo_name}</MarginRight>
          </Row>
          <Row>
            <Bold>{translate('고객센터')}</Bold>
            <MarginRight>{phone_num}</MarginRight>
          </Row>
          <Row>
            <Bold>{translate('팩스')}</Bold>
            <MarginRight>{fax_num}</MarginRight>
          </Row>

          <Row>
            <Bold>{translate('개인정보 보호책임자')}</Bold>
            <MarginRight>{pvcy_rep_name}</MarginRight>
          </Row>
          {
            mail_order_num != null &&
            <>
              <Row>
                <Bold>{translate('통신판매번호')}</Bold>
                <MarginRight>{mail_order_num}</MarginRight>
              </Row>
            </>
          }
          <Row style={{ flexWrap: 'wrap', textDecoration: 'underline' }}>
            <Bold style={{ marginRight: '1rem', cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=0') }}>{translate('서비스이용약관')}</Bold>
            <Bold style={{ cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=1') }}>{translate('개인정보처리방침')}</Bold>
          </Row>
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default Footer
