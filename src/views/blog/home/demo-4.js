import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings'
import { themeObj } from 'src/components/elements/styled-components'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { commarNumber } from 'src/utils/function'
import { formatLang } from 'src/utils/format'
import { useFeaturedProduct } from 'src/utils/use-featured-product'
import { useLocales } from 'src/locales'

/* ══════════════════════════════════════
   블로그 데모-4: 미니멀 모노크롬
   순흑백 + Swiss 스타일 + 대형 타이포그래피
   ══════════════════════════════════════ */

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: #fff;
  color: #000;
`

/* Hero - 풀스크린 분할 */
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  border-bottom: 1px solid #000;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    min-height: 80vh;
  }
`
const HeroLeft = styled.div`
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid #000;
  @media (max-width: 840px) {
    border-right: none;
    border-bottom: 1px solid #000;
    padding: 3rem 1.5rem;
  }
`
const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 3rem;
`
const HeroTitle = styled.h1`
  font-size: 96px;
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -5px;
  margin: 0;
  text-transform: uppercase;
  @media (max-width: 840px) {
    font-size: 48px;
    letter-spacing: -2px;
  }
`
const HeroMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 3rem;
`
const MetaLabel = styled.div`
  opacity: 0.5;
  margin-bottom: 0.5rem;
`
const MetaValue = styled.div`
  font-weight: bold;
`
const HeroRight = styled.div`
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const HeroImage = styled(LazyLoadImage)`
  width: 400px;
  height: 400px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 280px;
    height: 280px;
  }
`

/* Big Number Section */
const BigNumSection = styled.section`
  padding: 6rem 3rem;
  border-bottom: 1px solid #000;
  @media (max-width: 840px) {
    padding: 4rem 1.5rem;
  }
`
const BigNumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  @media (max-width: 840px) {
    grid-template-columns: repeat(2, 1fr);
  }
`
const BigNumCell = styled.div`
  padding: 2rem 1.5rem;
  border-left: 1px solid #000;
  &:first-child {
    border-left: none;
  }
  @media (max-width: 840px) {
    &:nth-child(3) { border-left: none; }
  }
`
const BigNum = styled.div`
  font-size: 64px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  margin-bottom: 0.5rem;
`
const BigNumLabel = styled.div`
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
`

/* Manifesto */
const Manifesto = styled.section`
  padding: 8rem 3rem;
  border-bottom: 1px solid #000;
  @media (max-width: 840px) {
    padding: 4rem 1.5rem;
  }
`
const ManifestoText = styled.div`
  max-width: 800px;
  margin: 0 auto;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.3;
  letter-spacing: -1px;
  text-align: center;
  text-transform: uppercase;
  @media (max-width: 840px) {
    font-size: 22px;
  }
`

/* Product Info Grid */
const InfoSection = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #000;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const InfoLeft = styled.div`
  padding: 4rem 3rem;
  border-right: 1px solid #000;
  @media (max-width: 840px) {
    border-right: none;
    border-bottom: 1px solid #000;
    padding: 3rem 1.5rem;
  }
`
const InfoRight = styled.div`
  padding: 4rem 3rem;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const InfoHeading = styled.h2`
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -2px;
  margin: 0 0 2rem 0;
  text-transform: uppercase;
  @media (max-width: 840px) {
    font-size: 32px;
  }
`
const InfoBody = styled.div`
  font-size: 14px;
  line-height: 1.8;
  letter-spacing: 0.5px;
`

/* Price + CTA */
const PriceSection = styled.section`
  padding: 6rem 3rem;
  text-align: center;
  @media (max-width: 840px) {
    padding: 4rem 1.5rem;
  }
`
const PriceLabel = styled.div`
  font-size: 11px;
  letter-spacing: 4px;
  text-transform: uppercase;
  opacity: 0.6;
  margin-bottom: 1rem;
`
const PriceValue = styled.div`
  font-size: 96px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -4px;
  margin-bottom: 3rem;
  @media (max-width: 840px) {
    font-size: 56px;
    letter-spacing: -2px;
  }
`
const CTABtn = styled.a`
  display: inline-block;
  padding: 24px 80px;
  background: #000;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    background: #fff;
    color: #000;
    outline: 2px solid #000;
  }
`

