
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
/*@media (max-width:840px){
    width:97%;
    margin:0 auto;
}*/
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
    const { item, router } = props;
    return (
        <>
            <ItemContent style={{ margin: '1rem' }} onClick={() => {
                router.push(`/blog/product/${item.id}`)
            }}>
                <LazyLoadImage style={{ width: '100%', height: '100%' }} src={item?.product_img} />
                <ItemText style={{ fontWeight: 'bold' }}>{item?.product_name}</ItemText>
                <ItemText style={{ color: themeObj.grey[500] }}>
                    {item.product_sale_price < item.product_price &&
                        <>
                            <div style={{ color: 'red', marginRight: '0.25rem' }}>
                                {commarNumber((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                            </div>
                        </>}
                    <Row>
                        <div style={{ color: 'black', fontSize: themeObj.font_size.size7, }}>{commarNumber(item.product_sale_price)} 원</div>
                        {item.product_sale_price < item.product_price &&
                            <>
                                <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                                    {item.product_sale_price < item.product_price ? commarNumber(item.product_price) : ''}
                                </div>
                            </>}
                    </Row>
                </ItemText>
            </ItemContent>
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
