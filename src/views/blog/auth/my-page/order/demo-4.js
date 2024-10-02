import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Checkbox, FormControlLabel, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { test_items, test_seller, test_option_list } from 'src/data/test-data';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { commarNumber } from 'src/utils/function';

const ContentContainer = styled.div`
display:flex;
flex-direction:column;
padding:1rem;
`

const ChooseBox = styled.div`
display:flex;
justify-content:space-between;
margin:1.5rem 0 2rem 0;
`

const ItemBox = styled.div`
margin: 1rem 0;
`

const AddressButton = styled.div`
display:flex;
flex-direction:column;
`

const test_order = [
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

// 공지사항, faq 등 상세페이지 김인욱
const Demo4 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode } = useSettingsContext();
    const [sellerId, setSellerId] = useState(test_order[0].seller_id)
    const [sellerList, setSellerList] = useState([])
    const [orderList, setOrderList] = useState([]);

    useEffect(() => {
        let order_data = [...test_order];
        let product_data = [...test_items];
        let seller_data = [...test_seller];
        let option_data = [...test_option_list];
        let option_list = [];
        for (var i = 0; i < option_data.length; i++) {
            option_list = [...option_list, ...option_data[i].children];
        }
        order_data = order_data.map((item) => {
            return {
                ...item,
                product: _.find(product_data, { id: item.product_id }),
                option: _.find(option_list, { id: item.option_id }),
                seller: _.find(seller_data, { id: item.seller_id })
            }
        })
        setOrderList(order_data);

    }, [])

    return (
        <>
            <Wrappers>
                <Title>주문/배송 조회</Title>
                <Tabs
                    indicatorColor='primary'
                    textColor='primary'
                    scrollButtons='false'
                    variant='scrollable'
                    value={sellerId}
                    onChange={(event, newValue) => {
                        setSellerId(newValue)
                    }}
                    sx={{
                        width: '100%',
                        float: 'left'
                    }}
                >
                    {_.uniqBy(orderList, 'seller.title').map((data, idx) => {
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
                            }}
                            style={{
                                marginRight: '1rem'
                            }}
                        />
                    })}
                </Tabs>
                <ContentContainer style={{
                    background: `${themeMode == 'dark' ? '#000' : '#F6F6F6'}`
                }}>
                    {orderList.map((item, idx) => (
                        <>
                            {item.seller_id == sellerId &&
                                <>
                                    <ItemBox style={{
                                        background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                                    }}>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                                            <div style={{ display: 'flex' }}>
                                                <img src={item.product.product_img} width='48px' height='48px' style={{ margin: '0 1rem 0 0' }} />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div>{item.product.name}</div>
                                                    <div>{commarNumber(item.product.product_sale_price + item.option.price)}원</div>
                                                    <div>옵션 : {item.option.name} / {item.quantity}개</div>
                                                    <div style={{ marginTop: '0.5rem' }}>{commarNumber((item.product.product_sale_price + item.option.price) * item.quantity)}원</div>
                                                </div>
                                            </div>
                                            <AddressButton>
                                                <Button
                                                    variant='outlined'
                                                    style={{
                                                        marginBottom: '1rem',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >주문정보</Button>
                                                <Button
                                                    variant='outlined'
                                                    style={{
                                                        marginBottom: '1rem',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >배송정보</Button>
                                            </AddressButton>

                                        </div>
                                    </ItemBox>
                                </>
                            }
                        </>
                    ))}
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo4
