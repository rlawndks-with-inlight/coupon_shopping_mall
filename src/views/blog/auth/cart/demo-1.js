import styled from 'styled-components'
import { Tab, Tabs, TextField, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Iconify from 'src/components/iconify/Iconify';
import { Icon } from '@iconify/react';
import { commarNumber } from 'src/utils/function';
import _ from 'lodash'
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';

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
margin 1rem 0;
`
const ContainerTitle = styled.div`
fontWeight:bold;
`

const ContentBox = styled.div`
margin:2.5% auto;
background-color:white;
width:95%;
`

const TextBox = styled.div`
display:flex;
flex-direction:column;
margin-left:5%;
`
const test_cart = [
    {
        id: 111,
        product_name: '[국내제작/고퀄/보풀X]플레인 나시 - t',
        product_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/6/29/thumb@1080_1687996041-a03a48a3-6c08-4856-9aa9-15d05fa9c444.jpeg',
        mkt_pr: 20000,
        item_pr: 18000,
        content: "<p><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543362484-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543365336-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543369919-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543372457-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543375175-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543377838-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543380642-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543383596-note.png\"></p><p><br></p><p><span class=\"ql-size-small\">#2차전지 #전기차 #리튬 #미국 #중국 #패권다툼 #반도체 규제 #주요 광물 #수출 #규제 #갈륨 #게르마늄 #아연 #희토류 #클라우딩 컴퓨터 서비스 #중국 #제재 #아마존 #마이크로소프트 #인공지능 반도체 #삼성전자 #최첨단 반도체 #AI 반도체 #삼성 파운드리 포럼 2023 #SAFE 포럼 2023 #2나노 #3나노 #공정설계키트 #팹리스 #파운드리 #생태계 강화 #자동차 #현대차 #기아 #친환경차 #전기차 #수소차 #미국 인플레이션감축법 #IRA #의료AI #캔서문샷 #사우디아라비아 #비전2030 #SEHA 가상병원 #프로젝트 참여</span></p><p><br></p><p><span class=\"ql-size-small\">#리튬 관련주 #STX #금양 #코스모화학 #강원에너지 #이브이첨단소재 #코스모신소재</span></p><p><span class=\"ql-size-small\">#희토류 관련주 #유니온 #삼화전자 #대원화성 #유니온머티리얼 #티플랙스 #동국알앤에스</span></p><p><span class=\"ql-size-small\">#클라우드 관련주 #솔트웨어 #데이타솔루션 #덕산하이메탈 #오픈베이스 #케이아이엔엑스 #파이오링크</span></p><p><span class=\"ql-size-small\">#반도체 관련주 #가온칩스 #동운아나텍 #마이크로투나노 #유니퀘스트 #코아시아 #에이디테크놀로지</span></p><p><span class=\"ql-size-small\">#자동차 관련주 #서연이화 #KG모빌리티 #트루윈 #한주라이트메탈 #아진산업 #화신</span></p><p><span class=\"ql-size-small\">#의료AI 관련주 #루닛 #비올 #제이엘케이 #뷰노 #딥노이드 #신한제7호스팩</span></p>",
        images: [
            'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299885-c8ca43a2-dca0-4428-8d39-25831173de5d.jpeg',
            'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299886-f9f50ad1-22e0-4cf3-8c88-67dbc433a838.jpeg',
            'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299886-eeae94f7-9cd0-46da-9cdb-dac47a64806d.jpeg'
        ],
        seller: {
            id: 123,
            profile_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2021/7/5/thumb@1080_1625479198-59043e92-67de-46b1-8755-f21c5ca0a9ae.jpg',
            nickname: 'Merrymond',
            delivery_fee: 3000,
        },
        option: [
            { id: 1, name: "블랙", price: 0, count: 1 },
            { id: 2, name: "베이지", price: 500, count: 2 },
            { id: 3, name: "크림", price: 1500, count: 3 },
        ],
    },
    {
        id: 222,
        product_name: '낭만 과일(비회원 주문가능)',
        product_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/6/29/thumb@1080_1687996041-a03a48a3-6c08-4856-9aa9-15d05fa9c444.jpeg',
        mkt_pr: 20000,
        item_pr: 18000,
        content: "<p><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543362484-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543365336-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543369919-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543372457-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543375175-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543377838-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543380642-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543383596-note.png\"></p><p><br></p><p><span class=\"ql-size-small\">#2차전지 #전기차 #리튬 #미국 #중국 #패권다툼 #반도체 규제 #주요 광물 #수출 #규제 #갈륨 #게르마늄 #아연 #희토류 #클라우딩 컴퓨터 서비스 #중국 #제재 #아마존 #마이크로소프트 #인공지능 반도체 #삼성전자 #최첨단 반도체 #AI 반도체 #삼성 파운드리 포럼 2023 #SAFE 포럼 2023 #2나노 #3나노 #공정설계키트 #팹리스 #파운드리 #생태계 강화 #자동차 #현대차 #기아 #친환경차 #전기차 #수소차 #미국 인플레이션감축법 #IRA #의료AI #캔서문샷 #사우디아라비아 #비전2030 #SEHA 가상병원 #프로젝트 참여</span></p><p><br></p><p><span class=\"ql-size-small\">#리튬 관련주 #STX #금양 #코스모화학 #강원에너지 #이브이첨단소재 #코스모신소재</span></p><p><span class=\"ql-size-small\">#희토류 관련주 #유니온 #삼화전자 #대원화성 #유니온머티리얼 #티플랙스 #동국알앤에스</span></p><p><span class=\"ql-size-small\">#클라우드 관련주 #솔트웨어 #데이타솔루션 #덕산하이메탈 #오픈베이스 #케이아이엔엑스 #파이오링크</span></p><p><span class=\"ql-size-small\">#반도체 관련주 #가온칩스 #동운아나텍 #마이크로투나노 #유니퀘스트 #코아시아 #에이디테크놀로지</span></p><p><span class=\"ql-size-small\">#자동차 관련주 #서연이화 #KG모빌리티 #트루윈 #한주라이트메탈 #아진산업 #화신</span></p><p><span class=\"ql-size-small\">#의료AI 관련주 #루닛 #비올 #제이엘케이 #뷰노 #딥노이드 #신한제7호스팩</span></p>",
        images: [
            'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299885-c8ca43a2-dca0-4428-8d39-25831173de5d.jpeg',
            'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299886-f9f50ad1-22e0-4cf3-8c88-67dbc433a838.jpeg',
            'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299886-eeae94f7-9cd0-46da-9cdb-dac47a64806d.jpeg'
        ],
        seller: {
            id: 2,
            profile_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2021/7/5/thumb@1080_1625479198-59043e92-67de-46b1-8755-f21c5ca0a9ae.jpg',
            nickname: '벨르시 마켓',
            delivery_fee: 5000,
        },
        option: [
            { id: 1, name: "백도", price: 0, count: 10 },
            { id: 2, name: "황도", price: 5000, count: 10 },
        ],
    },
    {
        id: 333,
        product_name: '[국내제작/고퀄/보풀X]플레인 나시 - t',
        product_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/6/29/thumb@1080_1687996041-a03a48a3-6c08-4856-9aa9-15d05fa9c444.jpeg',
        mkt_pr: 20000,
        item_pr: 18000,
        content: "<p><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543362484-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543365336-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543369919-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543372457-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543375175-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543377838-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543380642-note.png\"><img src=\"https://purplevery6.cafe24.com:8443/image/note/1688543383596-note.png\"></p><p><br></p><p><span class=\"ql-size-small\">#2차전지 #전기차 #리튬 #미국 #중국 #패권다툼 #반도체 규제 #주요 광물 #수출 #규제 #갈륨 #게르마늄 #아연 #희토류 #클라우딩 컴퓨터 서비스 #중국 #제재 #아마존 #마이크로소프트 #인공지능 반도체 #삼성전자 #최첨단 반도체 #AI 반도체 #삼성 파운드리 포럼 2023 #SAFE 포럼 2023 #2나노 #3나노 #공정설계키트 #팹리스 #파운드리 #생태계 강화 #자동차 #현대차 #기아 #친환경차 #전기차 #수소차 #미국 인플레이션감축법 #IRA #의료AI #캔서문샷 #사우디아라비아 #비전2030 #SEHA 가상병원 #프로젝트 참여</span></p><p><br></p><p><span class=\"ql-size-small\">#리튬 관련주 #STX #금양 #코스모화학 #강원에너지 #이브이첨단소재 #코스모신소재</span></p><p><span class=\"ql-size-small\">#희토류 관련주 #유니온 #삼화전자 #대원화성 #유니온머티리얼 #티플랙스 #동국알앤에스</span></p><p><span class=\"ql-size-small\">#클라우드 관련주 #솔트웨어 #데이타솔루션 #덕산하이메탈 #오픈베이스 #케이아이엔엑스 #파이오링크</span></p><p><span class=\"ql-size-small\">#반도체 관련주 #가온칩스 #동운아나텍 #마이크로투나노 #유니퀘스트 #코아시아 #에이디테크놀로지</span></p><p><span class=\"ql-size-small\">#자동차 관련주 #서연이화 #KG모빌리티 #트루윈 #한주라이트메탈 #아진산업 #화신</span></p><p><span class=\"ql-size-small\">#의료AI 관련주 #루닛 #비올 #제이엘케이 #뷰노 #딥노이드 #신한제7호스팩</span></p>",
        images: [
            'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299885-c8ca43a2-dca0-4428-8d39-25831173de5d.jpeg',
            'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299886-f9f50ad1-22e0-4cf3-8c88-67dbc433a838.jpeg',
            'https://d32rratnkhh4zp.cloudfront.net/media/images/2023/7/2/thumb@1080_1688299886-eeae94f7-9cd0-46da-9cdb-dac47a64806d.jpeg'
        ],
        seller: {
            id: 2,
            profile_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2021/7/5/thumb@1080_1625479198-59043e92-67de-46b1-8755-f21c5ca0a9ae.jpg',
            nickname: '벨르시 마켓',
            delivery_fee: 5000,
        },
        option: [
            { id: 1, name: "레드", price: 0, count: 3 },
            { id: 2, name: "블루", price: 0, count: 2 },
            { id: 3, name: "그린", price: 0, count: 1 },
        ],
    }
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
    const [sellerId, setSellerId] = useState(0)
    const [wantBuyList, setWantBuyList] = useState([]);
    const [cartList, setCartList] = useState([]);
    const [sellerList, setSellerList] = useState([]);
    const [itemCount, setItemCount] = useState(0)
    const [priceSum, setPriceSum] = useState(0)
    const [deliveryFee, setDeliveryFee] = useState(0)

    useEffect(() => {
        let cart_data = test_cart;
        setSellerId(cart_data[0]?.seller.id);
        setCartList(cart_data);
        setSellerList(cart_data.map(item => {
            return item.seller
        }))

    }, [])

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
                        }}
                        sx={{
                            width: '100%',
                            float: 'left'
                        }}
                    >
                        {_.uniqBy(sellerList, 'id').map((seller, idx) => {
                            return <Tab
                                label={seller.nickname}
                                value={seller.id}
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
                            if (e.target.checked) {
                                for (var i = 0; i < cartList.length; i++) {
                                    if (cartList[i].seller.id == sellerId) {
                                        want_buy_list.push(cartList[i].id)
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
                                {item.seller.id == sellerId &&
                                    <>
                                        {item.option.map(option => (
                                            <ItemBox style={{
                                                background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                                            }}>

                                                <div style={{padding:'1rem'}}>
                                                    <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size7, display: 'flex' }}>
                                                        <img src={item.product_img} width='48px' height='48px' style={{margin:'0 1rem 0 0.5rem'}}/>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <div>{item.product_name}</div>
                                                            <div>{commarNumber(item.item_pr + option.price)}원</div>
                                                            <div>옵션 : {option.name} / {option.count}개</div>
                                                            <div style={{marginTop:'0.5rem'}}>{commarNumber((item.item_pr + option.price) * option.count)}원</div>
                                                        </div>
                                                    </Typography>} control={<Checkbox checked={wantBuyList.includes(item.id)} onChange={(e) => {
                                                        let want_buy_list = [...wantBuyList];
                                                        if (e.target.checked) {
                                                            want_buy_list.pop(item.id)
                                                        }
                                                        else {
                                                            want_buy_list.push(item.id)
                                                        }
                                                        want_buy_list = _.uniq(want_buy_list);
                                                        setWantBuyList(want_buy_list)
                                                    }} />} />
                                                </div>
                                            </ItemBox>
                                        ))}
                                        <Row style={{justifyContent:'right'}}>상품 {} + 배송비 {deliveryFee} = {}</Row>
                                    </>
                                }
                            </>
                        ))}
                    </ContentContainer>

                    <ContentContainer style={{
                        background: `${themeMode == 'dark' ? '#000' : '#F6F6F6'}`,
                    }}>
                        <Row style={{ margin: '0.5rem 0', justifyContent: 'space-between' }}>
                            <div>주문 상품 수</div>
                            <div>{itemCount}개</div>
                        </Row>
                        <Row style={{ margin: '0.5rem 0', justifyContent: 'space-between' }}>
                            <div>총 주문금액</div>
                            <div>{commarNumber(priceSum)}원</div>
                        </Row>
                        <Row style={{ margin: '0.5rem 0', justifyContent: 'space-between' }}>
                            <div>배송비</div>
                            <div>{test_cart.seller}</div>
                        </Row>
                        <Row style={{ margin: '1rem 0 2rem 0', justifyContent: 'space-between', fontWeight:'bold', color: themeDnsData.theme_css?.main_color }}>
                            <div>총 결제 금액</div>
                            <div>{commarNumber(priceSum)}원</div>
                        </Row>
                        <Button variant='contained' style={{height:'56px', fontSize:'large'}}>
                            구매하기
                        </Button>
                    </ContentContainer>
                </ContentWrappers>
            </Wrappers>
        </>
    )
}
export default Demo1
