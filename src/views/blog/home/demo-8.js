import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { commarNumber } from 'src/utils/function'
import { formatLang } from 'src/utils/format'
import { useFeaturedProduct, useFeaturedProducts, getFeaturedCardData } from 'src/utils/use-featured-product'
import { useLocales } from 'src/locales'

/* ══════════════════════════════════════
   블로그 데모-8: 브루탈리스트
   거친 그리드 + 하드엣지 + 과감한 대비 + 아방가르드
   ══════════════════════════════════════ */

const NEON = '#dbff1c';
const BLACK = '#000';
const WHITE = '#fff';

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: ${WHITE};
  color: ${BLACK};
  min-height: 100vh;
`
/* Hero - 거친 그리드 */
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  min-height: 100vh;
  border-bottom: 4px solid ${BLACK};
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
`
const Cell = styled.div`
  border-right: 4px solid ${BLACK};
  border-bottom: 4px solid ${BLACK};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  &:last-child {
    border-right: none;
  }
  @media (max-width: 840px) {
    border-right: none;
  }
`
const BrandCell = styled(Cell)`
  background: ${NEON};
  justify-content: space-between;
`
const ImageCell = styled(Cell)`
  grid-row: span 2;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${WHITE};
  @media (max-width: 840px) {
    grid-row: span 1;
  }
`
const PriceCell = styled(Cell)`
  background: ${BLACK};
  color: ${WHITE};
  justify-content: space-between;
`
const NameCell = styled(Cell)`
  background: ${WHITE};
`
const CTACell = styled(Cell)`
  background: ${BLACK};
  color: ${WHITE};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  &:hover {
    background: ${NEON};
    color: ${BLACK};
  }
`

const MonoLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.5;
`
const BrandMark = styled.div`
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1;
  text-transform: uppercase;
  word-break: break-all;
`
const HugeImage = styled(LazyLoadImage)`
  width: 420px;
  height: 420px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 280px;
    height: 280px;
  }
`
const PriceLabelText = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0.5;
  letter-spacing: 2px;
`
const PriceHuge = styled.div`
  font-size: 56px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 0.9;
  @media (max-width: 840px) {
    font-size: 40px;
  }
`
const PriceOrig = styled.div`
  font-size: 13px;
  text-decoration: line-through;
  opacity: 0.5;
  margin-top: 0.5rem;
`
const NameHuge = styled.div`
  font-size: 38px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1;
  text-transform: uppercase;
  @media (max-width: 840px) {
    font-size: 26px;
  }
`
const CTAText = styled.div`
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 6px;
  text-transform: uppercase;
`

/* Manifesto - 대형 텍스트 */
const Manifesto = styled.section`
  padding: 6rem 2rem;
  border-bottom: 4px solid ${BLACK};
  @media (max-width: 840px) {
    padding: 3rem 1.25rem;
  }
`
const ManifestoBig = styled.div`
  font-size: 120px;
  font-weight: 900;
  letter-spacing: -6px;
  line-height: 1.05;
  text-transform: uppercase;
  word-break: break-word;
  @media (max-width: 840px) {
    font-size: 56px;
    letter-spacing: -2px;
  }
`
const ManifestoAccent = styled.span`
  background: ${NEON};
  padding: 0 0.5rem;
`

/* Facts - 강조된 숫자 */
const Facts = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 4px solid ${BLACK};
  @media (max-width: 840px) {
    grid-template-columns: repeat(2, 1fr);
  }
`
const FactCell = styled.div`
  padding: 3rem 2rem;
  border-right: 4px solid ${BLACK};
  &:last-child {
    border-right: none;
  }
  &:nth-child(odd) {
    background: ${WHITE};
  }
  &:nth-child(even) {
    background: ${BLACK};
    color: ${WHITE};
  }
  @media (max-width: 840px) {
    &:nth-child(even) {
      border-right: 4px solid ${BLACK};
    }
    &:nth-child(2n) {
      border-right: none;
    }
    border-bottom: 4px solid ${BLACK};
  }
`
const FactNum = styled.div`
  font-size: 64px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -3px;
  margin-bottom: 0.5rem;
`
const FactLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.7;
`

/* Final */
const FinalCTA = styled.section`
  background: ${NEON};
  padding: 8rem 2rem;
  text-align: center;
  cursor: pointer;
  border-bottom: 4px solid ${BLACK};
  &:hover {
    background: ${BLACK};
    color: ${NEON};
  }
`
const FinalHuge = styled.div`
  font-size: 120px;
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 0.9;
  text-transform: uppercase;
  @media (max-width: 840px) {
    font-size: 48px;
    letter-spacing: -2px;
  }
`
const FinalSmall = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 4px;
  margin-top: 1.5rem;
  text-transform: uppercase;
`

/* 대표 상품 - 브루탈리스트 그리드 (Facts 격자 미러) */
const Featured = styled.section`
  border-bottom: 4px solid ${BLACK};
`
const FeaturedHead = styled.div`
  padding: 5rem 2rem 3rem;
  @media (max-width: 840px) {
    padding: 3rem 1.25rem 2rem;
  }
`
const FeaturedTitle = styled.div`
  font-size: 88px;
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 1;
  text-transform: uppercase;
  @media (max-width: 840px) {
    font-size: 48px;
    letter-spacing: -2px;
  }
