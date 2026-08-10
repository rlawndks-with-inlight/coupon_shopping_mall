import { memo, useState, useEffect, useCallback } from "react";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting";
import styled from "styled-components";
import { useTheme } from "@mui/material/styles";
import { PointerText, themeObj } from "../styled-components";
import { IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { commarNumber, getPriceUnitByLang, setProductPriceByLang } from "src/utils/function";
import { insertWishDataUtil } from "src/utils/shop-util";
import toast from "react-hot-toast";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useLocales } from "src/locales";
import { formatLang } from "src/utils/format";
import { ProductStatusBadge } from './ProductStatusBadge';
import { Seller1 } from './demo-1';

/**
 * demo-3 상품카드 : "에디토리얼 룩북"
 * - 각진(라운드 없음) 플랫한 프레임 + 사진이 프레임을 꽉 채우고(object-fit:cover) hover 시 사진만 확대
 * - 이미지 우상단 흰 원형 버튼 안에 위시 하트 (사진 위에서도 잘 보이도록)
 * - 상품명 위에 대문자 자간 eyebrow(product_comment), 가격은 1px 헤어라인 아래
 * - 할인율은 Item1/Item2 의 빨강이 아니라 테마 primary 색상 태그로 표기
 * 기능(데이터/라우팅/위시/가격/다국어)은 demo-1 의 Item1 과 완전히 동일하다.
 */
const ItemContainer = styled.div`
width:100%;
display:flex;
cursor:pointer;
transition: 0.4s;
position: relative;
&:hover img{
  transform: scale(1.06);
}
`
const ItemImgFrame = styled.div`
width: 100%;
height: 320px;
position: relative;
overflow: hidden;
background:${themeObj.grey[100]};
@media screen and (max-width:1700px){
  height:18vw;
}
@media screen and (max-width:1150px){
  height:30vw;
}
@media screen and (max-width:850px){
  height:44vw;
}
`
const ItemImg = styled(LazyLoadImage)`
width: 100%;
height: 100%;
object-fit: cover;
transition: transform 0.6s ease;
`
const HeartButton = styled(IconButton)`
position: absolute !important;
right: 8px;
top: 8px;
z-index: 4;
background: rgba(255,255,255,0.85) !important;
&:hover{
  background: #fff !important;
}
`
const ItemTextContainer = styled.div`
display:flex;
flex-direction: column;
flex: 1;
min-width: 0;
padding-top: 0.9rem;
`
const ItemEyebrow = styled.div`
font-size:${themeObj.font_size.size9};
text-transform: uppercase;
letter-spacing: 0.08em;
font-weight: bold;
color:${themeObj.grey[500]};
word-break: break-all;
`
const ItemName = styled.div`
margin-top:0.35rem;
font-weight: bold;
font-size:${themeObj.font_size.size7};
letter-spacing: 0.01em;
line-height: 1.35;
word-break: break-all;
`
const PriceRow = styled.div`
margin-top:0.75rem;
padding-top:0.6rem;
border-top:1px solid ${themeObj.grey[300]};
display:flex;
align-items: baseline;
flex-wrap:wrap;
column-gap: 0.4rem;
`
const SaleTag = styled.div`
font-size:${themeObj.font_size.size9};
font-weight: bold;
letter-spacing: 0.04em;
text-transform: uppercase;
color:${props => props.theme?.palette?.primary?.main ?? themeObj.grey[800]};
`
const SalePrice = styled.div`
font-size:${themeObj.font_size.size6};
font-weight: bold;
`
const OriginPrice = styled.div`
text-decoration: line-through;
font-size:${themeObj.font_size.size8};
color:${themeObj.grey[500]};
`

