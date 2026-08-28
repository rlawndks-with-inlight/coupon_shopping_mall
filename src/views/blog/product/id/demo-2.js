import { Icon } from '@iconify/react';
import ProductAddons from 'src/components/elements/shop/ProductAddons';
import { requiredGroups } from 'src/data/product-options';
import { Select, MenuItem, Drawer, FormControl, InputLabel, Button, Avatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import styled from 'styled-components'
import _ from 'lodash'
import { commarNumber, commarNumberWithUnit, getPriceUnitByLang, isPurchasable, getProductStatus } from 'src/utils/function';
import Slider from 'react-slick';
import { useTheme } from '@emotion/react';
import { logoSrc } from 'src/data/data';
import dynamic from 'next/dynamic';
import { apiManager, apiShop } from 'src/utils/api';
import { insertCartDataUtil, selectItemOptionUtil, 배송비표시 } from 'src/utils/shop-util';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import toast from 'react-hot-toast';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { ProductDetailsReview } from 'src/views/@dashboard/e-commerce/details';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import QuantityStepper from 'src/components/elements/shop/QuantityStepper';
import DetailNotices from 'src/components/elements/shop/DetailNotices';
import OrderFormFields from 'src/components/elements/shop/OrderFormFields';


const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})
const Wrappers = styled.div`
max-width: 720px;
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
const Demo2 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { translate, currentLang } = useLocales();
    const { themeMode, themeCartData, onChangeCartData, themeDnsData } = useSettingsContext();
    const { user } = useAuthContext();
    const theme = useTheme();

    const [item, setItem] = useState({});
    const [scrollY, setScrollY] = useState(0);
    const [cartOpen, setCartOpen] = useState(false)
    const [selectOptions, setSelectOptions] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [selectProductGroups, setSelectProductGroups] = useState({
        count: 1,
        groups: [],
    });
  // 주문 추가 입력항목(행사일 등)의 값. 담기·바로구매 때 상품에 실어 보낸다.
  const [orderFormValues, setOrderFormValues] = useState({});

    const [tab, setTab] = useState(0)
    const [reviewPage, setReviewPage] = useState(1)
    const [reviewContent, setReviewContent] = useState({})
    const [reviewTotal, setReviewTotal] = useState(0)

    useEffect(() => {
        pageSetting(1);
    }, [])

    const pageSetting = async (review_page) => {

        let product = await apiShop('product', 'get', {
            id: router.query?.id
        })
        if (product) {
            product['images'] = [...[product?.product_img], ...product?.sub_images.map(item => { return item.product_sub_img })];
            setItem(product)
            //console.log(product)

            setReviewPage(review_page)

            let review_data = await apiManager('product-reviews', 'list', {
                page: review_page,
                product_id: router.query?.id,
                page_size: 10,
            })
            setReviewContent(review_data)
            setReviewTotal(review_data.total)
            //console.log(reviewContent)
        }
    }

    /*
    useEffect(() => {
      let data = test_item
      data['images'].unshift(data?.product_img);
      setItem(data)
    }, [])
  */

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

    // 살 수 있는 상태인지(판매중·새상품만 구매 가능). 상태맵은 프레임1·3과 같은 것을 쓴다.
    const purchasable = isPurchasable(item?.status);
    const productStatusText = getProductStatus(item?.status)?.text;
    const handleAddCart = async () => {
        //옵션 체크 안해도 저장 되는데 이 부분은 수정할 여지가 있어보임
        let result = await insertCartDataUtil({ ...item, seller_id: router.query?.seller_id ?? 0 , order_form_values: orderFormValues }, selectProductGroups, themeCartData, onChangeCartData);
        if (result) {
            toast.success(translate("장바구니에 성공적으로 추가되었습니다."))
            window.location.reload()
        }
    };
    const onSelectOption = (group, option, is_option_multiple) => {
        let select_product_groups = selectItemOptionUtil(group, option, selectProductGroups, is_option_multiple);
        console.log(select_product_groups)
        setSelectProductGroups(select_product_groups);
        //console.log(select_product_groups)
    }

    const [buyOpen, setBuyOpen] = useState(false);
    return (
        <>
            <DialogBuyNow
                buyOpen={buyOpen}
                setBuyOpen={setBuyOpen}
                product={{ ...item, order_form_values: orderFormValues }}
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
                    {/* 상품명은 lang_obj 번역본을 우선 표시한다(번역이 없으면 formatLang 이 원문을 그대로 반환). */}
                    <ItemName>{formatLang(item, 'product_name', currentLang)}</ItemName>
                    <Divider />
                    <PriceContainer>
                        {item.product_sale_price < item.product_price &&
                            <>
                                <Row style={{ alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: themeObj.font_size.size8, fontWeight: 'bold', color: theme.palette.error.main }}>{parseInt((item.product_price - item.product_sale_price) / item.product_price * 100)}%</div>
                                    <div style={{ marginLeft: '0.5rem', fontSize: themeObj.font_size.size9, textDecoration: 'line-through', color: themeObj.grey[500] }}>{commarNumberWithUnit(item.product_price)}</div>
                                </Row>

                            </>}
                        {/* '몇 명 구매'(products.buying_count) 표시를 제거했다.
                            컬럼은 DB 에 있지만 백엔드에 값을 증가시키는 코드가 없어 항상 초기값만 찍히는 유령 지표다.
                            지운 div 는 marginLeft:'auto' 로 오른쪽 끝에 있던 요소라, 남은 금액/원 은 왼쪽 정렬 그대로 유지된다. */}
                        <Row style={{ alignItems: 'flex-end', fontWeight: 'bold' }}>
                            <div style={{ fontSize: themeObj.font_size.size6, color: '' }}>{commarNumber(item.product_sale_price)}</div>
                            <div style={{ fontSize: themeObj.font_size.size8, marginLeft: '0.25rem' }}>{getPriceUnitByLang()}</div>
                        </Row>
                        <Divider style={{ margin: '1rem 0' }} />
                        {/* 배송정보 묶음 — 다른 프레임과 같은 표(DetailNotices)를 쓴다.
                            예전에는 이 프레임만 자기 라벨 칸을 따로 그려서, 톤·정렬을 다른 5개와
                            공유하지 않았다(라벨이 길어지면 여기만 어긋난다). 제목 '배송정보' 는 남긴다 —
                            이 프레임의 특징이고, 표는 그 아래에 들어간다. */}
                        <Row style={{ alignItems: 'flex-end', }}>
                            <div style={{ fontSize: themeObj.font_size.size8, color: '', fontWeight: 'bold', marginBottom: '0.5rem' }}>{translate('배송정보')}</div>
                        </Row>
                        <DetailNotices item={item} sx={{ marginBottom: '0.5rem' }} />
              {/* 주문 추가 입력항목 — 서식이 걸린 몰에서만 나타난다 */}
              <OrderFormFields product={item} values={orderFormValues} onChange={setOrderFormValues} sx={{ mt: 2 }} />
                    </PriceContainer>
                    {/* 품절·중단됨을 상세에서 바로 알린다 — 예전엔 표시도 없고 버튼도 살아 있어
                        옵션 창까지 열고 나서야 살 수 없다는 걸 알았다. */}
                    {!purchasable && productStatusText &&
                      <div style={{ padding: '10px 14px', marginBottom: '0.5rem', borderRadius: '6px', background: '#f5f5f5', color: '#666', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
                        {translate(productStatusText)}
                      </div>
                    }
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
                        <Row style={{ width: '100%', marginBottom: '1rem', paddingTop: '1rem' }}>
                            {/* ShopGo 산하는 상품후기를 쓰지 않는다.
                                후기 탭을 숨길 땐 '상품정보'가 남은 폭을 다 쓰게 해야
                                반쪽짜리 탭 하나가 덩그러니 남지 않는다. */}
                            {/* 상품 스펙 — 가맹점이 상품폼에 적어도 프레임1 말고는 어디에도 나오지 않던 값이다. */}
                            {formatLang(item, 'product_spec', currentLang) &&
                              <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '14px', color: '#666', background: '#f7f7f7', borderRadius: '6px', padding: '16px', margin: '0 0 1rem 0' }}>
                                {formatLang(item, 'product_spec', currentLang)}
                              </div>
                            }
                            <div style={{ padding: '0 0 1rem 0', fontSize: themeObj.font_size.size8, fontWeight: 'bold', cursor: 'pointer', width: `${isShopgoBrand(themeDnsData) ? '100%' : '50%'}`, textAlign: 'center', borderBottom: `${tab == 0 ? '2px solid black' : ''}` }} onClick={() => { setTab(0) }}>{translate('상품정보')}</div>
                            {!isShopgoBrand(themeDnsData) &&
                                <div style={{ padding: '0 0 1rem 0', fontSize: themeObj.font_size.size8, fontWeight: 'bold', cursor: 'pointer', width: '50%', textAlign: 'center', borderBottom: `${tab == 1 ? '2px solid black' : ''}` }} onClick={() => { setTab(1) }}>
                                    상품후기({reviewTotal})
                                </div>}
                        </Row>
                        {
                            tab == 0 ?
                                <>
                                    <ReactQuill
                                        className='none-padding'
                                        value={formatLang(item, 'product_description', currentLang) ?? `<body></body>`}
                                        readOnly={true}
                                        theme={"bubble"}
                                        bounds={'.app'}
                                    />
                                </>
                                :
                                <>
                                    <ProductDetailsReview product={{ ...item, order_form_values: orderFormValues }} reviewContent={reviewContent} onChangePage={pageSetting} reviewPage={reviewPage} />,
                                </>

                        }
                    </ContentContainer>
                </ContentWrappers>
            </Wrappers >
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
                    {/* <FormControl sx={{ width: '100%' }}>
                        <InputLabel>컬러</InputLabel>
                        <Select
                            label='컬러'
                            sx={{
                                width: '100%'
                            }}
                            placeholder='컬러'
                            onChange={(e) => {
                                if (e.target.value) {
                                    if (_.findIndex(selectOptions, { id: e.target.value }) < 0) {
                                        setSelectOptions([...selectOptions, {
                                            id: e.target.value,
                                            count: 1
                                        }])
                                    }
                                }
                            }}
                        >
                            {test_color_list.map((data) => (
                                <MenuItem
                                    key={data?.name}
                                    value={data?.id}
                                    onClick={() => {
                                        let find_index = _.findIndex(selectOptions, { id: data?.id });
                                        if (find_index < 0) {
                                            setSelectOptions([...selectOptions, {
                                                id: data?.id,
                                                count: 1
                                            }])
                                        } else {
                                            let select_options = [...selectOptions];
                                            select_options[find_index].count++;
                                            setSelectOptions(select_options);
                                        }
                                    }}
                                >{data?.name} {data.price > 0 ? '+' + commarNumber(data.price) : ''}</MenuItem>
                            ))}
                        </Select>
                    </FormControl> */}
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
                                {/* <Typography variant="subtitle2" sx={{ height: 40, lineHeight: '40px', flexGrow: 1 }}>
                                    {formatLang(group, 'group_name')}
                                </Typography>
                                <FormControl size='small'>
                                    <InputLabel id="demo-simple-select-label">{translate('선택')}</InputLabel>
                                    <Select
                                        name="size"
                                        size="small"
                                        sx={{
                                            minWidth: 96,
                                            '& .MuiFormHelperText-root': {
                                                mx: 0,
                                                mt: 1,
                                                textAlign: 'right',
                                            },
                                        }}
                                        label={translate("선택")}
                                        onChange={(e) => {
                                            onSelectOption(group, e.target.value)
                                        }}
                                    >
                                        {group?.options && group?.options.map((option) => (
                                            <MenuItem key={formatLang(option, 'option_name')} value={option}>
                                                {formatLang(option, 'option_name')}
                                                {(option?.option_price > 0 || option?.option_price < 0) ? ` (${option?.option_price > 0 ? '+' : ''}${commarNumber(setProductPriceByLang(option, 'option_price', price_lang, currentLang?.value))})` : ''}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl> */}
                            </Stack>
                        </>
                    ))}
                    {/* 추가상품 — 안 골라도 살 수 있다. 프레임 전체가 같은 컴포넌트를 쓴다. */}
                    <ProductAddons product={item} selected={selectProductGroups} onSelect={onSelectOption} style={{ marginTop: "0.75rem" }} />
                    {/* {selectOptions.map((option, idx) => (
                        <>
                            <DrawerBox>
                                <Row style={{ justifyContent: 'space-between' }}>
                                    <div>{formatLang(option, 'option_name')}</div>
                                    <Icon icon='fluent-mdl2:cancel' style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            let select_options = [...selectOptions];
                                            let find_index = _.findIndex(selectOptions, { id: item?.id });
                                            select_options.splice(find_index, 1);
                                            setSelectOptions(select_options)
                                        }} />
                                </Row>
                                <Row style={{ justifyContent: 'space-between' }}>
                                    <Row style={{ border: `1px solid ${themeObj.grey[300]}`, width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>
                                        <Icon icon='ic:baseline-minus' style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                let select_options = [...selectOptions];
                                                let find_index = _.findIndex(selectOptions, { id: item?.id });
                                                if (select_options[find_index].count == 1) {
                                                    select_options.splice(find_index, 1);
                                                    setSelectOptions(select_options)
                                                } else {
                                                    select_options[find_index].count--;
                                                    setSelectOptions(select_options)
                                                }

                                            }} />
                                        <div>{item.count}</div>

                                        <Icon icon='ic:baseline-plus' style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                let select_options = [...selectOptions];
                                                let find_index = _.findIndex(selectOptions, { id: item?.id });
                                                select_options[find_index].count++;
                                                setSelectOptions(select_options)
                                            }} />
                                    </Row>
                                    <div>{commarNumberWithUnit((test_item.product_sale_price + _.find(test_color_list, { id: item?.id }).price) * (item.count))}</div>

                                </Row>
                            </DrawerBox>
                        </>
                    ))} */}

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
                    {/* 수량 — 이 프레임엔 수량 UI 가 없어서 상세에서 담으면 늘 1개였다.
                        selectProductGroups.count 는 담기·바로구매 양쪽이 이미 읽는다. */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                      <div>{translate('수량')}</div>
                      <QuantityStepper
                        value={selectProductGroups?.count ?? 1}
                        onChange={(count) => setSelectProductGroups((prev) => ({ ...prev, count }))}
                      />
                    </div>
                    <Button
                        variant='outlined'
                        color='primary'
                        disabled={!purchasable}
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
                        disabled={!purchasable}
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
            <Dialog
                open={dialogOpen}
                onClose={() => { setDialogOpen(false) }}
                fullWidth
                PaperProps={{
                    sx: {
                        maxWidth: '540px',
                        width: '90vw'
                    }
                }}
            >
                {dialogType == 0 ?
                    <>
                        <DialogTitle
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0 0 1.5rem 1.5rem'
                            }}
                        >
                            <img src={logoSrc()} style={{ height: '56px', width: 'auto' }} />
                            <IconButton
                                sx={{}}
                                onClick={() => {
                                    setDialogOpen(false)
                                }}
                            >
                                <Icon icon={'ic:round-close'} fontSize={'2.5rem'} />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent
                            style={{ textAlign: 'center', marginBottom: '4%' }}
                        >{translate('로그인하시면')}<br />{translate('장바구니 이용이 가능합니다!')}</DialogContent>
                        <DialogActions>
                            <DialogBox>
                                <Button
                                    variant='contained'
                                    size='large'
                                    sx={{ marginBottom: '2%' }}
                                    onClick={() => { router.push('/shop/auth/login') }}>{translate('로그인하기')}</Button>
                                <Button
                                    variant='outlined'
                                    size='large'
                                    onClick={() => { setDialogOpen(false) }}>{translate('돌아가기')}</Button>
                            </DialogBox>
                        </DialogActions>
                    </>
                    :
                    <>
                        <DialogTitle
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0 0 1.5rem 1.5rem'
                            }}
                        >
                            <img src={logoSrc()} style={{ height: '56px', width: 'auto' }} />
                            <IconButton
                                sx={{}}
                                onClick={() => {
                                    setDialogOpen(false)
                                }}
                            >
                                <Icon icon={'ic:round-close'} fontSize={'2.5rem'} />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent
                            style={{ textAlign: 'center', marginBottom: '4%' }}
                        >{translate('로그인하시면')}<br />{translate('더 편하게 구매 가능합니다!')}</DialogContent>
                        <DialogActions>
                            <DialogBox>
                                <Button
                                    variant='contained'
                                    size='large'
                                    sx={{ marginBottom: '2%' }}
                                    onClick={() => { router.push('/shop/auth/login') }}>{translate('로그인하기')}</Button>
                                <Button
                                    variant='outlined'
                                    size='large'
                                    onClick={() => { setDialogOpen(false) }}>{translate('비회원으로 구매할게요')}</Button>
                            </DialogBox>
                        </DialogActions>
                    </>
                }
            </Dialog>
        </>
    )
}

export default Demo2
