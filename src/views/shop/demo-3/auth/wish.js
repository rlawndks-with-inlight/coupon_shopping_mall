import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Items } from 'src/components/elements/shop/common';
import { themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
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
const HeaderBox = styled.div`
display:flex;
flex-direction:column;
align-items:center;
margin: 4.5rem auto 3rem auto;
`
const PageTitle = styled.div`
font-size:${themeObj.font_size.size2};
font-weight:bold;
text-transform:uppercase;
letter-spacing:0.12em;
text-align:center;
`
const Accent = styled.div`
width:48px;
height:3px;
margin-top:0.9rem;
border-radius:2px;
`
const CountText = styled.div`
margin-top:0.9rem;
font-size:${themeObj.font_size.size8};
color:${themeObj.grey[600]};
letter-spacing:0.02em;
`
const EmptyBox = styled.div`
display:flex;
flex:1;
flex-direction:column;
align-items:center;
justify-content:center;
padding: 5rem 0 6rem 0;
`
const EmptyText = styled.div`
margin: 1.25rem auto 2rem auto;
font-size:${themeObj.font_size.size6};
color:${themeObj.grey[600]};
`
const WishDemo = (props) => {
  const theme = useTheme();
  const { themeWishData } = useSettingsContext();
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
  return (
    <>
      <Wrappers>
        <HeaderBox>
          <PageTitle>{translate('찜목록')}</PageTitle>
          <Accent style={{ background: theme.palette.primary.main }} />
          <CountText>{`${wishList.length} ${translate('개')}`}</CountText>
        </HeaderBox>
        {wishList.length > 0 ?
          <>
            <Items items={wishList} router={router} />
          </>
          :
          <>
            <EmptyBox>
              <Icon icon={'basil:cancel-outline'} style={{ fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
              <EmptyText>{translate('찜한 상품이 없습니다.')}</EmptyText>
              <Button
                variant="outlined"
                sx={{ height: '44px', minWidth: '200px', letterSpacing: '0.04em' }}
                onClick={() => router.push('/shop')}
              >
                {translate('쇼핑 계속하기')}
              </Button>
            </EmptyBox>
          </>}
      </Wrappers>
    </>
  )
}
export default WishDemo
