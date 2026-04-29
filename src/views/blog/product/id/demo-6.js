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
import { themeObj } from 'src/components/elements/styled-components';
import toast from 'react-hot-toast';

/* 상품 상세 - 데모 6: 소프트 에디토리얼 */

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: #fafaf7;
  min-height: 100vh;
`
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
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
  background: linear-gradient(135deg, ${p => p.$color}08 0%, ${p => p.$color}20 100%);
  position: relative;
  overflow: hidden;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
    aspect-ratio: 4/5;
  }
`
const ImageCircle = styled.div`
  position: absolute;
  width: 85%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background: radial-gradient(circle, ${p => p.$color}15 0%, transparent 70%);
`
const HeroImage = styled(LazyLoadImage)`
  max-width: 480px;
  max-height: 520px;
  object-fit: contain;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.15));
  @media (max-width: 840px) {
    max-width: 280px;
    max-height: 340px;
  }
`
const InfoSide = styled.div`
  padding: 5rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const BrandLabel = styled.div`
  font-size: 12px;
  letter-spacing: 5px;
  font-weight: 700;
  color: ${p => p.$color};
  text-transform: uppercase;
`
const ProductName = styled.h1`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 52px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1.1;
  margin: 0;
  color: #1a1a1a;
  @media (max-width: 840px) {
    font-size: 34px;
  }
`
const Description = styled.div`
  font-size: 16px;
  color: ${themeObj.grey[600]};
  line-height: 1.8;
  font-style: italic;
`
const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`
const SalePrice = styled.span`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 40px;
  font-weight: 700;
  color: ${p => p.$color};
`
const OrigPrice = styled.span`
  font-size: 15px;
  text-decoration: line-through;
  color: ${themeObj.grey[400]};
`
const Discount = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #e74c3c;
  letter-spacing: 2px;
`
const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  @media (max-width: 480px) {
    flex-direction: column;
  }
`
const Btn = styled.button`
  flex: 1;
  padding: 18px 40px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid #1a1a1a;
  background: ${p => p.$primary ? '#1a1a1a' : 'transparent'};
  color: ${p => p.$primary ? '#fff' : '#1a1a1a'};
  transition: all 0.3s;
  &:hover {
    background: ${p => p.$primary ? 'transparent' : '#1a1a1a'};
    color: ${p => p.$primary ? '#1a1a1a' : '#fff'};
  }
`
const DetailSection = styled.section`
  padding: 6rem 2rem;
  background: #fff;
  @media (max-width: 840px) {
    padding: 4rem 1.5rem;
  }
`
const DetailTitle = styled.h2`
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
const DetailContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 2;
  color: ${themeObj.grey[700]};
  img { max-width: 100%; height: auto; }
`

const Demo6 = () => {
  const router = useRouter();
  const { currentLang, translate } = useLocales();
  const { themeDnsData, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();
  const [item, setItem] = useState(null);
  const brandName = themeDnsData?.name || 'BRAND';
  const mainColor = themeDnsData?.theme_css?.main_color || '#8B7355';

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
    if (result) {
      toast.success(translate ? translate('장바구니에 성공적으로 추가되었습니다.') : '장바구니에 추가되었습니다.');
    }
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
        <ImageSide $color={mainColor}>
          <ImageCircle $color={mainColor} />
          <HeroImage src={img} effect="blur" />
        </ImageSide>
        <InfoSide>
          <BrandLabel $color={mainColor}>{brandName} · Signature</BrandLabel>
          <ProductName>{name}</ProductName>
          {comment && <Description>"{comment}"</Description>}
          <PriceRow>
            {hasSale && <Discount>{disc}% OFF</Discount>}
            <SalePrice $color={mainColor}>{commarNumber(sale)}원</SalePrice>
            {hasSale && <OrigPrice>{commarNumber(orig)}원</OrigPrice>}
          </PriceRow>
          <ButtonRow>
            <Btn onClick={handleAddCart}>Add to Cart</Btn>
            <Btn $primary onClick={handleAddCart}>Buy Now →</Btn>
          </ButtonRow>
        </InfoSide>
      </Hero>
      {item?.product_description && (
        <DetailSection>
          <DetailTitle>About This Product</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: item.product_description }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo6;
