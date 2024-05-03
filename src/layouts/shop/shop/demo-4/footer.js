import { useTheme } from "@emotion/react"
import { useSettingsContext } from "src/components/settings"
import { useLocales } from "src/locales"
import styled from "styled-components"
import { logoSrc } from "src/data/data"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"

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
    const { themeDnsData, themeMode } = useSettingsContext();
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
            <div style={{ marginTop: '2rem' }} />
            <Wrapper style={{ fontFamily: 'Noto Sans KR' }}>
                <ContentWrapper style={{ backgroundColor: `${themeMode != 'dark' ? '#FF5B0D' : ''}`, }}>
                    <MainContent style={{ display: 'flex', flexDirection: 'row', marginTop: '50px', justifyContent: 'space-between' }}>
                        <div>
                            <Row style={{ fontWeight: 'bold', fontSize: '16px', color: 'white', fontFamily: 'Playfair Display', }}>
                                OUR SERVICE
                            </Row>
                            <br /><br />
                            <Row
                                style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}
                            >
                                온라인 판매
                            </Row>
                            <Row
                                style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}
                                onClick={() => {
                                    router.push('/shop/guide/brand-about')
                                }}
                            >
                                오프라인
                            </Row>
                            <Row
                                style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}
                                onClick={() => {
                                    router.push('/shop/guide/purchase-guide')
                                }}
                            >
                                매입센터
                            </Row>
                            <Row
                                style={{ color: 'white', cursor: 'pointer' }}
                                onClick={() => {
                                    router.push('/shop/guide/purchase-guide')
                                }}
                            >
                                위탁판매
                            </Row>
                        </div>
                        {/*<div>
                            <Row style={{fontWeight:'bold', fontSize:'16px', color:'#FFFFFF', fontFamily:'Playfair Display',}}>
                                SELL
                            </Row>
                            <br /><br />
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                온라인 판매
                            </Row>
                            <Row 
                            style={{marginBottom:'0.7rem', cursor:'pointer'}}
                            onClick={() => {
                                router.push('shop/guide/brand-about')
                            }}
                            >
                                오프라인
                            </Row>
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                매입센터
                            </Row>
                            <Row style={{cursor:'pointer'}}>
                                위탁센터
                            </Row>
                        </div>*/}
                        <div>
                            <Row style={{ fontWeight: 'bold', fontSize: '16px', color: 'white', fontFamily: 'Playfair Display', }}>
                                HELP
                            </Row>
                            <br /><br />
                            <Row
                                style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}
                                onClick={() => {
                                    router.push('/shop/service/47')
                                }}
                            >
                                공지사항
                            </Row>
                            <Row
                                style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}
                                onClick={() => {
                                    if (user) {
                                        onLogout()
                                    } else {
                                        router.push('/shop/auth/login')
                                    }
                                }}
                            >
                                {user ? '로그아웃' : '로그인'}
                            </Row>
                            <Row
                                style={{ marginBottom: '0.7rem', color: 'white', cursor: 'pointer' }}
                                onClick={() => {
                                    router.push('/shop/auth/login/?scroll_to=700')
                                }}
                            >
                                비회원주문조회
                            </Row>
                            <Row style={{ color: 'white', cursor: 'pointer' }}
                                onClick={() => {
                                    router.push('/shop/service/46')
                                }}
                            >
                                1:1문의
                            </Row>
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
                <ContentWrapper style={{ display: 'flex', maxWidth: '1400px' }}>
                    <MainContent style={{ marginTop: '50px' }}>
                        <Row style={{ position: 'relative' }}>
                            <MarginRight style={{ fontWeight: 'bold', fontSize: '16px' }}>{company_name}</MarginRight>
                        </Row>
                        <Row>
                            {addr?.length > 1 &&
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <MarginRight>{addr}</MarginRight>
                                    </div>

                                </>
                            }
                        </Row>
                        <Row>
                            {phone_num?.length > 1 &&
                                <>
                                    <div style={{ display: 'flex' }}>
                                        <MarginRight>TEL : {phone_num}</MarginRight>
                                    </div>

                                </>
                            }
                        </Row>
                        <Row>
                            {ceo_name?.length > 1 &&
                                <>
                                    <MarginRight>대표 : {ceo_name}</MarginRight>

                                </>
                            }
                        </Row>
                        <Row>
                            {business_num?.length > 1 &&
                                <>
                                    <MarginRight>사업자등록번호 : {business_num}</MarginRight>
                                </>
                            }
                        </Row>
                        <Row>
                            {pvcy_rep_name?.length > 1 &&
                                <>
                                    <MarginRight>개인정보 보호책임자 : {pvcy_rep_name}</MarginRight>
                                </>
                            }
                        </Row>
                        <Row>
                            {fax_num?.length > 1 &&
                                <>
                                    <MarginRight>FAX : {fax_num}</MarginRight>
                                </>
                            }
                        </Row>
                        <Row>
                            {mail_order_num?.length > 1 &&
                                <>
                                    <MarginRight>통신판매번호 : {mail_order_num}</MarginRight>
                                </>
                            }
                        </Row>
                        <br />
                        <Row>
                            COPYRIGHT © GRANDPARIS ALL RIGHTS RESERVED.
                        </Row>
                        <br />
                        <Col>
                            <Row>
                                <MarginRight style={{ cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=0') }}>Terms</MarginRight>
                                <MarginRight style={{ cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=1') }}>| Privacy Policy</MarginRight>
                            </Row>
                            <br />
                            <Row >
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
                        </Col>
                    </MainContent>
                    <MainContent style={{ marginTop: '50px' }}>
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
                        {/*<Row>
                            <MarginRight>대표 : 최성일, 최윤영, 이동영</MarginRight>
                                </Row>*/}
                        <Row>
                            <MarginRight>사업자등록번호 : 592-87-02871</MarginRight>
                        </Row>

                    </MainContent>
                </ContentWrapper>
            </Wrapper>
        </>
    )
}

export default Footer;