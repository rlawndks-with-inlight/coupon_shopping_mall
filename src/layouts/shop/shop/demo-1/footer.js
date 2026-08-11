import { useTheme } from "@emotion/react"
import { useSettingsContext } from "src/components/settings"
import { useLocales } from "src/locales"
import styled from "styled-components"
import { useEffect } from "react"

/* 푸터는 '법적으로 반드시 있어야 하지만 눈에 띌 필요는 없는' 영역이다.
   예전엔 회사명·주소·사업자번호·대표·고객센터·팩스·보호책임자·통신판매번호를
   각각 한 줄씩(8줄) 굵은 라벨 + 본문 색으로 세로로 쌓아서, 화면 한 폭을 통째로 먹고
   상품보다 더 도드라졌다("너무 큰 영역을 차지하고 돋보인다"는 가맹점 의견).
   내용은 그대로 두고 배치만 가로 wrap + 저채도로 바꾼다 — 표시 의무는 그대로 지킨다. */
const Wrapper = styled.footer`
width:100%;
padding: 1.75rem 0;
margin-top: auto;
`
const ContentWrapper = styled.div`
display:flex;
flex-direction:column;
width:90%;
max-width:1600px;
margin: 0 auto;
row-gap: 6px;
font-size:12px;
line-height:1.7;
`
/* 한 줄에 최대한 붙여 흘리고, 좁은 화면에서만 자연스럽게 접힌다. */
const Row = styled.div`
display:flex;
flex-wrap:wrap;
column-gap:1rem;
row-gap:2px;
`
const Bold = styled.span`
font-weight:600;
margin-right:0.35rem;
`
const MarginRight = styled.span`
margin-right:0.5rem;
`
/* 항목 하나(라벨+값) 묶음.
   nowrap 은 쓰지 않는다 — 주소처럼 긴 값이 들어가면 좁은 화면에서 가로 스크롤이 생긴다.
   대신 한국어 단어 중간이 끊기지 않게만 한다. */
const Field = styled.span`
word-break:keep-all;
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
      {/* 회색 배경 덩어리 대신 얇은 구분선 + 흐린 글자 — 존재는 하되 도드라지지 않게 */}
      <Wrapper style={{
        background: theme.palette.mode == 'dark' ? '#111' : '#fafafa',
        borderTop: `1px solid ${theme.palette.mode == 'dark' ? '#333' : '#eee'}`,
        color: theme.palette.text.disabled,
      }}>
        <ContentWrapper>
          <Row>
            {company_name && <Field><Bold>{translate('회사명')}</Bold>{company_name}</Field>}
            {addr && <Field><Bold>{translate('주소')}</Bold>{addr}</Field>}
            {business_num && <Field><Bold>{translate('사업자등록번호')}</Bold>{business_num}</Field>}
            {ceo_name && <Field><Bold>{translate('대표')}</Bold>{ceo_name}</Field>}
            {phone_num && <Field><Bold>{translate('고객센터')}</Bold>{phone_num}</Field>}
            {fax_num && <Field><Bold>{translate('팩스')}</Bold>{fax_num}</Field>}
            {pvcy_rep_name && <Field><Bold>{translate('개인정보 보호책임자')}</Bold>{pvcy_rep_name}</Field>}
            {mail_order_num && <Field><Bold>{translate('통신판매번호')}</Bold>{mail_order_num}</Field>}
          </Row>
          <Row style={{ textDecoration: 'underline', marginTop: '4px' }}>
            <Bold style={{ marginRight: 0, cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=0') }}>{translate('서비스이용약관')}</Bold>
            <Bold style={{ marginRight: 0, cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=1') }}>{translate('개인정보처리방침')}</Bold>
            <Bold style={{ marginRight: 0, cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/policy?type=3') }}>{translate('쇼핑몰 이용안내')}</Bold>
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
                      alt={translate('KB에스크로 이체 인증마크')}
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
