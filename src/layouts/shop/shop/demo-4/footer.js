import { useTheme } from "@emotion/react"
import { useSettingsContext } from "src/components/settings"
import { useLocales } from "src/locales"
import styled from "styled-components"
import { logoSrc } from "src/data/data"

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
    const { themeDnsData } = useSettingsContext();
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
    return (
        <>
            <div style={{ marginTop: '2rem' }} />
            <Wrapper>
                <ContentWrapper style={{backgroundColor:'#000000'}}>
                <MainContent style={{display:'flex', flexDirection:'row', marginTop:'50px', justifyContent:'space-between'}}>
                        <div>
                            <Row style={{fontWeight:'bold', fontSize:'16px', color:'#FFFFFF'}}>
                                OUR SERVICE
                            </Row>
                            <br /><br />
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                온라인 판매
                            </Row>
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                오프라인
                            </Row>
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                매입센터
                            </Row>
                            <Row style={{cursor:'pointer'}}>
                                위탁센터
                            </Row>
                        </div>
                        <div>
                            <Row style={{fontWeight:'bold', fontSize:'16px', color:'#FFFFFF'}}>
                                SELL
                            </Row>
                            <br /><br />
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                온라인 판매
                            </Row>
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                오프라인
                            </Row>
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                매입센터
                            </Row>
                            <Row style={{cursor:'pointer'}}>
                                위탁센터
                            </Row>
                        </div>
                        <div>
                            <Row style={{fontWeight:'bold', fontSize:'16px', color:'#FFFFFF'}}>
                                HELP
                            </Row>
                            <br /><br />
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                공지사항
                            </Row>
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                로그인
                            </Row>
                            <Row style={{marginBottom:'0.7rem', cursor:'pointer'}}>
                                비회원주문조회
                            </Row>
                            <Row style={{cursor:'pointer'}}>
                                1:1문의
                            </Row>
                        </div>
                        <div>
                            <Row style={{fontWeight:'bold', fontSize:'16px', color:'#FFFFFF'}}>
                                C.S CENTER
                            </Row>
                            <br /><br />
                            <Row style={{fontWeight:'bold', fontSize:'18px', color:'#FFFFFF'}}>
                                02-517-2950
                            </Row>
                            <Row style={{fontWeight:'bold', fontSize:'18px', color:'#FFFFFF', marginBottom:'0.5rem'}}>
                                02-517-8950
                            </Row>
                            <Row>
                                월-금 AM 10:30 ~ PM 7:30
                            </Row> 
                            <Row>
                                토요일 AM 10:30 ~ PM 6:00
                            </Row>
                            <Row>
                                일요일, 공휴일 휴무
                            </Row>
                        </div>
                    </MainContent>
                </ContentWrapper>
                <ContentWrapper style={{display:'flex', flexDirection:'column'}}>
                    <MainContent style={{marginTop:'50px'}}>
                        <Row style={{position:'relative'}}>
                            <MarginRight style={{fontWeight:'bold', fontSize:'16px'}}>{company_name}</MarginRight>
                            <Row style={{position:'absolute', right:'0'}}>
                            <MarginRight style={{ cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=0') }}>Terms</MarginRight>
                            <MarginRight style={{ cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=1') }}>| Privacy Policy</MarginRight>
                            <Row style={{marginLeft:'1rem'}}>
                                <img 
                                src='/grandparis/instagram.png'
                                style={{marginRight:'0.5rem', cursor:'pointer'}}
                                />
                                <img 
                                src='/grandparis/kakaotalk.png'
                                style={{marginRight:'0.5rem', cursor:'pointer'}}
                                />
                                <img 
                                src='/grandparis/band.png'
                                style={{marginRight:'0.5rem', cursor:'pointer'}}
                                />
                            </Row>
                            </Row>
                        </Row>
                        <Row>
                        {addr?.length > 1 &&
                            <>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <MarginRight>{addr}</MarginRight>
                                    </div>
                                
                            </>
                        }
                        {phone_num?.length > 1 &&
                            <>
                                    <div style={{ display: 'flex' }}>
                                        <MarginRight>| TEL : {phone_num}</MarginRight>
                                    </div>
                                
                            </>
                        }
                        {ceo_name?.length > 1 &&
                            <>
                                    <MarginRight>| 대표 : {ceo_name}</MarginRight>
                                
                            </>
                        }
                        </Row>
                        <Row>
                        {business_num?.length > 1 &&
                            <>
                                    <MarginRight>사업자등록번호 : {business_num}</MarginRight>
                            </>
                        }
                        {fax_num?.length > 1 &&
                            <>
                                    <MarginRight>| FAX : {fax_num}</MarginRight>
                            </>
                        }
                        {pvcy_rep_name?.length > 1 &&
                            <>
                                    <MarginRight>| 개인정보 보호책임자 : {pvcy_rep_name}</MarginRight>
                            </>
                        }

                        {mail_order_num?.length > 1 &&
                            <>
                                    <MarginRight>| 통신판매번호 : {mail_order_num}</MarginRight>
                            </>
                        }
                        </Row>
                        <br />
                        <Row>
                        COPYRIGHT © GRANDPARIS ALL RIGHTS RESERVED.
                        </Row>
                    </MainContent>
                </ContentWrapper>
            </Wrapper>
        </>
    )
}

export default Footer;