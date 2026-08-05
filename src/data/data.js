import { useSettingsContext } from 'src/components/settings';

// 로고 미등록 브랜드 처리:
// 기본(대체) 로고는 쓰지 않는다. 로고가 없으면 아무것도 보이지 않아야 한다.
// 호출부가 54곳이고 전부 폴백 없이 <img src={logoSrc()}> 로 렌더하므로 호출부를 고치는 대신
// 빈 문자열을 돌려주고, globals.css 의 `img[src=""] { display:none }` 이 요소 자체를 숨긴다.
// (undefined 를 돌려주면 React 가 src 속성을 아예 빼버려 alt 텍스트/깨진 아이콘이 노출된다.)
export const logoSrc = () => {
  const { themeDnsData, themeMode } = useSettingsContext();
  return themeDnsData[`${themeMode == 'dark' ? 'dark_' : ''}logo_img`] || '';
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