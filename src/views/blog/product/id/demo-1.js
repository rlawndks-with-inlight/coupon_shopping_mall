import { Icon } from '@iconify/react';
import { Select, MenuItem, Drawer, FormControl, InputLabel, Button, Avatar, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { test_categories, test_items, test_seller } from 'src/data/test-data';
import styled from 'styled-components'
import _ from 'lodash'
import { commarNumber } from 'src/utils/function';
import Slider from 'react-slick';
import { useTheme } from '@emotion/react';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})
const Wrappers = styled.div`
max-width: 840px;
width:100%;
margin: 0 auto;
display:flex;
flex-direction:column;
position:relative;
`
const BannerImg = styled.div`
width:100%;
height:400px;
display:flex;
flex-direction:column;
align-items:center;

`
const ContentWrappers = styled.div`
position:absolute;
top:350px;
display:flex;
flex-direction:column;
padding:1rem;
width:100%;
border-top-left-radius: 24px;
border-top-right-radius: 24px;
`
const ItemName = styled.div`
font-size:${themeObj.font_size.size6};
font-weight:bold;
padding:0.5rem 0;
`
const PriceContainer = styled.div`
padding:0.5rem 0;
display:flex;
flex-direction:column;
`
const ContentContainer = styled.div`
display:flex;
flex-direction:column;
padding:1rem 0;
`
const test_item = {
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
        nickname: 'Merrymond'
    }
}
// 셀러별 메인페이지 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { themeMode } = useSettingsContext();

    const theme = useTheme();

    const [item, setItem] = useState({});
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        let data = test_item
        data['images'].unshift(data?.product_img);
        setItem(data)
    }, [])
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollHeight = window.scrollY;
            setScrollY(currentScrollHeight)
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    const sliderSetting = {
        infinite: true,
        speed: 500,
        autoplay: false,
        autoplaySpeed: 2500,
        slidesToShow: 1,
        slidesToScroll: 1,
    }
    return (
        <>

            <Wrappers>
                <Slider {...sliderSetting}>
                    {item?.images && item?.images.map((item, idx) => (
                        <>
                            <BannerImg style={{
                                backgroundImage: `url(${item})`,
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                            }} />
                        </>
                    ))}
                </Slider>
                <ContentWrappers style={{
                    background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
                }}>
                    <Row style={{ justifyContent: 'space-between' }}>
                        <Row style={{ alignItems: 'center', cursor: 'pointer' }} onClick={() => { router.push(`/blog/seller/${item.seller?.id}`) }}>
                            <Avatar src={item.seller?.profile_img} sx={{ width: '30px', height: '30px' }} />
                            <div style={{ marginLeft: '0.25rem',fontSize:themeObj.font_size.size8 }}>{item.seller?.nickname}</div>
                        </Row>
                        <Button variant='outlined' sx={{
                            height: '30px',
                        }}>
                            1:1문의
                        </Button>
                    </Row>
                    <ItemName>{item.product_name}</ItemName>
                    <Divider />
                    <PriceContainer>
                        {item.item_pr < item.mkt_pr &&
                            <>
                                <Row style={{ alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: themeObj.font_size.size8, fontWeight: 'bold' }}>{parseInt((item.mkt_pr - item.item_pr) / item.mkt_pr * 100)}%</div>
                                    <div style={{ marginLeft: '0.5rem', fontSize: themeObj.font_size.size9, textDecoration: 'line-through', color: themeObj.grey[500] }}>{commarNumber(item.mkt_pr)}원</div>
                                </Row>

                            </>}
                        <Row style={{ alignItems: 'flex-end', fontWeight: 'bold' }}>
                            <div style={{ fontSize: themeObj.font_size.size6, color: theme.palette.error.main }}>{commarNumber(item.item_pr)}</div>
                            <div style={{ fontSize: themeObj.font_size.size8, marginLeft: '0.25rem' }}>원</div>
                        </Row>
                    </PriceContainer>
                    <Button variant='contained'>
                        구매하기
                    </Button>

                    <div style={{ marginTop: '1rem' }} />
                    <Divider />
                    <ContentContainer>
                        <div style={{ padding: '0 0 1rem 0', fontSize: themeObj.font_size.size8, fontWeight: 'bold' }}>상품정보</div>
                        <ReactQuill
                            className='none-padding'
                            value={item?.content ?? `<body></body>`}
                            readOnly={true}
                            theme={"bubble"}
                            bounds={'.app'}
                        />
                    </ContentContainer>
                </ContentWrappers>
            </Wrappers>
        </>
    )
}

export default Demo1
