import { memo, useState, useEffect, useCallback } from "react";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting";
import styled from "styled-components";
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

// demo-8 (asapmall) "에디토리얼 슬레이트" — flat, sharp-cornered, monochrome slate
// on periwinkle-tinted image plates. Functional parity with Item1 (demo-1.js);
// only styling / JSX layout differs.
const SLATE = '#515B66';

const ItemName = styled.div`
font-weight: 700;
font-size:${themeObj.font_size.size6};
color:${SLATE};
letter-spacing:-0.3px;
word-break: break-all;
`
const ItemSubName = styled.div`
margin-top:0.25rem;
color:${themeObj.grey[500]};
font-size:${themeObj.font_size.size8};
word-break: break-all;
`
const ItemPrice = styled.div`
margin-top:0.5rem;
font-size:${themeObj.font_size.size6};
color:${SLATE};
font-weight:700;
display:flex;
align-items:center;
flex-wrap:wrap;
`
// sharp, filled slate discount tag (replaces demo-1's red %) to hold the monochrome palette
const DiscountTag = styled.div`
background:${SLATE};
color:#fff;
font-size:${themeObj.font_size.size9};
font-weight:700;
letter-spacing:-0.3px;
border-radius:0;
padding:2px 6px;
margin-right:0.4rem;
line-height:1.4;
`
const ItemContainer = styled.div`
width:100%;
display:flex;
cursor:pointer;
transition: 0.5s;
position: relative;
&:hover{
  transform: translateY(-8px);
}
`
// editorial square-edged image plate: periwinkle wash (#CED9EA @ ~45%) over neutral grey200
const ItemImgContainer = styled.div`
width: 100%;
height: 300px;
margin: 0 auto;
display: flex;
position: relative;
overflow: hidden;
background: linear-gradient(0deg, rgba(206,217,234,0.45), rgba(206,217,234,0.45)), ${themeObj.grey[200]};
@media screen and (max-width:1700px){
  height:16vw;
}
@media screen and (max-width:1150px){
  height:28vw;
}
@media screen and (max-width:850px){
  height:40vw;
}
`
// thin slate rule beneath the text block — the editorial underline, above the price row
const ItemTextContainer = styled.div`
display:flex;
flex-direction: column;
padding-top:0.6rem;
`
const ItemTextBlock = styled.div`
display:flex;
flex-direction: column;
border-bottom:1px solid ${SLATE};
padding-bottom:0.6rem;
`
const ItemImg = styled(LazyLoadImage)`
object-fit: contain;
margin: auto;
height: 100%;
`
export const Item8 = memo((props) => {

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
    return (
        <>
            <ItemContainer style={{
                padding: `${itemThemeCss?.container?.padding}%`,
                columnGap: `0.5rem`,
                rowGap: `0.5rem`,
                flexDirection: `${itemThemeCss?.container.is_vertical == 0 ? 'column' : 'row'}`,
                border: `${itemThemeCss?.container.border_width}px solid ${itemThemeCss?.container.border_color}`,
                borderRadius: `${itemThemeCss?.container.border_radius}px`,
                boxShadow: `${itemThemeCss?.shadow.x}px ${itemThemeCss?.shadow.y * (-1)}px ${itemThemeCss?.shadow.width}px ${itemThemeCss?.shadow.color}${itemThemeCss?.shadow.darkness > 9 ? '' : '0'}${itemThemeCss?.shadow.darkness}`
            }}
            >
                <ItemImgContainer>
                    <ProductStatusBadge status={item?.status} />
                    <ItemImg src={item?.product_img} onClick={() => {
                        if (item?.id) {
                            router.push(`/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`)
                        }
                    }} />
                    <IconButton sx={{ position: 'absolute', right: '2px', top: '2px' }} onClick={onClickHeart}>
                        <Icon icon={themeWishData.map(itm => { return itm?.product_id }).includes(item?.id) ? 'mdi:heart' : 'mdi:heart-outline'} fontSize={'2rem'} style={{
                            color: `${themeWishData.map(itm => { return itm?.product_id }).includes(item?.id) ? 'red' : ''}`
                        }} />
                    </IconButton>
                </ItemImgContainer>
                <ItemTextContainer
                    onClick={() => {
                        if (item?.id) {
                            router.push(`/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`)
                        }
                    }}>
                    <ItemTextBlock>
                        <ItemName>{formatLang(item, 'product_name', currentLang)}</ItemName>
                        <ItemSubName>{formatLang(item, 'product_comment', currentLang)}</ItemSubName>
                    </ItemTextBlock>
                    <ItemPrice style={{
                        marginTop: 'auto'
                    }}>
                        {
                            themeDnsData?.id == 95 && item?.product_sale_price > 99999 ?
                                <>
                                    <div>별도 문의 필요</div>
                                </>
                                :
                                <>
                                    {item.product_sale_price < item.product_price &&
                                        <>
                                            <DiscountTag>
                                                {commarNumber((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                            </DiscountTag>
                                        </>}
                                    <div>{commarNumber(setProductPriceByLang(item, 'product_sale_price', item?.price_lang, currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}</div>
                                    {item.product_sale_price < item.product_price &&
                                        <>
                                            <div style={{ textDecoration: 'line-through', marginLeft: '0.4rem', fontSize: themeObj.font_size.size8, fontWeight: 400, color: themeObj.grey[500] }}>
                                                {item.product_sale_price < item.product_price ? commarNumber(setProductPriceByLang(item, 'product_price', item?.price_lang, currentLang?.value)) : ''}
                                            </div>
                                        </>}
                                </>
                        }
                    </ItemPrice>
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

// Seller8 mirrors the sibling Seller export shape (Seller1/9), tuned to demo-8 slate type.
const SellerContainer = styled.div`
width:100%;
display:flex;
cursor:pointer;
transition: 0.5s;
position: relative;
flex-direction: column;
&:hover{
  transform: translateY(-8px);
}
`
const ItemText = styled.div`
font-size:${themeObj.font_size.size8};
margin-top:0.5rem;
`
export const Seller8 = (props) => {//셀러카드
    const { item, router } = props;

    return (
        <>
            <SellerContainer onClick={() => {
                router.push(`/shop/seller/${item.id}`)
            }}>
                <ItemImg style={{
                    backgroundImage: `url(${item?.profile_img})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    width: '100%'
                }} />
                <ItemText style={{ fontWeight: 'bold', letterSpacing: '-0.3px', color: SLATE }}>{item?.nickname}</ItemText>
                <ItemText style={{ color: themeObj.grey[500] }}>{item?.seller_name}</ItemText>
            </SellerContainer>
        </>
    )
}
