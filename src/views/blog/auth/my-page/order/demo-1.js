import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { commarNumber, getTrxStatusByNumber } from 'src/utils/function';
import { apiManager } from 'src/utils/api';
import { getOptionLabel } from 'src/utils/shop-util';
import OrderCancelButton from 'src/components/elements/shop/OrderCancelButton';

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

// 실 트랜잭션 order-line 의 옵션 문자열 구성(groups[].options[].option_name)
const getOptionText = (order) => {
    if (!order?.groups || order.groups.length === 0) return '';
    return order.groups
        .map((group) => (group?.options || []).map((option) => getOptionLabel(option)).join('/'))
        .filter((text) => !!text)
        .join(' / ');
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

// 회원 주문/배송 조회 (실 주문 데이터) 김인욱
const Demo1 = (props) => {
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
        onLoadOrders();
    }, [])

    // 로그인 회원의 실 주문내역 로드 → 트랜잭션을 order-line 단위로 평탄화(셀러 탭/아이템 렌더용)
    const onLoadOrders = async () => {
        let data = await apiManager('transactions', 'list', { page: 1, page_size: 20 });
        let content = data?.content || [];
        let flat_list = [];
        content.forEach((trx) => {
            (trx?.orders || []).forEach((order) => {
                let order_count = order?.order_count || 0;
                let order_amount = order?.order_amount || 0;
                flat_list.push({
                    seller_id: order?.seller_id || 0,
                    seller_title: order?.seller_user_name || '판매자',
                    order_name: order?.order_name ?? order?.product_name,
                    order_count: order_count,
                    order_amount: order_amount,
                    unit_price: order_count > 0 ? Math.round(order_amount / order_count) : order_amount,
                    option_text: getOptionText(order),
                    product_img: order?.product_img,
                    product_id: order?.product_id,
                    ord_num: trx?.ord_num,
                    trx_status: trx?.trx_status,
                    amount: trx?.amount,
                    addr: trx?.addr,
                    detail_addr: trx?.detail_addr,
                    receiver: trx?.receiver || trx?.buyer_name,
                    invoice_num: trx?.invoice_num,
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
                                    <ItemBox key={idx} style={{
                                        background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                                    }}>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem 0', fontSize: '0.85rem', opacity: 0.8 }}>
                                            <div>주문번호 {item.ord_num}</div>
                                            <div>{getTrxStatusByNumber(item.trx_status)}</div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                                            <div style={{ display: 'flex' }}>
                                                <img src={item.product_img} width='48px' height='48px' style={{ margin: '0 1rem 0 0' }} />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div>{item.order_name}</div>
                                                    <div>{commarNumber(item.unit_price)}원</div>
                                                    <div>옵션 : {item.option_text ? `${item.option_text} / ` : ''}{item.order_count}개</div>
                                                    <div style={{ marginTop: '0.5rem' }}>{commarNumber(item.order_amount)}원</div>
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
                                                {/* 블로그형 프레임에는 취소요청 수단이 아예 없었다 — 공용 버튼으로 통일 */}
                                                <OrderCancelButton trx={item.trx} onDone={onLoadOrders} sx={{ marginBottom: '1rem', whiteSpace: 'nowrap' }} />
                                            </AddressButton>

                                        </div>
                                        {(item.receiver || item.addr || item.invoice_num) &&
                                            <div style={{ padding: '0 1rem 1rem', fontSize: '0.85rem', opacity: 0.8 }}>
                                                {item.receiver && <div>받는분 : {item.receiver}</div>}
                                                {item.addr && <div>배송지 : {item.addr} {item.detail_addr}</div>}
                                                {item.invoice_num && <div>송장 : {item.invoice_num}</div>}
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
export default Demo1
