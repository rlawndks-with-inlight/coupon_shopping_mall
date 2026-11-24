import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Button, Pagination } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { commarNumber, getOrderStatusText, 손님주문상태, commarNumberWithUnit } from 'src/utils/function';
import { apiManager } from 'src/utils/api';
import { getOptionLabel } from 'src/utils/shop-util';
import OrderCancelButton from 'src/components/elements/shop/OrderCancelButton';
import ReviewWriteButton from 'src/components/elements/shop/review/ReviewWriteButton';
import useReviewWritable from 'src/components/elements/shop/review/useReviewWritable';
import { isDomestic, formatOverseasAddress } from 'src/data/countries';
import { formatLang } from 'src/utils/format';
import { useLocales } from 'src/locales';
import CancelLineNote from 'src/components/elements/shop/CancelLineNote';

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
const Demo2 = (props) => {
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
    // 주문은 20건씩 쪽으로 나눠 받는다. 예전엔 첫 20건만 받고 쪽 단추가 없어 그보다 앞 주문을 볼 수 없었다(2026-11-24).
    const 주문쪽크기 = 20;
    const [쪽, set쪽] = useState(1);
    const [전체, set전체] = useState(0);
    // 줄마다 「후기 쓰기」 — 쓸 수 있는지는 서버가 판정한 것을 한 번 받아 둔다.
    const { byOrder: reviewLines, refresh: refreshReviewLines } = useReviewWritable();

    useEffect(() => {
        getOrderList();
    }, [])

    // 실 주문내역 로드 → 주문라인(orders[]) 단위로 평탄화해서 셀러 탭/목록 렌더에 사용
    const getOrderList = async (보낼쪽) => {
        const 이번쪽 = Number(보낼쪽) || 쪽; // 인자 없이 부르면(취소 뒤 다시 읽기) 지금 쪽
        try {
            let data = await apiManager('transactions', 'list', { page: 이번쪽, page_size: 주문쪽크기, type: 'user' }); // 내 주문만 + 취소 건 포함, 실패 건 제외
            let content = data?.content ?? [];
            if (data) { set전체(Number(data?.total) || 0); set쪽(이번쪽); }
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
                        seller_title: line?.seller_user_name || translate('기본배송'),
                    });
                }
            }
            setOrderList(flat);
            if (flat.length > 0) {
                setSellerId(flat[0].seller_id);
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
                                    <ItemBox style={{
                                        background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                                    }}>

                                        {/* 모바일(390px)에서 오른쪽 배송 칸이 nowrap 이라 카드가 옆으로 넘쳤다 → 줄바꿈 허용 + 텍스트 칸 min-width:0 */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', minWidth: 0 }}>
                                                <img src={item.product_img} alt={formatLang(item, 'product_name') || item.order_name || ''} width='48px' height='48px' style={{ margin: '0 1rem 0 0', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <div>{formatLang(item, 'product_name') || item.order_name}</div>
                                                    <div>{commarNumberWithUnit(item.order_amount)}</div>
                                                    {item.groups?.length > 0 &&
                                                        <div>{translate('옵션')} : {item.groups.map((group) => `${formatLang(group, 'group_name')}: ${(group?.options ?? []).map((option) => getOptionLabel(option)).join(' / ')}`).join(', ')}</div>
                                                    }
                                                    <div>{translate('수량')} : {item.order_count}{translate('개')}<CancelLineNote line={item} cancelled={item?.trx?.is_cancel_trans == 1} /></div>
                                                    <div style={{ marginTop: '0.5rem' }}>{translate('주문번호')} : {item.trx?.ord_num}</div>
                                                    <div>{translate('주문현황')} : {손님주문상태(item.trx, translate)}</div>
                                                </div>
                                            </div>
                                            <AddressButton>
                                                {(item.trx?.receiver || item.trx?.buyer_name) &&
                                                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{translate('받는분')} : {item.trx?.receiver || item.trx?.buyer_name}</div>
                                                }
                                                {item.trx?.addr &&
                                                    // 해외 주소는 나라마다 순서가 달라 국내 형식(주소+상세주소)으로는 표기가 안 된다
                                                    // — 도시·주·국가가 통째로 빠져 어디로 가는 주문인지 알 수 없었다.
                                                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem', maxWidth: '220px' }}>
                                                        {isDomestic(item.trx?.country_code)
                                                            ? `${item.trx?.addr} ${item.trx?.detail_addr || ''}`.trim()
                                                            : formatOverseasAddress(item.trx)}
                                                    </div>
                                                }
                                                {item.trx?.invoice_num &&
                                                    <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{translate('송장')} : {item.trx?.invoice_num}</div>
                                                }
                                                <Button
                                                    variant='outlined'
                                                    disabled={!parseInvoice(item.trx?.invoice_num)}
                                                    onClick={() => {
                                                        const track = parseInvoice(item.trx?.invoice_num);
                                                        if (track) window.open(track.url, '_blank', 'noopener,noreferrer');
                                                    }}
                                                    style={{
                                                        marginBottom: '1rem',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >{translate('배송조회')}</Button>
                                                {/* 블로그형 프레임에는 취소요청 수단이 아예 없었다 — 공용 버튼으로 통일 */}
                                                <OrderCancelButton trx={item.trx} orders={item.trx?.orders} onDone={getOrderList} sx={{ marginBottom: '1rem', whiteSpace: 'nowrap' }} />
                                                <ReviewWriteButton line={reviewLines[item.id]} onDone={refreshReviewLines} sx={{ marginBottom: '1rem' }} />
                                            </AddressButton>

                                        </div>
                                    </ItemBox>
                                </>
                            }
                        </>
                    ))}
                    {전체 > 주문쪽크기 &&
                        <Pagination
                            sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
                            count={Math.ceil(전체 / 주문쪽크기)}
                            page={쪽}
                            variant='outlined' shape='rounded' color='primary'
                            onChange={(_, n) => { getOrderList(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo2
