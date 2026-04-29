import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { commarNumber } from 'src/utils/function'
import { formatLang } from 'src/utils/format'
import { useFeaturedProduct } from 'src/utils/use-featured-product'
import { useLocales } from 'src/locales'

/* ══════════════════════════════════════
   블로그 데모-9: 파스텔 드림
   부드러운 파스텔 + 둥근 형태 + 인스타 감성
   ══════════════════════════════════════ */

const BG = '#fff5f0';
const PINK = '#ffc4c4';
const CORAL = '#ff8a80';
const TEXT = '#2c2c2c';

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: ${BG};
  color: ${TEXT};
  min-height: 100vh;
`
const Section = styled.section`
  padding: 5rem 2rem;
  @media (max-width: 840px) {
    padding: 3rem 1.25rem;
  }
`

/* Floating Hero */
const Hero = styled(Section)`
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(180deg, ${BG} 0%, ${PINK}40 100%);
`
const FloatingBlob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.6;
  animation: float 8s ease-in-out infinite;
  @keyframes float {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.05); }
  }
`
const Blob1 = styled(FloatingBlob)`
  top: 10%;
  left: 10%;
  width: 300px;
  height: 300px;
  background: ${PINK};
`
const Blob2 = styled(FloatingBlob)`
  bottom: 15%;
  right: 10%;
  width: 250px;
  height: 250px;
  background: ${CORAL}60;
  animation-delay: -4s;
`
const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 700px;
`
const HeroStickerRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`
const Sticker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 8px 18px;
  background: ${p => p.$bg || '#fff'};
  color: ${p => p.$color || TEXT};
  border-radius: 50px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
`
const HeroImageWrap = styled.div`
  width: 340px;
  height: 340px;
  margin: 0 auto 2rem;
  background: #fff;
  border-radius: 60% 40% 50% 50% / 50% 50% 40% 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 30px 80px rgba(255, 138, 128, 0.25);
  overflow: hidden;
  @media (max-width: 840px) {
    width: 260px;
    height: 260px;
  }
`
const HeroImage = styled(LazyLoadImage)`
  width: 260px;
  height: 260px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 200px;
    height: 200px;
  }
`
const HeroName = styled.h1`
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1.1;
  margin: 0 0 1rem 0;
  @media (max-width: 840px) {
    font-size: 32px;
  }
`
const HeroDesc = styled.div`
  font-size: 16px;
  line-height: 1.7;
  color: ${TEXT};
  opacity: 0.7;
  margin-bottom: 1.5rem;
`
const HeroPriceWrap = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 12px 28px;
  background: #fff;
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
`
const HeroPrice = styled.span`
  font-size: 28px;
  font-weight: 900;
  color: ${CORAL};
`
const HeroOrig = styled.span`
  font-size: 14px;
  text-decoration: line-through;
  opacity: 0.4;
`
const CTABtn = styled.a`
  display: inline-block;
  padding: 16px 44px;
  background: linear-gradient(135deg, ${CORAL} 0%, #ff6b6b 100%);
  color: #fff;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(255, 138, 128, 0.4);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(255, 138, 128, 0.5);
  }
`

/* Polaroid Gallery */
const PolaroidGallery = styled(Section)`
  text-align: center;
`
const PolaroidGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 3rem auto 0;
`
const Polaroid = styled.div`
  background: #fff;
  padding: 14px 14px 40px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  transform: rotate(${p => p.$rot || 0}deg);
  transition: transform 0.3s;
  &:hover {
    transform: rotate(0deg) scale(1.05);
  }
`
const PolaroidImg = styled(LazyLoadImage)`
  width: 200px;
  height: 200px;
  object-fit: contain;
  background: ${BG};
  display: block;
`
const PolaroidCaption = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  font-family: 'Caveat', 'Gowun Batang', cursive;
  font-size: 16px;
  color: ${TEXT};
`

/* Quote Section */
const QuoteSection = styled(Section)`
  background: ${PINK}50;
  text-align: center;
`
const Quote = styled.div`
  font-size: 28px;
  font-weight: 900;
  line-height: 1.5;
  letter-spacing: -0.5px;
  max-width: 700px;
  margin: 0 auto;
  @media (max-width: 840px) {
    font-size: 20px;
  }
`
const QuoteHighlight = styled.span`
  background: linear-gradient(180deg, transparent 60%, ${CORAL}60 60%);
  padding: 0 4px;
`

/* Heart Reviews */
const HeartSection = styled(Section)`
  text-align: center;
`
const HeartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 3rem auto 0;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const HeartCard = styled.div`
  background: #fff;
  padding: 2rem 1.5rem;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  text-align: left;
`
const HeartEmoji = styled.div`
  font-size: 32px;
  margin-bottom: 1rem;
`
const HeartText = styled.div`
  font-size: 14px;
  line-height: 1.7;
  color: ${TEXT};
  margin-bottom: 1rem;
`
const HeartAuthor = styled.div`
  font-size: 12px;
  color: ${CORAL};
  font-weight: 700;
`

