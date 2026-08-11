import { useRouter } from "next/router";
import styled from "styled-components";
import { themeObj } from "src/components/elements/styled-components";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { isDemoHost } from "src/components/main-site/frameList";
import { useLocales } from "src/locales";
import PolicyBody from "src/components/elements/shop/PolicyBody";
import { TERMS, PRIVACY, GUIDE } from "src/data/policy-content";

// 약관·개인정보처리방침·이용안내 화면.
//
// 본문은 법무에서 받은 원본에서 자동 생성한다(scripts/policy/build.mjs).
// 예전엔 이 파일에 조문이 통째로 하드코딩돼 있었고, 게다가 이용약관은
// `themeDnsData?.id != 77` 로 두 벌이 갈려 있었다 — 브랜드 77 만 전자상거래 약관을 보고
// 판매중인 11개 프레임 가맹점은 전부 '소셜 로그인'을 언급하는 낡은 서비스 약관을 봤다.
// 이제 전 브랜드가 같은 본문을 보고, 회사명·쇼핑몰명·시행일만 브랜드 값으로 채운다.

// $embedded — 모달(DialogPolicy)이나 주문서 안에 끼울 때 켜는 모드.
// 페이지용 세로 확보(90vh)와 하단 여백을 그대로 두면 모달 본문에 뷰포트 높이만큼 빈 공간이 생긴다.
const Wrappers = styled.div`
display:flex;
flex-direction:column;
min-height:${props => props.$embedded ? 'auto' : '90vh'};
padding: ${props => props.$embedded ? '0' : '0 0 4rem 0'};
position: relative;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:${props => props.$embedded ? '100%' : '90%'};
margin:${props => props.$embedded ? '0' : '1rem auto'};
`
const Title = styled.div`
font-weight:bold;
font-size:${themeObj.font_size.size4};
margin-bottom:2rem;
`
const Text = styled.div`
margin-bottom:24px;
font-size:${themeObj.font_size.size7};
line-height:1.8;
word-break:keep-all;
`

export const POLICY_TYPE = { TERMS: 0, PRIVACY: 1, COPYRIGHT: 2, GUIDE: 3 };
const TITLES = {
  0: '이용약관',
  1: '개인정보처리방침',
  2: '저작권정책',
  3: '쇼핑몰 이용안내',
};

// 시행일자 — 가맹점이 등록된 날. 관리자에서 손으로 넣는 establish_date 는 대부분 비어 있어
// "이 약관은 (빈칸)부터 시행합니다" 로 나갔다.
const toKoreanDate = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const m = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (!m) return '';
  return `${Number(m[1])}년 ${Number(m[2])}월 ${Number(m[3])}일`;
};

const Policy = (props) => {
  // embedded 기본값 false — 이 컴포넌트를 그냥 끼워 쓰는 22곳(쇼핑몰형/블로그형 회원가입, 주문서, 관리자 등)의
  // 렌더 결과가 지금과 동일해야 한다.
  const { type, embedded = false } = props;
  const { themeDnsData } = useSettingsContext();
  const { translate } = useLocales();
  const router = useRouter();

  // prop 이 우선. 페이지로 열렸을 때만 쿼리를 본다.
  // ⚠ 쿼리도 prop 도 없으면 예전엔 세 블록이 모두 거짓이 되어 제목도 본문도 없는 백지가 떴다.
  //   (undefined == 0 은 거짓이다) — 이용약관을 기본으로 둔다.
  //   DialogPolicy 는 닫혀 있을 때 type 을 '' 로 넘기므로 빈 문자열도 '없음'으로 본다.
  const given = [type, router.query?.type].find((v) => v !== undefined && v !== null && v !== '');
  const current = Number(given ?? POLICY_TYPE.TERMS);

  const vars = {
    company: themeDnsData?.company_name || themeDnsData?.name || '',
    shop: themeDnsData?.name || '',
    // created_at 은 백엔드 domain API 가 내려준다. 예전 브랜드는 없을 수 있어 establish_date 로 물러선다.
    date: toKoreanDate(themeDnsData?.created_at) || toKoreanDate(themeDnsData?.establish_date),
    pvcyName: themeDnsData?.pvcy_rep_name || '',
    phone: themeDnsData?.phone_num || '',
  };

  const blocks = current === POLICY_TYPE.PRIVACY ? PRIVACY
    : current === POLICY_TYPE.GUIDE ? GUIDE
      : current === POLICY_TYPE.TERMS ? TERMS
        : null;

  return (
    <>
      <Wrappers $embedded={embedded} style={{ margin: `${type >= 0 ? '0' : ''}` }}>
        <ContentWrapper $embedded={embedded}>

          {/* 모달에서는 DialogTitle 이 제목을 담당한다. */}
          {!embedded && <Title not_arrow={true}>{translate(TITLES[current] ?? '')}</Title>}

          {blocks && <PolicyBody blocks={blocks} vars={vars} />}

          {current === POLICY_TYPE.COPYRIGHT &&
            <Text>
              저작권 정책<br />

              {themeDnsData?.name}에서 발행되는 모든 콘텐츠는 저작권법에 의하여 보호받는 저작물로서 저작권은 {themeDnsData?.company_name}에 있습니다.<br /><br />

              {themeDnsData?.name}({themeDnsData?.company_name})의 허락 없이 콘텐츠에 대한 무단 복제 및 배포 등 저작권을 침해하는 행위를 금합니다.<br /><br />

              {themeDnsData?.name}({themeDnsData?.company_name})에서 발행하는 모든 콘텐츠를 무단으로 상업적으로 이용하거나 기타 영리 목적으로 이용할 경우 민법상 부당이득, 불법행위 등을 이유로 손해배상 책임을 질 수 있습니다.<br />
              상업적 또는 기타 영리 목적 등으로 이용을 원할 경우 사전에 {themeDnsData?.name}({themeDnsData?.company_name})와 별도 협의를 하거나 허락을 얻어야 하며, 협의 또는 허락을 얻어 자료의 내용을 게재하는 경우에도 출처가 {themeDnsData?.name}({themeDnsData?.company_name})임을 반드시 밝혀야 합니다.<br /><br />

              {themeDnsData?.name}({themeDnsData?.company_name})에서 발행하는 모든 콘텐츠를 블로그, SNS, 개인용, 비상업용 등 공익, 비영리 목적에 이용할 경우에도 출처를 {themeDnsData?.name}({themeDnsData?.company_name})로 명시하여야 합니다.<br /><br />

              {themeDnsData?.name}({themeDnsData?.company_name})의 콘텐츠를 적법한 절차에 따라 다른 인터넷 사이트에 게재하는 경우에도 내용의 무단 변경을 금지하며, 이를 위반할 때에는 형사처벌을 받을 수 있습니다.<br /><br />

              위 내용은 저작권법 제123조(침해정지), 저작권법 제125조(손해배상청구)에 근거합니다.<br /><br />

              {!isDemoHost() && themeDnsData?.phone_num && <>저작권 관련 문의사항은 {themeDnsData?.phone_num}로 문의 바랍니다.<br /></>}
            </Text>}
        </ContentWrapper>
      </Wrappers>
    </>
  )
}
Policy.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Policy
