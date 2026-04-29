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

/* 상품 상세 - 데모 8: 브루탈리스트 */

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
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  border-bottom: 4px solid ${BLACK};
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const Cell = styled.div`
  border-right: 4px solid ${BLACK};
  border-bottom: 4px solid ${BLACK};
  padding: 2rem;
`
const ImageCell = styled(Cell)`
  grid-row: span 2;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  @media (max-width: 840px) {
    grid-row: span 1;
  }
`
const NameCell = styled(Cell)`
  background: ${NEON};
`
const PriceCell = styled(Cell)`
  background: ${BLACK};
  color: ${WHITE};
  border-right: none;
`
const MonoLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.6;
  letter-spacing: 2px;
  margin-bottom: 1rem;
`
const HugeImage = styled(LazyLoadImage)`
  width: 420px;
  height: 420px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 300px;
    height: 300px;
  }
`
const NameHuge = styled.div`
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 0.95;
  text-transform: uppercase;
  word-break: keep-all;
  @media (max-width: 840px) {
    font-size: 32px;
  }
`
const DescMono = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
  margin-top: 1.5rem;
  max-width: 400px;
`
const PriceHuge = styled.div`
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 0.9;
  @media (max-width: 840px) {
    font-size: 44px;
  }
`
const OrigPrice = styled.div`
  font-size: 13px;
  text-decoration: line-through;
  opacity: 0.5;
  margin-top: 0.5rem;
`
const ButtonGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr 2fr;
  border-bottom: 4px solid ${BLACK};
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const BtnCell = styled.button`
  padding: 32px 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 6px;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  border-right: 4px solid ${BLACK};
  &:last-child {
    border-right: none;
  }
  background: ${p => p.$primary ? BLACK : WHITE};
  color: ${p => p.$primary ? NEON : BLACK};
  &:hover {
    background: ${p => p.$primary ? NEON : BLACK};
    color: ${p => p.$primary ? BLACK : NEON};
  }
  @media (max-width: 840px) {
    border-right: none;
    border-bottom: 4px solid ${BLACK};
    &:last-child {
      border-bottom: none;
    }
  }
`
const DetailSection = styled.section`
  padding: 5rem 2rem;
  border-bottom: 4px solid ${BLACK};
  @media (max-width: 840px) {
    padding: 3rem 1.25rem;
  }
`
const DetailTitle = styled.h2`
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -3px;
  text-transform: uppercase;
  margin: 0 0 2rem 0;
  @media (max-width: 840px) {
    font-size: 36px;
  }
`
const DetailContent = styled.div`
  max-width: 800px;
  font-size: 14px;
  line-height: 1.9;
  img { max-width: 100%; height: auto; }
`

const Demo8 = () => {
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
      toast.error('로그인을 해주세요.');
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
  const disc = hasSale ? Math.round((orig - sale) * 100 / orig) : 0;

  return (
    <Wrapper>
      <Hero>
        <ImageCell>
          <HugeImage src={img} effect="blur" />
        </ImageCell>
        <NameCell>
          <MonoLabel>Product / 01</MonoLabel>
          <NameHuge>{name}</NameHuge>
          {comment && <DescMono>// {comment}</DescMono>}
        </NameCell>
        <PriceCell>
          <MonoLabel>Price / KRW</MonoLabel>
          <PriceHuge>{commarNumber(sale)}원</PriceHuge>
          {hasSale && <OrigPrice>{commarNumber(orig)}원 · -{disc}%</OrigPrice>}
        </PriceCell>
      </Hero>

      <ButtonGrid>
        <BtnCell onClick={handleAddCart}>Cart</BtnCell>
        <BtnCell $primary onClick={handleAddCart}>Buy Now →</BtnCell>
      </ButtonGrid>

      {item?.product_description && (
        <DetailSection>
          <DetailTitle>Details.</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: item.product_description }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo8;