/* Final CTA */
const FinalCTA = styled(Section)`
  text-align: center;
  background: linear-gradient(180deg, ${PINK}40 0%, ${CORAL}80 100%);
  padding: 6rem 2rem;
`
const FinalTitle = styled.h2`
  font-size: 44px;
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1.2;
  margin: 0 0 1rem 0;
  @media (max-width: 840px) {
    font-size: 32px;
  }
`

const SectionHeading = styled.h2`
  font-size: 36px;
  font-weight: 900;
  text-align: center;
  letter-spacing: -1px;
  margin: 0 0 2rem 0;
  @media (max-width: 840px) {
    font-size: 26px;
  }
`

const Demo9 = (props) => {
  const { currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { func } = props;
  const router = func?.router;
  const brandName = themeDnsData?.name || 'BRAND';
  const product = useFeaturedProduct();

  if (!product) {
    return (
      <Wrapper>
        <Section style={{ textAlign: 'center' }}>
          <HeroName>Coming Soon 💕</HeroName>
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
      <Hero>
        <Blob1 />
        <Blob2 />
        <HeroContent>
          <HeroStickerRow>
            <Sticker $bg={CORAL} $color="#fff">✨ NEW</Sticker>
            {hasSale && <Sticker $bg="#fff" $color={CORAL}>🔥 {disc}% OFF</Sticker>}
            <Sticker $bg="#fff" $color={TEXT}>💝 {brandName}</Sticker>
          </HeroStickerRow>
          <HeroImageWrap>
            <HeroImage src={img} effect="blur" onClick={goTo} style={{ cursor: 'pointer' }} />
          </HeroImageWrap>
          <HeroName>{name}</HeroName>
          {comment && <HeroDesc>{comment}</HeroDesc>}
          <HeroPriceWrap>
            <HeroPrice>{commarNumber(sale)}원</HeroPrice>
            {hasSale && <HeroOrig>{commarNumber(orig)}원</HeroOrig>}
          </HeroPriceWrap>
          <div>
            <CTABtn onClick={goTo}>구매하기 💫</CTABtn>
          </div>
        </HeroContent>
      </Hero>

      <PolaroidGallery>
        <SectionHeading>📸 Moments</SectionHeading>
        <PolaroidGrid>
          <Polaroid $rot={-3}>
            <PolaroidImg src={img} effect="blur" />
            <PolaroidCaption>love it 💕</PolaroidCaption>
          </Polaroid>
          <Polaroid $rot={2}>
            <PolaroidImg src={img} effect="blur" />
            <PolaroidCaption>best ever ✨</PolaroidCaption>
          </Polaroid>
          <Polaroid $rot={-1.5}>
            <PolaroidImg src={img} effect="blur" />
            <PolaroidCaption>my fav 🌸</PolaroidCaption>
          </Polaroid>
        </PolaroidGrid>
      </PolaroidGallery>

      <QuoteSection>
        <Quote>
          "<QuoteHighlight>하나만 만들어도 제대로</QuoteHighlight>,<br />
          그게 바로 {brandName}의 방식이에요."
        </Quote>
      </QuoteSection>

      <HeartSection>
        <SectionHeading>💗 Customer Love</SectionHeading>
        <HeartGrid>
          <HeartCard>
            <HeartEmoji>🥰</HeartEmoji>
            <HeartText>"정말 좋아요! 기대했던 것보다 훨씬 만족스러워요."</HeartText>
            <HeartAuthor>— 지수님</HeartAuthor>
          </HeartCard>
          <HeartCard>
            <HeartEmoji>✨</HeartEmoji>
            <HeartText>"단 하나의 상품에 이렇게 진심일 수 있다니. 감동."</HeartText>
            <HeartAuthor>— 민지님</HeartAuthor>
          </HeartCard>
          <HeartCard>
            <HeartEmoji>💕</HeartEmoji>
            <HeartText>"친구들한테도 추천했어요. 반응 너무 좋아요!"</HeartText>
            <HeartAuthor>— 서연님</HeartAuthor>
          </HeartCard>
        </HeartGrid>
      </HeartSection>

      <FinalCTA>
        <FinalTitle>지금이 {brandName}과<br />함께할 순간이에요 💕</FinalTitle>
        <div style={{ margin: '2rem 0' }}>
          <HeroPrice style={{ fontSize: '40px' }}>{commarNumber(sale)}원</HeroPrice>
        </div>
        <CTABtn onClick={goTo}>바로 구매하기 →</CTABtn>
      </FinalCTA>
    </Wrapper>
  );
};

export default Demo9;
