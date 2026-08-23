import { themeObj } from "src/components/elements/styled-components"
import { useSettingsContext } from "src/components/settings"
import styled from "styled-components"
import { logoSrc } from "src/data/data"
import { useLocales } from "src/locales"
import { Icon } from "@iconify/react"
import { useRouter } from "next/router"
import { useState } from "react"
import DialogSearch from "src/components/dialog/DialogSearch"
import { isMyPagePath, isPath, isStorefrontHome } from "src/utils/blog-shop-route"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import { Badge } from "@mui/material"

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
/* 12px 아래로 내리지 말 것. 이 화면의 작은 글씨 기본 단계가 12px 이고(13곳),
   여기만 10px 이었다. 올려도 탭바 높이는 56px 그대로다(실측). */
font-size:12px;
font-weight:500;
`

const Footer = () => {
  // themeCartData: 하단 고정바 장바구니 개수 배지용
  const { themeMode, themeCartData } = useSettingsContext();
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const currentPath = router.asPath;
  const [searchOpen, setSearchOpen] = useState(false);
  // 로그아웃 처리기. 하단정보에서는 뺐고(마이페이지에 있다) 지금은 쓰이지 않는다 —
  // 헤더에 다시 붙일 때 쓰라고 남겨 둔다.
  const { user, logout } = useAuthContext();
  const onLogout = async () => {
    await logout();
    window.location.reload();
  };

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
        root_path={'/shop/search?keyword='}
      />
      <Wrappers style={{
        background: isDark ? '#111' : '#fafafa',
        borderTop: `1px solid ${isDark ? '#333' : '#eee'}`,
      }}>
        <ContentWrapper>
          {/* 여기만 width 기준이라 세로형·2단 로고가 유독 크게, 가로형이 유독 작게 나왔다.
              헤더와 같은 축(height)으로 통일하고 가로 상한을 따로 둔다. */}
          {/* alignSelf 필수: ContentWrapper 가 flex-direction:column 이라 align-items 기본값(stretch)이
              가로로 늘린다. 예전엔 width:100px 로 폭이 고정돼 있어 stretch 가 안 먹었는데,
              width:auto 로 바꾸면서 그 보호막이 사라졌다 — 빼면 로고가 160px 로 늘어나 찌그러진다. */}
          <img src={logoSrc()}
            style={{ height: 'calc(32px * var(--logo-scale, 1))', width: 'auto', maxWidth: 'calc(160px * var(--logo-scale, 1))', objectFit: 'contain', alignSelf: 'flex-start', marginBottom: '8px', opacity: 0.5 }} />
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
          {/* 이용약관·개인정보처리방침·이용안내.
              이 프레임 푸터에만 약관 링크가 통째로 없어서, 고객이 약관을 보려면
              마이페이지 맨 아래까지 들어가야 했다(11개 프레임 중 여기만 그랬다). */}
          <InfoRow style={{ columnGap: '0.75rem' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => router.push('/shop/auth/policy?type=0')}>
              {translate('이용약관')}
            </span>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => router.push('/shop/auth/policy?type=1')}>
              {translate('개인정보처리방침')}
            </span>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => router.push('/shop/auth/policy?type=3')}>
              {translate('쇼핑몰 이용안내')}
            </span>
          </InfoRow>

          {/* 로그아웃은 하단정보에 두지 않는다 — 여기는 사업자정보·약관 자리다.
              로그아웃은 마이페이지에 있다(views/blog/auth/my-page/demo-1.js). */}
        </ContentWrapper>
      </Wrappers>
      <BottomNav style={{
        background: isDark ? '#111' : '#fff',
        borderTop: `1px solid ${isDark ? '#333' : '#eee'}`,
      }}>
        <NavItem $active={isStorefrontHome(router)} onClick={() => router.push('/shop')}>
          <Icon icon="ph:house" fontSize="1.3rem" color={navColor} />
          <NavLabel style={{ color: navColor }}>HOME</NavLabel>
        </NavItem>
        {/* 검색은 페이지 이동이 아니라 다이얼로그라 경로가 바뀌지 않는다 —
            경로로 판정하면 이 버튼은 영영 비활성이다. 다이얼로그 상태를 그대로 쓴다. */}
        <NavItem $active={searchOpen || isPath(router, '/shop/search')} onClick={() => setSearchOpen(true)}>
          <Icon icon="ph:magnifying-glass" fontSize="1.3rem" color={navColor} />
          <NavLabel style={{ color: navColor }}>SEARCH</NavLabel>
        </NavItem>
        {/* 하단 고정바의 장바구니에도 담긴 개수를 붙인다.
            헤더에는 배지가 있는데 이 바에는 없어서, 같은 화면에 배지 있는 장바구니와
            없는 장바구니가 동시에 보였다. */}
        <NavItem $active={isPath(router, '/shop/auth/cart')} onClick={() => router.push('/shop/auth/cart')}>
          <Badge badgeContent={themeCartData?.length ?? 0} color="error">
            <Icon icon="ph:shopping-cart" fontSize="1.3rem" color={navColor} />
          </Badge>
          <NavLabel style={{ color: navColor }}>CART</NavLabel>
        </NavItem>
        <NavItem $active={isMyPagePath(router)} onClick={() => router.push('/shop/auth/my-page')}>
          <Icon icon="ph:user" fontSize="1.3rem" color={navColor} />
          <NavLabel style={{ color: navColor }}>MY</NavLabel>
        </NavItem>
      </BottomNav>
    </>
  )
}
export default Footer
