import { Icon } from '@iconify/react';
import { Select, MenuItem, Drawer, FormControl, InputLabel, Button, Avatar, Divider, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { test_categories, test_items, test_seller } from 'src/data/test-data';
import styled from 'styled-components'
import _ from 'lodash'
import { commarNumber } from 'src/utils/function';
import Slider from 'react-slick';
import { useTheme } from '@emotion/react';
import dynamic from 'next/dynamic';
import { apiShop } from 'src/utils/api';
import { insertCartDataUtil, selectItemOptionUtil } from 'src/utils/shop-util';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import toast from 'react-hot-toast';
import { useLocales } from 'src/locales';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';


const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
const Wrappers = styled.div`
max-width: 840px;
width:100%;
margin: 0 auto 56px auto;
display:flex;
flex-direction:column;
position:relative;
`
const BannerImg = styled.div`
width:100%;
height:400px;
display:flex;
flex-direction:column;
align-items:center;

`
const ContentWrappers = styled.div`
top:350px;
display:flex;
flex-direction:column;
padding:1rem;
width:100%;
border-top-left-radius: 24px;
border-top-right-radius: 24px;
`
const ItemName = styled.div`
font-size:${themeObj.font_size.size6};
font-weight:bold;
padding:0.5rem 0;
`
const PriceContainer = styled.div`
padding:0.5rem 0;
display:flex;
flex-direction:column;
`
const ContentContainer = styled.div`
display:flex;
flex-direction:column;
padding:1rem 0;
`

const DrawerBox = styled.div`
width:100%;
border-bottom: 1px solid;
display:flex;
flex-direction:column;
padding:1rem 0;
`

const SelectContainer = styled.div`
padding:4rem 2.5% 0 2.5%;
`


// 상품별 메인페이지 김인욱
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate } = useLocales();
  const { themeMode, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();

  const theme = useTheme();

  const [item, setItem] = useState({});
  const [scrollY, setScrollY] = useState(0);
  const [cartOpen, setCartOpen] = useState(false)
  const [selectOptions, setSelectOptions] = useState([]);
  const [product, setProduct] = useState();
  const [buyOpen, setBuyOpen] = useState(false);
  const [selectProductGroups, setSelectProductGroups] = useState({
    count: 1,
    groups: [],
  });

  const product_id = parseInt(document.location.href.split('/').reverse()[1])

  useEffect(() => {
    pageSetting();
  }, [])

  const pageSetting = async () => {

    let product = await apiShop('product', 'get', {
      id: router.query?.id
    })
    if (product) {
      product['images'] = [...[product?.product_img], ...product?.sub_images.map(item => { return item.product_sub_img })];
      setItem(product)

    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollHeight = window.scrollY;
      setScrollY(currentScrollHeight)
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const sliderSetting = {
    infinite: true,
    speed: 500,
    autoplay: false,
    autoplaySpeed: 2500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  const handleAddCart = async () => {
    // 비회원도 장바구니 허용
    let result = await insertCartDataUtil({ ...item, seller_id: router.query?.seller_id ?? 0 }, selectProductGroups, themeCartData, onChangeCartData);
    if (result) {
      toast.success(translate("장바구니에 성공적으로 추가되었습니다."))
      window.location.reload()
    }
  };
  const onSelectOption = (group, option, is_option_multiple) => {
    let select_product_groups = selectItemOptionUtil(group, option, selectProductGroups, is_option_multiple);
    setSelectProductGroups(select_product_groups);
  }

  return (
    <>
      <DialogBuyNow
        buyOpen={buyOpen}
        setBuyOpen={setBuyOpen}
        product={item}
        selectProductGroups={selectProductGroups}
        is_blog={1}
      />

      <Wrappers>
        <Slider {...sliderSetting}>
          {item?.images && item?.images.map((item, idx) => (
            <>
              <BannerImg style={{
                backgroundImage: `url(${item})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }} />
            </>
          ))}
        </Slider>
        <ContentWrappers style={{
          background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
          position: 'absolute'
        }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ alignItems: 'center', cursor: 'pointer' }} onClick={() => { router.push(`/blog/seller/${item.seller?.id}`) }}>
              <Avatar src={item.seller?.profile_img} sx={{ width: '30px', height: '30px' }} />
              <div style={{ marginLeft: '0.25rem', fontSize: themeObj.font_size.size8 }}>{item.seller?.nickname}</div>
            </Row>
            <Button variant='outlined' onClick={() => router.push('/blog/auth/my-page/inquiry')} sx={{
              height: '30px',
            }}>
              1:1문의
            </Button>
          </Row>

        </ContentWrappers>
        <ContentWrappers style={{
          background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
        }}>
          <ItemName>{item.product_name}</ItemName>
          <Divider />
          <PriceContainer>
            {item.product_sale_price < item.product_price &&
              <>
                <Row style={{ alignItems: 'flex-end' }}>
                  <div style={{ fontSize: themeObj.font_size.size8, fontWeight: 'bold' }}>{parseInt((item.product_price - item.product_sale_price) / item.product_price * 100)}%</div>
                  <div style={{ marginLeft: '0.5rem', fontSize: themeObj.font_size.size9, textDecoration: 'line-through', color: themeObj.grey[500] }}>{commarNumber(item.product_price)}원</div>
                </Row>

              </>}
            <Row style={{ alignItems: 'flex-end', fontWeight: 'bold' }}>
              <div style={{ fontSize: themeObj.font_size.size6, color: theme.palette.error.main }}>{commarNumber(item.product_sale_price)}</div>
              <div style={{ fontSize: themeObj.font_size.size8, marginLeft: '0.25rem' }}>원</div>
            </Row>
          </PriceContainer>
          <Button variant='contained' onClick={() => { setCartOpen(true) }}>
            구매하기
          </Button>
          <div style={{ marginTop: '1rem' }} />
          <Divider />
          <ContentContainer>
            <div style={{ padding: '0 0 1rem 0', fontSize: themeObj.font_size.size8, fontWeight: 'bold' }}>상품정보</div>
            <ReactQuill
              className='none-padding'
              value={item?.product_description ?? `<body></body>`}
              readOnly={true}
              theme={"bubble"}
              bounds={'.app'}
            />
          </ContentContainer>
        </ContentWrappers>
      </Wrappers>
      <Drawer
        anchor={'bottom'}
        open={cartOpen}
        onClose={() => {
          setCartOpen(false);
          setSelectOptions([]);
        }}
        disableScrollLock={true}
        sx={{
          width: '100vw'
        }}
        PaperProps={{
          sx: {
            maxWidth: '840px',
            width: '100%',
            minHeight: '200px',
            margin: '0 auto',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            paddingBottom: '2rem',
            position: 'fixed'
          }
        }}
      >
        <SelectContainer>
          {(item?.groups ?? []).map((group) => (
            <>
              <Stack direction="row" justifyContent="space-between">
                <FormControl sx={{ width: '100%' }}>
                  <InputLabel>{group?.group_name}</InputLabel>
                  <Select
                    label={group?.group_name}
                    sx={{
                      width: '100%'
                    }}
                    placeholder={group?.group_name}
                    onChange={(e) => {
                      onSelectOption(group, e.target.value)
                    }}
                  >
                    {group?.options && group?.options.map((data) => (
                      <MenuItem
                        key={data?.option_name}
                        value={data}
                      >{data?.option_name} {data.option_price > 0 ? '+' + commarNumber(data.option_price) : ''}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </>
          ))}

          <DrawerBox style={{ borderBottom: 'none' }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>
                상품 금액
              </Row>
              <div>
                <span style={{ color: 'red' }}>{commarNumber(item?.product_sale_price)}</span>원
              </div>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>
                배송비
              </Row>
              <div>
                <span style={{ color: 'red' }}>{commarNumber(item?.delivery_fee)}</span>원
              </div>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>
                합계
              </Row>
              <div>
                <span style={{ color: 'red' }}>{commarNumber(parseInt(item?.product_sale_price + item?.delivery_fee))}</span>원
              </div>
            </Row>
          </DrawerBox>
          <Button
            variant='outlined'
            color='primary'
            style={{
              width: '30%',
              height: '56px',
              marginTop: '1rem',
              marginRight: '1%',
              fontSize: 'large'
            }}
            onClick={() => {
              handleAddCart()
            }}
          >장바구니</Button>
          <Button
            variant='contained'
            color='primary'
            style={{
              width: '69%',
              height: '56px',
              marginTop: '1rem',
              fontSize: 'large'
            }}
            onClick={() => {
              // 비회원도 바로구매 허용(주문서에서 비회원 주문비밀번호로 진행)
              setBuyOpen(true);
            }}
          >바로구매</Button>
        </SelectContainer>
      </Drawer>
    </>
  )
}

export default Demo1
