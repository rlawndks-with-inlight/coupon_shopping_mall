import { Icon } from '@iconify/react';
import { Typography, Divider, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { Items } from 'src/components/elements/shop/common';
import { themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { getWishDataUtil } from 'src/utils/shop-util';
import styled from 'styled-components'

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 2rem auto 6rem auto;
`
const EmptyWrapper = styled.div`
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
padding: 7rem 0 9rem 0;
`

const WishDemo = (props) => {
  const { themeWishData, themeDnsData } = useSettingsContext();
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate } = useLocales();
  const [wishList, setWishList] = useState([]);
  useEffect(() => {
    pageSetting();
  }, [themeWishData])

  const pageSetting = async () => {
    let wish_list = await getWishDataUtil(themeWishData);
    setWishList(wish_list);
  }

  const mainColor = themeDnsData?.theme_css?.main_color;

  return (
    <>
      <Wrapper>
        <ContentWrapper>
          <div style={{ margin: '1rem 0 1.5rem 0' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              {translate('찜목록')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
              {translate('찜한 상품')} {wishList.length}
            </Typography>
          </div>
          <Divider sx={{ mb: 4 }} />
          {wishList.length > 0 ?
            <>
              <Items items={wishList} router={router} />
            </>
            :
            <>
              <EmptyWrapper>
                <Icon
                  icon={'ph:heart-straight-thin'}
                  style={{ fontSize: '5rem', color: mainColor || themeObj.grey[400], marginBottom: '1.5rem' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {translate('찜한 상품이 없습니다.')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
                  {translate('마음에 드는 상품을 찜해보세요.')}
                </Typography>
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => router.push('/shop')}
                  sx={{ fontWeight: 600, px: 4, py: 1 }}
                >
                  {translate('쇼핑 계속하기')}
                </Button>
              </EmptyWrapper>
            </>}
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default WishDemo
