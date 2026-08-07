import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { commarNumber, getTrxStatusByNumber } from 'src/utils/function';
import { apiManager } from 'src/utils/api';
import { getOptionLabel } from 'src/utils/shop-util';

const ContentContainer = styled.div`
display:flex;
flex-direction:column;
padding:1rem;
`

const ItemBox = styled.div`
margin: 1rem 0;
`

const AddressButton = styled.div`
display:flex;
flex-direction:column;
`

// 실 주문상품의 옵션 텍스트(groups/options)를 조합
const getOptionText = (order) => {
    const parts = [];
    (order?.groups || []).forEach((group) => {
        (group?.options || []).forEach((option) => {
            const value = getOptionLabel(option);
            if (value) parts.push(value);
        });
    });
    return parts.length > 0 ? parts.join(' / ') : '기본';
}

// 택배 배송조회(네이버 통합조회) — 송장은 `택배사-송장번호` 형식. 송장 없으면 null.
const parseInvoice = (invoice_num) => {
    if (!invoice_num) return null;
    const trimmed = String(invoice_num).trim();
    const di = trimmed.indexOf('-');
    const hasCourier = di > 0 && /[^0-9]/.test(trimmed.slice(0, di));
    const courier = hasCourier ? trimmed.slice(0, di) : '';
    const invoice = hasCourier ? trimmed.slice(di + 1) : trimmed;
    if (!invoice) return null;
    return {
        courier,
        invoice,
        url: `https://search.naver.com/search.naver?query=${encodeURIComponent(`${courier} ${invoice} 택배조회`.trim())}`,
    };
}

// 회원 주문/배송 조회 - 실 트랜잭션 데이터 렌더 김인욱
const Demo5 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode } = useSettingsContext();
    const [statusValue, setStatusValue] = useState(false)
    const [orderList, setOrderList] = useState([]);

    useEffect(() => {
        loadOrderList();
    }, [])

    const loadOrderList = async () => {
        let data = await apiManager('transactions', 'list', { page: 1, page_size: 20 });
        let content = data?.content || [];
        // 각 트랜잭션(주문)의 주문상품(orders[])을 펼쳐 부모 주문정보를 함께 부여
        let rows = [];
        content.forEach((trx) => {
            (trx?.orders || []).forEach((order) => {
                rows.push({
                    ...order,
                    ord_num: trx?.ord_num,
                    trx_status: trx?.trx_status,
                    amount: trx?.amount,
                    addr: trx?.addr,
                    detail_addr: trx?.detail_addr,
                    receiver: trx?.receiver || trx?.buyer_name,
                    receiver_phone: trx?.receiver_phone || trx?.buyer_phone,
                    invoice_num: trx?.invoice_num,
                });
            })
        })
        setOrderList(rows);
        if (rows.length > 0) {
            setStatusValue(rows[0].trx_status);
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
                    value={statusValue}
                    onChange={(event, newValue) => {
                        setStatusValue(newValue)
                    }}
                    sx={{
                        width: '100%',
                        float: 'left'
                    }}
                >
                    {_.uniqBy(orderList, 'trx_status').map((data, idx) => {
                        return <Tab
                            label={getTrxStatusByNumber(data.trx_status)}
                            value={data.trx_status}
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
                            {item.trx_status == statusValue &&
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
                                                    <div>옵션 : {getOptionText(item)} / {item.order_count}개</div>
                                                    <div style={{ marginTop: '0.5rem' }}>{getTrxStatusByNumber(item.trx_status)} · 주문번호 {item.ord_num}</div>
                                                </div>
                                            </div>
                                            <AddressButton>
                                                <Button
                                                    variant='outlined'
                                                    disabled={!parseInvoice(item.invoice_num)}
                                                    onClick={() => {
                                                        const track = parseInvoice(item.invoice_num);
                                                        if (track) window.open(track.url, '_blank', 'noopener,noreferrer');
                                                    }}
                                                    style={{
                                                        marginBottom: '1rem',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >배송조회</Button>
                                            </AddressButton>

                                        </div>
                                        {(item.receiver || item.addr || item.invoice_num) &&
                                            <div style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.9rem' }}>
                                                {item.receiver &&
                                                    <div>받는분 : {item.receiver}{item.receiver_phone ? ` (${item.receiver_phone})` : ''}</div>}
                                                {item.addr &&
                                                    <div>배송지 : {item.addr} {item.detail_addr || ''}</div>}
                                                {item.invoice_num &&
                                                    <div>송장번호 : {item.invoice_num}</div>}
                                            </div>
                                        }
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
export default Demo5
