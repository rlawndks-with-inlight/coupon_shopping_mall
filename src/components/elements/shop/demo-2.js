import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting";
import styled from "styled-components";
import { themeObj } from "../styled-components";
import { useState } from "react";
import { useEffect } from "react";
import { IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { commarNumber, commarNumberWithUnit } from 'src/utils/function';
import { insertWishDataUtil } from "src/utils/shop-util";
import toast from "react-hot-toast";
import Slider from "react-slick";
import { Seller1 } from "./demo-1";
import { ProductStatusBadge } from './ProductStatusBadge';
import { formatLang } from "src/utils/format";
import { useLocales } from "src/locales";

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
/* 사진 상자의 높이는 폭에서 나온다(aspect-ratio). 높이를 화면 폭 구간별 vw 로 따로 정하지 않는다.
   예전엔 높이는 15vw/25vw/42vw 인데 폭은 카드 열 수로 정해져서, 상자의 가로세로 비율이
   PC 1.14 / 모바일 1.33 으로 달랐다. 사진은 (당시) cover 라 모바일에서 위아래가 더 잘렸다 —
   "PC에선 온전한 사진이 모바일에선 잘린다"(포스몰 제보 2026-09-21). 비율을 폭에 묶으면
   어느 화면에서든 같은 부분이 보인다. 비율값은 상품카드 설정의 image.ratio(기본 1 = 정사각). */
const ItemImgContainer = styled.div`
position: relative;
`
const ItemImg = styled.div`
width: 100%;
`
const ItemTextContainer = styled.div`
display:flex;
flex-direction: column;
`

export const Item2 = (props) => {
    const { user } = useAuthContext();
    const { themeWishData, onChangeWishData } = useSettingsContext();
    const { item, router, theme_css, seller } = props;
    // 프레임2 상품 카드는 상품명·설명을 원문 그대로 그렸다 — 언어를 바꿔도 상품만 한국어로 남았다.
    // 다른 프레임(1·3·6~11)의 카드는 전부 formatLang 을 거친다. 같은 규칙으로 맞춘다.
    const { currentLang, translate } = useLocales();
    const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);
    // sub_images 에는 상세설명 이미지 행도 섞여 온다(백엔드가 product_images 를 통째로 담아
    // sub_images·description_images 양쪽에 넣는다). 그 행들은 product_sub_img 가 null 이라
    // 걸러내지 않으면 슬라이더에 빈 칸이 생겼다.
    const images = [item?.product_img, ...(item?.sub_images ?? []).map(itm => itm?.product_sub_img)].filter(Boolean)
    useEffect(() => {
        if (theme_css) {
            setItemThemeCss(theme_css)
        }
    }, [theme_css])
    const onClickHeart = () => {
        if (user) {
            insertWishDataUtil(item, themeWishData, onChangeWishData);
        } else {
            toast.error(translate('로그인을 해주세요.'))
        }
    }
    const item_img_setting = {
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2500,
        slidesToScroll: 1,
        dots: false,
        // ⚠ 이 카드만 사진칸에 슬라이더를 하나 더 갖고 있다(다른 프레임 카드에는 없다).
        //   메인화면 상품줄은 가로로 미는 '레일' 인데, 그 안에서 카드가 손가락을 가져가면
        //   **레일이 안 밀린다**(2026-08-31 제보). 사진이 카드의 대부분이라 사실상 못 민다.
        //   사진은 알아서 돌아가고(autoplay) 손님은 눌러서 상품으로 들어가면 되므로,
        //   손가락 동작은 바깥 레일에 양보한다.
        //   (CSS 쪽도 같이 풀어야 한다 — common.js 의 RailCard 주석 참고)
        swipe: false,
        draggable: false,
        touchMove: false,
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
                    <ProductStatusBadge status={item?.status} />
                    <Slider {...item_img_setting}>
                        {images.map(url => (
                            <>
                                <ItemImg style={{
                                    backgroundImage: `url(${url})`,
                                    // contain: 가로·세로 어느 비율로 올려도 사진 전체가 정사각 칸에 들어간다 — 다른 5개 프레임과 같은 규칙.
                                    // 예전엔 cover 라 정사각이 아닌 사진은 잘렸다(2026-09-22 사장님 결정: 6종 통일).
                                    // 배경 방식이라 no-repeat 이 없으면 남는 자리에 사진이 반복된다.
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    width: `${itemThemeCss?.container.is_vertical == 0 ? '100%' : '50%'}`,
                                    // 저장된 설정에 image.ratio 가 없는 몰(이 값이 생기기 전에 저장)도 정사각으로 — 없으면 상자가 0 높이로 접힌다
                                    aspectRatio: `${Number(itemThemeCss?.image?.ratio) > 0 ? Number(itemThemeCss.image.ratio) : 1} / 1`,
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
                        {item.product_sale_price < item.product_price &&
                            <>
                                <div style={{ color: 'red', marginRight: '0.25rem' }}>
                                    {Math.round((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                </div>
                            </>}
                        <div>{commarNumberWithUnit(item.product_sale_price)}</div>
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