import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Items as ShopItems } from 'src/components/elements/shop/common';
import { Items as BlogItems } from 'src/components/elements/blog/common';
import { Col, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { getWishDataUtil } from 'src/utils/shop-util';
import { isBlogBrand } from 'src/utils/blog-shop-route';

// 프레임 공용 찜목록.
//
// 예전엔 전용 화면이 없는 프레임이 전부 WishDemo1(쇼핑몰 프레임1 화면)으로 떨어졌다.
// 그 화면은 shop/common 의 Items 를 쓰는데, 그 디스패처는 shop_demo_num 으로 카드를 고른다
// — 블로그형 브랜드는 shop_demo_num 이 0 이라 어느 분기에도 안 걸려 마지막 폴백(Item5,
// 쇼핑몰 카드)이 나왔다. 자기 프레임과 생김새가 전혀 다른 목록이 뜨는 셈이다.
// 브랜드 유형에 맞는 카드 디스패처를 고른다.
const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:70vh;
margin-bottom:10vh;
`

const WishPanel = ({ router }) => {
  const { themeWishData, themeDnsData } = useSettingsContext();
  const { translate } = useLocales();
  const [wishList, setWishList] = useState([]);

  useEffect(() => {
    (async () => {
      setWishList(await getWishDataUtil(themeWishData));
    })();
  }, [themeWishData]);

  const Items = isBlogBrand(themeDnsData) ? BlogItems : ShopItems;

  return (
    <Wrappers>
      <Title>{translate('찜목록')}</Title>
      {wishList.length > 0
        ? <Items items={wishList} router={router} />
        : (
          <Col>
            <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
            <div style={{ margin: 'auto auto 8rem auto' }}>{translate('찜한 상품이 없습니다.')}</div>
          </Col>
        )}
    </Wrappers>
  );
};

export default WishPanel;
