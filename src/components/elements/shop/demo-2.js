import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting";
import styled from "styled-components";
import { themeObj } from "../styled-components";
import { useState } from "react";
import { useEffect } from "react";
import { IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { commarNumber } from "src/utils/function";
import { insertWishDataUtil } from "src/utils/shop-util";
import toast from "react-hot-toast";
import Slider from "react-slick";
import { Seller1 } from "./demo-1";

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
const ItemImgContainer = styled.div`
position: relative;
height: 300px;
@media screen and (max-width: 1800px) {
    height: 15vw;
}
@media screen and (max-width: 1150px) {
    height: 25vw;
}
@media screen and (max-width: 850px) {
    height: 42vw;
}
`
const ItemImg = styled.div`
height: 300px;
@media screen and (max-width: 1800px) {
    height: 15vw;
}
@media screen and (max-width: 1150px) {
    height: 25vw;
}
@media screen and (max-width: 850px) {
    height: 42vw;
}
`
const ItemTextContainer = styled.div`
display:flex;
flex-direction: column;
`

export const Item2 = (props) => {
    const { user } = useAuthContext();
    const { themeWishData, onChangeWishData } = useSettingsContext();
    const { item, router, theme_css, seller } = props;
    const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);
    const images = [...[item?.product_img], ...(item?.sub_images ?? []).map(itm => { return itm.product_sub_img })]
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
    const item_img_setting = {
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2500,
        slidesToScroll: 1,
        dots: false,
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
                <ItemImgContainer>
                    <Slider {...item_img_setting}>
                        {images.map(url => (
                            <>
                                <ItemImg style={{
                                    backgroundImage: `url(${url})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    width: `${itemThemeCss?.container.is_vertical == 0 ? '100%' : '50%'}`,
                                    borderRadius: `${itemThemeCss?.image.border_radius}px`,
                                }}
                                    onClick={() => {
                                        if (item?.id) {
                                            router.push(`/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`)
                                        }
                                    }} >
                                </ItemImg>
                            </>
                        ))}


                    </Slider>

                    <IconButton sx={{ position: 'absolute', right: '2px', bottom: '2px' }} onClick={onClickHeart}>
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

export const Seller2 = (props) => {//셀러카드

    return (
        <>
            <Seller1 {...props} />
        </>
    )
}