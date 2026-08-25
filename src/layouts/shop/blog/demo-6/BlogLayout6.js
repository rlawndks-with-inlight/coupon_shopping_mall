import styled from "styled-components";
import { useSettingsContext } from "src/components/settings";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useState } from "react";
import DialogSearch from "src/components/dialog/DialogSearch";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import StorefrontPopups from "src/components/elements/shop/StorefrontPopups";
import { isStorefrontHome, normalizePath } from "src/utils/blog-shop-route";
import LanguagePopover from "src/layouts/manager/header/LanguagePopover";
import { Badge } from "@mui/material";
import { useLocales } from "src/locales";
import { logoDeliveryUrl } from "src/data/data";

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
/* 로고는 좌·우 슬롯(SideSlot / HeaderActions) 사이에 자기 폭만 차지하고 놓인다.
   예전엔 LogoArea 가 flex:1 이라 우측 아이콘이 늘어날수록 로고가 왼쪽으로 밀렸다.
   좌우를 flex:1 로 똑같이 나눠 가지면 우측 아이콘 개수(로그인 여부·언어 사용 여부)가
   달라져도 로고가 가운데 그대로 있는다. */
const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex: 0 0 auto;
  justify-content: center;
  /* 모바일에서는 가운데 두지 않는다.
     아이콘 5개가 오른쪽에 몰려 있어 가운데 로고는 '왼쪽이 텅 빈' 모양이 되고,
     로고 자리도 양옆을 균등하게 비우느라 130px 로 좁아진다.
     왼쪽으로 붙이면 그 여백을 로고가 쓴다. (PC 는 가운데 정렬 그대로) */
  @media (max-width: 480px) {
    justify-content: flex-start;
  }
  /* 로고 폭 상한. Logo(styled(LazyLoadImage))가 아니라 여기에 거는 이유는 Logo 주석 참고.
     481~519px 구간에서 가로형 로고 + 언어선택 켠 가맹점이면 아이콘 묶음이 우측 패딩을 뚫고
     나가 문서에 가로 스크롤바가 생겼다(이 헤더는 sticky 라 잘리는 게 아니라 페이지가 흔들린다). */
  max-width: 220px;
  overflow: hidden;
  @media (max-width: 520px) {
    max-width: 130px;
  }
  /* LazyLoadImage(effect="blur")는 <span class="lazy-load-image-background"> 로 한 겹 감싸는데
     styled() 가 만든 클래스는 그 span 이 아니라 안쪽 <img> 에 붙는다(Logo 주석 참고).
     그래서 Logo 에만 상한을 걸면 span 은 옛 크기 그대로 남아 로고가 안 커진다.
     여기서 span 을 직접 잡는다 — Logo 의 값과 반드시 같이 움직여야 한다. */
  @media (max-width: 480px) {
    .lazy-load-image-background {
      height: auto;
      max-height: calc(56px * var(--logo-scale, 1));
      /* Logo 의 값과 반드시 같이 움직여야 한다 */
      max-width: min(130px, calc(100vw - 244px));
    }
  }
`
/* 헤더 좌측 슬롯(뒤로가기 버튼 자리). 우측 액션과 같은 flex 를 가져 로고를 가운데로 민다. */
const SideSlot = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  /* 로고를 가운데 세우는 힘이 이 flex:1 이다(반대쪽 HeaderActions 와 균형).
     모바일에서는 그 힘을 푼다 — 뒤로가기 버튼 자리만 차지하고, 로고는 그 옆에 붙는다. */
  @media (max-width: 480px) {
    flex: 0 0 auto;
  }
`
/* 로고를 '한 축'이 아니라 '상자'로 잡는다 — 이유는 shop/demo-1/header.js 의 LogoImg 주석 참고.
   28px 은 판매중 11개 프레임 통틀어 최소값이었고, 같은 헤더의 IconBtn(20px 아이콘 + padding 0.5rem
   = 36×44px)보다도 작아 로고가 아이콘 하나처럼 보였다. 이 한 곳이 blog demo 4~9 여섯 개를 담당한다
   (ShopLayout.js 가 blog demo 4~9 를 전부 이 레이아웃으로 보낸다).
   이 헤더는 position:sticky 라 흐름 공간을 차지한다 — 높아진 만큼 본문이 자연히 내려가므로
   상단 여백을 하드코딩한 화면이 없고, 그래서 blog demo 1·2 와 달리 마음 놓고 키울 수 있다.
   ≤480px 은 그대로 둔다: 아이콘 5개(36px)+뒤로가기 자리 36px 로 375px 화면에서 로고 몫이
   130px 뿐이라, 이 구간은 과거 로고가 두 줄로 깨진 이력이 있다(아래 IconBtn 주석 참고). */
