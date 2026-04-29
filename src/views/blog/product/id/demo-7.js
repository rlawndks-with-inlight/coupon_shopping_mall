import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { commarNumber } from 'src/utils/function';
import { formatLang } from 'src/utils/format';
import { apiShop } from 'src/utils/api';
import { insertCartDataUtil } from 'src/utils/shop-util';
import toast from 'react-hot-toast';

/* 상품 상세 - 데모 7: 일본 젠 / 와비사비 */

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
`
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 85vh;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const ImageSide = styled.div`
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-right: 1px solid ${INK}20;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
    border-right: none;
    border-bottom: 1px solid ${INK}20;
  }
`
const InkRing = styled.div`
  position: absolute;
  width: 420px;
  height: 420px;
  border: 2px solid ${INK};
  border-radius: 50%;
  border-left-color: transparent;
  transform: rotate(-45deg);
  @media (max-width: 840px) {
    width: 280px;
    height: 280px;
  }
`
const HeroImage = styled(LazyLoadImage)`
  width: 320px;
  height: 320px;
  object-fit: contain;
  position: relative;
  z-index: 1;
  @media (max-width: 840px) {
    width: 220px;
    height: 220px;
  }
`
const InfoSide = styled.div`
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const Stamp = styled.div`
  align-self: flex-start;
  padding: 6px 20px;
  border: 1.5px solid ${INK};
  font-size: 10px;
  letter-spacing: 4px;
  border-radius: 2px;
`
const BrandLabel = styled.div`
  font-size: 11px;
  letter-spacing: 5px;
  color: ${ACCENT};
  text-transform: uppercase;
`
const ProductName = styled.h1`
  font-family: 'Noto Serif KR', serif;
  font-size: 40px;
  font-weight: 300;
  letter-spacing: 2px;
  line-height: 1.4;
  margin: 0;
  @media (max-width: 840px) {
    font-size: 28px;
  }
`
const Divider = styled.div`
  width: 24px;
  height: 2px;
  background: ${ACCENT};
`
const Description = styled.div`
  font-family: 'Noto Serif KR', serif;
  font-size: 15px;
  line-height: 2;
  font-style: italic;
  opacity: 0.75;
`
const PriceBlock = styled.div`
  border-top: 1px solid ${INK}30;
  padding-top: 1.5rem;
  margin-top: 1rem;
`
const Price = styled.div`
  font-family: 'Noto Serif KR', serif;
  font-size: 32px;
  font-weight: 300;
`
const OrigPrice = styled.span`
  font-size: 14px;
  text-decoration: line-through;
  opacity: 0.4;
  margin-left: 0.75rem;
`
const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`
const Btn = styled.button`
  flex: 1;
  padding: 16px 32px;
  border: 1.5px solid ${INK};
  background: ${p => p.$primary ? INK : 'transparent'};
  color: ${p => p.$primary ? PAPER : INK};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 5px;
  cursor: pointer;
  &:hover {
    background: ${ACCENT};
    color: ${PAPER};
    border-color: ${ACCENT};
  }
`
const DetailSection = styled.section`
  padding: 6rem 2rem;
  background: #ebe5d9;
  @media (max-width: 840px) {
    padding: 4rem 1.25rem;
  }
`
const DetailTitle = styled.h2`
  font-family: 'Noto Serif KR', serif;
  font-size: 34px;
  font-weight: 300;
  letter-spacing: 4px;
  text-align: center;
  margin: 0 0 3rem 0;
`
const DetailContent = styled.div`
  max-width: 720px;
  margin: 0 auto;
  font-family: 'Noto Serif KR', serif;
  font-size: 14px;
  line-height: 2;
  img { max-width: 100%; height: auto; }
`

const Demo7 = () => {
  const router = useRouter();
  const { currentLang, translate } = useLocales();
  const { themeDnsData, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (router.query?.id) loadProduct();
  }, [router.query?.id]);

  const loadProduct = async () => {
    const product = await apiShop('product', 'get', { id: router.query?.id });
    if (product) setItem(product);
  };

  const handleAddCart = async () => {
    if (!user) {
      toast.error(translate ? translate('로그인을 해주세요.') : '로그인을 해주세요.');
      return;
    }
    const result = await insertCartDataUtil(
      { ...item, seller_id: router.query?.seller_id ?? 0 },
      [], themeCartData, onChangeCartData
    );
    if (result) toast.success('장바구니에 추가되었습니다.');
  };

  if (!item) return <Wrapper><DetailSection>Loading...</DetailSection></Wrapper>;

  const img = fixImgUrl(item?.product_img);
  const name = formatLang(item, 'product_name', currentLang);
  const comment = item?.product_comment;
  const sale = item?.product_sale_price || item?.product_price || 0;
  const orig = item?.product_price || 0;
  const hasSale = orig > sale && sale > 0;

  return (
    <Wrapper>
      <Hero>
        <ImageSide>
          <InkRing />
          <HeroImage src={img} effect="blur" />
        </ImageSide>
        <InfoSide>
          <Stamp>無 · 空 · 和</Stamp>
          <BrandLabel>{themeDnsData?.name || 'Brand'}</BrandLabel>
          <ProductName>{name}</ProductName>
          <Divider />
          {comment && <Description>"{comment}"</Description>}
          <PriceBlock>
            <Price>
              {commarNumber(sale)}円
              {hasSale && <OrigPrice>{commarNumber(orig)}円</OrigPrice>}
            </Price>
          </PriceBlock>
          <ButtonRow>
            <Btn onClick={handleAddCart}>장바구니</Btn>
            <Btn $primary onClick={handleAddCart}>求める →</Btn>
          </ButtonRow>
        </InfoSide>
      </Hero>
      {item?.product_description && (
        <DetailSection>
          <DetailTitle>品物の物語</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: item.product_description }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo7;
