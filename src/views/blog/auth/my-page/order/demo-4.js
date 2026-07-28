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

// 실 주문상품의 옵션 그룹(groups[].options[])을 표시용 문자열로 변환
const getOptionText = (order) => {
    let arr = [];
    (order?.groups || []).forEach((group) => {
        (group?.options || []).forEach((option) => {
            arr.push(option?.option_name ?? option?.value);
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

    useEffect(() => {
        getOrderList();
    }, [])

    // 로그인 회원의 실 주문목록을 불러와 주문상품 단위로 펼쳐 렌더한다.
    const getOrderList = async () => {
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
                            label={data?.seller_user_name || '판매자'}
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
                                                    <div>{item?.order_name}</div>
                                                    <div>{commarNumber(item?.order_amount)}원</div>
                                                    <div>옵션 : {getOptionText(item) || '-'} / {item?.order_count}개</div>
                                                    <div style={{ marginTop: '0.5rem' }}>주문번호 : {item?.trx?.ord_num}</div>
                                                    <div>주문상태 : {getTrxStatusByNumber(item?.trx?.trx_status)}</div>
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
                                                >배송조회</Button>
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
