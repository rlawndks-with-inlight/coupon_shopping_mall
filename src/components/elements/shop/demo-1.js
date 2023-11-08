import { useEffect } from "react";
import { useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting";
import styled from "styled-components";
import { themeObj } from "../styled-components";
import { commarNumber } from "src/utils/function";
import { IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { insertWishDataUtil } from "src/utils/shop-util";
import toast from "react-hot-toast";

const ItemName = styled.div`
font-weight: bold;
font-size:${themeObj.font_size.size7};
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
font-size:${themeObj.font_size.size7};
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
&:hover{
  transform: translateY(-8px);
}
`
const ItemImg = styled.img`
`
const ItemTextContainer = styled.div`
display:flex;
flex-direction: column;
`

export const Item1 = (props) => {//상품카드

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
            toast.error('로그인을 해주세요.')
        }
    }
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
                <IconButton sx={{ position: 'absolute', right: '2px', top: '2px' }} onClick={onClickHeart}>
                    <Icon icon={themeWishData.map(itm => { return itm?.product_id }).includes(item?.id) ? 'mdi:heart' : 'mdi:heart-outline'} fontSize={'2rem'} style={{
                        color: `${themeWishData.map(itm => { return itm?.product_id }).includes(item?.id) ? 'red' : ''}`
                    }} />
                </IconButton>
                <ItemImg src={item.product_img} style={{
                    width: `${itemThemeCss?.container.is_vertical == 0 ? '100%' : '50%'}`,
                    height: `auto`,
                    borderRadius: `${itemThemeCss?.image.border_radius}px`,
                }}
                    onClick={() => {
                        if (item?.id) {
                            router.push(`/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`)
                        }
                    }} >
                </ItemImg>
                <ItemTextContainer
                    onClick={() => {
                        if (item?.id) {
                            router.push(`/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`)
                        }
                    }}>
                    <ItemName>{item.product_name}</ItemName>
                    <ItemSubName>{item.product_comment}</ItemSubName>
                    <ItemPrice style={{
                        marginTop: 'auto'
                    }}>
                        {item.product_sale_price < item.product_price &&
                            <>
                                <div style={{ color: 'red', marginRight: '0.25rem' }}>
                                    {commarNumber((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                </div>
                            </>}
                        <div>{commarNumber(item.product_sale_price)} 원</div>
                        {item.product_sale_price < item.product_price &&
                            <>
                                <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                                    {item.product_sale_price < item.product_price ? commarNumber(item.product_price) : ''}
                                </div>
                            </>}
                    </ItemPrice>
                </ItemTextContainer>
            </ItemContainer>
        </>
    )
}
const ItemContent = styled.div`
display:flex;
flex-direction:column;
width:23.5%;
cursor:pointer;
@media (max-width:1500px){
    width:47%;
    margin:0 auto;
}
@media (max-width:840px){
    width:96%;
    margin:0 auto;
}
`
const SellerImg = styled.div`
width:100%;
height:320px;
@media (max-width:1500px){
    height:36vw;
}
@media (max-width:840px){
    height:40vw;
}
`
const ItemText = styled.div`
font-size:${themeObj.font_size.size8};
margin-top:0.5rem;
`
export const Seller1 = (props) => {//셀러카드
    const { item, router } = props;
    return (
        <>
            <ItemContent onClick={() => {
                router.push(`/shop/seller/${item.id}`)
            }}>
                <SellerImg style={{
                    backgroundImage: `url(${item?.profile_img})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }} />
                <ItemText style={{ fontWeight: 'bold' }}>{item?.nickname}</ItemText>
                <ItemText style={{ color: themeObj.grey[500] }}>{item?.seller_name}</ItemText>
            </ItemContent>
        </>
    )
}