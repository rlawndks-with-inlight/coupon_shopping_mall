import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { commarNumber } from 'src/utils/function'
import { formatLang } from 'src/utils/format'
import { useFeaturedProduct } from 'src/utils/use-featured-product'
import { useLocales } from 'src/locales'

/* ══════════════════════════════════════
   블로그 데모-7: 일본 젠 / 와비사비
   크라프트 페이퍼 톤 + 손그림 느낌 + 세로 강조
   ══════════════════════════════════════ */

const PAPER = '#f4efe6';
const INK = '#2b2420';
const ACCENT = '#a64d3c';

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: ${PAPER};
  color: ${INK};
  min-height: 100vh;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(rgba(43, 36, 32, 0.04) 1px, transparent 1px),
      radial-gradient(rgba(43, 36, 32, 0.03) 1px, transparent 1px);
    background-size: 24px 24px, 48px 48px;
    background-position: 0 0, 12px 12px;
    pointer-events: none;
  }
`
const Section = styled.section`
  position: relative;
  padding: 6rem 2rem;
  @media (max-width: 840px) {
    padding: 4rem 1.25rem;
  }
`

/* Hero */
const Hero = styled(Section)`
  min-height: 100vh;
  display: flex;
  align-items: center;
`
const HeroInner = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 3rem;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`
const VerticalLabel = styled.div`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 14px;
  letter-spacing: 8px;
  color: ${ACCENT};
  font-weight: 500;
  @media (max-width: 840px) {
    writing-mode: horizontal-tb;
    letter-spacing: 4px;
  }
`
const HeroCenter = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`
const HeroStamp = styled.div`
  display: inline-block;
  padding: 8px 24px;
  border: 1.5px solid ${INK};
  color: ${INK};
  font-size: 11px;
  letter-spacing: 4px;
  font-weight: 500;
  border-radius: 2px;
`
const HeroImageWrap = styled.div`
  position: relative;
  width: 340px;
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 840px) {
    width: 240px;
    height: 240px;
  }
`
const InkCircle = styled.div`
  position: absolute;
  inset: 0;
  border: 2px solid ${INK};
  border-radius: 50%;
  border-left-color: transparent;
  transform: rotate(-45deg);
`
const HeroImage = styled(LazyLoadImage)`
  width: 260px;
  height: 260px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 180px;
    height: 180px;
  }
`
const HeroName = styled.h1`
  font-family: 'Noto Serif KR', 'Playfair Display', serif;
  font-size: 40px;
  font-weight: 300;
  letter-spacing: 2px;
  line-height: 1.4;
  margin: 0;
  @media (max-width: 840px) {
    font-size: 28px;
  }
`
const HeroDivider = styled.div`
  width: 24px;
  height: 2px;
  background: ${ACCENT};
`
const HeroBrush = styled.div`
  font-family: 'Noto Serif KR', serif;
  font-size: 15px;
  line-height: 2;
  font-style: italic;
  color: ${INK};
  opacity: 0.7;
  max-width: 420px;
`
const HeroPrice = styled.div`
  font-family: 'Noto Serif KR', serif;
  font-size: 30px;
  font-weight: 300;
  margin-top: 0.5rem;
`
const HeroRight = styled.div`
  font-family: 'Noto Serif KR', serif;
  font-size: 11px;
  letter-spacing: 4px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  opacity: 0.6;
  justify-self: end;
  @media (max-width: 840px) {
    writing-mode: horizontal-tb;
  }
`
const CTABtn = styled.a`
  display: inline-block;
  padding: 14px 40px;
  background: ${INK};
  color: ${PAPER};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 5px;
  text-decoration: none;
  cursor: pointer;
  margin-top: 1rem;
  &:hover {
    background: ${ACCENT};
  }
`

/* Philosophy */
const Philosophy = styled(Section)`
  background: #ebe5d9;
  text-align: center;
`
const PhilosophyText = styled.div`
  font-family: 'Noto Serif KR', serif;
  font-size: 26px;
  line-height: 2;
  letter-spacing: 2px;
  max-width: 720px;
  margin: 0 auto;
  font-weight: 300;
  @media (max-width: 840px) {
    font-size: 18px;
    letter-spacing: 1px;
  }
`
const PhilosophySign = styled.div`
  margin-top: 2rem;
  font-size: 11px;
  letter-spacing: 6px;
  opacity: 0.5;
`

/* Values - 3열 세로형 */
const Values = styled(Section)`
  text-align: center;
`
const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  max-width: 900px;
  margin: 0 auto;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`
