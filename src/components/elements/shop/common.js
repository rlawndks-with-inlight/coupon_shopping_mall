import styled from "styled-components";
import { themeObj } from "../styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { commarNumber } from "src/utils/function";

const ItemWrapper = styled.div`
    display: -webkit-box;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
    width:285px;
    cursor: pointer;
    @media (max-width: 1350px) {
      width:31%;
    }
    @media (max-width: 1000px) {
      width:47%;
    }
    @media (max-width: 650px) {
      width:100%;
    }
`
const ItemName = styled.div`
font-weight: bold;
font-size:${themeObj.font_size.size6};
`
const ItemPrice = styled.div`
font-size:${themeObj.font_size.size6};
`
const ItemsContainer = styled.div`
display:flex;
flex-wrap:wrap;
column-gap: 20px;
grid-row-gap: 40px;
row-gap: 40px;
width:100%;
@media (max-width: 1350px) {
  column-gap: 3%;
}
@media (max-width: 1000px) {
  column-gap: 6%;
}
@media (max-width: 650px) {
  column-gap: 0;
}
`
export const Item = (props) => {

  const { item, router } = props;

  return (
    <>
      <ItemWrapper
        onClick={() => {
          router.push(`/shop/item/${item?.id}`)
        }}
      >
        <LazyLoadImage src={item?.product_img}
          className="item-img"
        />
        <ItemName>{item.name}</ItemName>
        <ItemPrice>{commarNumber(item.item_pr)} 원</ItemPrice>
      </ItemWrapper>
    </>
  )
}
export const Items = (props) => {
  const { items, router } = props;
  return (
    <>
      <ItemsContainer>
        {items && items.map((item, idx) => {
          return <Item item={item} router={router} />
        })}
      </ItemsContainer>
    </>
  )
}
