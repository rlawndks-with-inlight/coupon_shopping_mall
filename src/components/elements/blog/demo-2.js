
import styled from "styled-components"
import { Row, themeObj } from "../styled-components"
import { IconButton } from "@mui/material"
import { Icon } from "@iconify/react"
import { LazyLoadImage } from "react-lazy-load-image-component"
import { commarNumber } from "src/utils/function"

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
    return (
        <>
            {
                length == 1 ?
                    <>
                        <ItemContent className='onlyone' style={{ margin: '1rem', letterSpacing: '-1px' }} onClick={() => {
                            router.push(`/blog/product/${item.id}`)
                        }}>
                            <LazyLoadImage className="onlyone" style={{ borderRadius: '12px', }} src={item?.product_img} />
                            <ItemText style={{ fontSize: '19px', marginRight: '0.1rem' }}>{item?.product_name}</ItemText>
                            <ItemText style={{ color: themeObj.grey[500], width: '100%' }}>
                                <Row>
                                    {item.product_sale_price < item.product_price &&
                                        <>
                                            <div style={{ color: 'red', marginRight: '0.25rem', fontSize: '16px' }}>
                                                {commarNumber((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                            </div>
                                        </>}
                                    {item.product_sale_price < item.product_price &&
                                        <>
                                            <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: '16px', color: themeObj.grey[500] }}>
                                                {item.product_sale_price < item.product_price ? commarNumber(item.product_price) : ''}원
                                            </div>
                                        </>}
                                </Row>
                                <Row style={{ width: '100%' }}>
                                    <div style={{ color: 'black', fontSize: '24px', fontWeight: 'bold' }}>{commarNumber(item.product_sale_price)}원</div>
                                    <div style={{ fontSize: themeObj.font_size.size8, marginLeft: 'auto', fontWeight: 'normal', color: themeObj.grey[500] }}>{item.buying_count}명 구매</div>
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
                                        router.push(`/blog/product/${item.id}`)
                                    }}>
                                        <LazyLoadImage style={{ width: '100%', height: '100%', borderRadius: '12px', }} src={item?.product_img} />
                                        <ItemText style={{ fontWeight: 'bold', position: 'absolute', bottom: '4.5rem', left: '0.5rem', color: 'white', fontSize: '18px', zIndex: '10', marginRight: '0.1rem' }}>{item?.product_name}</ItemText>
                                        <ItemText style={{ color: themeObj.grey[500], position: 'absolute', bottom: '0.5rem', left: '0.5rem', zIndex: '10', width: '95%' }}>
                                            <Row>
                                                {item.product_sale_price < item.product_price &&
                                                    <>
                                                        <div style={{ color: 'red', marginRight: '0.25rem', fontSize: themeObj.font_size.size7, fontWeight: 'bold' }}>
                                                            {commarNumber((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                                        </div>
                                                        {item.product_sale_price < item.product_price &&
                                                            <>
                                                                <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                                                                    {item.product_sale_price < item.product_price ? commarNumber(item.product_price) : ''}원
                                                                </div>
                                                            </>}
                                                    </>}
                                            </Row>
                                            <Row style={{ width: '100%' }}>
                                                <div style={{ color: 'black', fontSize: '20px', zIndex: '10', color: 'white', fontWeight: 'bold' }}>{commarNumber(item.product_sale_price)}원</div>
                                                <div style={{ fontSize: themeObj.font_size.size8, marginLeft: 'auto', fontWeight: 'normal', color: themeObj.grey[500] }}>{item.buying_count}명 구매</div>
                                            </Row>
                                        </ItemText>
                                        <div style={{ width: '100%', height: '80%', position: 'absolute', bottom: '0', zIndex: '5', background: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%)', borderRadius: '0px 0px 12px 12px' }} />
                                    </ItemContent>
                                </>
                                :
                                <>
                                    <ItemContent style={{ margin: '1rem' }} onClick={() => {
                                        router.push(`/blog/product/${item.id}`)
                                    }}>
                                        <LazyLoadImage style={{ width: '100%', height: '100%', borderRadius: '12px' }} src={item?.product_img} />
                                        <ItemText style={{ fontWeight: 'bold', marginRight: '0.1rem' }}>{item?.product_name}</ItemText>
                                        <ItemText style={{ color: themeObj.grey[500] }}>
                                            <Row>
                                                {item.product_sale_price < item.product_price &&
                                                    <>
                                                        <div style={{ color: 'red', marginRight: '0.25rem' }}>
                                                            {commarNumber((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                                                        </div>
                                                    </>}
                                                {item.product_sale_price < item.product_price &&
                                                    <>
                                                        <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                                                            {item.product_sale_price < item.product_price ? commarNumber(item.product_price) : ''}원
                                                        </div>
                                                    </>}
                                            </Row>
                                            <Row>
                                                <div style={{ color: 'black', fontSize: themeObj.font_size.size7, }}>{commarNumber(item.product_sale_price)}원</div>
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
                        router.push(`/blog/product/${item.id}`)
                    }} />
                    <IconButton sx={{ position: 'absolute', right: '0', bottom: '0' }}
                        onClick={() => {
                            onClickCartButton(item)
                        }}>
                        <Icon icon='iconamoon:shopping-bag' />
                    </IconButton>
                </div>
                <ItemText style={{ fontWeight: 'bold' }} onClick={() => {
                    router.push(`/blog/product/${item.id}`)
                }}>{item?.product_name}</ItemText>
                <ItemText style={{ color: themeObj.grey[500] }} onClick={() => {
                    router.push(`/blog/product/${item.id}`)
                }}>{item?.product_comment}</ItemText>

            </SellerItemContent>
        </>
    )
}
export const Seller = (props) => {
    const { item, router } = props;
    return (
        <>
            <ItemContent onClick={() => {
                router.push(`/blog/seller/${item.id}`)
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
