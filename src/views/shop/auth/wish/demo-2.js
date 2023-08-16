import { useEffect, useState } from "react";
import { Icon } from '@iconify/react';
import { Items } from 'src/components/elements/shop/common';
import { themeObj, Col, Title } from "src/components/elements/styled-components";
import { test_items } from "src/data/test-data";
import styled from "styled-components";

const Wrappers = styled.div`
max-width: 1200px;
display: flex;
flex-direction: column;
margin: 0 auto;
width: 90%;
min-height: 90vh;
margin-bottom: 10vh;
`

//찜목록 박이규
const Demo2 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const [wishList, setWishList] = useState([]);
  useEffect(() => {
    let data = test_items;
    setWishList(data);
  })
  return (
    <>
      <Wrappers>
        <Title>찜목록</Title>
        {wishList.length > 0 ?
          <>
            <Items items={wishList} router={router} />
          </>
          :
          <>
            <Col>
              <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
              <div style={{ margin: ' auto auto 8rem auto' }}>찜한 상품이 없습니다.</div>
            </Col>
          </>}
      </Wrappers>
    </>
  )
}
export default Demo2
