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
import Slider from "react-slick";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useLocales } from "src/locales";
import { formatLang } from "src/utils/format";
import { ProductStatusBadge } from './ProductStatusBadge';

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
/* 사진 상자의 높이는 폭에서 나온다(aspect-ratio, 렌더에서 image.ratio 로 지정). 화면 폭 구간별 vw 로
   따로 정하지 않는다 — 예전엔 상자 비율이 PC 1.07 / 모바일 1.40 이라 사진이 잘리진 않아도(contain)
   기기마다 사진 크기가 달랐다(PC 205px / 모바일 172px 정사각, 2026-09-22 실측). 프레임2·3·5·6 과 같은 규칙. */
const ItemImgContainer = styled.div`
width: 100%;
margin: 0 auto;
display: flex;
position: relative;
`

const ItemTextContainer = styled.div`
display:flex;
flex-direction: column;
`
const ItemImg = styled(LazyLoadImage)`
object-fit: contain;
margin: auto;
width: 100%;
height: 100%;
`
export const Item1 = memo((props) => {

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
                {/* 저장된 설정에 image.ratio 가 없는 몰(이 값이 생기기 전에 저장)도 정사각으로 — 없으면 상자가 0 높이로 접힌다 */}
                <ItemImgContainer style={{ aspectRatio: `${Number(itemThemeCss?.image?.ratio) > 0 ? Number(itemThemeCss.image.ratio) : 1} / 1` }}>
                    <ProductStatusBadge status={item?.status} />
                    <ItemImg src={item?.product_img} onClick={() => {
                        if (item?.id) {
                            router.push(`/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`)
                        }
                    }} />
                    {/* 찜(위시리스트) 하트 제거 — 안 쓰는 기능이라 다른 프레임·기본 카드와 통일. */}
                </ItemImgContainer>
                <ItemTextContainer
                    onClick={() => {
                        if (item?.id) {
                            router.push(`/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`)
                        }
                    }}>
                    <ItemName>{formatLang(item, 'product_name', currentLang)}</ItemName>
                    <ItemSubName>{formatLang(item, 'product_comment', currentLang)}</ItemSubName>
                    <ItemPrice style={{
                        marginTop: 'auto'
                    }}>
                        {
                            themeDnsData?.id == 95 && item?.product_sale_price > 99999 ?
                                <>
                                    <div>{translate('별도 문의 필요')}</div>
                                </>
                                :
                                <>
                                    {item.product_sale_price < item.product_price &&
                                        <>
                                            <div style={{ color: 'red', marginRight: '0.25rem' }}>
                                                {Math.round((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                            </div>
                                        </>}
                                    <div>{commarNumber(setProductPriceByLang(item, 'product_sale_price', item?.price_lang, currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}</div>
                                    {item.product_sale_price < item.product_price &&
                                        <>
                                            <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
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
export const Seller1 = (props) => {//셀러카드
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