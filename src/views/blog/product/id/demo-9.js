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

/* 상품 상세 - 데모 9: 파스텔 드림 */

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
const Hero = styled.section`
  padding: 4rem 2rem;
  background: linear-gradient(180deg, ${BG} 0%, ${PINK}30 100%);
  @media (max-width: 840px) {
    padding: 2rem 1.25rem;
  }
`
const HeroInner = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1100px;
  margin: 0 auto;
  gap: 3rem;
  align-items: center;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`
const ImageWrap = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  background: #fff;
  border-radius: 60% 40% 50% 50% / 50% 50% 40% 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 30px 80px rgba(255, 138, 128, 0.2);
  overflow: hidden;
  max-width: 500px;
  margin: 0 auto;
`
const HeroImage = styled(LazyLoadImage)`
  width: 320px;
  height: 320px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 240px;
    height: 240px;
  }
`
const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`
const StickerRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`
const Sticker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 6px 14px;
  background: ${p => p.$bg || '#fff'};
  color: ${p => p.$color || TEXT};
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
`
const ProductName = styled.h1`
  font-size: 42px;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1.1;
  margin: 0;
  @media (max-width: 840px) {
    font-size: 30px;
  }
`
const Description = styled.div`
  font-size: 15px;
  line-height: 1.7;
  opacity: 0.7;
`
const PriceWrap = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 14px 28px;
  background: #fff;
  border-radius: 50px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  align-self: flex-start;
`
const Price = styled.span`
  font-size: 30px;
  font-weight: 900;
  color: ${CORAL};
`
const OrigPrice = styled.span`
  font-size: 14px;
  text-decoration: line-through;
  opacity: 0.4;
`
const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  @media (max-width: 480px) {
    flex-direction: column;
  }
`
const Btn = styled.button`
  flex: 1;
  padding: 16px 28px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  border: ${p => p.$primary ? 'none' : `2px solid ${CORAL}`};
  background: ${p => p.$primary ? `linear-gradient(135deg, ${CORAL} 0%, #ff6b6b 100%)` : 'transparent'};
  color: ${p => p.$primary ? '#fff' : CORAL};
  transition: all 0.3s;
  box-shadow: ${p => p.$primary ? '0 8px 20px rgba(255, 138, 128, 0.4)' : 'none'};
  &:hover {
    transform: translateY(-2px);
  }
`
const DetailSection = styled.section`
  padding: 5rem 2rem;
  background: #fff;
  @media (max-width: 840px) {
    padding: 3rem 1.25rem;
  }
`
const DetailTitle = styled.h2`
  font-size: 36px;
  font-weight: 900;
  text-align: center;
  letter-spacing: -1px;
  margin: 0 0 3rem 0;
  @media (max-width: 840px) {
    font-size: 26px;
  }
`
const DetailContent = styled.div`
  max-width: 720px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.9;
  img { max-width: 100%; height: auto; border-radius: 16px; }
`

const Demo9 = () => {
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
    if (result) toast.success('장바구니에 추가되었습니다 💕');
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
        <HeroInner>
          <ImageWrap>
            <HeroImage src={img} effect="blur" />
          </ImageWrap>
          <Info>
            <StickerRow>
              <Sticker $bg={CORAL} $color="#fff">✨ NEW</Sticker>
              {hasSale && <Sticker $bg="#fff" $color={CORAL}>🔥 {disc}%</Sticker>}
              <Sticker $bg="#fff" $color={TEXT}>💝 {themeDnsData?.name || 'Brand'}</Sticker>
            </StickerRow>
            <ProductName>{name}</ProductName>
            {comment && <Description>{comment}</Description>}
            <PriceWrap>
              <Price>{commarNumber(sale)}원</Price>
              {hasSale && <OrigPrice>{commarNumber(orig)}원</OrigPrice>}
            </PriceWrap>
            <ButtonRow>
              <Btn onClick={handleAddCart}>🛒 장바구니</Btn>
              <Btn $primary onClick={handleAddCart}>구매하기 💫</Btn>
            </ButtonRow>
          </Info>
        </HeroInner>
      </Hero>
      {item?.product_description && (
        <DetailSection>
          <DetailTitle>💗 Product Story</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: item.product_description }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo9;
