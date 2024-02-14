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
flex-direction:column;
width:90%;
max-width:1300px;
margin: 0 auto;
row-gap: 0.25rem;
`
const Row = styled.div`
display:flex;
`
const Bold = styled.div`
font-weight:bold;
margin-right:0.5rem;
`
const MarginRight = styled.div`
margin-right:0.5rem;
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
            <Wrapper style={{ background: `${theme.palette.mode == 'dark' ? '' : theme.palette.grey[200]}` }}>
                <ContentWrapper>
                    <img src={logoSrc()} style={{ width: '200px' }} />

                    {/*
            <Row>
              <Bold>{translate('회사명')}</Bold>
              <MarginRight>{company_name}</MarginRight>
            </Row>
  */}
                    {ceo_name.length > 1 &&
                        <>
                            <Row>
                                <Bold>{translate('대표')}</Bold>
                                <MarginRight>{ceo_name}</MarginRight>
                            </Row>
                        </>
                    }
                    {addr.length > 1 &&
                        <>
                            <Row>
                                <Bold style={{ whiteSpace: 'nowrap' }}>{translate('주소')}</Bold>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <MarginRight>{addr}</MarginRight>
                                    <MarginRight>인스파이어점 : 인천시 중구 공항문화로 127 (중구 용유로 542) 3층</MarginRight>
                                </div>
                            </Row>
                        </>
                    }
                    {business_num.length > 1 &&
                        <>
                            <Row>
                                <Bold>{translate('사업자등록번호')}</Bold>
                                <MarginRight>{business_num}</MarginRight>
                            </Row>
                        </>
                    }
                    {phone_num.length > 1 &&
                        <>
                            <Row>
                                <Bold>{translate('전화')}</Bold>
                                <div style={{ display: 'flex' }}>
                                    <MarginRight>{phone_num}</MarginRight>
                                    <MarginRight>02-517-8950</MarginRight>
                                </div>
                            </Row>
                        </>
                    }
                    {fax_num.length > 1 &&
                        <>
                            <Row>
                                <Bold>{translate('팩스')}</Bold>
                                <MarginRight>{fax_num}</MarginRight>
                            </Row>
                        </>
                    }
                    {pvcy_rep_name.length > 1 &&
                        <>
                            <Row>
                                <Bold>{translate('개인정보 보호책임자')}</Bold>
                                <MarginRight>{pvcy_rep_name}</MarginRight>
                            </Row>
                        </>
                    }

                    {mail_order_num.length > 1 &&
                        <>
                            <Row>
                                <Bold>{translate('통신판매번호')}</Bold>
                                <MarginRight>{mail_order_num}</MarginRight>
                            </Row>
                        </>
                    }
                    <Row style={{ flexWrap: 'wrap', textDecoration: 'underline' }}>
                        <Bold style={{ marginRight: '1rem', cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=0') }}>{translate('서비스이용약관')}</Bold>
                        <Bold style={{ cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=1') }}>{translate('개인정보처리방침')}</Bold>
                    </Row>
                </ContentWrapper>
            </Wrapper>
        </>
    )
}

export default Footer;