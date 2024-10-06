import { Icon } from '@iconify/react';
import { Select, MenuItem, Drawer, FormControl, InputLabel, Button, Avatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { test_categories, test_items, test_seller } from 'src/data/test-data';
import styled from 'styled-components'
import _ from 'lodash'
import { commarNumber } from 'src/utils/function';
import Slider from 'react-slick';
import { useTheme } from '@emotion/react';
import { logoSrc } from 'src/data/data';
import dynamic from 'next/dynamic';
import { apiManager, apiShop } from 'src/utils/api';
import { insertCartDataUtil, selectItemOptionUtil } from 'src/utils/shop-util';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import toast from 'react-hot-toast';
import { useLocales } from 'src/locales';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { ProductDetailsReview } from 'src/views/@dashboard/e-commerce/details';


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

const test_item = {
    product_name: '[국내제작/고퀄/보풀X]플레인 나시 - t',
    product_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/6/29/thumb@1080_1687996041-a03a48a3-6c08-4856-9aa9-15d05fa9c444.jpeg',
    product_price: 20000,
    product_sale_price: 18000,
    content: "<p><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543362484-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543365336-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543369919-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543372457-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543375175-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543377838-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543380642-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543383596-note.png\"></p><p><br></p><p><span class=\"ql-size-small\">#2차전지 #전기차 #리튬 #미국 #중국 #패권다툼 #반도체 규제 #주요 광물 #수출 #규제 #갈륨 #게르마늄 #아연 #희토류 #클라우딩 컴퓨터 서비스 #중국 #제재 #아마존 #마이크로소프트 #인공지능 반도체 #삼성전자 #최첨단 반도체 #AI 반도체 #삼성 파운드리 포럼 2023 #SAFE 포럼 2023 #2나노 #3나노 #공정설계키트 #팹리스 #파운드리 #생태계 강화 #자동차 #현대차 #기아 #친환경차 #전기차 #수소차 #미국 인플레이션감축법 #IRA #의료AI #캔서문샷 #사우디아라비아 #비전2030 #SEHA 가상병원 #프로젝트 참여</span></p><p><br></p><p><span class=\"ql-size-small\">#리튬 관련주 #STX #금양 #코스모화학 #강원에너지 #이브이첨단소재 #코스모신소재</span></p><p><span class=\"ql-size-small\">#희토류 관련주 #유니온 #삼화전자 #대원화성 #유니온머티리얼 #티플랙스 #동국알앤에스</span></p><p><span class=\"ql-size-small\">#클라우드 관련주 #솔트웨어 #데이타솔루션 #덕산하이메탈 #오픈베이스 #케이아이엔엑스 #파이오링크</span></p><p><span class=\"ql-size-small\">#반도체 관련주 #가온칩스 #동운아나텍 #마이크로투나노 #유니퀘스트 #코아시아 #에이디테크놀로지</span></p><p><span class=\"ql-size-small\">#자동차 관련주 #서연이화 #KG모빌리티 #트루윈 #한주라이트메탈 #아진산업 #화신</span></p><p><span class=\"ql-size-small\">#의료AI 관련주 #루닛 #비올 #제이엘케이 #뷰노 #딥노이드 #신한제7호스팩</span></p>",
    images: [
        'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299885-c8ca43a2-dca0-4428-8d39-25831173de5d.jpeg',
        'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299886-f9f50ad1-22e0-4cf3-8c88-67dbc433a838.jpeg',
        'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299886-eeae94f7-9cd0-46da-9cdb-dac47a64806d.jpeg'
    ],
    seller: {
        id: 123,
        profile_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2021/7/5/thumb@1080_1625479198-59043e92-67de-46b1-8755-f21c5ca0a9ae.jpg',
        nickname: 'Merrymond'
    }
}

const test_color_list = [
    { id: 1, name: "블랙", price: 0 },
    { id: 2, name: "베이지", price: 500 },
    { id: 3, name: "크림", price: 1500 },
]


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
    const { themeMode, themeCartData, onChangeCartData } = useSettingsContext();
    const { user } = useAuthContext();
    const theme = useTheme();

    const [item, setItem] = useState({});
    const [scrollY, setScrollY] = useState(0);
    const [cartOpen, setCartOpen] = useState(false)
    const [selectOptions, setSelectOptions] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [product, setProduct] = useState();
    const [selectProductGroups, setSelectProductGroups] = useState({
        count: 1,
        groups: [],
    });
    const product_id = parseInt(document.location.href.split('/').reverse()[1])

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

    const getTotalPrice = () => {
        let total_price = 0;
        for (var i = 0; i < selectOptions.length; i++) {
            let find_item = _.find(test_color_list, { id: selectOptions[i]?.id });
            total_price += (test_item.product_sale_price + find_item?.price) * selectOptions[i]?.count;
        }
        return total_price
    }

    const handleAddCart = async () => {
        //옵션 체크 안해도 저장 되는데 이 부분은 수정할 여지가 있어보임
        if (user) {
            let result = await insertCartDataUtil({ ...item, seller_id: router.query?.seller_id ?? 0 }, selectProductGroups, themeCartData, onChangeCartData);
            if (result) {
                toast.success(translate("장바구니에 성공적으로 추가되었습니다."))
                window.location.reload()
            }
        } else {
            toast.error(<PointerText onClick={() => router.push('/shop/auth/login')}>{translate('로그인을 해주세요.')}</PointerText>);
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
                product={item}
                selectProductGroups={selectProductGroups}
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
                }}>
                    <ItemName>{item.product_name}</ItemName>
                    <Divider />
                    <PriceContainer>
                        {item.product_sale_price < item.product_price &&
                            <>
                                <Row style={{ alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: themeObj.font_size.size8, fontWeight: 'bold', color: theme.palette.error.main }}>{parseInt((item.product_price - item.product_sale_price) / item.product_price * 100)}%</div>
                                    <div style={{ marginLeft: '0.5rem', fontSize: themeObj.font_size.size9, textDecoration: 'line-through', color: themeObj.grey[500] }}>{commarNumber(item.product_price)}원</div>
                                </Row>

                            </>}
                        <Row style={{ alignItems: 'flex-end', fontWeight: 'bold' }}>
                            <div style={{ fontSize: themeObj.font_size.size6, color: '' }}>{commarNumber(item.product_sale_price)}</div>
                            <div style={{ fontSize: themeObj.font_size.size8, marginLeft: '0.25rem' }}>원</div>
                            <div style={{ fontSize: themeObj.font_size.size8, marginLeft: 'auto', fontWeight: 'normal', color: themeObj.grey[500] }}>{item?.buying_count}명 구매</div>
                        </Row>
                        <Divider style={{ margin: '1rem 0' }} />
                        <Row style={{ alignItems: 'flex-end', }}>
                            <div style={{ fontSize: themeObj.font_size.size8, color: '', fontWeight: 'bold', marginBottom: '0.5rem' }}>배송정보</div>
                        </Row>
                        <Row style={{ alignItems: 'flex-end', }}>
                            <div style={{ fontSize: themeObj.font_size.size8, color: '' }}>배송비 : <span style={{ color: theme.palette.error.main }}>3000원</span></div>
                        </Row>
                        <Row style={{ alignItems: 'flex-end', }}>
                            <div style={{ fontSize: themeObj.font_size.size8, color: '' }}>합배송 무제한</div>
                        </Row>
                        <Row style={{ alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: themeObj.font_size.size8, color: '' }}>CJ대한통운</div>
                        </Row>
                    </PriceContainer>
                    <Button variant='contained' onClick={() => { setCartOpen(true) }}>
                        구매하기
                    </Button>
                    <div style={{ marginTop: '1rem' }} />
                    <Divider />
                    <ContentContainer>
                        <Row style={{ width: '100%', marginBottom: '1rem', paddingTop: '1rem' }}>
                            <div style={{ padding: '0 0 1rem 0', fontSize: themeObj.font_size.size8, fontWeight: 'bold', cursor: 'pointer', width: '50%', textAlign: 'center', borderBottom: `${tab == 0 ? '2px solid black' : ''}` }} onClick={() => { setTab(0) }}>
                                상품정보
                            </div>
                            <div style={{ padding: '0 0 1rem 0', fontSize: themeObj.font_size.size8, fontWeight: 'bold', cursor: 'pointer', width: '50%', textAlign: 'center', borderBottom: `${tab == 1 ? '2px solid black' : ''}` }} onClick={() => { setTab(1) }}>
                                상품후기({reviewTotal})
                            </div>
                        </Row>
                        {
                            tab == 0 ?
                                <>
                                    <ReactQuill
                                        className='none-padding'
                                        value={item?.product_description ?? `<body></body>`}
                                        readOnly={true}
                                        theme={"bubble"}
                                        bounds={'.app'}
                                    />
                                </>
                                :
                                <>
                                    <ProductDetailsReview product={item} reviewContent={reviewContent} onChangePage={pageSetting} reviewPage={reviewPage} />,
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
                                {/* <Typography variant="subtitle2" sx={{ height: 40, lineHeight: '40px', flexGrow: 1 }}>
                                    {group?.group_name}
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
                                            <MenuItem key={option?.option_name} value={option}>
                                                {option?.option_name}
                                                {(option?.option_price > 0 || option?.option_price < 0) ? ` (${option?.option_price > 0 ? '+' : ''}${commarNumber(setProductPriceByLang(option, 'option_price', price_lang, currentLang?.value))})` : ''}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl> */}
                            </Stack>
                        </>
                    ))}
                    {/* {selectOptions.map((option, idx) => (
                        <>
                            <DrawerBox>
                                <Row style={{ justifyContent: 'space-between' }}>
                                    <div>{option?.option_name}</div>
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
                                    <div>{commarNumber((test_item.product_sale_price + _.find(test_color_list, { id: item?.id }).price) * (item.count))}원</div>

                                </Row>
                            </DrawerBox>
                        </>
                    ))} */}

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
                            if (user) {
                                setBuyOpen(true);
                            } else {
                                toast.error('로그인을 해주세요.')
                            }
                        }}
                    >바로구매</Button>
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
                        >로그인하시면<br />장바구니 이용이 가능합니다!
                        </DialogContent>
                        <DialogActions>
                            <DialogBox>
                                <Button
                                    variant='contained'
                                    size='large'
                                    sx={{ marginBottom: '2%' }}
                                    onClick={() => { router.push('/blog/auth/login') }}>로그인하기</Button>
                                <Button
                                    variant='outlined'
                                    size='large'
                                    onClick={() => { setDialogOpen(false) }}>돌아가기</Button>
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
                        >로그인하시면<br />더 편하게 구매 가능합니다!</DialogContent>
                        <DialogActions>
                            <DialogBox>
                                <Button
                                    variant='contained'
                                    size='large'
                                    sx={{ marginBottom: '2%' }}
                                    onClick={() => { router.push('/blog/auth/login') }}>로그인하기</Button>
                                <Button
                                    variant='outlined'
                                    size='large'
                                    onClick={() => { setDialogOpen(false) }}>비회원으로 구매할게요</Button>
                            </DialogBox>
                        </DialogActions>
                    </>
                }
            </Dialog>
        </>
    )
}

export default Demo2
