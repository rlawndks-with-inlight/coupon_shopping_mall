import styled from "styled-components"
import { useTheme } from '@mui/material/styles'
import { useSettingsContext } from "src/components/settings"
import { useLocales } from "src/locales"
import { themeObj } from 'src/components/elements/styled-components'
import { logoSrc } from "src/data/data"

const Wrappers = styled.footer`
width:100%;
margin-top:auto;
border-top:2px solid ${props => props.accent || themeObj.grey[900]};
`
const Inner = styled.div`
max-width:1500px;
width:90%;
margin:0 auto;
padding:2.5rem 0 3rem;
display:flex;
flex-direction:column;
`
const TopRow = styled.div`
display:flex;
align-items:center;
flex-wrap:wrap;
gap:1rem;
padding-bottom:1.25rem;
border-bottom:1px solid ${themeObj.grey[300]};
`
const Brand = styled.div`
font-size:${themeObj.font_size.size6};
font-weight:bold;
text-transform:uppercase;
letter-spacing:0.08em;
margin-right:auto;
`
const LogoImg = styled.img`
height:28px;
width:auto;
margin-right:auto;
`
const PolicyLinks = styled.div`
display:flex;
align-items:center;
column-gap:1.25rem;
flex-wrap:wrap;
`
const PolicyLink = styled.div`
font-size:${themeObj.font_size.size9};
font-weight:bold;
text-transform:uppercase;
letter-spacing:0.05em;
cursor:pointer;
color:inherit;
transition:color 0.15s;
&:hover{
  color:${props => props.accent || themeObj.grey[900]};
}
`
const InfoWrap = styled.div`
display:flex;
flex-wrap:wrap;
column-gap:1.5rem;
row-gap:0.4rem;
padding:1.25rem 0 0.25rem;
font-size:${themeObj.font_size.size9};
line-height:1.6;
color:${themeObj.grey[700]};
`
const Info = styled.span`
display:inline-flex;
align-items:center;
`
const Label = styled.span`
font-weight:bold;
text-transform:uppercase;
letter-spacing:0.03em;
margin-right:0.4rem;
`
const Copyright = styled.div`
margin-top:1rem;
font-size:${themeObj.font_size.size10};
letter-spacing:0.05em;
text-transform:uppercase;
color:${themeObj.grey[500]};
`
const Footer = (props) => {
  const router = props?.func?.router;
  const theme = useTheme();
  const { translate } = useLocales();
  const { themeDnsData, themeMode } = useSettingsContext();
  const {
    company_name,
    addr,
    business_num,
    ceo_name,
    phone_num,
    fax_num,
    pvcy_rep_name,
    mail_order_num,
  } = themeDnsData ?? {};

  const accent = themeDnsData?.theme_css?.main_color || theme?.palette?.primary?.main;
  const logo = logoSrc();

  const goPolicy = (type) => {
    if (router) {
      router.push(`/shop/auth/policy?type=${type}`);
    }
  }

  return (
    <>
      <div style={{ marginTop: '2rem' }} />
      <Wrappers
        accent={accent}
        style={{ background: themeMode == 'dark' ? '#000' : '#fff' }}
      >
        <Inner>
          <TopRow>
            {logo ?
              <LogoImg src={logo} alt={company_name || 'logo'} />
              :
              (company_name && <Brand>{company_name}</Brand>)
            }
            <PolicyLinks>
              <PolicyLink accent={accent} onClick={() => goPolicy(0)}>
                {translate('서비스이용약관')}
              </PolicyLink>
              <PolicyLink accent={accent} onClick={() => goPolicy(1)}>
                {translate('개인정보처리방침')}
              </PolicyLink>
            </PolicyLinks>
          </TopRow>
          <InfoWrap>
            {company_name && <Info><Label>{translate('회사명')}</Label>{company_name}</Info>}
            {ceo_name && <Info><Label>{translate('대표')}</Label>{ceo_name}</Info>}
            {business_num && <Info><Label>{translate('사업자등록번호')}</Label>{business_num}</Info>}
            {mail_order_num && <Info><Label>{translate('통신판매번호')}</Label>{mail_order_num}</Info>}
            {addr && <Info><Label>{translate('주소')}</Label>{addr}</Info>}
            {phone_num && <Info><Label>{translate('고객센터')}</Label>{phone_num}</Info>}
            {fax_num && <Info><Label>{translate('팩스')}</Label>{fax_num}</Info>}
            {pvcy_rep_name && <Info><Label>{translate('개인정보 보호책임자')}</Label>{pvcy_rep_name}</Info>}
          </InfoWrap>
          {company_name &&
            <Copyright>{`© ${company_name}. All rights reserved.`}</Copyright>
          }
        </Inner>
      </Wrappers>
    </>
  )
}
export default Footer
