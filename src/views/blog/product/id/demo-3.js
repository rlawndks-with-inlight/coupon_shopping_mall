// 판매자 영역 삭제로 Avatar 를 더 이상 쓰지 않아 import 에서 뺐다.
import ProductAddons from 'src/components/elements/shop/ProductAddons';
import { requiredGroups } from 'src/data/product-options';
import { Select, MenuItem, Drawer, FormControl, InputLabel, Button, Divider, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import styled from 'styled-components'
import _ from 'lodash'
import { commarNumber, commarNumberWithUnit, getPriceUnitByLang, isPurchasable } from 'src/utils/function';
import Slider from 'react-slick';
import { useTheme } from '@emotion/react';
import dynamic from 'next/dynamic';
import { apiShop } from 'src/utils/api';
import { insertCartDataUtil, selectItemOptionUtil, 배송비표시 } from 'src/utils/shop-util';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import toast from 'react-hot-toast';
import { useLocales } from 'src/locales';
import ShippingLine from 'src/components/elements/shop/ShippingLine';
import DeliveryNotice from 'src/components/elements/shop/DeliveryNotice';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { formatLang } from 'src/utils/format';


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
/* 헤더가 더 이상 사진 위에 투명하게 얹히지 않는다(로고가 보이는 보통 헤더로 통일).
   그래서 첫 화면이 헤더에 가리지 않도록 헤더 높이만큼 띄운다.
   이 프레임의 헤더는 position:fixed 이고 높이가 56px 다(레이아웃 주석 참고). */
padding-top:56px;
`
const BannerImg = styled.div`
/* 상품 사진은 자르지 않는다 — 가로로 긴 상자에 cover 를 걸어 두어서
   세로로 긴 사진은 위아래가 잘려 나갔다(가맹점 신고 2026-08-21, 프레임3·4).
   배너와 같은 규칙이다: 비율이 다르면 잘리는 대신 여백이 생긴다.
   프레임5·6 은 원래부터 object-fit:contain 이라 이 문제가 없었다. */
background-color:#f7f7f7;
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

const DialogBox = styled.div`
display:flex;
flex-direction:column;
margin: 0 auto;
width:100%;
`


// 상품별 메인페이지 김인욱
const Demo3 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { translate } = useLocales();
    const { themeMode, themeCartData, onChangeCartData, themePostCategoryList } = useSettingsContext();
  // 목록은 마이페이지 '고객센터'에서 게시판으로 들어가면 그대로 보이므로 메뉴에서 뺐고,
  // 여기 버튼은 실제로 글을 쓰는 화면으로 보낸다. 게시판이 없으면 예전 경로로 폴백.
    const { user } = useAuthContext();

    const theme = useTheme();

    const [item, setItem] = useState({});
    const [scrollY, setScrollY] = useState(0);
    const [cartOpen, setCartOpen] = useState(false)
    const [selectProductGroups, setSelectProductGroups] = useState({
        count: 1,
        groups: [],
    });
    const [buyOpen, setBuyOpen] = useState(false);

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

    // 살 수 있는 상태인지(판매중·새상품만). 다른 프레임은 이미 이 판정을 쓰고 있었는데
    // 이 프레임만 빠져 있어 품절 상품도 버튼이 살아 있었다.
    const purchasable = isPurchasable(item?.status);

    const handleAddCart = async () => {
        // 비회원도 장바구니 담기 허용
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
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                            }} />
                        </>
                    ))}
                </Slider>
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
                                    <div style={{ marginLeft: '0.5rem', fontSize: themeObj.font_size.size9, textDecoration: 'line-through', color: themeObj.grey[500] }}>{commarNumberWithUnit(item.product_price)}</div>
                                </Row>

                            </>}
                        <Row style={{ alignItems: 'flex-end', fontWeight: 'bold' }}>
                            <div style={{ fontSize: themeObj.font_size.size6, color: theme.palette.error.main }}>{commarNumber(item.product_sale_price)}</div>
                            <div style={{ fontSize: themeObj.font_size.size8, marginLeft: '0.25rem' }}>{getPriceUnitByLang()}</div>
                        </Row>
                    </PriceContainer>
                    {/* 배송비. 이 프레임도 구매 서랍에만 있어서, 가맹점이 배송비를 설정해도
                        손님은 '구매하기'를 누르기 전엔 볼 수 없었다(blog-1 과 같은 문제). */}
                    <ShippingLine item={item} />
                    {/* 배송 안내(가맹점별·SHOPGO 하위 전용) — 배송비 바로 아래. 둘은 한 묶음이라 떼어 놓지 않는다. */}
                    <DeliveryNotice />
                    {/* 장바구니를 서랍 안에만 두었더니 '담기 버튼이 없다'는 문의가 왔다(가맹점 2026-08-21).
                        살지 말지 고르는 자리에 담기가 없으면 손님은 그 몰에 담기가 없다고 읽는다.
                        옵션이 걸린 상품은 고를 자리가 있어야 하므로 서랍을 열고, 옵션이 없으면 바로 담는다. */}
                    <Row style={{ gap: '0.5rem' }}>
                      <Button variant='outlined' disabled={!purchasable} style={{ width: '38%' }}
                        onClick={() => { requiredGroups(item).length > 0 ? setCartOpen(true) : handleAddCart() }}>
                        {translate('장바구니')}
                      </Button>
                      <Button variant='contained' disabled={!purchasable} style={{ width: '62%' }}
                        onClick={() => { setCartOpen(true) }}>{translate('구매하기')}</Button>
                    </Row>
                    <div style={{ marginTop: '1rem' }} />
                    <Divider />
                    <ContentContainer>
                        <div style={{ padding: '0 0 1rem 0', fontSize: themeObj.font_size.size8, fontWeight: 'bold' }}>{translate('상품정보')}</div>
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
                    {requiredGroups(item).map((group) => (
                        <>
                            <Stack direction="row" justifyContent="space-between">
                                <FormControl sx={{ width: '100%' }}>
                                    <InputLabel>{formatLang(group, 'group_name')}</InputLabel>
                                    <Select
                                        label={formatLang(group, 'group_name')}
                                        sx={{
                                            width: '100%'
                                        }}
                                        placeholder={formatLang(group, 'group_name')}
                                        onChange={(e) => {
                                            onSelectOption(group, e.target.value)
                                        }}
                                    >
                                        {group?.options && group?.options.map((data) => (
                                            <MenuItem
                                                key={formatLang(data, 'option_name')}
                                                value={data}
                                            >{formatLang(data, 'option_name')} {data.option_price > 0 ? '+' + commarNumber(data.option_price) : ''}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </>
                    ))}
                    {/* 추가상품 — 안 골라도 살 수 있다. 프레임 전체가 같은 컴포넌트를 쓴다. */}
                    <ProductAddons product={item} selected={selectProductGroups} onSelect={onSelectOption} style={{ marginTop: "0.75rem" }} />
                    <DrawerBox style={{ borderBottom: 'none' }}>
                        <Row style={{ justifyContent: 'space-between' }}>
                            <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>{translate('상품 금액')}</Row>
                            <div>
                                <span style={{ color: 'red' }}>{commarNumber(item?.product_sale_price)}</span>원
                            </div>
                        </Row>
                        <Row style={{ justifyContent: 'space-between' }}>
                            <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>{translate('배송비')}</Row>
                            <div>
                                <span style={{ color: 'red' }}>{commarNumber(배송비표시(item).fee)}</span>원
                            </div>
                        </Row>
                        <Row style={{ justifyContent: 'space-between' }}>
                            <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>{translate('합계')}</Row>
                            <div>
                                <span style={{ color: 'red' }}>{commarNumber(parseInt((item?.product_sale_price ?? 0) + 배송비표시(item).fee))}</span>원
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
                    >{translate('장바구니')}</Button>
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
                    >{translate('바로구매')}</Button>
                </SelectContainer>
            </Drawer>
        </>
    )
}

export default Demo3
