import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings'
import { themeObj } from 'src/components/elements/styled-components'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { commarNumber, commarNumberWithUnit } from 'src/utils/function'
import { formatLang, 홈문구 } from 'src/utils/format'
import { useFeaturedProduct, useFeaturedProducts, getFeaturedCardData } from 'src/utils/use-featured-product'
import { useLocales } from 'src/locales'
import StorefrontEmptyHome from 'src/components/elements/shop/StorefrontEmptyHome'

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
/* 히어로는 사진(왼쪽) · 글(오른쪽) 두 칸이다.
   가맹점 요청(2026-08-24, 2026-08-26 보완): "사진 이미지와 제목 이미지 순서 변경.
   모바일상에서도 사진 이미지가 먼저 나오는게 좋을 듯" — PC 도 좌우를 바꾼다.

   ⚠ 예전에는 글이 왼쪽이라 모바일에서만 CSS order 로 사진을 끌어올렸다.
     이제 PC·모바일 모두 사진이 먼저이므로 **DOM 순서 자체가 사진 → 글** 이다.
     order 뒤집기는 필요 없어졌다(있으면 오히려 두 번 뒤집힌다). */
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* 헤더가 sticky 라 위에서 제 높이만큼 자리를 차지한다.
     100vh 를 그대로 쓰면 히어로 아랫단이 늘 화면 밖으로 밀려
     **'구매하기' 버튼이 잘린 채** 보였다. 헤더 높이(약 5rem)를 뺀다.
     svh 는 모바일 주소창이 접혔다 펴질 때 높이가 튀지 않게 한다
     (못 읽는 브라우저는 윗줄 vh 를 쓴다 — 그래서 두 줄을 겹쳐 둔다). */
  min-height: calc(100vh - 5rem);
  min-height: calc(100svh - 5rem);
  border-bottom: 1px solid #000;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`
const HeroInfo = styled.div`
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  /* 세로 구분선은 사진 칸(HeroMedia)의 오른쪽으로 옮겼다 — 사진이 왼쪽이 되었기 때문이다. */
  min-width: 0;
  @media (max-width: 840px) {
    /* 모바일 구분선은 여기가 아니라 사진 아래에 있다.
       글 아래에 그으면 Hero 자체의 border-bottom 과 겹쳐 두 줄이 된다. */
    padding: 2.25rem 1.5rem;
  }
`
/* 위쪽 한 줄(상호 · № 001)은 편집 디자인의 머리글이라 위에 붙여 두고,
   제목·정보·버튼은 남은 자리 한가운데 모은다.

   ⚠ 예전에는 justify-content: space-between 으로 버튼을 칸 맨 아래에 붙였다.
     100vh 짜리 칸이라 글과 버튼 사이에 **화면 절반이 빈 채로** 남았고,
     버튼은 화면 밖으로 밀려 잘렸다. 가운데 모으면 두 문제가 같이 사라진다. */
const HeroBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`
const HeroCta = styled.div`
  margin-top: 3rem;
  /* 모바일에서는 위아래 여백을 조금씩 줄인다.
     안 줄이면 히어로가 첫 화면보다 10px 남짓 길어져 **'구매하기' 가 접힌 자리 아래**로 넘어갔다.
     사진 크기는 건드리지 않는다 — 사진을 먼저 보여 달라는 것이 요청의 본뜻이다. */
  @media (max-width: 840px) {
    margin-top: 2rem;
  }
`
const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  /* 12px 아래로 내리지 말 것 — 이 화면의 작은 글씨 기본 단계가 12px 이다(18곳). */
  font-size: 12px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 3rem;
`
/* 96px 고정이었다. 좌우를 나눈 화면에서 한 칸은 창의 절반뿐이라,
   1100~1400px 짜리 노트북에서 긴 상품명이 칸을 넘치거나 두세 줄로 무너졌다.
   칸 너비를 따라가게 하고(글자 크기 5vw), 위아래로만 묶어 둔다.
   자간도 px 이 아니라 em 이라야 글자가 작아질 때 같이 좁아진다. */
const HeroTitle = styled.h1`
  font-size: clamp(44px, 5vw, 96px);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.05em;
  margin: 0;
  text-transform: uppercase;
  /* 한글 상품명이 아무 글자에서나 갈라지지 않게 한다(CSS 기본값이 그렇다). */
  word-break: keep-all;
  overflow-wrap: anywhere;
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
const HeroMedia = styled.div`
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  /* 두 칸을 가르는 세로선. 사진이 왼쪽이 되었으므로 선도 이쪽 오른쪽으로 왔다. */
  border-right: 1px solid #000;
  @media (max-width: 840px) {
    padding: 2rem 1.25rem;
    border-right: none;
    /* 한 칸으로 접히면 사진과 글 사이를 가로선이 가른다. */
    border-bottom: 1px solid #000;
  }
