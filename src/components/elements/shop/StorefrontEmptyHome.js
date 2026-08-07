import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings'

// 스토어프론트 홈에 '판매할 상품이 0건'일 때 뜨는 공용 안내 화면.
//
// 이 화면이 뜨는 조건은 딱 하나다 — 대표상품 지정도 없고 판매상품도 0건인 상태.
// 즉 로딩 중 깜빡임이 아니라 '이제 막 개설해서 아직 상품을 안 올린 가맹점' 이다.
//
// 원래 프레임6~11(blog demo-4~9)이 각자 'COMING SOON' / 'Coming Soon' / 'Coming soon' /
// 'Coming Soon 💕' 을 제각각 찍고 있었다. 영어 단독 문구는 고객에게
// "아직 안 연 사이트 / 공사중" 으로 읽혀 그대로 이탈 사유가 된다.
// 브랜드명을 노출해 몰이 살아 있다는 것을 보이고, 준비중이라는 사실을 한국어로 알리는 편이 낫다.
// 문구가 6개 파일에 흩어져 또 제각각이 되지 않도록 공용 컴포넌트로 뺀다.
//
// 배경색은 여기서 강제하지 않는다. 데모별 톤(다크/크라프트/파스텔 등)은 호출부의
// Wrapper/Section 이 그대로 유지하고, 글자색도 color:inherit 로 부모를 따라간다.

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1.25rem;
  text-align: center;
  color: inherit;
`
const Brand = styled.div`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
  word-break: keep-all;
  @media (max-width: 840px) {
    font-size: 22px;
  }
`
const Title = styled.div`
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  word-break: keep-all;
  @media (max-width: 840px) {
    font-size: 17px;
  }
`
const Desc = styled.div`
  font-size: 14px;
  line-height: 1.7;
  opacity: 0.7;
  word-break: keep-all;
`

const StorefrontEmptyHome = () => {
  const { themeDnsData } = useSettingsContext();
  // 몰 표시명은 themeDnsData.name 이다.
  // (company_name 은 사업자 상호라 고객 화면 인사말에는 부적절해서 쓰지 않는다.)
  const brandName = themeDnsData?.name || '';

  return (
    <Box>
      {brandName && <Brand>{brandName}</Brand>}
      <Title>곧 만나요</Title>
      <Desc>지금 상품을 준비하고 있습니다.</Desc>
    </Box>
  );
};

export default StorefrontEmptyHome;
