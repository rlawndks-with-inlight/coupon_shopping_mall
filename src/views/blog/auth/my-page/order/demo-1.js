import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { commarNumber, getOrderStatusText, commarNumberWithUnit } from 'src/utils/function';
import { apiManager } from 'src/utils/api';
import { getOptionLabel } from 'src/utils/shop-util';
import OrderCancelButton from 'src/components/elements/shop/OrderCancelButton';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';

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
  const { translate } = useLocales();
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
    // 최초 렌더에서 목록이 [] 이라 "주문 내역이 없습니다" 가 깜빡이는 걸 막기 위한 로딩 플래그
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        onLoadOrders();
    }, [])

    // 로그인 회원의 실 주문내역 로드 → 트랜잭션을 order-line 단위로 평탄화(셀러 탭/아이템 렌더용)
    const onLoadOrders = async () => {
        try {
            let data = await apiManager('transactions', 'list', { page: 1, page_size: 20 });
            let content = data?.content || [];
            let flat_list = [];
            content.forEach((trx) => {
                (trx?.orders || []).forEach((order) => {
                    let order_count = order?.order_count || 0;
                    let order_amount = order?.order_amount || 0;
                    flat_list.push({
                        // 주문(트랜잭션) 원본을 그대로 달고 간다 — 취소요청 버튼이 상태를 여기서 읽는다.
                        // 이게 빠져 있어서 이 프레임들만 결제대기인데도 취소요청 버튼이 안 떴다.
                        trx,
                        seller_id: order?.seller_id || 0,
                        // 셀러 시스템을 쓰지 않아 seller_user_name 은 항상 null — 폴백 문구를 '기본배송' 으로 통일
                        seller_title: order?.seller_user_name || translate('기본배송'),
                        order_name: formatLang(order, 'product_name') || order?.order_name,
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
        } finally {
            // 성공/실패와 무관하게 로딩 종료 (실패 시엔 빈 상태 문구가 뜬다)
            setLoading(false);
        }
    }

    // 목록 렌더 조건(item.seller_id == sellerId)과 동일한 기준으로 계산 —
    // "주문은 있는데 이 탭엔 0건" 인 경우도 빈 상태로 잡기 위함
    const filtered_list = orderList.filter((item) => item.seller_id == sellerId);

    return (
        <>
            <Wrappers>
                <Title>{translate('주문/배송 조회')}</Title>
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
                    {/* 로딩 중 / 목록 0건일 때 회색 박스가 빈 채로 남아 있던 문제 대응 */}
                    {loading &&
                        <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.6 }}>{translate('불러오는 중...')}</div>
                    }
                    {!loading && filtered_list.length === 0 &&
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>{translate('주문 내역이 없습니다.')}<br />
                            <Button variant='outlined' sx={{ mt: 2 }} onClick={() => router.push('/shop')}>{translate('쇼핑하러 가기')}</Button>
                        </div>
                    }
                    {orderList.map((item, idx) => (
                        <>
                            {item.seller_id == sellerId &&
                                <>
                                    <ItemBox key={idx} style={{
                                        background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                                    }}>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem 0', fontSize: '0.85rem', opacity: 0.8 }}>
                                            <div>{translate('주문번호')} {item.ord_num}</div>
                                            <div>{getOrderStatusText(item)}</div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', minWidth: 0 }}>
                                                <img src={item.product_img} alt={item.order_name || ''} width='48px' height='48px' style={{ margin: '0 1rem 0 0', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <div>{item.order_name}</div>
                                                    <div>{commarNumberWithUnit(item.unit_price)}</div>
                                                    <div>{translate('옵션')} : {item.option_text ? `${item.option_text} / ` : ''}{item.order_count}{translate('개')}</div>
                                                    <div style={{ marginTop: '0.5rem' }}>{commarNumberWithUnit(item.order_amount)}</div>
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
                                                >{translate('배송조회')}</Button>
                                                {/* 블로그형 프레임에는 취소요청 수단이 아예 없었다 — 공용 버튼으로 통일 */}
                                                <OrderCancelButton trx={item.trx} orders={item.trx?.orders} onDone={onLoadOrders} sx={{ marginBottom: '1rem', whiteSpace: 'nowrap' }} />
                                            </AddressButton>

                                        </div>
                                        {(item.receiver || item.addr || item.invoice_num) &&
                                            <div style={{ padding: '0 1rem 1rem', fontSize: '0.85rem', opacity: 0.8 }}>
                                                {item.receiver && <div>{translate('받는분')} : {item.receiver}</div>}
                                                {item.addr && <div>{translate('배송지')} : {item.addr} {item.detail_addr}</div>}
                                                {item.invoice_num && <div>{translate('송장')} : {item.invoice_num}</div>}
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
