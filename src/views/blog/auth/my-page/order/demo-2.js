import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Checkbox, FormControlLabel, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { commarNumber, getTrxStatusByNumber } from 'src/utils/function';
import { apiManager } from 'src/utils/api';

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

// 공지사항, faq 등 상세페이지 김인욱
const Demo2 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode } = useSettingsContext();
    const [sellerId, setSellerId] = useState(0)
    const [orderList, setOrderList] = useState([]);

    useEffect(() => {
        getOrderList();
    }, [])

    // 실 주문내역 로드 → 주문라인(orders[]) 단위로 평탄화해서 셀러 탭/목록 렌더에 사용
    const getOrderList = async () => {
        let data = await apiManager('transactions', 'list', { page: 1, page_size: 20 });
        let content = data?.content ?? [];
        let flat = [];
        for (var i = 0; i < content.length; i++) {
            let trx = content[i];
            let lines = trx?.orders ?? [];
            for (var j = 0; j < lines.length; j++) {
                let line = lines[j];
                flat.push({
                    ...line,
                    trx,
                    seller_id: line?.seller_id ?? 0,
                    seller_title: line?.seller_user_name || '기본배송',
                });
            }
        }
        setOrderList(flat);
        if (flat.length > 0) {
            setSellerId(flat[0].seller_id);
        }
    }

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
                    {_.uniqBy(orderList, 'seller_id').map((data, idx) => {
                        return <Tab
                            key={idx}
                            label={data.seller_title}
                            value={data.seller_id}
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
                                                <img src={item.product_img} width='48px' height='48px' style={{ margin: '0 1rem 0 0' }} />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div>{item.order_name}</div>
                                                    <div>{commarNumber(item.order_amount)}원</div>
                                                    {item.groups?.length > 0 &&
                                                        <div>옵션 : {item.groups.map((group) => `${group?.group_name}: ${(group?.options ?? []).map((option) => option?.option_name ?? option?.value).join(' / ')}`).join(', ')}</div>
                                                    }
                                                    <div>수량 : {item.order_count}개</div>
                                                    <div style={{ marginTop: '0.5rem' }}>주문번호 : {item.trx?.ord_num}</div>
                                                    <div>주문현황 : {getTrxStatusByNumber(item.trx?.trx_status)}</div>
                                                </div>
                                            </div>
                                            <AddressButton>
                                                {(item.trx?.receiver || item.trx?.buyer_name) &&
                                                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>받는분 : {item.trx?.receiver || item.trx?.buyer_name}</div>
                                                }
                                                {item.trx?.addr &&
                                                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem', maxWidth: '220px' }}>{item.trx?.addr} {item.trx?.detail_addr || ''}</div>
                                                }
                                                {item.trx?.invoice_num &&
                                                    <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>송장 : {item.trx?.invoice_num}</div>
                                                }
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
export default Demo2
