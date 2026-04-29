import styled from "styled-components";
import { useSettingsContext } from "src/components/settings";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import { LazyLoadImage } from "react-lazy-load-image-component";

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

  return (
    <Wrapper>
      <Header>
        <IconBtn onClick={() => router.back()}>
          <Icon icon="material-symbols:arrow-back" />
        </IconBtn>
        <LogoArea onClick={() => router.push('/blog')}>
          {themeDnsData?.logo_img ? (
            <Logo src={themeDnsData.logo_img} effect="blur" />
          ) : (
            <BrandText>{brandName}</BrandText>
          )}
        </LogoArea>
        <IconBtn onClick={() => router.push('/blog/auth/cart')}>
          <Icon icon="iconamoon:shopping-bag" />
        </IconBtn>
      </Header>
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
        <FooterLine>© {new Date().getFullYear()} {brandName.toUpperCase()} · ALL RIGHTS RESERVED</FooterLine>
      </Footer>
    </Wrapper>
  );
};

export default BlogLayout6;
