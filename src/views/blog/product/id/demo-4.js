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
import { insertCartDataUtil, startBuyNow, selectItemOptionUtil } from 'src/utils/shop-util';
import toast from 'react-hot-toast';

/* 상품 상세 - 데모 4: 미니멀 모노크롬 */

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: #fff;
  color: #000;
`
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 90vh;
  border-bottom: 1px solid #000;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`
const ImageSide = styled.div`
  background: #f5f5f5;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #000;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
    border-right: none;
    border-bottom: 1px solid #000;
  }
`
const HeroImage = styled(LazyLoadImage)`
  width: 480px;
  height: 480px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 300px;
    height: 300px;
  }
`
const InfoSide = styled.div`
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
`
const ProductName = styled.h1`
  font-size: 56px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  margin: 0;
  text-transform: uppercase;
  @media (max-width: 840px) {
    font-size: 36px;
  }
`
const Description = styled.div`
  font-size: 14px;
  line-height: 1.8;
  opacity: 0.8;
`
const PriceBlock = styled.div`
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  padding: 2rem 0;
`
const PriceLabel = styled.div`
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 0.5rem;
`
const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
`
const OrigPrice = styled.span`
  font-size: 16px;
  text-decoration: line-through;
  opacity: 0.4;
`
const SalePrice = styled.span`
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -2px;
  @media (max-width: 840px) {
    font-size: 32px;
  }
`
const Discount = styled.span`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
`
const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`
const Btn = styled.button`
  padding: 22px 0;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid #000;
  background: ${p => p.$primary ? '#000' : '#fff'};
  color: ${p => p.$primary ? '#fff' : '#000'};
  &:hover {
    background: ${p => p.$primary ? '#fff' : '#000'};
    color: ${p => p.$primary ? '#000' : '#fff'};
  }
`
const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`
const OptionField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`
const OptionLabel = styled.label`
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  opacity: 0.5;
`
const OptionSelect = styled.select`
  width: 100%;
  padding: 16px;
  border: 1px solid #000;
  background: #fff;
  color: #000;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='black' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  &:focus { outline: none; }
  option { text-transform: none; letter-spacing: normal; font-weight: 400; }
`
const DetailSection = styled.section`
  padding: 5rem 3rem;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const DetailTitle = styled.h2`
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -1px;
  text-transform: uppercase;
  margin: 0 0 2rem 0;
`
const DetailContent = styled.div`
  max-width: 720px;
  font-size: 14px;
  line-height: 1.9;
  img { max-width: 100%; height: auto; }
`

const Demo4 = () => {
  const router = useRouter();
  const { currentLang, translate } = useLocales();
  const { themeDnsData, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();
  const [item, setItem] = useState(null);
  const [selectProductGroups, setSelectProductGroups] = useState({ count: 1, groups: [] });
  const brandName = themeDnsData?.name || 'BRAND';

  useEffect(() => {
    if (router.query?.id) loadProduct();
  }, [router.query?.id]);

  const loadProduct = async () => {
    const product = await apiShop('product', 'get', { id: router.query?.id });
    if (product) setItem(product);
  };

  const handleAddCart = async () => {
    // 비회원도 담기 허용(카트→주문서에서 비회원 주문비밀번호로 진행)
    const result = await insertCartDataUtil(
      { ...item, seller_id: router.query?.seller_id ?? 0 },
      selectProductGroups, themeCartData, onChangeCartData
    );
    if (result) {
      toast.success(translate ? translate('장바구니에 성공적으로 추가되었습니다.') : '장바구니에 추가되었습니다.');
    }
  };

  const onSelectOption = (group, option) => {
    setSelectProductGroups(selectItemOptionUtil(group, option, selectProductGroups));
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
        <ImageSide>
          <HeroImage src={img} effect="blur" />
        </ImageSide>
        <InfoSide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <TopRow>
              <span>{brandName}</span>
              <span>№ 001</span>
            </TopRow>
            <ProductName>{name}</ProductName>
            {comment && <Description>{comment}</Description>}
            <PriceBlock>
              <PriceLabel>Price</PriceLabel>
              <PriceRow>
                {hasSale && <OrigPrice>{commarNumber(orig)}원</OrigPrice>}
                <SalePrice>{commarNumber(sale)}원</SalePrice>
                {hasSale && <Discount>{disc}% OFF</Discount>}
              </PriceRow>
            </PriceBlock>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {item?.groups?.length > 0 && (
              <OptionGroup>
                {item.groups.map((group, gIdx) => (
                  <OptionField key={group?.id ?? group?.group_name ?? gIdx}>
                    <OptionLabel>{group?.group_name}</OptionLabel>
                    <OptionSelect
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value === '') return;
                        const option = group?.options?.[Number(e.target.value)];
                        if (option) onSelectOption(group, option);
                      }}
                    >
                      <option value="" disabled>Select</option>
                      {group?.options?.map((option, oIdx) => (
                        <option key={option?.id ?? option?.option_name ?? oIdx} value={oIdx}>
                          {option?.option_name}{option?.option_price > 0 ? ` (+${commarNumber(option.option_price)}원)` : ''}
                        </option>
                      ))}
                    </OptionSelect>
                  </OptionField>
                ))}
              </OptionGroup>
            )}
            <ButtonRow>
              <Btn onClick={handleAddCart}>Add to Cart</Btn>
              <Btn $primary onClick={() => startBuyNow(item, selectProductGroups, router)}>Buy Now →</Btn>
            </ButtonRow>
          </div>
        </InfoSide>
      </Hero>
      {item?.product_description && (
        <DetailSection>
          <DetailTitle>The Details</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: item.product_description }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo4;
