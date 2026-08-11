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

// 실 주문상품의 옵션 그룹(groups[].options[])을 표시용 문자열로 변환
const getOptionText = (order) => {
    let arr = [];
    (order?.groups || []).forEach((group) => {
        (group?.options || []).forEach((option) => {
            arr.push(getOptionLabel(option));
        });
    });
    return arr.join(' / ');
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
const Demo4 = (props) => {
  const { translate } = useLocales();
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode } = useSettingsContext();
    const [sellerId, setSellerId] = useState(undefined)
    const [sellerList, setSellerList] = useState([])
    const [orderList, setOrderList] = useState([]);
    // 최초 렌더에서 목록이 [] 이라 "주문 내역이 없습니다" 가 깜빡이는 걸 막기 위한 로딩 플래그
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOrderList();
    }, [])

    // 로그인 회원의 실 주문목록을 불러와 주문상품 단위로 펼쳐 렌더한다.
    const getOrderList = async () => {
        try {
            let data = await apiManager('transactions', 'list', { page: 1, page_size: 20 });
            let content = data?.content ?? [];
            let items = [];
            content.forEach((trx) => {
                (trx?.orders || []).forEach((order) => {
                    // 각 주문상품에 상위 트랜잭션(주문번호/상태/배송지/송장)을 결합
                    items.push({ ...order, trx });
                });
            });
            setOrderList(items);
            if (items.length > 0) {
                setSellerId(items[0]?.seller_id);
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
                            // 셀러 시스템 미사용으로 seller_user_name 은 항상 null — 폴백 문구를 '기본배송' 으로 통일
                            label={data?.seller_user_name || '기본배송'}
                            value={data?.seller_id}
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
                                    <ItemBox style={{
                                        background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                                    }}>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                                            <div style={{ display: 'flex' }}>
                                                <img src={item?.product_img} width='48px' height='48px' style={{ margin: '0 1rem 0 0' }} />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div>{formatLang(item, 'product_name') || item?.order_name}</div>
                                                    <div>{commarNumberWithUnit(item?.order_amount)}</div>
                                                    <div>옵션 : {getOptionText(item) || '-'} / {item?.order_count}개</div>
                                                    <div style={{ marginTop: '0.5rem' }}>주문번호 : {item?.trx?.ord_num}</div>
                                                    <div>주문상태 : {getOrderStatusText(item?.trx)}</div>
                                                    <div>받는분 : {item?.trx?.receiver || item?.trx?.buyer_name || '-'}</div>
                                                    <div>배송지 : {item?.trx?.addr ? `${item?.trx?.addr} ${item?.trx?.detail_addr || ''}` : '-'}</div>
                                                    <div>송장번호 : {item?.trx?.invoice_num || '-'}</div>
                                                </div>
                                            </div>
                                            <AddressButton>
                                                <Button
                                                    variant='outlined'
                                                    disabled={!parseInvoice(item?.trx?.invoice_num)}
                                                    onClick={() => {
                                                        const track = parseInvoice(item?.trx?.invoice_num);
                                                        if (track) window.open(track.url, '_blank', 'noopener,noreferrer');
                                                    }}
                                                    style={{
                                                        marginBottom: '1rem',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >{translate('배송조회')}</Button>
                                                {/* 블로그형 프레임에는 취소요청 수단이 아예 없었다 — 공용 버튼으로 통일 */}
                                                <OrderCancelButton trx={item.trx} onDone={getOrderList} sx={{ marginBottom: '1rem', whiteSpace: 'nowrap' }} />
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
