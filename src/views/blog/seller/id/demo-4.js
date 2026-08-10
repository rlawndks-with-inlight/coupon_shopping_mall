import { Icon } from '@iconify/react';
import { Select, MenuItem, Drawer, FormControl, InputLabel, Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { SellerItem } from 'src/components/elements/blog/demo-1';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import styled from 'styled-components'
import _ from 'lodash'
import { commarNumber, getAllIdsWithParents, getDownToTopChildren } from 'src/utils/function';
import { apiManager, apiShop } from 'src/utils/api';
import { insertCartDataUtil, selectItemOptionUtil, startBuyNow } from 'src/utils/shop-util';
import toast from 'react-hot-toast';
import { formatLang } from 'src/utils/format';

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
const Title = styled.div`
color:#fff;
margin-top:auto;
margin-bottom:0.5rem;
font-size:${themeObj.font_size.size4};
font-weight:bold;
`
const SubTitle = styled.div`
color:#fff;
font-size:${themeObj.font_size.size9};
text-align:center;
`
const CategoryWrapper = styled.div`
position:absolute;
top:350px;
display:flex;
flex-direction:column;
padding:2.25rem 1rem 1rem 1rem;
width:100%;
border-top-left-radius: 24px;
border-top-right-radius: 24px;
`
const CategoryContainer = styled.div`
display:flex;
width:100%;
overflow-x:auto;
white-space:nowrap;
margin-top:1rem;
`
const Category = styled.div`
padding:0.25rem;
font-size:${themeObj.font_size.size9};
`
const ItemContainer = styled.div`
width:calc(100% - 32px);
margin: 5rem auto 0 auto;
display:flex;
flex-wrap:wrap;
column-gap:4%;
row-gap:1rem;
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

// 셀러별 메인페이지 김인욱
const Demo4 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { themeMode, themeCategoryList, themePostCategoryList, themeCartData, onChangeCartData } = useSettingsContext();

    const [sellerData, setSellerData] = useState({});
    const [sellerCategories, setSellerCategories] = useState([]);
    const [categoryId, setCategoryId] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [cartOpen, setCartOpen] = useState(false);
    const [products, setProducts] = useState([])
    const [selectedItem, setSelectedItem] = useState({});
    const [selectProductGroups, setSelectProductGroups] = useState({
        count: 1,
        groups: [],
    });

    useEffect(() => {
        pageSetting();
    }, [])

    const pageSetting = async () => {
        let seller_info = await apiManager('sellers', 'get', {
            id: router.query?.id
        })
        setSellerData(seller_info)
        let products = await apiShop('product', 'list', {
            page: 1,
            page_size: 1000,
            seller_id: router.query?.id
        })
        let category_list = [];
        for (var i = 0; i < products?.content.length; i++) {
            let top_category_id = getDownToTopChildren(products?.content[i]?.category_id, themeCategoryList[0]?.product_categories ?? []);
            if (!category_list.includes(top_category_id[0])) {
                category_list.push(top_category_id[0]);
            }
        }
        category_list = category_list.map((item => {
            return _.find(themeCategoryList, { id: parseInt(item) })
        }))
        setSellerCategories(category_list);
        setProducts(products?.content)
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
    const onClickCartButton = (item) => {
        setSelectedItem(item);
        setSelectProductGroups({
            count: 1,
            groups: [],
        });
        setCartOpen(true);
    }

    const onSelectOption = (group, option, is_option_multiple) => {
        let select_product_groups = selectItemOptionUtil(group, option, selectProductGroups, is_option_multiple);
        setSelectProductGroups(select_product_groups);
    }

    const handleAddCart = () => {
        // 비회원도 장바구니 담기 허용(로그인 유도 없이 실제 장바구니에 저장)
        let result = insertCartDataUtil({ ...selectedItem, seller_id: router.query?.id ?? 0 }, selectProductGroups, themeCartData, onChangeCartData);
        if (result) {
            toast.success('장바구니에 성공적으로 추가되었습니다.');
            setCartOpen(false);
        }
    }

    return (
        <>
            <Wrappers>
                <BannerImg style={{
                    backgroundImage: `url(${sellerData?.background_img})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}>
                    <Title>{sellerData?.nickname}</Title>
                    <SubTitle>{sellerData?.nickname}</SubTitle>
                    <Row style={{ margin: '1rem' }}>
                        {sellerData?.sns_obj?.instagram_id &&
                            <>
                                <Icon
                                    onClick={() => {
                                        window.location.href = `https://www.instagram.com/${sellerData?.sns_obj?.instagram_id}`
                                    }}
                                    icon='fe:instagram' style={{
                                        margin: '0.5rem',
                                        fontSize: themeObj.font_size.size4,
                                        color: '#fff',
                                        cursor: 'pointer'
                                    }} />
                            </>}
                        {sellerData?.sns_obj?.youtube_channel &&
                            <>
                                <Icon
                                    onClick={() => {
                                        window.location.href = `${sellerData?.sns_obj?.youtube_channel}`
                                    }}
                                    icon='fe:youtube'
                                    style={{
                                        margin: '0.5rem',
                                        fontSize: themeObj.font_size.size4,
                                        color: '#fff',
                                        cursor: 'pointer'
                                    }} />
                            </>}
                    </Row>

                    <Row style={{
                        marginBottom: 'auto',
                    }}>
                        {themePostCategoryList && themePostCategoryList.map((item, idx) => (
                            <>
                                <SubTitle style={{ borderRight: `${idx == themePostCategoryList.length - 1 ? 'none' : '1px solid #fff'}`, width: '65px' }}>{formatLang(item, 'post_category_title')}</SubTitle>
                            </>
                        ))}
                    </Row>
                </BannerImg>
                <CategoryWrapper style={{
                    background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
                    borderRadius: `${scrollY >= 350 ? '0' : ''}`,
                    position: `${scrollY >= 350 ? 'fixed' : ''}`,
                    top: `${scrollY >= 350 ? '0' : ''}`,
                    zIndex: 9
                }}>
                    {scrollY < 350 &&
                        <>
                            <div style={{ margin: '0 auto', fontSize: themeObj.font_size.size8 }}>Product</div>
                            <Icon icon='mdi:dot' style={{ margin: '0 auto' }} />
                        </>}
                    <CategoryContainer className='none-scroll'>
                        <Category onClick={() => { setCategoryId(0) }}
                            style={{
                                fontWeight: `${categoryId == 0 ? 'bold' : ''}`,
                                color: `${categoryId == 0 ? '' : themeObj.grey[500]}`,
                                borderBottom: `2px solid ${categoryId == 0 ? `${themeMode == 'dark' ? '#fff' : '#000'}` : 'transparent'}`,
                                cursor: 'pointer'
                            }}
                        >All</Category>
                        {sellerCategories && sellerCategories.map((item, idx) => (
                            <>
                                <Category
                                    onClick={() => { setCategoryId(item?.id) }}
                                    style={{
                                        fontWeight: `${categoryId == item?.id ? 'bold' : ''}`,
                                        color: `${categoryId == item?.id ? '' : themeObj.grey[500]}`,
                                        borderBottom: `2px solid ${categoryId == item?.id ? `${themeMode == 'dark' ? '#fff' : '#000'}` : 'transparent'}`,
                                        cursor: 'pointer'
                                    }}
                                >{formatLang(item, 'category_name')}</Category>
                            </>
                        ))}
                    </CategoryContainer>
                </CategoryWrapper>
                <ItemContainer>
                    {products.map((item, idx) => (
                        <>
                            {(categoryId == 0 || getDownToTopChildren(item?.category_id, themeCategoryList[0]?.product_categories ?? []).includes(categoryId)) &&
                                <>
                                    <SellerItem router={router} item={item} onClickCartButton={onClickCartButton} />
                                </>}
                        </>
                    ))}
                </ItemContainer>
            </Wrappers>
            <Drawer
                anchor={'bottom'}
                open={cartOpen}
                onClose={() => {
                    setCartOpen(false);
                    setSelectProductGroups({
                        count: 1,
                        groups: [],
                    });
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
                    {(selectedItem?.groups ?? []).map((group) => (
                        <>
                            <Stack direction="row" justifyContent="space-between" key={group?.id} sx={{ marginBottom: '1rem' }}>
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
                    <DrawerBox style={{ borderBottom: 'none' }}>
                        <Row style={{ justifyContent: 'space-between' }}>
                            <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>
                                상품 금액
                            </Row>
                            <div>
                                <span style={{ color: 'red' }}>{commarNumber(selectedItem?.product_sale_price)}</span>원
                            </div>
                        </Row>
                        <Row style={{ justifyContent: 'space-between' }}>
                            <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>
                                배송비
                            </Row>
                            <div>
                                <span style={{ color: 'red' }}>{commarNumber(selectedItem?.delivery_fee)}</span>원
                            </div>
                        </Row>
                        <Row style={{ justifyContent: 'space-between' }}>
                            <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>
                                합계
                            </Row>
                            <div>
                                <span style={{ color: 'red' }}>{commarNumber(parseInt((selectedItem?.product_sale_price ?? 0) + (selectedItem?.delivery_fee ?? 0)))}</span>원
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
                            startBuyNow({ ...selectedItem, seller_id: router.query?.id ?? 0 }, selectProductGroups, router)
                        }}
                    >바로구매</Button>
                </SelectContainer>
            </Drawer>
        </>
    )
}

export default Demo4