`
/* 400px 고정이었다. 1920px 화면에서 한 칸이 960px 인데 사진은 400px 이라
   회색 칸 안에서 **사진이 동동 떠 보였다**(빈 자리가 사진보다 넓었다).
   칸 너비를 따라 커지되 지나치게 커지지는 않게 위를 막는다. */
const HeroImage = styled(LazyLoadImage)`
  width: 100%;
  max-width: 620px;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  @media (max-width: 840px) {
    max-width: 340px;
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
  /* 12px 아래로 내리지 말 것 — 이 화면의 작은 글씨 기본 단계가 12px 이다(18곳). */
  font-size: 12px;
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
  /* 12px 아래로 내리지 말 것 — 이 화면의 작은 글씨 기본 단계가 12px 이다(18곳). */
  font-size: 12px;
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

/* Featured Products Grid (optional) */
const FeaturedSection = styled.section`
  padding: 6rem 3rem;
  border-bottom: 1px solid #000;
  @media (max-width: 840px) {
    padding: 4rem 1.5rem;
  }
`
const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  @media (max-width: 840px) {
    grid-template-columns: repeat(2, 1fr);
  }
`
const FeaturedCell = styled.div`
  border-left: 1px solid #000;
  cursor: pointer;
  &:first-child {
    border-left: none;
  }
  &:hover {
    background: #000;
    color: #fff;
  }
  @media (max-width: 840px) {
    &:nth-child(3) { border-left: none; }
  }
`
const FeaturedImageBox = styled.div`
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  padding: 2rem;
`
const FeaturedImage = styled(LazyLoadImage)`
  width: 100%;
  height: 100%;
  object-fit: contain;
`
const FeaturedInfo = styled.div`
  padding: 1.5rem;
`
const FeaturedName = styled.div`
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  @media (max-width: 840px) {
    font-size: 18px;
  }
`
const FeaturedPrice = styled.div`
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.5px;
`

const Demo4 = (props) => {
  const { translate, currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { func } = props;
  const router = func?.router;
  const brandName = themeDnsData?.name || 'BRAND';
  const t = themeDnsData?.setting_obj?.home_texts?.demo4 ?? {}; // 가맹점 편집 문구(미입력 시 기본값). 읽을 때는 홈문구() 로 — 언어별 번역이 lang_obj 에 들어 있다.
  const product = useFeaturedProduct();
  const featuredProducts = useFeaturedProducts({ excludeId: product?.id });

  // 상품 0건(대표상품 지정도 없고 판매상품도 없음)일 때만 여기로 온다.
  // 'COMING SOON' 영어 단독은 고객에게 '공사중/안 연 사이트'로 읽혀 이탈 사유가 되므로
  // 브랜드명 + 한국어 안내를 쓰는 공용 컴포넌트로 교체. 배경/여백은 데모 톤 그대로 유지.
  if (!product) {
    return (
      <Wrapper>
        <PriceSection>
          <StorefrontEmptyHome />
        </PriceSection>
      </Wrapper>
    );
  }

  const img = fixImgUrl(product?.product_img);
  const name = formatLang(product, 'product_name', currentLang);
  const comment = formatLang(product, 'product_comment');
  const sale = product?.product_sale_price || product?.product_price || 0;
  const orig = product?.product_price || 0;
  const hasSale = orig > sale && sale > 0;
  const disc = hasSale ? Math.round((orig - sale) * 100 / orig) : 0;
  const goTo = () => router?.push?.(`/shop/item/${product?.id}`);

  return (
    <Wrapper>
      {/* 사진이 먼저다 — PC 는 왼쪽 칸, 모바일은 위 칸.
          DOM 순서가 곧 화면 순서라 CSS order 로 뒤집지 않는다. */}
      <Hero>
        <HeroMedia>
          <HeroImage src={img} effect="blur" onClick={goTo} style={{ cursor: 'pointer' }} />
        </HeroMedia>
        <HeroInfo>
          <HeroTop>
            <span>{brandName}</span>
            <span>{홈문구(t, 'edition', currentLang) || '№ 001'}</span>
          </HeroTop>
          <HeroBody>
            <HeroTitle>{name}</HeroTitle>
            <HeroMeta>
              <div>
                <MetaLabel>{translate('종류')}</MetaLabel>
                <MetaValue>{홈문구(t, 'type_value', currentLang) || 'Signature'}</MetaValue>
              </div>
              <div>
                <MetaLabel>{translate('연도')}</MetaLabel>
                <MetaValue>{new Date().getFullYear()}</MetaValue>
              </div>
            </HeroMeta>
            <HeroCta>
              <CTABtn onClick={goTo}>{translate('구매하기')} →</CTABtn>
            </HeroCta>
          </HeroBody>
        </HeroInfo>
      </Hero>

      <BigNumSection>
        <BigNumGrid>
          <BigNumCell>
            <BigNum>01</BigNum>
            <BigNumLabel>{홈문구(t, 'bignum1_label', currentLang) || 'Premium'}</BigNumLabel>
          </BigNumCell>
          <BigNumCell>
            <BigNum>02</BigNum>
            <BigNumLabel>{홈문구(t, 'bignum2_label', currentLang) || 'Crafted'}</BigNumLabel>
          </BigNumCell>
          <BigNumCell>
            <BigNum>03</BigNum>
            <BigNumLabel>{홈문구(t, 'bignum3_label', currentLang) || 'Timeless'}</BigNumLabel>
          </BigNumCell>
          <BigNumCell>
            <BigNum>04</BigNum>
            <BigNumLabel>{홈문구(t, 'bignum4_label', currentLang) || 'Unique'}</BigNumLabel>
          </BigNumCell>
        </BigNumGrid>
      </BigNumSection>

      <Manifesto>
        <ManifestoText>
          {/* 짧은 장식 라벨(№ 001·Signature·Premium…)은 디자인의 일부라 영어로 둔다.
              이건 문장이라 다르다 — 영어 화면에만 맞고 한국어 화면에는 안 맞는다. */}
          "{comment || translate('하나의 제품. 끝없는 품질. 온 정성을 담아 만듭니다.')}"
        </ManifestoText>
      </Manifesto>

      <InfoSection>
        <InfoLeft>
          <InfoHeading>{translate('상품')}</InfoHeading>
          <InfoBody>
            {comment || translate('{{brand}} 시그니처 제품입니다. 단 하나의 제품에 모든 정성을 담아 완성했습니다.', { brand: brandName })}
          </InfoBody>
        </InfoLeft>
        <InfoRight>
          <InfoHeading>{translate('브랜드')}</InfoHeading>
          <InfoBody>
            {홈문구(t, 'brand_intro', currentLang) || translate('{{brand}}은(는) 단 하나의 제품에 집중하는 브랜드입니다. 여러 가지를 만들기보다 진심으로 자신 있는 하나에 몰입합니다.', { brand: brandName })}
          </InfoBody>
        </InfoRight>
      </InfoSection>

      {featuredProducts.length > 0 && (
        <FeaturedSection>
          <InfoHeading>{translate('더보기')}</InfoHeading>
          <FeaturedGrid>
            {featuredProducts.map((item) => {
              const c = getFeaturedCardData(item, currentLang);
              return (
                <FeaturedCell key={c.id} onClick={() => router?.push?.(`/shop/item/${c.id}`)}>
                  <FeaturedImageBox>
                    <FeaturedImage src={c.img} effect="blur" alt={c.name} />
                  </FeaturedImageBox>
                  <FeaturedInfo>
                    <FeaturedName>{c.name}</FeaturedName>
                    {c.hasSale && (
                      <div style={{ fontSize: '12px', textDecoration: 'line-through', opacity: 0.4, marginBottom: '0.35rem' }}>
                        {commarNumberWithUnit(c.orig)} · {c.disc}% OFF
                      </div>
                    )}
                    <FeaturedPrice>{commarNumberWithUnit(c.sale)}</FeaturedPrice>
                  </FeaturedInfo>
                </FeaturedCell>
              );
            })}
          </FeaturedGrid>
        </FeaturedSection>
      )}

      <PriceSection>
        <PriceLabel>{translate('가격')}</PriceLabel>
        {hasSale && (
          <div style={{ fontSize: '18px', textDecoration: 'line-through', opacity: 0.4, marginBottom: '0.5rem' }}>
            {commarNumberWithUnit(orig)} · {disc}% OFF
          </div>
        )}
        <PriceValue>{commarNumberWithUnit(sale)}</PriceValue>
        <CTABtn onClick={goTo}>{translate('주문하기')} →</CTABtn>
      </PriceSection>
    </Wrapper>
  );
};

export default Demo4;
