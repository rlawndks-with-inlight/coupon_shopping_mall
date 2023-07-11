import { Icon } from '@iconify/react';
import { Select, MenuItem, Drawer, FormControl, InputLabel, Button, Dialog, DialogContent, DialogActions, DialogTitle, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { SellerItem } from 'src/components/elements/blog/demo-1';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { test_categories, test_items, test_seller } from 'src/data/test-data';
import styled from 'styled-components'
import _ from 'lodash'
import { commarNumber } from 'src/utils/function';
import { logoSrc } from 'src/data/data';

const Wrappers = styled.div`
max-width: 840px;
width:100%;
margin: 0 auto;
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

const DialogBox = styled.div`
display:flex;
flex-direction:column;
margin: 0 auto;
width:100%;
`

const test_color_list = [
    { id: 1, name: "블랙", price: 0 },
    { id: 2, name: "베이지", price: 500 },
    { id: 3, name: "크림", price: 1500 },
]
const test_item_price = 20000;
// 셀러별 메인페이지 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { themeMode } = useSettingsContext();
    const test_seller_data = {
        seller: test_seller[0],
        banner: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2022/1/11/thumb@1080_1641873353-1ecca7c0-00a5-42fe-9d2a-8e79c7b29f75.jpeg',
        categories: test_categories,
    }

    const [sellerData, setSellerData] = useState({});
    const [categoryId, setCategoryId] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [cartOpen, setCartOpen] = useState(false);
    const [itemColor, setItemColor] = useState("");
    const [selectOptions, setSelectOptions] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");


    useEffect(() => {
        setSellerData(test_seller_data);
    }, [])
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
        setCartOpen(true);
    }

    const getTotalPrice = () => {
        let total_price = 0;
        for (var i = 0; i < selectOptions.length; i++) {
            let find_item = _.find(test_color_list, { id: selectOptions[i]?.id });
            total_price += (test_item_price + find_item?.price) * selectOptions[i]?.count;
        }
        return total_price
    }
    return (
        <>
            <Wrappers>
                <BannerImg style={{
                    backgroundImage: `url(${test_seller_data?.banner})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}>
                    <Title>{sellerData?.seller?.title}</Title>
                    <SubTitle>{sellerData?.seller?.sub_title}</SubTitle>
                    <Icon icon='fe:instagram' style={{
                        margin: '1rem',
                        fontSize: themeObj.font_size.size4,
                        color: '#fff'
                    }} />
                    <Row style={{
                        marginBottom: 'auto',
                    }}>
                        <SubTitle style={{ borderRight: '1px solid #fff', width: '65px' }}>공지사항</SubTitle>
                        <SubTitle style={{ width: '64px' }}>1:1문의</SubTitle>
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
                            }}
                        >All</Category>
                        {sellerData?.categories && sellerData?.categories.map((item, idx) => (
                            <>
                                <Category
                                    onClick={() => { setCategoryId(item?.id) }}
                                    style={{
                                        fontWeight: `${categoryId == item?.id ? 'bold' : ''}`,
                                        color: `${categoryId == item?.id ? '' : themeObj.grey[500]}`,
                                        borderBottom: `2px solid ${categoryId == item?.id ? `${themeMode == 'dark' ? '#fff' : '#000'}` : 'transparent'}`,
                                    }}
                                >{item.category_name}</Category>
                            </>
                        ))}
                    </CategoryContainer>
                </CategoryWrapper>
                <ItemContainer>
                    {test_items.map((item, idx) => (
                        <>
                            <SellerItem router={router} item={item} onClickCartButton={onClickCartButton} />
                        </>
                    ))}
                </ItemContainer>
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
                    <FormControl sx={{ width: '100%' }}>
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
                    </FormControl>
                    {selectOptions.map((item, idx) => (
                        <>
                            <DrawerBox>
                                <Row style={{ justifyContent: 'space-between' }}>
                                    <div>{_.find(test_color_list, { id: item?.id })?.name}</div>
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
                                    <div>{commarNumber((test_item_price + _.find(test_color_list, { id: item?.id }).price) * (item.count))}원</div>

                                </Row>
                            </DrawerBox>
                        </>
                    ))}
                    {selectOptions[0] ?
                        <>
                            <DrawerBox style={{ borderBottom: 'none' }}>
                                <Row style={{ justifyContent: 'space-between' }}>
                                    <Row style={{ width: '150px', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem' }}>
                                        <div>총 {_.sum(selectOptions.map(item => { return item.count }))}개 상품 금액</div>
                                    </Row>
                                    <div>
                                        <span style={{ color: 'red' }}>{commarNumber(getTotalPrice())}</span>원
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
                                    setDialogOpen(true)
                                    setDialogType(0)
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
                                    setDialogOpen(true)
                                    setDialogType(1)
                                }}
                            >바로구매</Button>
                        </> : ""
                    }
                </SelectContainer>
            </Drawer>
            <Dialog
                open={dialogOpen}
                onClose={() => { setDialogOpen(false) }}
                fullWidth
                PaperProps={{
                    sx: {
                        maxWidth: '840px'
                    }
                }}
            >
                {dialogType == 0 ?
                    <>
                        <DialogTitle
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}
                        >
                            <img src={logoSrc} style={{ height: '40px', width: 'auto' }} />
                            <IconButton
                                sx={{}}
                                onClick={() => {
                                    setDialogOpen(false)
                                }}
                            >
                                <Icon icon={'ic:round-close'} fontSize={'1.8rem'} />
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
                                justifyContent: 'space-between'
                            }}
                        >
                            <img src={logoSrc} style={{ height: '40px', width: 'auto' }} />
                            <IconButton
                                sx={{}}
                                onClick={() => {
                                    setDialogOpen(false)
                                }}
                            >
                                <Icon icon={'ic:round-close'} fontSize={'1.8rem'} />
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

export default Demo1
