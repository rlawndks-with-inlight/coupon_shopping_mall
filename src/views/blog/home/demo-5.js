import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { commarNumber, commarNumberWithUnit } from 'src/utils/function'
import { formatLang, 홈문구 } from 'src/utils/format'
import { useFeaturedProduct, useFeaturedProducts, getFeaturedCardData } from 'src/utils/use-featured-product'
import { useLocales } from 'src/locales'
import StorefrontEmptyHome from 'src/components/elements/shop/StorefrontEmptyHome'

/* ══════════════════════════════════════
   블로그 데모-5: 다크 럭셔리
   검은 배경 + 골드 액센트
   ══════════════════════════════════════ */

const GOLD = '#c9a876';

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: #0a0a0a;
  color: #fff;
`
const Section = styled.section`
  padding: 6rem 2rem;
  @media (max-width: 840px) {
    padding: 4rem 1.25rem;
  }
`

const Hero = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 3rem;
  background:
    radial-gradient(ellipse at center, rgba(201, 168, 118, 0.15) 0%, transparent 60%),
    linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
`
const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 700px;
`
const HeroOrnament = styled.div`
  font-size: 24px;
  color: ${GOLD};
  letter-spacing: 10px;
  margin-bottom: 2rem;
`
const HeroBrand = styled.div`
  font-size: 12px;
  letter-spacing: 6px;
  color: ${GOLD};
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 2rem;
`
const HeroImageWrap = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 3rem;
  width: 320px;
  height: 320px;
  @media (max-width: 840px) {
    width: 240px;
    height: 240px;
  }
`
const HeroImageBg = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, ${GOLD}40 0%, transparent 70%);
  filter: blur(30px);
`
const HeroImageRing = styled.div`
  position: absolute;
  inset: -20px;
  border: 1px solid ${GOLD}40;
  border-radius: 50%;
`
const HeroImage = styled(LazyLoadImage)`
  width: 260px;
  height: 260px;
  object-fit: contain;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 20px 50px rgba(201, 168, 118, 0.3));
  @media (max-width: 840px) {
    width: 200px;
    height: 200px;
  }
`
const HeroTitle = styled.h1`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 52px;
  font-weight: 300;
  letter-spacing: -1px;
  line-height: 1.2;
  margin: 0 0 1.5rem 0;
  @media (max-width: 840px) {
    font-size: 32px;
  }
`
const HeroDivider = styled.div`
  width: 40px;
  height: 1px;
  background: ${GOLD};
  margin: 2rem auto;
`
const HeroDesc = styled.div`
  font-size: 15px;
  line-height: 1.9;
  opacity: 0.7;
  font-style: italic;
  margin-bottom: 2.5rem;
`
const HeroPrice = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  color: ${GOLD};
  font-weight: 300;
  margin-bottom: 2rem;
`
const CTABtn = styled.a`
  display: inline-block;
  padding: 16px 48px;
  border: 1px solid ${GOLD};
  color: ${GOLD};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  transition: all 0.3s;
  &:hover {
    background: ${GOLD};
    color: #0a0a0a;
  }
`

const SpecSection = styled(Section)`
  background: #0f0f0f;
  border-top: 1px solid rgba(201, 168, 118, 0.15);
  border-bottom: 1px solid rgba(201, 168, 118, 0.15);
`
const SpecGrid = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const SpecCell = styled.div`
  text-align: center;
  padding: 2rem;
  border-left: 1px solid rgba(201, 168, 118, 0.15);
  &:first-child {
    border-left: none;
  }
  @media (max-width: 840px) {
    border-left: none;
    border-top: 1px solid rgba(201, 168, 118, 0.15);
    &:first-child {
      border-top: none;
    }
  }
`
const SpecIcon = styled.div`
  font-size: 28px;
  color: ${GOLD};
  margin-bottom: 1rem;
`
const SpecTitle = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  margin-bottom: 0.5rem;
`
const SpecDesc = styled.div`
  font-size: 13px;
  opacity: 0.6;
  line-height: 1.7;
`

const StorySection = styled(Section)`
  padding: 8rem 2rem;
`
const StoryInner = styled.div`
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
`
const StoryLabel = styled.div`
  font-size: 11px;
  letter-spacing: 6px;
  color: ${GOLD};
  margin-bottom: 2rem;
`
const StoryTitle = styled.h2`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 42px;
  font-weight: 300;
  line-height: 1.3;
  margin: 0 0 2rem 0;
  @media (max-width: 840px) {
    font-size: 28px;
  }
`
const StoryQuote = styled.div`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 22px;
  line-height: 1.7;
  font-style: italic;
  opacity: 0.8;
  max-width: 700px;
  margin: 0 auto;
  @media (max-width: 840px) {
    font-size: 17px;
  }
