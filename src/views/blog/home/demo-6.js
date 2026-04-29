import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings'
import { themeObj } from 'src/components/elements/styled-components'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { commarNumber } from 'src/utils/function'
import { formatLang } from 'src/utils/format'
import { useFeaturedProduct } from 'src/utils/use-featured-product'
import { useLocales } from 'src/locales'

/* ══════════════════════════════════════
   단일 상품 전용 럭셔리 랜딩 페이지 데모
   (블로그 데모-6)
   ══════════════════════════════════════ */

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  width: 100%;
  background: #fafaf7;
`
const Section = styled.section`
  padding: 6rem 1.5rem;
  @media (max-width: 840px) {
    padding: 4rem 1.25rem;
  }
`
const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`

/* Hero */
const HeroSection = styled.section`
  position: relative;
  width: 100%;
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${p => p.$color}08 0%, ${p => p.$color}20 100%);
  overflow: hidden;
  @media (max-width: 840px) {
    min-height: 85vh;
    padding: 2rem 1rem;
  }
`
const HeroInner = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  gap: 4rem;
  padding: 2rem;
  align-items: center;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`
const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  @media (max-width: 840px) {
    align-items: center;
  }
`
const HeroLabel = styled.div`
  font-size: 12px;
  letter-spacing: 5px;
  font-weight: 700;
  color: ${p => p.$color};
  text-transform: uppercase;
`
const HeroTitle = styled.h1`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 56px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1.1;
  color: #1a1a1a;
  margin: 0;
  @media (max-width: 840px) {
    font-size: 38px;
  }
`
const HeroDesc = styled.div`
  font-size: 16px;
  color: ${themeObj.grey[600]};
  line-height: 1.8;
  max-width: 480px;
  font-style: italic;
`
const HeroPriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-top: 0.75rem;
`
const HeroSalePrice = styled.span`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 36px;
  font-weight: 700;
  color: ${p => p.$color};
`
const HeroOrigPrice = styled.span`
  font-size: 16px;
  text-decoration: line-through;
  color: ${themeObj.grey[400]};
`
const HeroDisc = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #e74c3c;
  letter-spacing: 2px;
`
const HeroCTA = styled.a`
  display: inline-block;
  padding: 18px 48px;
  background: #1a1a1a;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 3px;
  text-decoration: none;
  cursor: pointer;
  margin-top: 1rem;
  align-self: flex-start;
  transition: all 0.3s;
  &:hover {
    background: ${p => p.$color};
  }
  @media (max-width: 840px) {
    align-self: center;
  }
`
const HeroImageWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`
const HeroImageCircle = styled.div`
  position: absolute;
  width: 90%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background: radial-gradient(circle, ${p => p.$color}15 0%, transparent 70%);
`
const HeroImage = styled(LazyLoadImage)`
  max-width: 480px;
  max-height: 520px;
  object-fit: contain;
  position: relative;
  filter: drop-shadow(0 30px 60px rgba(0,0,0,0.15));
  @media (max-width: 840px) {
    max-width: 320px;
    max-height: 380px;
  }
`

/* Marquee brand stripe */
const MarqueeStripe = styled.div`
  background: #1a1a1a;
  color: #fff;
  padding: 1.5rem 1.5rem;
  overflow: hidden;
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-style: italic;
  letter-spacing: 8px;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  @media (max-width: 840px) {
    font-size: 14px;
    letter-spacing: 4px;
    padding: 1rem;
  }
`

/* Features */
const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const FeatureCard = styled.div`
  text-align: center;
  padding: 2rem 1rem;
`
const FeatureIcon = styled.div`
  font-size: 40px;
  margin-bottom: 1rem;
`
const FeatureTitle = styled.div`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 0.75rem;
  letter-spacing: -0.5px;
`
const FeatureDesc = styled.div`
  font-size: 14px;
  color: ${themeObj.grey[600]};
  line-height: 1.7;
`

/* Story */
const StorySection = styled(Section)`
  background: #fff;
`
const StoryInner = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1100px;
  margin: 0 auto;
  gap: 4rem;
  align-items: center;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`
const StoryImageWrap = styled.div`
  aspect-ratio: 4/5;
  background: linear-gradient(135deg, ${p => p.$color}15 0%, ${p => p.$color}05 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`
const StoryText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`
const StoryLabel = styled.div`
  font-size: 11px;
  letter-spacing: 5px;
  color: ${p => p.$color};
  font-weight: 700;
  text-transform: uppercase;