const ValueCard = styled.div`
  padding: 2rem 1rem;
  border: 1px solid ${INK}30;
`
const ValueKanji = styled.div`
  font-family: 'Noto Serif KR', serif;
  font-size: 48px;
  color: ${ACCENT};
  margin-bottom: 1.5rem;
  font-weight: 300;
`
const ValueTitle = styled.div`
  font-family: 'Noto Serif KR', serif;
  font-size: 18px;
  margin-bottom: 1rem;
  letter-spacing: 2px;
`
const ValueDesc = styled.div`
  font-size: 13px;
  line-height: 2;
  opacity: 0.75;
`

/* Final */
const FinalCTA = styled(Section)`
  text-align: center;
  background: ${INK};
  color: ${PAPER};
`
const FinalTitle = styled.h2`
  font-family: 'Noto Serif KR', serif;
  font-size: 42px;
  font-weight: 300;
  letter-spacing: 4px;
  margin: 0 0 2rem 0;
  @media (max-width: 840px) {
    font-size: 28px;
  }
`
const FinalCTABtn = styled.a`
  display: inline-block;
  padding: 14px 48px;
  border: 1.5px solid ${PAPER};
  color: ${PAPER};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 5px;
  cursor: pointer;
  margin-top: 1rem;
  &:hover {
    background: ${PAPER};
    color: ${INK};
  }
`

const SectionHeading = styled.h2`
  font-family: 'Noto Serif KR', serif;
  font-size: 34px;
  font-weight: 300;
  text-align: center;
  letter-spacing: 4px;
  margin: 0 0 3rem 0;
  &::after {
    content: '';
    display: block;
    width: 30px;
    height: 2px;
    background: ${ACCENT};
    margin: 1rem auto 0;
  }
`

const Demo7 = (props) => {
  const { currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { func } = props;
  const router = func?.router;
  const brandName = themeDnsData?.name || '無名';
  const product = useFeaturedProduct();

  if (!product) {
    return (
      <Wrapper>
        <Section style={{ textAlign: 'center' }}>
          <HeroName>Coming Soon</HeroName>
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
  const goTo = () => router?.push?.(`/blog/product/${product?.id}`);

  return (
    <Wrapper>
      <Hero>
        <HeroInner>
          <VerticalLabel>{brandName}</VerticalLabel>
          <HeroCenter>
            <HeroStamp>無 · 空 · 和</HeroStamp>
            <HeroImageWrap>
              <InkCircle />
              <HeroImage src={img} effect="blur" onClick={goTo} style={{ cursor: 'pointer' }} />
            </HeroImageWrap>
            <HeroName>{name}</HeroName>
            <HeroDivider />
            {comment && <HeroBrush>"{comment}"</HeroBrush>}
            <HeroPrice>{commarNumber(sale)}円</HeroPrice>
            <CTABtn onClick={goTo}>求める</CTABtn>
          </HeroCenter>
          <HeroRight>SINCE {new Date().getFullYear()}</HeroRight>
        </HeroInner>
      </Hero>

      <Philosophy>
        <PhilosophyText>
          오래 지속되는 것에는 이유가 있습니다.<br />
          빠르지 않아도, 화려하지 않아도,<br />
          진심으로 만들어진 단 하나를.
        </PhilosophyText>
        <PhilosophySign>— {brandName} —</PhilosophySign>
      </Philosophy>

      <Values>
        <SectionHeading>三つの誓い</SectionHeading>
        <ValuesGrid>
          <ValueCard>
            <ValueKanji>無</ValueKanji>
            <ValueTitle>없음의 미학</ValueTitle>
            <ValueDesc>덜어내는 것이 곧 본질을 드러내는 길이라 믿습니다.</ValueDesc>
          </ValueCard>
          <ValueCard>
            <ValueKanji>空</ValueKanji>
            <ValueTitle>비움의 공간</ValueTitle>
            <ValueDesc>여백이 있기에 의미가 채워집니다.</ValueDesc>
          </ValueCard>
          <ValueCard>
            <ValueKanji>和</ValueKanji>
            <ValueTitle>조화의 손길</ValueTitle>
            <ValueDesc>자연과 사람 사이, 조용한 균형을 추구합니다.</ValueDesc>
          </ValueCard>
        </ValuesGrid>
      </Values>

      <FinalCTA>
        <FinalTitle>{brandName}</FinalTitle>
        <HeroBrush style={{ color: PAPER, opacity: 0.6, maxWidth: '500px', margin: '0 auto 2rem' }}>
          "좋은 것을 오래도록 함께하는 기쁨"
        </HeroBrush>
        <FinalCTABtn onClick={goTo}>求める →</FinalCTABtn>
      </FinalCTA>
    </Wrapper>
  );
};

export default Demo7;
