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
                <ContentWrapper style={{ display: 'flex', maxWidth: '1600px' }}>
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
                        <Col>
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
                            </Row>
                            <br />
                        </Col>
                    </MainContent>
                </ContentWrapper>
            </Wrapper>
        </>
    )
}

export default Footer;