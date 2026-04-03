import { themeObj } from "src/components/elements/styled-components"
import { useSettingsContext } from "src/components/settings"
import styled from "styled-components"
import { logoSrc } from "src/data/data"
import { useLocales } from "src/locales"
import { Icon } from "@iconify/react"
import { useRouter } from "next/router"
import { useState } from "react"
import DialogSearch from "src/components/dialog/DialogSearch"

const Wrappers = styled.footer`
margin-top: auto;
padding: 32px 0 80px;
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
row-gap: 4px;
font-size:${themeObj.font_size.size9};
color:${themeObj.grey[500]};
line-height:1.6;
`
const InfoRow = styled.div`
display:flex;
flex-wrap:wrap;
`
const Label = styled.span`
font-weight:600;
color:${themeObj.grey[600]};
margin-right:4px;
`
const Separator = styled.span`
margin:0 8px;
color:${themeObj.grey[300]};
`
const BottomNav = styled.div`
position:fixed;
bottom:0;
left:50%;
transform:translateX(-50%);
width:100%;
max-width:840px;
height:56px;
background:#fff;
border-top:1px solid #eee;
display:flex;
align-items:center;
justify-content:space-around;
z-index:10;
`
const NavItem = styled.div`
display:flex;
flex-direction:column;
align-items:center;
cursor:pointer;
gap:2px;
opacity:${props => props.$active ? '1' : '0.5'};
transition: opacity 0.2s;
&:hover { opacity:1; }
`
const NavLabel = styled.span`
font-size:10px;
font-weight:500;
`

const Footer = () => {
  const { themeMode } = useSettingsContext();
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const currentPath = router.asPath;
  const [searchOpen, setSearchOpen] = useState(false);

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

  const isDark = themeMode == 'dark';
  const navColor = isDark ? '#fff' : '#111';

  return (
    <>
      <DialogSearch
        open={searchOpen}
        handleClose={() => setSearchOpen(false)}
        root_path={'/blog/search?keyword='}
      />
      <Wrappers style={{
        background: isDark ? '#111' : '#fafafa',
        borderTop: `1px solid ${isDark ? '#333' : '#eee'}`,
      }}>
        <ContentWrapper>
          <img src={logoSrc()} style={{ width: '100px', marginBottom: '8px', opacity: 0.5 }} />
          <InfoRow>
            {ceo_name?.length > 1 &&
              <span><Label>{translate('대표')}</Label>{ceo_name}<Separator>|</Separator></span>
            }
            {business_num?.length > 1 &&
              <span><Label>{translate('사업자등록번호')}</Label>{business_num}<Separator>|</Separator></span>
            }
            {mail_order_num?.length > 1 &&
              <span><Label>{translate('통신판매번호')}</Label>{mail_order_num}</span>
            }
          </InfoRow>
          {addr?.length > 1 &&
            <InfoRow>
              <Label>{translate('주소')}</Label>
              <span>{addr}</span>
            </InfoRow>
          }
          <InfoRow>
            {phone_num?.length > 1 &&
              <span><Label>{translate('고객센터')}</Label>{phone_num}<Separator>|</Separator></span>
            }
            {fax_num?.length > 1 &&
              <span><Label>{translate('팩스')}</Label>{fax_num}</span>
            }
          </InfoRow>
          {pvcy_rep_name?.length > 1 &&
            <InfoRow>
              <Label>{translate('개인정보 보호책임자')}</Label>
              <span>{pvcy_rep_name}</span>
            </InfoRow>
          }
        </ContentWrapper>
      </Wrappers>
      <BottomNav style={{
        background: isDark ? '#111' : '#fff',
        borderTop: `1px solid ${isDark ? '#333' : '#eee'}`,
      }}>
        <NavItem $active={currentPath === '/blog'} onClick={() => router.push('/blog')}>
          <Icon icon="ph:house" fontSize="1.3rem" color={navColor} />
          <NavLabel style={{ color: navColor }}>HOME</NavLabel>
        </NavItem>
        <NavItem $active={currentPath.includes('/search')} onClick={() => setSearchOpen(true)}>
          <Icon icon="ph:magnifying-glass" fontSize="1.3rem" color={navColor} />
          <NavLabel style={{ color: navColor }}>SEARCH</NavLabel>
        </NavItem>
        <NavItem $active={currentPath.includes('/cart')} onClick={() => router.push('/blog/auth/cart')}>
          <Icon icon="ph:shopping-cart" fontSize="1.3rem" color={navColor} />
          <NavLabel style={{ color: navColor }}>CART</NavLabel>
        </NavItem>
        <NavItem $active={currentPath.includes('/my-page')} onClick={() => router.push('/blog/auth/my-page')}>
          <Icon icon="ph:user" fontSize="1.3rem" color={navColor} />
          <NavLabel style={{ color: navColor }}>MY</NavLabel>
        </NavItem>
      </BottomNav>
    </>
  )
}
export default Footer
