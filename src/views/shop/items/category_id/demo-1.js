import { useEffect } from 'react';
import { test_items } from 'src/data/test-data';
import styled from 'styled-components'
import { useTheme } from "@emotion/react";
import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { commarNumber } from 'src/utils/function';
import { Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';

const Wrapper = styled.div`
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
const Name = styled.div`
font-weight: bold;
font-size:${themeObj.font_size.size5};
`
const Price = styled.div`
font-size:${themeObj.font_size.size5};
`
const Item = (props) => {

  const { item, router } = props;

  return (
    <>
      <Wrapper
        onClick={() => {
          router.push(`/shop/item/${item?.id}`)
        }}
      >
        <LazyLoadImage src={item?.product_img}
          className="item-img"
        />
        <Name>{item.name}</Name>
        <Price>{commarNumber(item.item_pr)} 원</Price>
      </Wrapper>
    </>
  )
}
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 1rem auto;
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
const Items = (props) => {
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

const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeCategoryList } = useSettingsContext();
  useEffect(() => {
    console.log(themeCategoryList)
  }, [themeCategoryList])

  return (
    <>
      <ContentWrapper>
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
          <Title>asd</Title>
        </div>
        <Items items={test_items} router={router} />
      </ContentWrapper>
    </>
  )
}
export default Demo1