`
const StoryTitle = styled.h2`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 42px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -1.5px;
  margin: 0;
  @media (max-width: 840px) {
    font-size: 30px;
  }
`
const StoryBody = styled.div`
  font-size: 15px;
  line-height: 2;
  color: ${themeObj.grey[700]};
`

/* Numbers */
const NumbersSection = styled(Section)`
  background: #1a1a1a;
  color: #fff;
  text-align: center;
`
const NumbersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 900px;
  margin: 3rem auto 0;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const NumberCard = styled.div`
  padding: 1.5rem 1rem;
  border-left: 1px solid rgba(255,255,255,0.15);
  &:first-child {
    border-left: none;
  }
  @media (max-width: 840px) {
    border-left: none;
    border-top: 1px solid rgba(255,255,255,0.15);
    &:first-child {
      border-top: none;
    }
  }
`
const NumberValue = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 56px;
  font-weight: 900;
  color: ${p => p.$color};
  margin-bottom: 0.5rem;
`
const NumberLabel = styled.div`
  font-size: 13px;
  letter-spacing: 3px;
  opacity: 0.7;
  text-transform: uppercase;
`

/* Gallery */
const GallerySection = styled(Section)`
  background: #fafaf7;
`
const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  max-width: 1100px;
  margin: 3rem auto 0;
  aspect-ratio: 16/9;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    aspect-ratio: auto;
    & > div {
      aspect-ratio: 4/3;
    }
  }
