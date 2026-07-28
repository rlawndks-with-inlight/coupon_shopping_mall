import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { commarNumber, getTrxStatusByNumber } from 'src/utils/function';
import { apiManager } from 'src/utils/api';

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

// 실 주문상품(order.orders[i])의 옵션 정보를 문자열로 조합
const getOptionText = (order) => {
    if (!order?.groups || order?.groups.length === 0) return '';
    return order.groups.map((group) => {
        const options = (group?.options || []).map((option) => option?.option_name ?? option?.value).join(' / ');
        return `${group?.group_name}: ${options}`;
    }).join(' / ');
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

// 공지사항, faq 등 상세페이지 김인욱
const Demo3 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode } = useSettingsContext();
    const [sellerId, setSellerId] = useState(null)
    const [orderList, setOrderList] = useState([]);

    useEffect(() => {
        onLoadOrders();
    }, [])

    const onLoadOrders = async () => {
        // 로그인 회원의 실 주문목록 로드
        let data = await apiManager('transactions', 'list', { page: 1, page_size: 20 });
        let content = data?.content || [];
        // 트랜잭션(주문)의 주문상품(orders[])을 셀러 탭 렌더에 맞게 평탄화
        let flat_list = [];
        content.forEach((trx) => {
            (trx?.orders || []).forEach((order, idx) => {
                flat_list.push({
                    key: `${trx?.ord_num}-${idx}`,
                    // 주문(트랜잭션) 레벨 필드
                    ord_num: trx?.ord_num,
                    trx_status: trx?.trx_status,
                    amount: trx?.amount,
                    buyer_name: trx?.buyer_name,
                    buyer_phone: trx?.buyer_phone,
                    receiver: trx?.receiver || trx?.buyer_name,
                    receiver_phone: trx?.receiver_phone,
                    zonecode: trx?.zonecode,
                    addr: trx?.addr,
                    detail_addr: trx?.detail_addr,
                    invoice_num: trx?.invoice_num,
                    created_at: trx?.created_at,
                    // 주문상품(sub-order) 레벨 필드
                    product_id: order?.product_id,
                    product_img: order?.product_img,
                    order_name: order?.order_name || order?.product_name,
                    order_count: order?.order_count,
                    order_amount: order?.order_amount,
                    seller_id: order?.seller_id ?? 0,
                    seller_user_name: order?.seller_user_name,
                    groups: order?.groups || [],
                });
            });
        });
        setOrderList(flat_list);
        if (flat_list.length > 0) {
            setSellerId(flat_list[0].seller_id);
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
                            label={data.seller_user_name || '판매자'}
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
                    {orderList.map((item, idx) => {
                        const option_text = getOptionText(item);
                        return (
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
                                                        <div>{option_text ? `옵션 : ${option_text} / ` : '수량 : '}{item.order_count}개</div>
                                                        <div style={{ marginTop: '0.5rem' }}>주문번호 : {item.ord_num}</div>
                                                        <div>주문상태 : {getTrxStatusByNumber(item.trx_status)}</div>
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
                                                <div style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.875rem' }}>
                                                    {item.receiver &&
                                                        <div>받는분 : {item.receiver}{item.receiver_phone ? ` (${item.receiver_phone})` : ''}</div>}
                                                    {item.addr &&
                                                        <div>배송지 : {item.zonecode ? `(${item.zonecode}) ` : ''}{item.addr} {item.detail_addr || ''}</div>}
                                                    {item.invoice_num &&
                                                        <div>송장번호 : {item.invoice_num}</div>}
                                                </div>}
                                        </ItemBox>
                                    </>
                                }
                            </>
                        )
                    })}
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo3
