import { useTheme } from "@emotion/react"
import { useSettingsContext } from "src/components/settings"
import { useLocales } from "src/locales"
import styled from "styled-components"
import { logoSrc } from "src/data/data"

const Wrapper = styled.footer`
width:100%;
padding: 3rem 0 3rem 0;
margin-top: auto;
font-family: 'ABeeZee';
font-weight: 400;
font-size: 14px;
`

const SubWrapper = styled.div`
display: flex;
max-width: 1240px;
margin: 0 auto;
@media (max-width: 1240px) {
  flex-direction: column;
}
`

const ContentWrapper = styled.div`
display:flex;
flex-direction:column;
width:90%;
margin: 0 auto;
row-gap: 0.25rem;
`
const Row = styled.div`
display:flex;
`
const Bold = styled.div`
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
        pvcy_rep_name,
        mail_order_num
    } = themeDnsData;
    return (
        <>
            <div style={{ marginTop: '2rem' }} />
            <Wrapper style={{ background: `${theme.palette.mode == 'dark' ? '' : '#EEEEEE'}` }}>
                <SubWrapper>
                    <ContentWrapper>
                        <Row>
                            <Bold style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { router.push('/shop/auth/policy?type=0') }}>{translate('서비스이용약관')}</Bold>
                            <Bold style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { router.push('/shop/auth/policy?type=1') }}>{translate('개인정보처리방침')}</Bold>
                        </Row>
                        <Row style={{ marginTop: '1rem' }}>
                            <img src='/logos/asapmall_full.png' style={{ height: '30px', maxWidth: '150px', marginRight: '1rem' }} />
                            <Row style={{ color: '#999', marginRight: '1rem' }}>
                                서울특별시 영등포구 여의대방로67길 11, 5층 에이5-41호(여의도동)<br />
                                대표 : 장지영 | 사업자번호 : 421-88-02504<br />
                                Tel. : 010-5519-2504<br />
                                FAX : 0504-144-9419<br />
                                E-mail : woojinplatform@gmail.com
                            </Row>
                        </Row>
                    </ContentWrapper>
                </SubWrapper>
            </Wrapper>
        </>
    )
}
export default Footer