`
const GalleryMain = styled.div`
  background: ${p => p.$color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`
const GallerySide = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 1rem;
`
const GallerySmall = styled.div`
  background: linear-gradient(135deg, ${p => p.$color}08 0%, ${p => p.$color}18 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`

/* Final CTA */
const FinalCTA = styled(Section)`
  background: linear-gradient(135deg, ${p => p.$color}20 0%, ${p => p.$color}05 100%);
  text-align: center;
`
const FinalCTATitle = styled.h2`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 52px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -2px;
  margin: 0 0 1.5rem 0;
  @media (max-width: 840px) {
    font-size: 36px;
  }
`
const FinalCTADesc = styled.div`
  font-size: 16px;
  color: ${themeObj.grey[700]};
  line-height: 1.8;
  max-width: 540px;
  margin: 0 auto 2.5rem;
`

const SectionHeading = styled.h2`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 40px;
  font-weight: 900;
  text-align: center;
  letter-spacing: -1.5px;
  margin: 0 0 3rem 0;
  @media (max-width: 840px) {
    font-size: 28px;
  }
`

const Demo6 = (props) => {
  const { currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { func } = props;
  const router = func?.router;
  const mainColor = themeDnsData?.theme_css?.main_color || '#8B7355';
  const brandName = themeDnsData?.name || 'BRAND';
  const product = useFeaturedProduct();

  if (!product) {
    return (
      <Wrapper>
        <Section>
          <Container style={{ textAlign: 'center' }}>
            <SectionHeading>Coming Soon</SectionHeading>
            <FinalCTADesc>관리자 페이지에서 대표 상품을 등록해주세요.</FinalCTADesc>
          </Container>
        </Section>
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
      {/* 1. HERO */}
      <HeroSection $color={mainColor}>
        <HeroInner>
          <HeroText>
            <HeroLabel $color={mainColor}>{brandName} · SIGNATURE</HeroLabel>
            <HeroTitle>{name}</HeroTitle>
            {comment && <HeroDesc>"{comment}"</HeroDesc>}
            <HeroPriceRow>
              {hasSale && <HeroDisc>{disc}% OFF</HeroDisc>}
              <HeroSalePrice $color={mainColor}>{commarNumber(sale)}원</HeroSalePrice>
              {hasSale && <HeroOrigPrice>{commarNumber(orig)}원</HeroOrigPrice>}
            </HeroPriceRow>
            <HeroCTA $color={mainColor} onClick={goTo}>DISCOVER MORE →</HeroCTA>
          </HeroText>
          <HeroImageWrap>
            <HeroImageCircle $color={mainColor} />
            <HeroImage src={img} effect="blur" onClick={goTo} style={{ cursor: 'pointer' }} />
          </HeroImageWrap>
        </HeroInner>
      </HeroSection>

      {/* 2. Marquee stripe */}
      <MarqueeStripe>
        ✦  CRAFTED WITH CARE  ✦  MADE FOR YOU  ✦  {brandName.toUpperCase()}  ✦  CRAFTED WITH CARE  ✦  MADE FOR YOU  ✦
      </MarqueeStripe>

      {/* 3. Features */}
      <Section>
        <Container>
          <SectionHeading>Why {brandName}</SectionHeading>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>✦</FeatureIcon>
              <FeatureTitle>Premium Quality</FeatureTitle>
              <FeatureDesc>최고급 원료와 장인의 손길로 완성된 품질. 엄선된 재료만을 사용합니다.</FeatureDesc>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>♡</FeatureIcon>
              <FeatureTitle>Thoughtful Design</FeatureTitle>
              <FeatureDesc>오랜 시간 다듬어진 디자인. 일상에 품격을 더하는 섬세한 디테일.</FeatureDesc>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>✧</FeatureIcon>
              <FeatureTitle>Time-honored</FeatureTitle>
              <FeatureDesc>전통과 현대의 조화. 변하지 않는 가치를 담아 오래도록 함께하는 선택.</FeatureDesc>
            </FeatureCard>
          </FeatureGrid>
        </Container>
      </Section>

      {/* 4. Story */}
      <StorySection>
        <StoryInner>
          <StoryImageWrap $color={mainColor}>
            <LazyLoadImage src={img} effect="blur" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }} />
          </StoryImageWrap>
          <StoryText>
            <StoryLabel $color={mainColor}>Our Story</StoryLabel>
            <StoryTitle>단 하나의 완성,<br />{brandName}</StoryTitle>
            <StoryBody>
              오랜 시간 연구와 다듬음을 거쳐 완성된 단 하나의 제품입니다.
              <br /><br />
              저희는 여러 가지를 한꺼번에 만들기보다, 진심으로 자신 있는 하나에 집중합니다.
              이것이 저희가 고객에게 드릴 수 있는 가장 정성스러운 선물입니다.
            </StoryBody>
          </StoryText>
        </StoryInner>
      </StorySection>

      {/* 5. Numbers */}
      <NumbersSection>
        <Container>
          <SectionHeading style={{ color: '#fff' }}>By the Numbers</SectionHeading>
          <NumbersGrid>
            <NumberCard>
              <NumberValue $color={mainColor}>100%</NumberValue>
              <NumberLabel>Quality Guaranteed</NumberLabel>
            </NumberCard>
            <NumberCard>
              <NumberValue $color={mainColor}>1000+</NumberValue>
              <NumberLabel>Happy Customers</NumberLabel>
            </NumberCard>
            <NumberCard>
              <NumberValue $color={mainColor}>4.9★</NumberValue>
              <NumberLabel>Average Rating</NumberLabel>
            </NumberCard>
          </NumbersGrid>
        </Container>
      </NumbersSection>

      {/* 6. Gallery */}
      <GallerySection>
        <Container>
          <SectionHeading>Gallery</SectionHeading>
          <GalleryGrid>
            <GalleryMain $color={mainColor}>
              <LazyLoadImage src={img} effect="blur" style={{ maxWidth: '70%', maxHeight: '80%', objectFit: 'contain' }} />
            </GalleryMain>
            <GallerySide>
              <GallerySmall $color={mainColor}>
                <LazyLoadImage src={img} effect="blur" style={{ maxWidth: '65%', maxHeight: '75%', objectFit: 'contain' }} />
              </GallerySmall>
              <GallerySmall $color={mainColor}>
                <LazyLoadImage src={img} effect="blur" style={{ maxWidth: '65%', maxHeight: '75%', objectFit: 'contain' }} />
              </GallerySmall>
            </GallerySide>
          </GalleryGrid>
        </Container>
      </GallerySection>

      {/* 7. Final CTA */}
      <FinalCTA $color={mainColor}>
        <Container>
          <FinalCTATitle>Experience {brandName}</FinalCTATitle>
          <FinalCTADesc>
            지금 바로 {brandName}의 시그니처를 만나보세요.
            <br />한 번의 선택이 일상을 바꿉니다.
          </FinalCTADesc>
          <HeroPriceRow style={{ justifyContent: 'center', marginBottom: '2rem' }}>
            {hasSale && <HeroDisc>{disc}% OFF</HeroDisc>}
            <HeroSalePrice $color={mainColor}>{commarNumber(sale)}원</HeroSalePrice>
            {hasSale && <HeroOrigPrice>{commarNumber(orig)}원</HeroOrigPrice>}
          </HeroPriceRow>
          <HeroCTA $color={mainColor} onClick={goTo}>지금 구매하기 →</HeroCTA>
        </Container>
      </FinalCTA>
    </Wrapper>
  );
};

export default Demo6;
