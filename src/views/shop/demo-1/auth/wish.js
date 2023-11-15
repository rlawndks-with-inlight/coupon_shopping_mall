import { Icon } from '@iconify/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Items } from 'src/components/elements/shop/common';
import { Col, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { getWishDataUtil } from 'src/utils/shop-util';
import styled from 'styled-components'
const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const WishDemo = (props) => {
  const { themeWishData } = useSettingsContext();
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const [wishList, setWishList] = useState([]);
  useEffect(() => {
    pageSetting();
  }, [themeWishData])

  const pageSetting = async () => {
    let wish_list = await getWishDataUtil(themeWishData);
    setWishList(wish_list);
  }
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
              <div style={{ margin: 'auto auto 8rem auto' }}>찜한 상품이 없습니다.</div>
            </Col>
          </>}
      </Wrappers>
    </>
  )
}
export default WishDemo