const Logo = styled(LazyLoadImage)`
  height: calc(44px * var(--logo-scale, 1));
  width: auto;
  /* 폭 상한은 LogoArea 가 건다 — LazyLoadImage 는 effect="blur" 일 때
     <span class="lazy-load-image-background"> 로 한 겹 감싸고, styled() 가 만든 클래스는
     그 span 이 아니라 안쪽 <img> 에 붙는다. 즉 여기 max-width 를 줘도 flex 자식(span)은
     안 줄어서 상한이 헛돈다. flex-shrink 도 같은 이유로 여기서는 무의미하다. */
  max-width: 100%;
  object-fit: contain;
  /* 모바일에서 높이를 못 박으면 안 된다.
     28px 로 고정돼 있었는데, 정사각형에 가까운 로고(예: 247x176)는 그 높이에서 폭이
     39px 밖에 안 나온다. 자리는 130px 인데 30% 만 쓰는 셈이라 로고가 아이콘보다 작아 보였다.
     (배율 0.7 인 가맹점은 19.6px 까지 내려가 27x20 으로 그려졌다 — 실제로 그렇게 보였다)

     그래서 높이 대신 '상자'로 가둔다. 어느 모양이든 알아서 상한에 닿는다.
       정사각형 로고 → 높이가 상한  55x39
       가로로 긴 로고 → 폭이 상한   130x30  (LogoArea 의 130px 안에 들어와 안 잘린다)

     56px 인 이유: 재 보니 72px 부터 헤더가 73 → 83px 로 밀린다. 56px 이 헤더를 안 건드리는 최대다.
     ⚠ 여기만 고치면 안 된다 — LazyLoadImage 가 감싸는 span 에도 같은 상한이 필요하다(LogoArea 참고). */
  @media (max-width: 480px) {
    height: auto;
    width: auto;
    max-height: calc(56px * var(--logo-scale, 1));
    /* 폭 상한은 화면에 맞춰 줄어야 한다.
       130px 로 못 박았더니 가로형 로고 + 좌측정렬 조합에서 320px 화면에 가로 스크롤이
       50px, 360px 에서 10px 생겼다(실측). 이 헤더는 sticky 라 페이지 자체가 흔들린다.
       244px 은 아이콘 5개(36px)와 뒤로가기 자리·여백이 반드시 써야 하는 몫이다. 236px 로는 4px 모자랐다(실측). */
    max-width: min(130px, calc(100vw - 244px));
  }
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
  /* 좁은 화면에서는 아이콘 묶음(검색·계정·장바구니·언어)이 헤더 폭을 다 먹어
     로고가 두 줄로 깨진다. 작은 폰에서만 아이콘 폭을 줄인다. */
  @media (max-width: 480px) {
    width: 36px;
    padding: 0.35rem;
    font-size: 18px;
  }
`
/* 홈에서 뒤로가기 버튼 자리를 대신 차지하는 빈 칸.
   폭은 IconBtn 과 똑같이 맞춘다(다르게 주면 홈과 하위 화면의 좌측 여백이 어긋난다). */
const IconSpacer = styled.div`
  width: 44px;
  flex-shrink: 0;
  @media (max-width: 480px) {
    width: 36px;
  }
`
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
`
const Main = styled.main`
  flex: 1;
`
/* PC 에서 본문이 좌우로 퍼지지 않게 프레임 폭으로 잡아둔다.
   이 프레임(6~11)에는 전용 화면이 홈과 상품상세뿐이라, 나머지 경로
   (/shop/items · 주문서 · 약관 · 위시리스트 등)는 쇼핑몰용 넓은 화면으로 떨어져
   화면 끝까지 퍼졌다. 이 레이아웃의 기준 폭은 홈이 쓰는 Container 와 같은 1100px 이다.
   홈·상품상세는 풀블리드(히어로 92vh)로 짜인 전용 화면이라 감싸면 안 된다. */
const Contained = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`
/* 정보 줄 자체는 원래 가로였는데, 상단 여백 4rem + 28px 브랜드명 + 이탤릭 태그라인 때문에
   푸터가 한 화면 가까이 차지했다("너무 크고 돋보인다"는 가맹점 의견).
   표시 의무 항목은 그대로 두고 여백과 글자 크기만 낮춘다. */
const Footer = styled.footer`
  background: #1a1a1a;
  color: #fff;
  padding: 2rem 2rem 1.25rem;
  text-align: center;
  @media (max-width: 720px) {
    padding: 1.75rem 1.25rem 1rem;
  }
`
const FooterBrand = styled.div`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  opacity: 0.75;
  margin-bottom: 0.75rem;
`
const FooterInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem 1.1rem;
  /* 12px 아래로 내리지 말 것 — 모바일에서 사업자 정보가 읽히지 않는다(실측 11px). */
  font-size: 12px;
  opacity: 0.42;
  line-height: 1.7;
