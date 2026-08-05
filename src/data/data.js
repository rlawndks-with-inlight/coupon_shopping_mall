import { useSettingsContext } from 'src/components/settings';

// 로고 미등록 브랜드에서 <img src={undefined}> 가 되어 '깨진 이미지' 아이콘이 뜨던 문제 방지용.
// 헤더·푸터·로그인 등 20여 곳이 폴백 없이 <img src={logoSrc()}> 로 렌더하므로,
// 호출부를 전부 고치는 대신 여기서 투명 1x1 PNG 를 돌려줘 아무것도 안 보이게 한다.
// (기본 로고 이미지를 쓰고 싶으면 이 상수를 해당 경로로 바꾸면 전 화면에 일괄 적용된다.)
const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const logoSrc = () => {
  const { themeDnsData, themeMode } = useSettingsContext();
  return themeDnsData[`${themeMode == 'dark' ? 'dark_' : ''}logo_img`] || TRANSPARENT_PIXEL;
};
export const KAKAO_OBJ = {
  BACKGROUND: '#F9E000',
  FONT_COLOR: '#371C1D'
}

export const SHOP_DEMO_DATA = [
  { value: 1, title: '데모 1 (일반 쇼핑몰에 적합)' },
  { value: 2, title: '데모 2' },
  { value: 3, title: '데모 3' },
  { value: 4, title: '데모 4 (위탁 쇼핑몰에 적합)' },
  { value: 5, title: '데모 5' },
  { value: 6, title: '데모 6' },
  { value: 7, title: '데모 7' },
  { value: 8, title: '데모 8' },
  { value: 9, title: '데모 9' },
  /*{ value: 10, title: '데모 10' },*/
];
export const BLOG_DEMO_DATA = [
  { value: 1, title: '데모 1' },
  { value: 2, title: '데모 2' },
  { value: 3, title: '데모 3' },
  { value: 4, title: '데모 4 (단일 · 미니멀 모노크롬)' },
  { value: 5, title: '데모 5 (단일 · 다크 럭셔리)' },
  { value: 6, title: '데모 6 (단일 · 소프트 에디토리얼)' },
  { value: 7, title: '데모 7 (단일 · 일본 젠/와비사비)' },
  { value: 8, title: '데모 8 (단일 · 브루탈리스트)' },
  { value: 9, title: '데모 9 (단일 · 파스텔 드림)' },
];