const Demo4 = (props) => {
  const { currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { func } = props;
  const router = func?.router;
  const brandName = themeDnsData?.name || 'BRAND';
  const product = useFeaturedProduct();

  if (!product) {
    return (
      <Wrapper>
        <PriceSection>
          <InfoHeading>COMING SOON</InfoHeading>
          <InfoBody>관리자 페이지에서 대표 상품을 등록해주세요.</InfoBody>
        </PriceSection>
      </Wrapper>
    );
  }

  const img = fixImgUrl(product?.product_img);
  const name = formatLang(product, 'product_name', currentLang);
  const comment = product?.product_comment;
  const sale = product?.product_sale_price || product?.product_price || 0;
  const orig = product?.product_price || 0;
  const hasSale = orig > sale && sale > 0;
  const disc = hasSale ? Math.round((orig - sale) * 100 / orig) : 0;
  const goTo = () => router?.push?.(`/blog/product/${product?.id}`);

  return (
    <Wrapper>
      <Hero>
        <HeroLeft>
          <div>
            <HeroTop>
              <span>{brandName}</span>
              <span>№ 001</span>
            </HeroTop>
            <HeroTitle>{name}</HeroTitle>
            <HeroMeta>
              <div>
                <MetaLabel>Type</MetaLabel>
                <MetaValue>Signature</MetaValue>
              </div>
              <div>
                <MetaLabel>Year</MetaLabel>
                <MetaValue>{new Date().getFullYear()}</MetaValue>
              </div>
            </HeroMeta>
          </div>
          <div>
            <CTABtn onClick={goTo}>Buy Now →</CTABtn>
          </div>
        </HeroLeft>
        <HeroRight>
          <HeroImage src={img} effect="blur" onClick={goTo} style={{ cursor: 'pointer' }} />
        </HeroRight>
      </Hero>

      <BigNumSection>
        <BigNumGrid>
          <BigNumCell>
            <BigNum>01</BigNum>
            <BigNumLabel>Premium</BigNumLabel>
          </BigNumCell>
          <BigNumCell>
            <BigNum>02</BigNum>
            <BigNumLabel>Crafted</BigNumLabel>
          </BigNumCell>
          <BigNumCell>
            <BigNum>03</BigNum>
            <BigNumLabel>Timeless</BigNumLabel>
          </BigNumCell>
          <BigNumCell>
            <BigNum>04</BigNum>
            <BigNumLabel>Unique</BigNumLabel>
          </BigNumCell>
        </BigNumGrid>
      </BigNumSection>

      <Manifesto>
        <ManifestoText>
          "{comment || 'One product. Endless quality. Made with absolute dedication.'}"
        </ManifestoText>
      </Manifesto>

      <InfoSection>
        <InfoLeft>
          <InfoHeading>The Product</InfoHeading>
          <InfoBody>
            {comment || `${brandName} 시그니처 제품입니다. 단 하나의 제품에 모든 정성을 담아 완성했습니다.`}
          </InfoBody>
        </InfoLeft>
        <InfoRight>
          <InfoHeading>The Brand</InfoHeading>
          <InfoBody>
            {brandName}은(는) 단 하나의 제품에 집중하는 브랜드입니다.
            여러 가지를 만들기보다 진심으로 자신 있는 하나에 몰입합니다.
          </InfoBody>
        </InfoRight>
      </InfoSection>

      <PriceSection>
        <PriceLabel>Price</PriceLabel>
        {hasSale && (
          <div style={{ fontSize: '18px', textDecoration: 'line-through', opacity: 0.4, marginBottom: '0.5rem' }}>
            {commarNumber(orig)}원 · {disc}% OFF
          </div>
        )}
        <PriceValue>{commarNumber(sale)}원</PriceValue>
        <CTABtn onClick={goTo}>Order Now →</CTABtn>
      </PriceSection>
    </Wrapper>
  );
};

export default Demo4;
