import { useTheme } from "@emotion/react"
import { useSettingsContext } from "src/components/settings"
import { useLocales } from "src/locales"
import styled from "styled-components"
import { logoSrc } from "src/data/data"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import Link from "next/link"

const Wrapper = styled.footer`
width:100%;
padding: 1rem 0 1.5rem 0;
margin-top: auto;
`
const ContentWrapper = styled.div`
display:flex;
width:100%;
margin: 0 auto;
justify-content: space-between;
`
const Row = styled.div`
display:flex;
`
const Col = styled.div`
display:flex;
flex-direction: column;
`
const Bold = styled.div`
font-weight:bold;
margin-right:0.5rem;
`
const MarginRight = styled.div`
margin-right:0.2rem;
`

const MainContent = styled.div`
display:flex;
flex-direction: column;
row-gap: 0.25rem;
color:#999999;
font-size: 12px;
max-width: 1400px;
margin:0 auto;
width:90%;
margin-bottom: 85px;
`

const SubContent = styled.div`
display:flex;
flex-direction: column;
row-gap: 0.25rem;
`

const Footer = (props) => {
    const {
        data: {
        },
        func: {
            router
        },
    } = props;
    const theme = useTheme();
    const { translate } = useLocales();
    const { themeDnsData, themeMode, themePostCategoryList } = useSettingsContext();
    // 푸터 HELP 영역의 게시판 링크.
    //
    // 예전엔 '/shop/service/47'(공지사항)·'/shop/service/46'(1:1문의)로 id 가 하드코딩돼 있었다.
    // 그 두 id 는 brand 5(demo4.asapmall.kr)의 게시판이다. 같은 프레임3을 쓰는 다른 가맹점
    // (testshop·testshop1·test030)은 자기 게시판 id 가 따로 있어서, 푸터를 누르면 남의 브랜드
    // 게시판으로 갔다(교차 브랜드 차단이 들어간 뒤로는 그냥 열리지 않는다).
    // 지금 브랜드의 게시판 목록에서 제목으로 찾고, 못 찾으면 링크 자체를 감춘다.
    const findBoard = (keyword) => (themePostCategoryList ?? [])
        .find((c) => String(c?.post_category_title ?? '').includes(keyword));
    const noticeBoard = findBoard('공지');
    const inquiryBoard = findBoard('문의');
    const {
        company_name,
        addr,
        business_num,
        ceo_name,
        phone_num,
        fax_num,
        mail_order_num,
        pvcy_rep_name,
    } = themeDnsData;
    const { user, logout } = useAuthContext()

    const onLogout = async () => {
        let result = await logout();
        //router.reload();
        window.location.reload();
    }
    return (
        <>
            {
                themeDnsData?.is_closure == 1 && !user ?
                    <></>
                    :
                    <>
                        <div style={{ marginTop: '2rem' }} />
                        <Wrapper style={{ fontFamily: 'Noto Sans KR' }}>
                            {
                                /*
                                <ContentWrapper style={{ backgroundColor: `${themeMode != 'dark' ? '#FF5B0D' : ''}`, }}>
                                <MainContent style={{ display: 'flex', flexDirection: 'row', marginTop: '50px', justifyContent: 'space-between' }}>
                                    <div>
                                        <Row style={{ fontWeight: 'bold', fontSize: '16px', color: 'white', fontFamily: 'Playfair Display', }}>
                                            OUR SERVICE
                                        </Row>
                                        <br /><br />
                                        <Row style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}>
                                            온라인 판매
                                        </Row>
                                        <Link href={'/shop/guide/brand-about'} passHref>
                                            <Row style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}>
                                                오프라인
                                            </Row>
                                        </Link>
                                        <Link href={'/shop/guide/purchase-guide'} passHref>
                                            <Row style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}>
                                                매입센터
                                            </Row>
                                        </Link>
                                        <Link href={'/shop/guide/purchase-guide'} passHref>
                                            <Row style={{ color: 'white', cursor: 'pointer' }}>
                                                위탁판매
                                            </Row>
                                        </Link>
                                    </div>
                                    <div>
                                        <Row style={{ fontWeight: 'bold', fontSize: '16px', color: 'white', fontFamily: 'Playfair Display', }}>
                                            HELP
                                        </Row>
                                        <br /><br />
                                        {noticeBoard &&
                                            <Link href={`/shop/service/${noticeBoard?.id}`} passHref>
                                                <Row style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}>
                                                    공지사항
                                                </Row>
                                            </Link>}
                                        {/* 로그아웃은 하단정보에 두지 않는다(헤더에 있다).
                                            비회원에게는 로그인 링크가 필요하므로 그쪽만 남긴다. */}
                                        {!user &&
                                            <Row
                                                style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}
                                                onClick={() => router.push('/shop/auth/login')}
                                            >
                                                로그인
                                            </Row>}
                                        <Link href={'/shop/auth/order-check'} passHref>
                                            <Row style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}>
                                                비회원주문조회
                                            </Row>
                                        </Link>
                                        {inquiryBoard &&
                                            <Link href={`/shop/service/${inquiryBoard?.id}`} passHref>
                                                <Row style={{ color: 'white', cursor: 'pointer' }}>
                                                    1:1문의
                                                </Row>
                                            </Link>}
                                    </div>
                                    <div>
                                        <Row style={{ fontWeight: 'bold', fontSize: '16px', color: 'white', fontFamily: 'Playfair Display', }}>
                                            C.S CENTER
                                        </Row>
                                        <br /><br />
                                        <Row style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>
                                            02-517-2950
                                        </Row>
                                        <Row style={{ fontWeight: 'bold', fontSize: '18px', color: 'white', marginBottom: '0.5rem' }}>
                                            02-517-8950
                                        </Row>
                                        <Row style={{ color: 'white', }}>
                                            월-금 AM 10:30 ~ PM 7:00
                                        </Row>
                                        <Row style={{ color: 'white', }}>
                                            토요일 AM 10:30 ~ PM 6:00
                                        </Row>
                                        <Row style={{ color: 'white', }}>
                                            일요일, 공휴일 휴무
                                        </Row>
                                    </div>
                                </MainContent>
                            </ContentWrapper>
                                */
                            }
                            <ContentWrapper style={{ backgroundColor: `${themeMode != 'dark' ? /*'#FF5B0D'*/themeDnsData?.theme_css.main_color : ''}`, height: '56px' }}></ContentWrapper>
                            <ContentWrapper style={{ display: 'flex', maxWidth: '1400px' }}>
                                <MainContent style={{ marginTop: '28px' }}>
                                    {/* 예전엔 항목마다 <Row> 한 줄씩 8줄이 세로로 쌓였다.
                                        검은 푸터가 스크롤 한 화면을 거의 다 먹어서 "너무 크고 돋보인다"는
                                        가맹점 의견이 나왔다. 표시 의무 항목은 그대로 두고 배치만 가로 wrap 으로
                                        바꾸고 한 단계 더 흐리게 한다(배경은 이 프레임의 디자인이라 유지). */}
                                    <Row style={{ position: 'relative', marginBottom: '6px' }}>
                                        <MarginRight style={{ fontWeight: 'bold', fontSize: '14px', opacity: 0.85 }}>{company_name}</MarginRight>
                                    </Row>
                                    <Row style={{ flexWrap: 'wrap', columnGap: '1rem', rowGap: '2px', fontSize: '12px', opacity: 0.55, lineHeight: 1.75 }}>
                                        {ceo_name?.length > 1 && <span>대표 {ceo_name}</span>}
                                        {business_num?.length > 1 && <span>사업자등록번호 {business_num}</span>}
                                        {mail_order_num?.length > 1 && <span>통신판매번호 {mail_order_num}</span>}
                                        {addr?.length > 1 && <span>주소 {addr}</span>}
                                        {phone_num?.length > 1 && <span>TEL {phone_num}</span>}
                                        {fax_num?.length > 1 && <span>FAX {fax_num}</span>}
                                        {pvcy_rep_name?.length > 1 && <span>개인정보 보호책임자 {pvcy_rep_name}</span>}
                                    </Row>
                                    {
                                        /*
                                        <Row>
                                        COPYRIGHT © GRANDPARIS ALL RIGHTS RESERVED.
                                        </Row>
                                        */
                                    }
                                    <Col style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
                                        <Row>
                                            <Link href={'/shop/auth/policy?type=0'} passHref>
                                                <MarginRight style={{ cursor: 'pointer' }}>
                                                    Terms
                                                </MarginRight>
                                            </Link>
                                            <Link href={'/shop/auth/policy?type=1'} passHref>
                                                <MarginRight style={{ cursor: 'pointer' }}>
                                                    | Privacy Policy
                                                </MarginRight>
                                            </Link>
                                            <Link href={'/shop/auth/policy?type=3'} passHref>
                                                <MarginRight style={{ cursor: 'pointer' }}>
                                                    | {translate('쇼핑몰 이용안내')}
                                                </MarginRight>
                                            </Link>
                                        </Row>
                                        <br />
                                        {
                                            /*
                                             <Row>
                                                <img
                                                    src='/grandparis/instagram.png'
                                                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        window.open('https://www.instagram.com/grandparis__/')
                                                    }}
                                                />
                                                <img
                                                    src='/grandparis/kakaotalk.png'
                                                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                                />
                                                <img
                                                    src='/grandparis/band.png'
                                                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        window.open('https://blog.naver.com/grandparis88')
                                                    }}
                                                />
                                            </Row>
                                            */
                                        }
                                    </Col>
                                </MainContent>
                                <MainContent style={{ marginTop: '50px' }}>
                                    {
                                        /*
                                        <Row style={{ position: 'relative' }}>
                                        <MarginRight style={{ fontWeight: 'bold', fontSize: '16px' }}>(주)럭셔리에디션</MarginRight>
                                    </Row>
                                    <Row>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <MarginRight>인천시 중구 공항문화로 127 (중구 용유로 542) 인스파이어리조트 3층 R03, R04</MarginRight>
                                        </div>
                                    </Row>
                                    <Row>
                                        <div style={{ display: 'flex' }}>
                                            <MarginRight>TEL : 032-215-8887, 032-215-8889</MarginRight>
                                        </div>
                                    </Row>
                                    <Row>
                                        <MarginRight>대표 : 최성일, 최윤영, 이동영</MarginRight>
                                            </Row>
                                    <Row>
                                        <MarginRight>사업자등록번호 : 592-87-02871</MarginRight>
                                    </Row>
                                        */
                                    }

                                </MainContent>
                            </ContentWrapper>
                        </Wrapper>
                    </>
            }
        </>
    )
}

export default Footer;