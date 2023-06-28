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
    margin:0;
    @media (max-width: 1350px) {
      width:27.6vw;
    }
    @media (max-width: 1000px) {
      width:41vw;
    }
    @media (max-width: 650px) {
      width:90vw;
    }
`
const ItemName = styled.div`
font-weight: bold;
font-size:${themeObj.font_size.size6};
`
const ItemPrice = styled.div`
font-size:${themeObj.font_size.size6};
display:flex;
align-items:end;
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
        <ItemPrice>
          {item.item_pr < item.mkt_pr &&
            <>
              <div style={{ color: 'red', marginRight: '0.25rem' }}>
                {commarNumber((item.mkt_pr - item.item_pr) * 100 / item.mkt_pr) + '%'}
              </div>
            </>}
          <div>{commarNumber(item.item_pr)} 원</div>
          {item.item_pr < item.mkt_pr &&
            <>
              <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                {item.item_pr < item.mkt_pr ? commarNumber(item.mkt_pr) : ''}
              </div>
            </>}

        </ItemPrice>
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