`
/* 푸터 링크 줄 — 비회원 주문조회 / 이용약관 / 개인정보처리방침.
   같은 스타일이 세 번 반복되므로 인라인 style 대신 styled 로 뺐다(이 파일은 전부 styled 다).
   톤은 FooterInfo 계열에 맞춘 12px / opacity 0.6 / 밑줄. */
const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.9rem;
  margin-top: 0.7rem;
`
const FooterLink = styled.span`
  /* 12px 아래로 내리지 말 것 — 모바일에서 사업자 정보가 읽히지 않는다(실측 11px). */
  font-size: 12px;
  opacity: 0.55;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    opacity: 1;
  }
`
const FooterLine = styled.div`
  /* 저작권 줄도 12px 로 맞춘다 — 이 화면에서 유일하게 10px 이었다. */
  font-size: 12px;
  opacity: 0.3;
  letter-spacing: 2px;
  margin-top: 0.9rem;
`

const BlogLayout6 = (props) => {
  // themeCartData: 장바구니 아이콘에 담긴 개수 배지를 붙이기 위해 함께 읽는다.
  const { themeDnsData, themeCartData } = useSettingsContext();
  // 이 레이아웃(blog demo 4~9 공용)에는 번역이 아예 없어서 푸터 문구가 늘 한국어였다.
  const { translate } = useLocales();
  const router = useRouter();
  const { children } = props;
  const brandName = themeDnsData?.name || 'BRAND';
  const { user, logout } = useAuthContext();
  const [searchOpen, setSearchOpen] = useState(false);
  // 이 프레임 전용으로 짜인 풀블리드 화면(홈·상품상세)만 폭 제한에서 뺀다. Contained 주석 참고.
  const isFullBleed = isStorefrontHome(router) || normalizePath(router).startsWith('/shop/item/');

  // 로그아웃 후 전체 리로드 — src/views/blog/auth/my-page/demo-2.js 에서 쓰는 것과 같은 방식.
  const onLogout = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <Wrapper>
      {/* 블로그 프레임에는 상품 목록 페이지(/blog/items)도 카테고리 메뉴도 없다.
          검색이 홈의 대표상품 외 상품을 찾는 유일한 수단인데 이 헤더엔 진입점이 없었다.
          (blog demo 4~9 가 이 레이아웃을 공유하므로 한 번만 넣으면 6개가 함께 해결된다) */}
      <DialogSearch
        open={searchOpen}
        handleClose={() => setSearchOpen(false)}
        root_path={'/shop/search?keyword='}
      />
      <Header>
        {/* 뒤로가기는 조건 없이 렌더되고 있어서 메인페이지에도 ← 가 떴다.
            홈에서는 같은 폭의 스페이서로 바꿔 좌측 여백을 그대로 유지한다
            (로고 중앙정렬 자체는 SideSlot/HeaderActions 의 flex:1 이 잡는다).
            isStorefrontHome 은 '/'(가맹점 도메인 루트 rewrite)와 '/shop' 둘 다 홈으로 본다. */}
        <SideSlot>
          {isStorefrontHome(router)
            ? <IconSpacer />
            : <IconBtn onClick={() => router.back()}>
              <Icon icon="material-symbols:arrow-back" />
            </IconBtn>}
        </SideSlot>
        <LogoArea onClick={() => router.push('/shop')}>
          {/* logoSrc() 를 쓰지 않고 컬럼을 직접 읽는 자리다(logoSrc 는 내부에서 훅을 부른다).
              여백 제거 변환은 순수 문자열 조작이라 여기서 그대로 태울 수 있다 — data.js 주석 참고. */}
          {themeDnsData?.logo_img ? (
            <Logo src={logoDeliveryUrl(themeDnsData.logo_img)} effect="blur" />
          ) : (
            <BrandText>{brandName}</BrandText>
          )}
        </LogoArea>
        {/* 아이콘을 한 묶음으로 — Header 가 space-between 이라 낱개로 두면 로고가 가운데서 밀린다.
            사람 아이콘: 이 레이아웃(blog demo 4~9 공용)에는 로그인·마이페이지 진입점이 아예 없어서
            회원가입을 해도 로그인할 방법이, 주문을 해도 주문내역을 볼 방법이 없었다.
            로그인 상태면 마이페이지, 아니면 로그인 화면으로 보낸다(blog demo 1·2 와 동일). */}
        <HeaderActions>
          {/* 상품 목록 — 이 레이아웃에는 상품을 둘러볼 수단이 검색뿐이었다.
              고객이 찾는 물건의 '이름을 이미 알고 있을 때'만 살 수 있었다는 뜻이다.
              /shop/items 는 카테고리 탐색과 목록을 함께 제공한다. */}
          <IconBtn onClick={() => router.push('/shop/items')}>
            <Icon icon="material-symbols:grid-view-outline" />
          </IconBtn>
          <IconBtn onClick={() => setSearchOpen(true)}>
            <Icon icon="tabler:search" />
          </IconBtn>
          <IconBtn onClick={() => router.push(user ? '/shop/auth/my-page' : '/shop/auth/login')}>
            <Icon icon="basil:user-outline" />
          </IconBtn>
          <IconBtn onClick={() => router.push('/shop/auth/cart')}>
            <Badge badgeContent={themeCartData?.length ?? 0} color="error">
              <Icon icon="iconamoon:shopping-bag" />
            </Badge>
          </IconBtn>
          {/* 언어 선택 — 이 레이아웃(blog demo 4~9 공용)에는 언어 UI 가 아예 없어서
              가맹점 언어 설정이 켜져 있어도 고객이 언어를 바꿀 방법이 없었다. */}
          {themeDnsData?.setting_obj?.is_use_lang == 1 && <LanguagePopover />}
        </HeaderActions>
      </Header>
      <StorefrontPopups />
      <Main>{isFullBleed ? children : <Contained>{children}</Contained>}</Main>
      <Footer>
        <FooterBrand>{brandName}</FooterBrand>
        {/* 전자상거래법상 표시 의무 항목이 빠져 있었다 —
            상호(company_name)·통신판매업신고번호(mail_order_num)·개인정보보호책임자(pvcy_rep_name).
            관리자 설정관리 › 기본설정 › 회사정보 탭에 입력칸은 있어서 가맹점이 값을 채워도
            이 프레임(6~11)에서는 화면에 나오지 않았다. FooterBrand 는 브랜드명(name)이지 상호가 아니다. */}
        {/* ⚠ 라벨은 반드시 translate() 를 거친다.
            가맹점 제보(2026-08-24): "5,6번 타입 — 영문버젼 하단 가맹점 정보 한글로 계속 보임".
            화면 전체가 영어인데 이 블록만 '상호 · 대표 · 사업자등록번호' 로 남아 있었다.
            값(상호명·대표자명·주소)은 그대로 둔다 — 등기된 고유명사라 번역 대상이 아니다.
            번역해야 하는 것은 **라벨**뿐이다. */}
        <FooterInfo>
          {themeDnsData?.company_name && <div>{translate('상호')} · {themeDnsData.company_name}</div>}
          {themeDnsData?.ceo_name && <div>{translate('대표')} · {themeDnsData.ceo_name}</div>}
          {themeDnsData?.business_num && <div>{translate('사업자등록번호')} · {themeDnsData.business_num}</div>}
          {themeDnsData?.mail_order_num && <div>{translate('통신판매업신고번호')} · {themeDnsData.mail_order_num}</div>}
          {themeDnsData?.phone_num && <div>{translate('고객센터')} · {themeDnsData.phone_num}</div>}
          {themeDnsData?.addr && <div>{translate('주소')} · {themeDnsData.addr}</div>}
          {themeDnsData?.pvcy_rep_name && <div>{translate('개인정보보호책임자')} · {themeDnsData.pvcy_rep_name}</div>}
        </FooterInfo>
        {/* 비회원 주문조회: 이 레이아웃에는 진입로가 마이페이지 안 다이얼로그뿐이라
            비회원은 도달할 수가 없었다. 푸터에서 바로 열어준다.
            이용약관·개인정보처리방침: 전자상거래법상 상시 열람 경로가 필요한데 이 푸터엔 없었다.
            policy.js 가 query type 으로 갈라진다(0=이용약관, 1=개인정보처리방침). */}
        <FooterLinks>
          <FooterLink onClick={() => router.push('/shop/auth/order-check')}>{translate('비회원 주문조회')}</FooterLink>
          {/* 비회원은 계정이 없어 1:1문의 답변을 확인할 경로가 필요하다(연락처 + 글비밀번호). */}
          <FooterLink onClick={() => router.push('/shop/auth/inquiry-check')}>{translate('비회원 문의조회')}</FooterLink>
          <FooterLink onClick={() => router.push('/shop/auth/policy?type=0')}>{translate('이용약관')}</FooterLink>
          <FooterLink onClick={() => router.push('/shop/auth/policy?type=1')}>{translate('개인정보처리방침')}</FooterLink>
          <FooterLink onClick={() => router.push('/shop/auth/policy?type=3')}>{translate('쇼핑몰 이용안내')}</FooterLink>
          {/* 로그아웃은 하단정보에 두지 않는다 — 마이페이지에 있다
              (블로그 6~9 는 my-page demo-2 로 떨어진다). */}
        </FooterLinks>
        <FooterLine>© {new Date().getFullYear()} {brandName.toUpperCase()} · ALL RIGHTS RESERVED</FooterLine>
      </Footer>
    </Wrapper>
  );
};

export default BlogLayout6;
