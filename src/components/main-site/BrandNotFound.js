import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

// 등록되지 않은 주소로 들어왔을 때 보여주는 안내.
//
// shopgo.co.kr 은 와일드카드 DNS·SSL 이라 **아무 서브도메인이나 연결은 된다.**
// 그래서 오타(mystore → mystroe), 폐업한 가맹점 주소, 크롤러가 찍어보는 주소가
// 전부 여기로 들어온다. 예전엔 브랜드를 못 찾으면 아무것도 렌더하지 않아
// 흰 화면에 HTTP 200 이 나갔다 — 방문자는 영문을 모르고, 검색엔진은 죽은 주소를
// 계속 살아 있는 페이지로 색인했다.
//
// ⚠ 이 화면은 브랜드 정보가 없는 상태에서, 앱의 프로바이더 바깥에서 그려진다.
//    - ThemeProvider 는 `paletteObj?.is_dns_data` 가 참일 때만 children 을 그린다.
//      브랜드가 없으면 그 안의 무엇도 렌더되지 않는다(이게 흰 화면의 원인이었다).
//    - 그래서 useLocales() 도 쓸 수 없다 — 안에서 useSettingsContext() 를 부르는데
//      SettingsProvider 가 위에 없으면 터진다. react-i18next 의 useTranslation 을 직접 쓴다.
//   테마·로고·색상 등 themeDnsData 에 기대는 것도 쓰면 안 된다. 스타일을 자급자족한다.

const Wrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  text-align: center;
  background: #ffffff;
  color: #111111;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;
const Code = styled.div`
  font-size: 13px;
  letter-spacing: 3px;
  font-weight: 700;
  color: #9e9e9e;
  margin-bottom: 1.25rem;
`;
const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  line-height: 1.45;
  margin: 0 0 0.75rem 0;
  word-break: keep-all;
  @media (min-width: 700px) { font-size: 30px; }
`;
const Desc = styled.p`
  font-size: 15px;
  line-height: 1.75;
  color: #666666;
  margin: 0 0 0.5rem 0;
  word-break: keep-all;
  max-width: 30rem;
`;
const HostName = styled.div`
  margin: 1.5rem 0 2rem 0;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  background: #f5f5f5;
  color: #444444;
  font-size: 14px;
  word-break: break-all;
  max-width: 100%;
`;
const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;
const Button = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 11rem;
  padding: 0.9rem 1.5rem;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid #111111;
  background: ${(p) => (p.$primary ? '#111111' : 'transparent')};
  color: ${(p) => (p.$primary ? '#ffffff' : '#111111')};
  &:hover { opacity: 0.85; }
`;

const BrandNotFound = ({ host = '' }) => {
  const { t: translate } = useTranslation();
  const mainUrl = `https://${(process.env.NEXT_PUBLIC_MAIN_FRONT_URL || 'shopgo.co.kr').replace(/^https?:\/\//, '')}`;

  return (
    <Wrap>
      <Code>404</Code>
      <Title>{translate('이 주소의 쇼핑몰을 찾을 수 없습니다')}</Title>
      <Desc>{translate('주소가 바르게 입력되었는지 확인해 주세요. 문을 닫았거나 아직 개설되지 않은 쇼핑몰일 수 있습니다.')}</Desc>
      {host && <HostName>{host}</HostName>}
      {/* 갈 곳은 ShopGo 홈 하나뿐이다.
          예전엔 '무료 쇼핑몰 신청하기'도 뒀는데, router.push('/apply') 는 **지금 이
          없는 주소 안에서** 이동한다 — mystroe.shopgo.co.kr/apply 로 가서 또 이 화면을
          만난다. 신청은 ShopGo 홈에서 하면 되므로 버튼을 없앴다. */}
      <Buttons>
        <Button $primary href={mainUrl}>{translate('ShopGo 홈으로')}</Button>
      </Buttons>
    </Wrap>
  );
};

export default BrandNotFound;
