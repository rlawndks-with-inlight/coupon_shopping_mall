import styled from 'styled-components'
import { Tab, Tabs, TextField, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Iconify from 'src/components/iconify/Iconify';
import { Icon } from '@iconify/react';
import { commarNumber } from 'src/utils/function';
import _, { set } from 'lodash'
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { test_items, test_seller, test_option_list } from 'src/data/test-data';
import { data } from 'jquery';

const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin: 56px auto 2rem auto;
width:90%;
@media (max-width:798px){
    width:100%;
    padding:5%;
}
`

const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
`

const ContentWrappers = styled.div`
display:flex;
flex-direction:column;
margin:0 auto;
padding-top: 5%;
width:100%;
`

const ChooseBox = styled.div`
display:flex;
justify-content:space-between;
`

const ChooseDelete = styled.span`
text-align:right;
font-size:1rem;
font-weight:regular;
margin:1.5rem 0 2rem 0;
color:gray;
text-decoration:underline;
cursor:pointer;
`

const ContentContainer = styled.div`
display:flex;
flex-direction:column;
padding:1rem;
`
const ItemBox = styled.div`
margin: 1rem 0;
`

const ContainerTitle = styled.div`
fontWeight:bold;
`

const test_cart = [
    {
        product_id: 64,
        option_id: 312,
        quantity: 2,
        seller_id: 3
    },
    {
        product_id: 64,
        option_id: 122,
        quantity: 3,
        seller_id: 3
    },
    {
        product_id: 66,
        option_id: 1112,
        quantity: 1,
        seller_id: 4
    },
]

// 장바구니 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { themeMode, themeDnsData } = useSettingsContext();
    const [sellerId, setSellerId] = useState(test_cart[0].seller_id)
    const [wantBuyList, setWantBuyList] = useState([]);
    const [cartList, setCartList] = useState([]);
    const [optionList, setOptionList] = useState([]);
    const [itemQuantity, setItemQuantity] = useState(0)
    const [priceSum, setPriceSum] = useState(0)
    const [deliveryFee, setDeliveryFee] = useState(0)
    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = () => {
        let cart_data = [...test_cart];
        let product_data = [...test_items];
        let seller_data = [...test_seller];
        let option_data = [...test_option_list];
        let option_list = [];
        for (var i = 0; i < option_data.length; i++) {
            option_list = [...option_list, ...option_data[i].children];
        }
        cart_data = cart_data.map((item) => {
            return {
                ...item,
                product: _.find(product_data, { id: item.product_id }),
                option: _.find(option_list, { id: item.option_id }),
                seller: _.find(seller_data, { id: item.seller_id })
            }
        })
        setCartList(cart_data);
        console.log(cartList)
    }
    return (
        <>
            <Wrappers>
                <Title>장바구니</Title>
                <ContentWrappers>
                    <Tabs
                        indicatorColor='primary'
                        textColor='primary'
                        scrollButtons='false'
                        variant='scrollable'
                        value={sellerId}
                        onChange={(event, newValue) => {
                            setSellerId(newValue)
                            setWantBuyList([])
                            setPriceSum(0)
                            setItemQuantity(0)
                        }}
                        sx={{
                            width: '100%',
                            float: 'left'
                        }}
                    >
                        {_.uniqBy(cartList, 'seller.title').map((data, idx) => {
                            return <Tab
                                label={data.seller.title}
                                value={data.seller.id}
                                sx={{
                                    borderBottom: '1px solid',
                                    borderColor: 'inherit',
                                    textColor: 'inherit',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    marginRight: '1rem'
                                }} />
                        })}
                    </Tabs>
                    <ChooseBox>
                        <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size7 }}>전체 선택</Typography>} control={<Checkbox onChange={(e) => {
                            let want_buy_list = [...wantBuyList];
                            console.log(want_buy_list)
                            if (e.target.checked) {
                                for (var i = 0; i < cartList.length; i++) {
                                    if (cartList[i].seller_id == sellerId) {
                                        want_buy_list.push(cartList[i])
                                        //setPriceSum(price => price + ((cartList[i].product.item_pr + cartList[i].option.price) * cartList[i].quantity))
                                       // setItemQuantity(quantity => quantity + cartList[i].quantity)
                                    }
                                }
                                want_buy_list = _.uniq(want_buy_list);
                                setWantBuyList(want_buy_list)
                            }
                            else {
                                for (var i = 0; i < cartList.length; i++) {
                                    if (cartList[i].seller_id == sellerId) {
                                        want_buy_list.pop(cartList[i])
                                       // setPriceSum(price => price - ((cartList[i].product.item_pr + cartList[i].option.price) * cartList[i].quantity))
                                        //setItemQuantity(quantity => quantity - cartList[i].quantity)
                                    }
                                }
                                want_buy_list = _.uniq(want_buy_list);
                                setWantBuyList(want_buy_list)
                            }
                        }} />} />
                        <ChooseDelete /*추후에 이 버튼을 누르면 장바구니 array 안의 상품을 개별적으로 삭제할 수 있어야 함*/>선택 삭제</ChooseDelete>
                    </ChooseBox>

                    <ContentContainer style={{
                        background: `${themeMode == 'dark' ? '#000' : '#F6F6F6'}`
                    }}>
                        <ContainerTitle style={{ fontWeight: 'bold' }}>일반배송 상품</ContainerTitle>
                        {cartList.map((item, idx) => (
                            <>
                                {item.seller_id == sellerId &&
                                    <>
                                        <ItemBox style={{
                                            background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                                        }}>

                                            <div style={{ padding: '1rem' }}>
                                                <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size7, display: 'flex' }}>
                                                    <img src={item.product.product_img} width='48px' height='48px' style={{ margin: '0 1rem 0 0.5rem' }} />
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <div>{item.product.name}</div>
                                                        <div>{commarNumber(item.product.item_pr + item.option.price)}원</div>
                                                        <div>옵션 : {item.option.name} / {item.quantity}개</div>
                                                        <div style={{ marginTop: '0.5rem' }}>{commarNumber((item.product.item_pr + item.option.price) * item.quantity)}원</div>
                                                    </div>
                                                </Typography>} control={<Checkbox checked={wantBuyList.includes(item)} onChange={(e) => {
                                                    let want_buy_list = [...wantBuyList];
                                                    if (e.target.checked) {
                                                        want_buy_list.push(item)
                                                        setPriceSum(price => price + ((item.product.item_pr + item.option.price) * item.quantity))
                                                        setItemQuantity(quantity => quantity + item.quantity)
                                                    }
                                                    else {
                                                        want_buy_list.pop(item)
                                                        setPriceSum(price => price - ((item.product.item_pr + item.option.price) * item.quantity))
                                                        setItemQuantity(quantity => quantity - item.quantity)
                                                    }
                                                    want_buy_list = _.uniq(want_buy_list);
                                                    setWantBuyList(want_buy_list)
                                                }} />} />
                                            </div>
                                        </ItemBox>
                                    </>
                                }
                            </>
                        ))}
                        <Row style={{ justifyContent: 'right' }}>상품 {priceSum} + 배송비 {deliveryFee} = {priceSum + deliveryFee}</Row>
                    </ContentContainer>

                    <ContentContainer style={{
                        background: `${themeMode == 'dark' ? '#000' : '#F6F6F6'}`,
                    }}>
                        <Row style={{ margin: '0.5rem 0', justifyContent: 'space-between' }}>
                            <div>주문 상품 수</div>
                            <div>{itemQuantity}개</div>
                        </Row>
                        <Row style={{ margin: '0.5rem 0', justifyContent: 'space-between' }}>
                            <div>총 주문금액</div>
                            <div>{commarNumber(priceSum + deliveryFee)}원</div>
                        </Row>
                        <Row style={{ margin: '0.5rem 0', justifyContent: 'space-between' }}>
                            <div>배송비</div>
                            <div>{deliveryFee}원</div>
                        </Row>
                        <Row style={{ margin: '1rem 0 2rem 0', justifyContent: 'space-between', fontWeight: 'bold', color: themeDnsData.theme_css?.main_color }}>
                            <div>총 결제 금액</div>
                            <div>{commarNumber(priceSum + deliveryFee)}원</div>
                        </Row>
                        <Button variant='contained' style={{ height: '56px', fontSize: 'large' }}>
                            구매하기
                        </Button>
                    </ContentContainer>
                </ContentWrappers>
            </Wrappers>
        </>
    )
}
export default Demo1