export const Item3 = memo((props) => {

    const theme = useTheme();
    const { currentLang, translate } = useLocales();
    const { user } = useAuthContext();
    const { themeWishData, onChangeWishData, themeDnsData } = useSettingsContext();
    const { item, router, theme_css, seller } = props;
    const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);
    useEffect(() => {
        if (theme_css) {
            setItemThemeCss(theme_css)
        }
    }, [theme_css])
    const onClickHeart = useCallback(() => {
        if (user) {
            insertWishDataUtil(item, themeWishData, onChangeWishData);
        } else {
            toast.error(<PointerText onClick={() => router.push('/shop/auth/login')}>{translate('로그인을 해주세요.')}</PointerText>);
        }
    }, [user, item, themeWishData, onChangeWishData, router, translate])
    const goDetail = () => {
        if (item?.id) {
            router.push(`/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`)
        }
    }
    const is_wished = themeWishData.map(itm => { return itm?.product_id }).includes(item?.id);
    const is_sale = item.product_sale_price < item.product_price;
    return (
        <>
            <ItemContainer style={{
                padding: `${itemThemeCss?.container?.padding}%`,
                columnGap: `0.75rem`,
                rowGap: `0.75rem`,
                flexDirection: `${itemThemeCss?.container.is_vertical == 0 ? 'column' : 'row'}`,
                border: `${itemThemeCss?.container.border_width}px solid ${itemThemeCss?.container.border_color}`,
                borderRadius: `${itemThemeCss?.container.border_radius}px`,
                boxShadow: `${itemThemeCss?.shadow.x}px ${itemThemeCss?.shadow.y * (-1)}px ${itemThemeCss?.shadow.width}px ${itemThemeCss?.shadow.color}${itemThemeCss?.shadow.darkness > 9 ? '' : '0'}${itemThemeCss?.shadow.darkness}`
            }}
            >
                <ItemImgFrame style={{
                    width: `${itemThemeCss?.container.is_vertical == 0 ? '100%' : '45%'}`
                }}>
                    <ProductStatusBadge status={item?.status} />
                    <ItemImg src={item?.product_img} onClick={goDetail} />
                    <HeartButton onClick={onClickHeart}>
                        <Icon icon={is_wished ? 'mdi:heart' : 'mdi:heart-outline'} fontSize={'1.6rem'} style={{
                            color: `${is_wished ? 'red' : themeObj.grey[700]}`
                        }} />
                    </HeartButton>
                </ItemImgFrame>
                <ItemTextContainer onClick={goDetail}>
                    <ItemEyebrow>{formatLang(item, 'product_comment', currentLang)}</ItemEyebrow>
                    <ItemName>{formatLang(item, 'product_name', currentLang)}</ItemName>
                    <PriceRow style={{
                        marginTop: 'auto'
                    }}>
                        {
                            themeDnsData?.id == 95 && item?.product_sale_price > 99999 ?
                                <>
                                    <div>{translate('별도 문의 필요')}</div>
                                </>
                                :
                                <>
                                    {is_sale &&
                                        <>
                                            <SaleTag theme={theme}>
                                                {commarNumber((item.product_price - item.product_sale_price) * 100 / item.product_price) + '% OFF'}
                                            </SaleTag>
                                        </>}
                                    <SalePrice>
                                        {commarNumber(setProductPriceByLang(item, 'product_sale_price', item?.price_lang, currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}
                                    </SalePrice>
                                    {is_sale &&
                                        <>
                                            <OriginPrice>
                                                {commarNumber(setProductPriceByLang(item, 'product_price', item?.price_lang, currentLang?.value))}
                                            </OriginPrice>
                                        </>}
                                </>
                        }
                    </PriceRow>
                </ItemTextContainer>
            </ItemContainer>
        </>
    )
}, (prevProps, nextProps) => {
    // item의 id가 같으면 리렌더링 방지
    return prevProps.item?.id === nextProps.item?.id &&
        prevProps.theme_css === nextProps.theme_css &&
        prevProps.seller?.id === nextProps.seller?.id;
});

export const Seller3 = (props) => {//셀러카드 - demo-2 와 동일하게 Seller1 위임
    return (
        <>
            <Seller1 {...props} />
        </>
    )
}
