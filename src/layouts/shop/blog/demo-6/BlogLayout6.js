import styled from "styled-components";
import { useSettingsContext } from "src/components/settings";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useState } from "react";
import DialogSearch from "src/components/dialog/DialogSearch";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import StorefrontPopups from "src/components/elements/shop/StorefrontPopups";
import { isStorefrontHome } from "src/utils/blog-shop-route";

/* 단일 상품 전용 럭셔리 레이아웃 — 심플 헤더 + 심플 푸터 */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fafaf7;
`
const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  background: rgba(250, 250, 247, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  @media (max-width: 720px) {
    padding: 1rem 1.25rem;
  }
`
const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
  justify-content: center;
`
const Logo = styled(LazyLoadImage)`
  height: 28px;
  object-fit: contain;
`
const BrandText = styled.div`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
`
const IconBtn = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #1a1a1a;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  &:hover {
    opacity: 0.6;
  }
`
/* 홈에서 뒤로가기 버튼 자리를 대신 차지하는 빈 칸.
   Header 가 space-between 이고 LogoArea 가 flex:1 이라, 버튼을 그냥 렌더하지 않으면
   로고가 22px 우측으로 밀린다. 폭은 IconBtn 과 똑같이 44px 로 맞춘다
   (다르게 주면 홈과 하위 화면의 로고 위치가 서로 어긋난다). */
const IconSpacer = styled.div`
  width: 44px;
  flex-shrink: 0;
`
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`
const Main = styled.main`
  flex: 1;
`
const Footer = styled.footer`
  background: #1a1a1a;
  color: #fff;
  padding: 4rem 2rem 2rem;
  text-align: center;
  @media (max-width: 720px) {
    padding: 3rem 1.25rem 1.5rem;
  }
`
const FooterBrand = styled.div`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 4px;
  margin-bottom: 1rem;
`
const FooterTagline = styled.div`
  font-size: 14px;
  opacity: 0.6;
  font-style: italic;
  letter-spacing: 1px;
  margin-bottom: 2rem;
`
const FooterInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  font-size: 12px;
  opacity: 0.5;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`
/* 푸터 링크 줄 — 비회원 주문조회 / 이용약관 / 개인정보처리방침.
   같은 스타일이 세 번 반복되므로 인라인 style 대신 styled 로 뺐다(이 파일은 전부 styled 다).
   톤은 FooterInfo 계열에 맞춘 12px / opacity 0.6 / 밑줄. */
const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`
const FooterLink = styled.span`
  font-size: 12px;
  opacity: 0.6;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    opacity: 1;
  }
`
const FooterLine = styled.div`
  font-size: 11px;
  opacity: 0.4;
  letter-spacing: 2px;
  margin-top: 1.5rem;
`

const BlogLayout6 = (props) => {
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const { children } = props;
  const brandName = themeDnsData?.name || 'BRAND';
  const { user, logout } = useAuthContext();
  const [searchOpen, setSearchOpen] = useState(false);

  // 로그아웃 후 전체 리로드 — src/views/blog/auth/my-page/demo-2.js 에서 쓰는 것과 같은 방식.
  const onLogout = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <Wrapper>
      {/* 블로그 프레임에는 상품 목록 페이지(/blog/items)도 카테고리 메뉴도 없다.
          검색이 홈의 대표상품 외 상품을 찾는 유일한 수단인데 이 헤더엔 진입점이 없었다.
          (프레임6~11이 이 레이아웃을 공유하므로 한 번만 넣으면 6개가 함께 해결된다) */}
      <DialogSearch
        open={searchOpen}
        handleClose={() => setSearchOpen(false)}
        root_path={'/shop/search?keyword='}
      />
      <Header>
        {/* 뒤로가기는 조건 없이 렌더되고 있어서 메인페이지에도 ← 가 떴다.
            홈에서는 같은 폭(44px) 스페이서로 바꿔 로고 위치를 그대로 유지한다.
            isStorefrontHome 은 '/'(가맹점 도메인 루트 rewrite)와 '/shop' 둘 다 홈으로 본다. */}
        {isStorefrontHome(router)
          ? <IconSpacer />
          : <IconBtn onClick={() => router.back()}>
            <Icon icon="material-symbols:arrow-back" />
          </IconBtn>}
        <LogoArea onClick={() => router.push('/shop')}>
          {themeDnsData?.logo_img ? (
            <Logo src={themeDnsData.logo_img} effect="blur" />
          ) : (
            <BrandText>{brandName}</BrandText>
          )}
        </LogoArea>
        {/* 아이콘을 한 묶음으로 — Header 가 space-between 이라 낱개로 두면 로고가 가운데서 밀린다.
            사람 아이콘: 이 레이아웃(프레임6~11 공용)에는 로그인·마이페이지 진입점이 아예 없어서
            회원가입을 해도 로그인할 방법이, 주문을 해도 주문내역을 볼 방법이 없었다.
            로그인 상태면 마이페이지, 아니면 로그인 화면으로 보낸다(프레임4·5와 동일). */}
        <HeaderActions>
          <IconBtn onClick={() => setSearchOpen(true)}>
            <Icon icon="tabler:search" />
          </IconBtn>
          <IconBtn onClick={() => router.push(user ? '/shop/auth/my-page' : '/shop/auth/login')}>
            <Icon icon="basil:user-outline" />
          </IconBtn>
          {/* 프레임6·7 은 로그인해도 로그아웃할 방법이 UI 상 없었다
              (프레임8~11 은 마이페이지 폴백 화면 덕에 우연히 가능했다).
              로그인 상태에서만 노출한다. */}
          {user && <IconBtn onClick={onLogout}>
            <Icon icon="ri:logout-circle-r-line" />
          </IconBtn>}
          <IconBtn onClick={() => router.push('/shop/auth/cart')}>
            <Icon icon="iconamoon:shopping-bag" />
          </IconBtn>
        </HeaderActions>
      </Header>
      <StorefrontPopups />
      <Main>{children}</Main>
      <Footer>
        <FooterBrand>{brandName}</FooterBrand>
        <FooterTagline>Crafted with care, made for you.</FooterTagline>
        <FooterInfo>
          {themeDnsData?.ceo_name && <div>대표 · {themeDnsData.ceo_name}</div>}
          {themeDnsData?.business_num && <div>사업자등록번호 · {themeDnsData.business_num}</div>}
          {themeDnsData?.phone_num && <div>고객센터 · {themeDnsData.phone_num}</div>}
          {themeDnsData?.addr && <div>주소 · {themeDnsData.addr}</div>}
        </FooterInfo>
        {/* 비회원 주문조회: 이 레이아웃에는 진입로가 마이페이지 안 다이얼로그뿐이라
            비회원은 도달할 수가 없었다. 푸터에서 바로 열어준다.
            이용약관·개인정보처리방침: 전자상거래법상 상시 열람 경로가 필요한데 이 푸터엔 없었다.
            policy.js 가 query type 으로 갈라진다(0=이용약관, 1=개인정보처리방침). */}
        <FooterLinks>
          <FooterLink onClick={() => router.push('/shop/auth/order-check')}>비회원 주문조회</FooterLink>
          <FooterLink onClick={() => router.push('/shop/auth/policy?type=0')}>이용약관</FooterLink>
          <FooterLink onClick={() => router.push('/shop/auth/policy?type=1')}>개인정보처리방침</FooterLink>
        </FooterLinks>
        <FooterLine>© {new Date().getFullYear()} {brandName.toUpperCase()} · ALL RIGHTS RESERVED</FooterLine>
      </Footer>
    </Wrapper>
  );
};

export default BlogLayout6;
