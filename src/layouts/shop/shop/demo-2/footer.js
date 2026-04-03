import styled from "styled-components"
import { useSettingsContext } from "src/components/settings"
import { useLocales } from "src/locales"

const Wrapper = styled.footer`
width:100%;
padding: 2.5rem 0;
margin-top: auto;
`
const ContentWrapper = styled.div`
display:flex;
flex-direction:column;
width:90%;
max-width:1200px;
margin: 0 auto;
row-gap: 4px;
font-size:12px;
color:#999;
line-height:1.6;
`
const InfoRow = styled.div`
display:flex;
flex-wrap:wrap;
`
const Label = styled.span`
font-weight:600;
color:#777;
margin-right:4px;
`
const Sep = styled.span`
margin:0 8px;
color:#ddd;
`
const Footer = (props) => {
  const { translate } = useLocales();
  const { themeDnsData, themeMode } = useSettingsContext();
  const { company_name, addr, business_num, ceo_name, phone_num, fax_num, mail_order_num, pvcy_rep_name } = themeDnsData;

  return (
    <>
      <div style={{ marginTop: '2rem' }} />
      <Wrapper style={{ background: themeMode == 'dark' ? '#111' : '#f7f7f7', borderTop: `1px solid ${themeMode == 'dark' ? '#333' : '#eee'}` }}>
        <ContentWrapper>
          {company_name &&
            <div style={{ fontSize: '14px', fontWeight: '700', color: themeMode == 'dark' ? '#ccc' : '#333', marginBottom: '8px' }}>{company_name}</div>
          }
          <InfoRow>
            {ceo_name && <span><Label>{translate('대표')}</Label>{ceo_name}<Sep>|</Sep></span>}
            {business_num && <span><Label>{translate('사업자등록번호')}</Label>{business_num}<Sep>|</Sep></span>}
            {mail_order_num && <span><Label>{translate('통신판매번호')}</Label>{mail_order_num}</span>}
          </InfoRow>
          {addr && <InfoRow><Label>{translate('주소')}</Label><span>{addr}</span></InfoRow>}
          <InfoRow>
            {phone_num && <span><Label>{translate('고객센터')}</Label>{phone_num}<Sep>|</Sep></span>}
            {fax_num && <span><Label>{translate('팩스')}</Label>{fax_num}</span>}
          </InfoRow>
          {pvcy_rep_name && <InfoRow><Label>{translate('개인정보 보호책임자')}</Label><span>{pvcy_rep_name}</span></InfoRow>}
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default Footer
