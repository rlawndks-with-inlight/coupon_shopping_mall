import { themeObj } from "src/components/elements/styled-components"
import { useSettingsContext } from "src/components/settings"
import styled from "styled-components"
import { logoSrc } from "src/data/data"
import { useLocales } from "src/locales"

const Wrappers = styled.footer`
margin-top: auto;
background:${themeObj.grey[300]};
min-height:200px;
padding:1rem;
max-width:840px;
margin:0 auto;
width:100%;
`
const ContentWrapper = styled.div`
display:flex;
flex-direction:column;
width:90%;
max-width:840px;
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
const Footer = () => {
  const { themeMode } = useSettingsContext();
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const {
    company_name,
    addr,
    business_num,
    ceo_name,
    phone_num,
    fax_num,
    mail_order_num,
    pvcy_rep_name,
  } = themeDnsData;
  return (
    <>
      <Wrappers style={{
        background: `${themeMode == 'dark' ? '#222222' : themeObj.grey[300]}`
      }}>
        <ContentWrapper>
          <img src={logoSrc()} style={{ width: '200px' }} />

          {/*
            <Row>
              <Bold>{translate('회사명')}</Bold>
              <MarginRight>{company_name}</MarginRight>
            </Row>
  */}
          {ceo_name.length > 1 &&
            <>
              <Row>
                <Bold>{translate('대표')}</Bold>
                <MarginRight>{ceo_name}</MarginRight>
              </Row>
            </>
          }
          {addr.length > 1 &&
            <>
              <Row>
                <Bold style={{ whiteSpace: 'nowrap' }}>{translate('주소')}</Bold>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <MarginRight>{addr}</MarginRight>
                </div>
              </Row>
            </>
          }
          {business_num.length > 1 &&
            <>
              <Row>
                <Bold>{translate('사업자등록번호')}</Bold>
                <MarginRight>{business_num}</MarginRight>
              </Row>
            </>
          }
          {phone_num.length > 1 &&
            <>
              <Row>
                <Bold>{translate('전화')}</Bold>
                <div style={{ display: 'flex' }}>
                  <MarginRight>{phone_num}</MarginRight>
                </div>
              </Row>
            </>
          }
          {fax_num.length > 1 &&
            <>
              <Row>
                <Bold>{translate('팩스')}</Bold>
                <MarginRight>{fax_num}</MarginRight>
              </Row>
            </>
          }
          {pvcy_rep_name.length > 1 &&
            <>
              <Row>
                <Bold>{translate('개인정보 보호책임자')}</Bold>
                <MarginRight>{pvcy_rep_name}</MarginRight>
              </Row>
            </>
          }
          {mail_order_num.length > 1 &&
            <>
              <Row>
                <Bold>{translate('통신판매번호')}</Bold>
                <MarginRight>{mail_order_num}</MarginRight>
              </Row>
            </>
          }
          {/*<Row style={{ flexWrap: 'wrap', textDecoration: 'underline' }}>
                        <Bold style={{ marginRight: '1rem', cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=0') }}>{translate('서비스이용약관')}</Bold>
                        <Bold style={{ cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=1') }}>{translate('개인정보처리방침')}</Bold>
                  </Row>*/}
        </ContentWrapper>
      </Wrappers>
    </>
  )
}
export default Footer
