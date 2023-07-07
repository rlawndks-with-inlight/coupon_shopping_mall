
import styled from "styled-components"
import { themeObj } from "../styled-components"
import { IconButton } from "@mui/material"
import { Icon } from "@iconify/react"

const ItemContent = styled.div`
display:flex;
flex-direction:column;
width:23.5%;
cursor:pointer;
@media (max-width:840px){
    width:97%;
    margin:0 auto;
}
`
const SellerItemContent = styled.div`
display:flex;
flex-direction:column;
width:48%;
cursor:pointer;
position:relative;
`
const ItemImg = styled.img`
width:100%;
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
export const Item = (props) => {
  const { item, router } = props;
  return (
    <>
      <ItemContent onClick={() => {
        router.push(`/blog/product/${item.id}`)
      }}>
        <ItemImg src={item?.product_img} />
        <ItemText style={{ fontWeight: 'bold' }}>{item?.name}</ItemText>
        <ItemText style={{ color: themeObj.grey[500] }}>{item?.sub_name}</ItemText>
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
          <ItemImg src={item?.product_img} onClick={() => {
            router.push(`/blog/product/${item.id}`)
          }} />
          <IconButton sx={{ position: 'absolute', right: '0', bottom: '0' }}
          onClick={()=>{
            onClickCartButton(item)
          }}>
            <Icon icon='iconamoon:shopping-bag' />
          </IconButton>
        </div>
        <ItemText style={{ fontWeight: 'bold' }} onClick={() => {
          router.push(`/blog/product/${item.id}`)
        }}>{item?.name}</ItemText>
        <ItemText style={{ color: themeObj.grey[500] }} onClick={() => {
          router.push(`/blog/product/${item.id}`)
        }}>{item?.sub_name}</ItemText>

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
          backgroundImage: `url(${item?.main_img})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }} />
        <ItemText style={{ fontWeight: 'bold' }}>{item?.title}</ItemText>
        <ItemText style={{ color: themeObj.grey[500] }}>{item?.sub_title}</ItemText>
      </ItemContent>
    </>
  )
}
