
import styled from "styled-components"
import { Row, themeObj } from "../styled-components"
import { IconButton } from "@mui/material"
import { Icon } from "@iconify/react"
import { LazyLoadImage } from "react-lazy-load-image-component"
import { commarNumber, commarNumberWithUnit } from 'src/utils/function'
import { formatLang } from "src/utils/format"
import { useLocales } from "src/locales"

//김인욱 컴포넌트
const ItemContent = styled.div`
display:flex;
flex-direction:column;
width:95%;
cursor:pointer;
aspect-ratio: 1/1;
border-radius: 12px;
/*@media (max-width:840px){
    width:97%;
    margin:0 auto;
}*/
&.onlyone {
    width: 100vw;
    max-width: 700px;
    aspect-ratio: 5/3;
    @media (max-width:720px){
        width: 90vw;
    }
    .onlyone {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
}
`
const SellerItemContent = styled.div`
display:flex;
flex-direction:column;
width:48%;
cursor:pointer;
position:relative;
`

const SellerImg = styled.div`
width:100%;
height:199px;
@media (max-width:840px){
    height:41.75vw;
}
`
const ItemText = styled.div`
font-size:${themeObj.font_size.size8};
margin-top:0.5rem;
`
export const Item2 = (props) => {
    const { item, router, type, length, idx } = props;
    // 상품명을 선택된 언어로 표시한다. lang_obj 가 없으면 formatLang 이 원문으로 폴백한다.
    // (섹션 제목은 HomeItems 에서 이미 번역되는데 카드 안쪽만 원문으로 남아 있었다)
    const { currentLang } = useLocales();
    const productName = formatLang(item, 'product_name', currentLang);
    return (
        <>
            {
                length == 1 ?
                    <>
                        <ItemContent className='onlyone' style={{ margin: '1rem', letterSpacing: '-1px' }} onClick={() => {
                            router.push(`/shop/item/${item.id}`)
                        }}>
                            <LazyLoadImage className="onlyone" style={{ borderRadius: '12px', }} src={item?.product_img} />
                            <ItemText style={{ fontSize: '19px', marginRight: '0.1rem' }}>{productName}</ItemText>
                            <ItemText style={{ color: themeObj.grey[500], width: '100%' }}>
                                <Row>
                                    {item.product_sale_price < item.product_price &&
                                        <>
                                            <div style={{ color: 'red', marginRight: '0.25rem', fontSize: '16px' }}>
                                                {Math.round((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                            </div>
                                        </>}
                                    {item.product_sale_price < item.product_price &&
                                        <>
                                            <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: '16px', color: themeObj.grey[500] }}>
                                                {item.product_sale_price < item.product_price ? commarNumberWithUnit(item.product_price) : ''}
                                            </div>
                                        </>}
                                </Row>
                                {/* '몇 명 구매'(item.buying_count) 표시를 제거했다.
                                    DB 컬럼은 있으나 백엔드에서 증가시키는 코드가 없어 항상 초기값만 나오는 유령 지표다.
                                    지운 div 가 marginLeft:'auto' 로 오른쪽 끝에 있던 요소라 남은 가격은 왼쪽 정렬 그대로다. */}
                                <Row style={{ width: '100%' }}>
                                    <div style={{ color: 'black', fontSize: '24px', fontWeight: 'bold' }}>{commarNumberWithUnit(item.product_sale_price)}</div>
                                </Row>
                            </ItemText>
                        </ItemContent>
                    </>
                    :
                    <>
                        {
                            type == 1 && idx == 0 ?
                                <>
                                    <ItemContent style={{ margin: '1rem', position: 'relative', letterSpacing: '-1px' }} onClick={() => {
                                        router.push(`/shop/item/${item.id}`)
                                    }}>
                                        <LazyLoadImage style={{ width: '100%', height: '100%', borderRadius: '12px', }} src={item?.product_img} />
                                        <ItemText style={{ fontWeight: 'bold', position: 'absolute', bottom: '4.5rem', left: '0.5rem', color: 'white', fontSize: '18px', zIndex: '10', marginRight: '0.1rem' }}>{productName}</ItemText>
                                        <ItemText style={{ color: themeObj.grey[500], position: 'absolute', bottom: '0.5rem', left: '0.5rem', zIndex: '10', width: '95%' }}>
                                            <Row>
                                                {item.product_sale_price < item.product_price &&
                                                    <>
                                                        <div style={{ color: 'red', marginRight: '0.25rem', fontSize: themeObj.font_size.size7, fontWeight: 'bold' }}>
                                                            {Math.round((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                                        </div>
                                                        {item.product_sale_price < item.product_price &&
                                                            <>
                                                                <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                                                                    {item.product_sale_price < item.product_price ? commarNumberWithUnit(item.product_price) : ''}
                                                                </div>
                                                            </>}
                                                    </>}
                                            </Row>
                                            {/* 위와 같은 이유로 '몇 명 구매' 표시를 제거했다(증가 로직이 없는 유령 지표).
                                                이 블록은 이미지 위 절대배치 오버레이라 지운 뒤에도 가격만 왼쪽에 남는다. */}
                                            <Row style={{ width: '100%' }}>
                                                <div style={{ color: 'black', fontSize: '20px', zIndex: '10', color: 'white', fontWeight: 'bold' }}>{commarNumberWithUnit(item.product_sale_price)}</div>
                                            </Row>
                                        </ItemText>
                                        <div style={{ width: '100%', height: '80%', position: 'absolute', bottom: '0', zIndex: '5', background: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%)', borderRadius: '0px 0px 12px 12px' }} />
                                    </ItemContent>
                                </>
                                :
                                <>
                                    <ItemContent style={{ margin: '1rem' }} onClick={() => {
                                        router.push(`/shop/item/${item.id}`)
                                    }}>
                                        <LazyLoadImage style={{ width: '100%', height: '100%', borderRadius: '12px' }} src={item?.product_img} />
                                        <ItemText style={{ fontWeight: 'bold', marginRight: '0.1rem' }}>{productName}</ItemText>
                                        <ItemText style={{ color: themeObj.grey[500] }}>
                                            <Row>
                                                {item.product_sale_price < item.product_price &&
                                                    <>
                                                        <div style={{ color: 'red', marginRight: '0.25rem' }}>
                                                            {Math.round((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                                        </div>
                                                    </>}
                                                {item.product_sale_price < item.product_price &&
                                                    <>
                                                        <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                                                            {item.product_sale_price < item.product_price ? commarNumberWithUnit(item.product_price) : ''}
                                                        </div>
                                                    </>}
                                            </Row>
                                            <Row>
                                                <div style={{ color: 'black', fontSize: themeObj.font_size.size7, }}>{commarNumberWithUnit(item.product_sale_price)}</div>
                                            </Row>
                                        </ItemText>
                                    </ItemContent>
                                </>
                        }
                    </>
            }
        </>
    )
}
export const SellerItem = (props) => {
    const { item, router, onClickCartButton } = props;
    return (
        <>
            <SellerItemContent>
                <div style={{ width: '100%', position: 'relative' }}>
                    <LazyLoadImage style={{ width: '100%' }} src={item?.product_img} onClick={() => {
                        router.push(`/shop/item/${item.id}`)
                    }} />
                    <IconButton sx={{ position: 'absolute', right: '0', bottom: '0' }}
                        onClick={() => {
                            onClickCartButton(item)
                        }}>
                        <Icon icon='iconamoon:shopping-bag' />
                    </IconButton>
                </div>
                <ItemText style={{ fontWeight: 'bold' }} onClick={() => {
                    router.push(`/shop/item/${item.id}`)
                }}>{item?.product_name}</ItemText>
                <ItemText style={{ color: themeObj.grey[500] }} onClick={() => {
                    router.push(`/shop/item/${item.id}`)
                }}>{item?.product_comment}</ItemText>

            </SellerItemContent>
        </>
    )
}
export const Seller2 = (props) => {
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
export const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
`

export const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin: 56px auto;
width: 90%;
`