`

const GallerySection = styled(Section)`
  background: #0f0f0f;
`
const GalleryGrid = styled.div`
  max-width: 1100px;
  margin: 3rem auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const GalleryCell = styled.div`
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  border: 1px solid rgba(201, 168, 118, 0.2);
  padding: 1.5rem;
`
const FeaturedCard = styled.div`
  cursor: pointer;
  text-align: center;
  transition: transform 0.3s;
  &:hover {
    transform: translateY(-4px);
  }
`
const FeaturedName = styled.div`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 20px;
  font-weight: 300;
  margin-top: 1.25rem;
  line-height: 1.3;
`
const FeaturedPrice = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: ${GOLD};
  font-weight: 300;
  margin-top: 0.5rem;
`
const FeaturedOrig = styled.span`
  font-size: 13px;
  opacity: 0.4;
  text-decoration: line-through;
  margin-right: 0.5rem;
`
const FeaturedDisc = styled.span`
  font-size: 12px;
  letter-spacing: 1px;
  color: ${GOLD};
`

const FinalCTA = styled(Section)`
  text-align: center;
  background:
    radial-gradient(ellipse at center, rgba(201, 168, 118, 0.15) 0%, transparent 70%),
    #0a0a0a;
`
const FinalTitle = styled.h2`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 56px;
  font-weight: 300;
  letter-spacing: -1px;
  margin: 0 0 2rem 0;
  @media (max-width: 840px) {
    font-size: 36px;
  }
`

const SectionHeading = styled.h2`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 38px;
  font-weight: 300;
  text-align: center;
  margin: 0 0 3rem 0;
  @media (max-width: 840px) {
    font-size: 26px;
  }
