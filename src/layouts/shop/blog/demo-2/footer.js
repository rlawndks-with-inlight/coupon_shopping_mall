import { themeObj } from "src/components/elements/styled-components"
import { useSettingsContext } from "src/components/settings"
import styled from "styled-components"
import { logoSrc } from "src/data/data"
import { useLocales } from "src/locales"
import { useState } from "react"
import { Drawer, IconButton } from "@mui/material"
import { Icon } from "@iconify/react"
import Policy from "src/pages/blog/auth/policy"
import { useRouter } from "next/router"

const Wrappers = styled.footer`
margin-top: auto;
min-height:250px;
padding:24px 16px 40px;
max-width:720px;
margin:0 auto;
width:100%;
`
const ContentWrapper = styled.div`
display:flex;
flex-direction:column;
width:100%;
max-width:720px;
margin: 0 auto;
row-gap: 0.25rem;
`
const Row = styled.div`
display:flex;
`
const Bold = styled.div`
font-weight:bold;
margin-right:1rem;
font-size: 12px;
`
const MarginRight = styled.div`
margin-right:0.5rem;
`
const DrawerTitle = styled.div`
display:flex;
margin-left:auto;
width:95%;
padding-left:2.5%;
justify-content:space-between;
`
const PolicyContainer = styled.div`
padding:0 2.5%;
`

const FixedFooter = styled.div`
height: 60px;
max-width: 720px;
width: 100%;
position: fixed;
bottom: 0;
background-color: white;
left: 50%;
transform: translate(-50%);
z-index: 10;
box-shadow: rgba(0, 0, 0, 0.14) 0px 8px 10px, rgba(0, 0, 0, 0.12) 0px 3px 14px, rgba(0, 0, 0, 0.2) 0px 5px 5px;
display: flex;
align-items: center;
justify-content: space-around;
`

const Footer = () => {
  const { themeMode } = useSettingsContext();
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();

  const [policyType, setPolicyType] = useState(0);

  const router = useRouter();

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
        background: `${themeMode == 'dark' ? '#222222' : '#F6F6F6'}`
      }}>
        <ContentWrapper>
          <Row>
            <Bold style={{ cursor: 'pointer' }} onClick={() => { setPolicyType(1) }}>
              이용약관
            </Bold>
            <Bold style={{ cursor: 'pointer' }} onClick={() => { setPolicyType(2) }}>
              개인정보정책
            </Bold>
          </Row>

          <Row style={{ fontSize: '10px' }}>
            {ceo_name.length > 1 &&
              <>
                <MarginRight>BS컴퍼니</MarginRight>
                <MarginRight>|</MarginRight>
              </>
            }
            {ceo_name.length > 1 &&
              <>
                <MarginRight>{translate('대표')} {ceo_name}</MarginRight>
                <MarginRight>|</MarginRight>
              </>
            }
            {business_num.length > 1 &&
              <>
                <MarginRight>{translate('사업자번호')}</MarginRight>
                <MarginRight>{business_num}</MarginRight>
              </>
            }
          </Row>
          <Row style={{ fontSize: '10px' }}>
            {mail_order_num.length > 1 &&
              <>
                <MarginRight>{translate('통신판매업신고')} {mail_order_num}</MarginRight>
              </>
            }
          </Row>
          <Row style={{ fontSize: '10px' }}>
            {addr.length > 1 &&
              <>
                <MarginRight>{addr}</MarginRight>
              </>
            }
          </Row>
          <Row style={{ fontSize: '10px' }}>
            {phone_num.length > 1 &&
              <>
                <MarginRight>{translate('전화')} {phone_num}</MarginRight>
                <MarginRight>|</MarginRight>
              </>
            }
            {fax_num.length > 1 &&
              <>
                <MarginRight>{translate('팩스')} {fax_num}</MarginRight>
              </>
            }
          </Row>
          <Row style={{ fontSize: '10px' }}>
            {pvcy_rep_name.length > 1 &&
              <>
                <MarginRight>{translate('개인정보 보호책임자')} {pvcy_rep_name}</MarginRight>
              </>
            }
          </Row>

          <Row style={{ marginTop: '1rem', color: '#999999', fontSize: '10px' }}>
            본 사이트는 위탁판매자이며 상품은 다수의 위탁업체에서 제공하고 있습니다. 상품, 상품정보, 거래에 관한 의무와 책임은 공급사에게 있습니다.
          </Row>

        </ContentWrapper>
        <Drawer
          anchor='bottom'
          open={policyType}
          onClose={() => {
            setPolicyType(0)
          }}
          PaperProps={{
            sx: {
              maxWidth: '790px',
              width: '90%',
              maxHeight: '500px',
              margin: '0 auto',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              paddingBottom: '2rem',
              position: 'fixed'
            }
          }}
        >
          <DrawerTitle>
            <img src={logoSrc()} style={{ height: '56px', width: 'auto' }} />
            <IconButton
              sx={{}}
              onClick={() => {
                setPolicyType(0)
              }}
            >
              <Icon icon={'ic:round-close'} fontSize={'2.5rem'} />
            </IconButton>
          </DrawerTitle>
          <PolicyContainer>
            <Policy type={policyType - 1} />
          </PolicyContainer>
        </Drawer>
      </Wrappers>
      <FixedFooter>
        <Icon icon='bi:handbag' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => { router.push('/blog') }} />
        <Icon icon={'iconoir:search'} style={{ fontSize: '24px', cursor: 'pointer' }} />
        <Icon icon={'fluent:cart-20-regular'} style={{ fontSize: '32px', cursor: 'pointer' }} onClick={() => router.push('/blog/auth/cart')} />
        {
          /*
          <Icon icon='radix-icons:hamburger-menu' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => {  }} />
        <Icon icon='ph:bell' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => {  }} />
          */
        }
        <Icon icon='basil:user-outline' style={{ fontSize: '32px', cursor: 'pointer' }} onClick={() => { router.push('/blog/auth/my-page') }} />
      </FixedFooter>
    </>
  )
}
export default Footer
