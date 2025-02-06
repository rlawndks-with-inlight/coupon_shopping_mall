import { useTheme } from "@emotion/react"
import { useSettingsContext } from "src/components/settings"
import { useLocales } from "src/locales"
import styled from "styled-components"
import { useEffect } from "react"

const Wrapper = styled.footer`
width:100%;
padding: 3rem 0 3rem 0;
margin-top: auto;
`
const ContentWrapper = styled.div`
display:flex;
flex-direction:column;
width:90%;
max-width:1600px;
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
    pvcy_rep_name,
    mail_order_num
  } = themeDnsData;


  useEffect(() => {
    window.KB_AUTHMARK_FORM = document.querySelector('form[name="KB_AUTHMARK_FORM"]');
  }, []);

  const onPopKBAuthMark = () => {
    window.open(
      '',
      'KB_AUTHMARK',
      'height=604, width=648, status=yes, toolbar=no, menubar=no, location=no'
    );

    const form = window.KB_AUTHMARK_FORM;
    form.action = 'https://okbfex.kbstar.com/quics';
    form.target = 'KB_AUTHMARK';
    form.submit();
  };

  return (
    <>
      <div style={{ marginTop: '2rem' }} />
      <Wrapper style={{ background: `${theme.palette.mode == 'dark' ? '' : theme.palette.grey[200]}` }}>
        <ContentWrapper>
          {
            company_name &&
            <>
              <Row>
                <Bold>{translate('회사명')}</Bold>
                <MarginRight>{company_name}</MarginRight>
              </Row>
            </>
          }
          {
            addr &&
            <>
              <Row>
                <Bold>{translate('주소')}</Bold>
                <MarginRight>{addr}</MarginRight>
              </Row>
            </>
          }
          {
            business_num &&
            <>
              <Row>
                <Bold>{translate('사업자등록번호')}</Bold>
                <MarginRight>{business_num}</MarginRight>
              </Row>
            </>
          }
          {
            ceo_name &&
            <>
              <Row>
                <Bold>{translate('대표')}</Bold>
                <MarginRight>{ceo_name}</MarginRight>
              </Row>
            </>
          }
          {
            phone_num &&
            <>
              <Row>
                <Bold>{translate('고객센터')}</Bold>
                <MarginRight>{phone_num}</MarginRight>
              </Row>
            </>
          }
          {
            fax_num &&
            <>
              <Row>
                <Bold>{translate('팩스')}</Bold>
                <MarginRight>{fax_num}</MarginRight>
              </Row>
            </>
          }

          {
            pvcy_rep_name &&
            <>
              <Row>
                <Bold>{translate('개인정보 보호책임자')}</Bold>
                <MarginRight>{pvcy_rep_name}</MarginRight>
              </Row>
            </>
          }
          {
            mail_order_num &&
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
          <Row>
            {
              themeDnsData.id == 77 &&
              <>
                <>
                  <form name="KB_AUTHMARK_FORM" method="get">
                    <input type="hidden" name="page" value="C021590" />
                    <input type="hidden" name="cc" value="b034066:b035526" />
                    <input
                      type="hidden"
                      name="mHValue"
                      value="20710323f146ce27b983d5b8ec7fd913"
                    />
                  </form>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPopKBAuthMark();
                    }}
                  >
                    <img
                      src="http://img1.kbstar.com/img/escrow/escrowcmark.gif"
                      alt="KB에스크로 이체 인증마크"
                      style={{ border: 0 }}
                    />
                  </a>
                </>
              </>
            }
          </Row>
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default Footer