`

const Demo5 = (props) => {
  const { currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { func } = props;
  const router = func?.router;
  const brandName = themeDnsData?.name || 'BRAND';
  const t = themeDnsData?.setting_obj?.home_texts?.demo5 ?? {}; // 가맹점 편집 문구(미입력 시 기본값). 읽을 때는 홈문구() 로 — 언어별 번역이 lang_obj 에 들어 있다.
  const product = useFeaturedProduct();
  const featuredProducts = useFeaturedProducts({ excludeId: product?.id });

  // 상품 0건(대표상품 지정도 없고 판매상품도 없음)일 때만 여기로 온다.
  // 'Coming Soon' 영어 단독은 고객에게 '공사중/안 연 사이트'로 읽혀 이탈 사유가 되므로
  // 브랜드명 + 한국어 안내를 쓰는 공용 컴포넌트로 교체. 다크 배경/여백은 데모 톤 그대로 유지.
  if (!product) {
    return (
      <Wrapper>
        <Section style={{ textAlign: 'center' }}>
          <StorefrontEmptyHome />
        </Section>
      </Wrapper>
    );
  }

  const img = fixImgUrl(product?.product_img);
  // 갤러리: 상품 서브이미지 사용(없으면 대표이미지). 어드민 상품편집에서 서브이미지 등록 시 반영.
  const galleryImgs = [img, ...(product?.sub_images ?? []).map(s => fixImgUrl(s?.product_sub_img))].filter(Boolean);
  const name = formatLang(product, 'product_name', currentLang);
  const comment = formatLang(product, 'product_comment');
  const sale = product?.product_sale_price || product?.product_price || 0;
  const orig = product?.product_price || 0;
  const hasSale = orig > sale && sale > 0;
  const disc = hasSale ? Math.round((orig - sale) * 100 / orig) : 0;
  const goTo = () => router?.push?.(`/shop/item/${product?.id}`);

  return (
    <Wrapper>
      <Hero>
        <HeroContent>
          <HeroOrnament>✦ ✦ ✦</HeroOrnament>
          <HeroBrand>{brandName} · Maison</HeroBrand>
          <HeroImageWrap>
            <HeroImageBg />
            <HeroImageRing />
            <HeroImage src={img} effect="blur" onClick={goTo} style={{ cursor: 'pointer' }} />
          </HeroImageWrap>
          <HeroTitle>{name}</HeroTitle>
          <HeroDivider />
          {comment && <HeroDesc>"{comment}"</HeroDesc>}
          {hasSale && (
            <div style={{ fontSize: '14px', color: '#ff6b6b', marginBottom: '1rem', letterSpacing: '2px' }}>
              {disc}% EXCLUSIVE OFFER
            </div>
          )}
          <HeroPrice>{commarNumberWithUnit(sale)}</HeroPrice>
          <CTABtn onClick={goTo}>Acquire</CTABtn>
        </HeroContent>
      </Hero>

      <SpecSection>
        <SectionHeading>{홈문구(t, 'spec_heading', currentLang) || 'Excellence, Defined'}</SectionHeading>
        <SpecGrid>
          <SpecCell>
            <SpecIcon>✦</SpecIcon>
            <SpecTitle>{홈문구(t, 'spec1_title', currentLang) || 'Pure Craftsmanship'}</SpecTitle>
            <SpecDesc>{홈문구(t, 'spec1_desc', currentLang) || '한 땀 한 땀 정성으로 완성된 장인의 작품.'}</SpecDesc>
          </SpecCell>
          <SpecCell>
            <SpecIcon>♦</SpecIcon>
            <SpecTitle>{홈문구(t, 'spec2_title', currentLang) || 'Rare Materials'}</SpecTitle>
            <SpecDesc>{홈문구(t, 'spec2_desc', currentLang) || '세계 각지에서 엄선된 최고의 원료만을 사용.'}</SpecDesc>
          </SpecCell>
          <SpecCell>
            <SpecIcon>♛</SpecIcon>
            <SpecTitle>{홈문구(t, 'spec3_title', currentLang) || 'Timeless Elegance'}</SpecTitle>
            <SpecDesc>{홈문구(t, 'spec3_desc', currentLang) || '유행에 흔들리지 않는 영원한 아름다움.'}</SpecDesc>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <StorySection>
        <StoryInner>
          <StoryLabel>MAISON STORY</StoryLabel>
          <StoryTitle>The Art of {brandName}</StoryTitle>
          <StoryQuote>
            {홈문구(t, 'story_quote', currentLang) || '"완벽을 추구한다는 것은 평범한 것을 만드는 것이 아닙니다. 오랜 시간 수많은 시도 끝에 단 하나의 답을 찾아내는 여정입니다."'}
          </StoryQuote>
        </StoryInner>
      </StorySection>

      <GallerySection>
        <SectionHeading>Visual Heritage</SectionHeading>
        <GalleryGrid>
          <GalleryCell>
            <LazyLoadImage src={galleryImgs[0]} effect="blur" style={{ maxWidth: '75%', maxHeight: '75%', objectFit: 'contain', filter: 'drop-shadow(0 10px 30px rgba(201,168,118,0.2))' }} />
          </GalleryCell>
          <GalleryCell>
            <LazyLoadImage src={galleryImgs[1 % galleryImgs.length]} effect="blur" style={{ maxWidth: '75%', maxHeight: '75%', objectFit: 'contain', filter: 'drop-shadow(0 10px 30px rgba(201,168,118,0.2))' }} />
          </GalleryCell>
          <GalleryCell>
            <LazyLoadImage src={galleryImgs[2 % galleryImgs.length]} effect="blur" style={{ maxWidth: '75%', maxHeight: '75%', objectFit: 'contain', filter: 'drop-shadow(0 10px 30px rgba(201,168,118,0.2))' }} />
          </GalleryCell>
        </GalleryGrid>
      </GallerySection>

      {featuredProducts.length > 0 && (
        <GallerySection>
          <SectionHeading>The Collection</SectionHeading>
          <GalleryGrid>
            {featuredProducts.map((item) => {
              const c = getFeaturedCardData(item, currentLang);
              return (
                <FeaturedCard key={c.id} onClick={() => router?.push?.(`/shop/item/${c.id}`)}>
                  <GalleryCell>
                    <LazyLoadImage src={c.img} effect="blur" style={{ maxWidth: '75%', maxHeight: '75%', objectFit: 'contain', filter: 'drop-shadow(0 10px 30px rgba(201,168,118,0.2))' }} />
                  </GalleryCell>
                  <FeaturedName>{c.name}</FeaturedName>
                  <FeaturedPrice>
                    {c.hasSale && (
                      <>
                        <FeaturedOrig>{commarNumberWithUnit(c.orig)}</FeaturedOrig>
                        <FeaturedDisc>{c.disc}%</FeaturedDisc>
                        <br />
                      </>
                    )}
                    {commarNumberWithUnit(c.sale)}
                  </FeaturedPrice>
                </FeaturedCard>
              );
            })}
          </GalleryGrid>
        </GallerySection>
      )}

      <FinalCTA>
        <HeroOrnament>✦</HeroOrnament>
        <FinalTitle>Enter the World<br />of {brandName}</FinalTitle>
        <HeroDivider />
        <HeroPrice>{commarNumberWithUnit(sale)}</HeroPrice>
        <CTABtn onClick={goTo}>Begin Your Journey</CTABtn>
      </FinalCTA>
    </Wrapper>
  );
};

export default Demo5;
