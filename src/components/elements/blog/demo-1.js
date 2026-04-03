
import styled from "styled-components"
import { themeObj } from "../styled-components"
import { IconButton } from "@mui/material"
import { Icon } from "@iconify/react"
import { LazyLoadImage } from "react-lazy-load-image-component"
import { commarNumber } from "src/utils/function"

const ItemContent = styled.div`
display:flex;
flex-direction:column;
width:100%;
cursor:pointer;
padding:8px;
`
const ItemImgWrap = styled.div`
width:100%;
aspect-ratio:1/1;
overflow:hidden;
border-radius:8px;
background:#f5f5f5;
& img {
    transition: transform 0.3s ease;
}
&:hover img {
    transform: scale(1.03);
}
`
const ItemName = styled.div`
font-size:15px;
font-weight:600;
margin-top:10px;
line-height:1.4;
overflow:hidden;
text-overflow:ellipsis;
display:-webkit-box;
-webkit-line-clamp:2;
-webkit-box-orient:vertical;
`
const ItemComment = styled.div`
font-size:13px;
color:${themeObj.grey[500]};
margin-top:3px;
overflow:hidden;
text-overflow:ellipsis;
white-space:nowrap;
`
const ItemPrice = styled.div`
font-size:15px;
font-weight:700;
margin-top:6px;
`
const ItemOriginalPrice = styled.span`
font-size:12px;
font-weight:400;
color:${themeObj.grey[400]};
text-decoration:line-through;
margin-left:4px;
`
const DiscountBadge = styled.span`
font-size:13px;
font-weight:700;
color:#e74c3c;
margin-right:4px;
`
const SellerContent = styled.div`
display:flex;
flex-direction:column;
align-items:center;
width:100%;
cursor:pointer;
padding:8px;
`
const SellerImg = styled.div`
width:72px;
height:72px;
border-radius:50%;
background-size:cover;
background-position:center;
background-repeat:no-repeat;
`

export const Item1 = (props) => {
  const { item, router } = props;
  const hasDiscount = item?.product_price > item?.product_sale_price && item?.product_sale_price > 0;
  const discountRate = hasDiscount ? Math.round((1 - item.product_sale_price / item.product_price) * 100) : 0;
  const displayPrice = item?.product_sale_price || item?.product_price || 0;

  return (
    <ItemContent onClick={() => { router.push(`/blog/product/${item.id}`) }}>
      <ItemImgWrap>
        <LazyLoadImage
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          src={item?.product_img}
        />
      </ItemImgWrap>
      <ItemName>{item?.product_name}</ItemName>
      {item?.product_comment && <ItemComment>{item?.product_comment}</ItemComment>}
      <ItemPrice>
        {hasDiscount && <DiscountBadge>{discountRate}%</DiscountBadge>}
        {commarNumber(displayPrice)}원
        {hasDiscount && <ItemOriginalPrice>{commarNumber(item.product_price)}원</ItemOriginalPrice>}
      </ItemPrice>
    </ItemContent>
  )
}
export const SellerItem = (props) => {
  const { item, router, onClickCartButton } = props;
  return (
    <ItemContent style={{ position: 'relative' }}>
      <div style={{ width: '100%', position: 'relative' }}>
        <ItemImgWrap onClick={() => { router.push(`/blog/product/${item.id}`) }}>
          <LazyLoadImage style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={item?.product_img} />
        </ItemImgWrap>
        <IconButton sx={{ position: 'absolute', right: '8px', bottom: '8px', background: 'rgba(255,255,255,0.9)', '&:hover': { background: '#fff' } }}
          onClick={() => { onClickCartButton(item) }}>
          <Icon icon='iconamoon:shopping-bag' />
        </IconButton>
      </div>
      <ItemName onClick={() => { router.push(`/blog/product/${item.id}`) }}>{item?.product_name}</ItemName>
      <ItemComment onClick={() => { router.push(`/blog/product/${item.id}`) }}>{item?.product_comment}</ItemComment>
    </ItemContent>
  )
}
export const Seller1 = (props) => {
  const { item, router } = props;
  return (
    <SellerContent onClick={() => { router.push(`/blog/seller/${item.id}`) }}>
      <SellerImg style={{ backgroundImage: `url(${item?.profile_img})` }} />
      <ItemName style={{ textAlign: 'center', fontSize: '14px' }}>{item?.nickname}</ItemName>
      <ItemComment style={{ textAlign: 'center' }}>{item?.seller_name}</ItemComment>
    </SellerContent>
  )
}
export const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
`
export const Wrappers = styled.div`
max-width:840px;
display:flex;
flex-direction:column;
margin: 56px auto;
width: 90%;
`
