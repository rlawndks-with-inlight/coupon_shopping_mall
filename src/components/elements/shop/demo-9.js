import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting";
import styled from "styled-components";
import { PointerText, themeObj } from "../styled-components";
import { useState } from "react";
import { useEffect } from "react";
import { IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { commarNumber, getPriceUnitByLang, setProductPriceByLang } from "src/utils/function";
import { insertWishDataUtil } from "src/utils/shop-util";
import toast from "react-hot-toast";
import Slider from "react-slick";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useLocales } from "src/locales";
import { formatLang } from "src/utils/format";

const ItemName = styled.div`
font-size: 14px;
word-break: break-all;
`
const ItemSubName = styled.div`
margin-top:0.25rem;
color:${themeObj.grey[500]};
font-size:${themeObj.font_size.size8};
word-break: break-all;
`
const ItemPrice = styled.div`
margin-top: auto;
font-size: 14px;
font-weight: bold;
letter-spacing: -0.3px;
display:flex;
align-items:end;
flex-wrap:wrap;
`
const ItemContainer = styled.div`
width:100%;
display:flex;
cursor:pointer;
transition: 0.5s;
position: relative;
max-width: 230px;
margin: 0 auto;
&:hover{
  transform: translateY(-8px);
}
`
const ItemImgContainer = styled.div`
width: 100%;
height: 230px;
margin: 0 auto;
display: flex;
position: relative;
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

const ItemTextContainer = styled.div`
display:flex;
flex-direction: column;
`
const ItemImg = styled(LazyLoadImage)`
object-fit: contain;
border-radius: 10px;
margin: auto;
height: 100%;
`
export const Item9 = (props) => {

    const { currentLang, translate } = useLocales();
    const { user } = useAuthContext();
    const { themeWishData, onChangeWishData } = useSettingsContext();
    const { item, router, theme_css, seller } = props;
    const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);
    useEffect(() => {
        if (theme_css) {
            setItemThemeCss(theme_css)
        }
    }, [theme_css])
    const onClickHeart = () => {
        if (user) {
            insertWishDataUtil(item, themeWishData, onChangeWishData);
        } else {
            toast.error(<PointerText onClick={() => router.push('/shop/auth/login')}>{translate('로그인을 해주세요.')}</PointerText>);
        }
    }
    return (
        <>
            <ItemContainer style={{
                padding: `${itemThemeCss?.container?.padding}%`,
                columnGap: `2rem`,
                rowGap: `0.5rem`,
                flexDirection: `${itemThemeCss?.container.is_vertical == 0 ? 'column' : 'row'}`,
                border: `${itemThemeCss?.container.border_width}px solid ${itemThemeCss?.container.border_color}`,
                borderRadius: `${itemThemeCss?.container.border_radius}px`,
                boxShadow: `${itemThemeCss?.shadow.x}px ${itemThemeCss?.shadow.y * (-1)}px ${itemThemeCss?.shadow.width}px ${itemThemeCss?.shadow.color}${itemThemeCss?.shadow.darkness > 9 ? '' : '0'}${itemThemeCss?.shadow.darkness}`
            }}
            >
                <ItemImgContainer>
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
                    <ItemName>{formatLang(item, 'product_name', currentLang)}</ItemName>
                </ItemTextContainer>
                <ItemPrice>
                    {/*item.product_sale_price < item.product_price &&
                            <>
                                <div style={{ color: 'red', marginRight: '0.25rem' }}>
                                    {commarNumber((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                </div>
                            </>*/}
                    <div>{commarNumber(setProductPriceByLang(item, 'product_sale_price', item?.price_lang, currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}</div>
                    {/*item.product_sale_price < item.product_price &&
                            <>
                                <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                                    {item.product_sale_price < item.product_price ? commarNumber(setProductPriceByLang(item, 'product_price', item?.price_lang, currentLang?.value)) : ''}
                                </div>
                            </>*/}
                </ItemPrice>
                <div style={{ color: '#22222280', fontSize: '12px' }}>즉시구매가</div>
            </ItemContainer>
        </>
    )
}
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
export const Seller9 = (props) => {//셀러카드
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
                <ItemText style={{ fontWeight: 'bold' }}>{item?.nickname}</ItemText>
                <ItemText style={{ color: themeObj.grey[500] }}>{item?.seller_name}</ItemText>
            </SellerContainer>
        </>
    )
}