`
const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 4px solid ${BLACK};
  @media (max-width: 840px) {
    grid-template-columns: repeat(2, 1fr);
  }
`
const ProductCell = styled.div`
  padding: 2rem;
  border-right: 4px solid ${BLACK};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  &:last-child {
    border-right: none;
  }
  &:nth-child(odd) {
    background: ${WHITE};
  }
  &:nth-child(even) {
    background: ${BLACK};
    color: ${WHITE};
  }
  &:hover {
    background: ${NEON};
    color: ${BLACK};
  }
  @media (max-width: 840px) {
    &:nth-child(even) {
      border-right: 4px solid ${BLACK};
    }
    &:nth-child(2n) {
      border-right: none;
    }
    border-bottom: 4px solid ${BLACK};
  }
`
const CardImage = styled(LazyLoadImage)`
  width: 100%;
  height: 200px;
  object-fit: contain;
  margin-bottom: 1.5rem;
`
const CardName = styled.div`
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1;
  text-transform: uppercase;
  margin-top: 1rem;
`
const CardPrice = styled.div`
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 0.9;
  margin-top: 0.75rem;
`

const Demo8 = (props) => {
  const { currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { func } = props;
  const router = func?.router;
  const brandName = themeDnsData?.name || 'BRAND';
  const t = themeDnsData?.setting_obj?.home_texts?.demo8 ?? {}; // 가맹점 편집 문구(미입력 시 기본값)
  const product = useFeaturedProduct();
  const featuredProducts = useFeaturedProducts({ excludeId: product?.id });

  if (!product) {
    return (
      <Wrapper>
        <Manifesto>
          <ManifestoBig>Coming <ManifestoAccent>soon</ManifestoAccent></ManifestoBig>
        </Manifesto>
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
  const goTo = () => router?.push?.(`/shop/item/${product?.id}`);

  return (
    <Wrapper>
      <Hero>
        <BrandCell>
          <MonoLabel>Brand / 01</MonoLabel>
          <BrandMark>{brandName}</BrandMark>
        </BrandCell>
        <ImageCell>
          <HugeImage src={img} effect="blur" onClick={goTo} style={{ cursor: 'pointer' }} />
        </ImageCell>
        <PriceCell>
          <PriceLabelText>Price</PriceLabelText>
          <div>
            {hasSale && <PriceOrig>{commarNumber(orig)}원 · -{disc}%</PriceOrig>}
            <PriceHuge>{commarNumber(sale)}원</PriceHuge>
          </div>
        </PriceCell>
        <NameCell>
          <MonoLabel>Product / 01</MonoLabel>
          <NameHuge style={{ marginTop: '1rem' }}>{name}</NameHuge>
        </NameCell>
        <CTACell onClick={goTo}>
          <CTAText>Buy →</CTAText>
        </CTACell>
      </Hero>

      <Manifesto>
        {t.manifesto ? (
          <ManifestoBig>{t.manifesto}</ManifestoBig>
        ) : (
          <ManifestoBig>
            One <ManifestoAccent>product</ManifestoAccent>.<br />
            Zero <ManifestoAccent>compromise</ManifestoAccent>.
          </ManifestoBig>
        )}
      </Manifesto>

      <Facts>
        <FactCell>
          <FactNum>{t.fact1_num || '01'}</FactNum>
          <FactLabel>{t.fact1_label || 'Single SKU'}</FactLabel>
        </FactCell>
        <FactCell>
          <FactNum>{t.fact2_num || '100'}</FactNum>
          <FactLabel>{t.fact2_label || '% quality'}</FactLabel>
        </FactCell>
        <FactCell>
          <FactNum>{t.fact3_num || '∞'}</FactNum>
          <FactLabel>{t.fact3_label || 'Dedication'}</FactLabel>
        </FactCell>
        <FactCell>
          <FactNum>{t.fact4_num || '0'}</FactNum>
          <FactLabel>{t.fact4_label || 'Filler'}</FactLabel>
        </FactCell>
      </Facts>

      {featuredProducts.length > 0 && (
        <Featured>
          <FeaturedHead>
            <MonoLabel>Collection / All</MonoLabel>
            <FeaturedTitle style={{ marginTop: '1rem' }}>
              More <ManifestoAccent>picks</ManifestoAccent>
            </FeaturedTitle>
          </FeaturedHead>
          <FeaturedGrid>
            {featuredProducts.map((item, i) => {
              const c = getFeaturedCardData(item, currentLang);
              return (
                <ProductCell key={c.id} onClick={() => router?.push?.(`/shop/item/${c.id}`)}>
                  <CardImage src={c.img} effect="blur" />
                  <MonoLabel>{`Item / ${String(i + 1).padStart(2, '0')}`}</MonoLabel>
                  <CardName>{c.name}</CardName>
                  {c.hasSale && <PriceOrig>{commarNumber(c.orig)}원 · -{c.disc}%</PriceOrig>}
                  <CardPrice>{commarNumber(c.sale)}원</CardPrice>
                </ProductCell>
              );
            })}
          </FeaturedGrid>
        </Featured>
      )}

      <FinalCTA onClick={goTo}>
        <FinalHuge>{t.cta_title || 'Get it now'}</FinalHuge>
        <FinalSmall>{t.cta_sub || 'tap anywhere to purchase'}</FinalSmall>
      </FinalCTA>
    </Wrapper>
  );
};

export default Demo8;
