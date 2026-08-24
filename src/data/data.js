import { useSettingsContext } from 'src/components/settings';

// 로고 배달 URL 에 '여백 제거 + 크기 맞춤'을 끼운다.
//
// [왜 필요한가] 가맹점이 올린 로고는 여백이 제각각이다. 실측 예: 첫돌공방 로고는
// 3375×3375 정사각인데 실제 글자는 2935×994 뿐이라 **세로의 70%가 빈 여백**이다.
// 헤더가 height:40px 를 주면 그 40px 는 캔버스 전체에 대응하므로 글자는 11.8px 로 찍힌다
// (40 × 0.295). 헤더 크기를 아무리 키워도 여백 비율만큼 손해가 그대로 남는다.
// e_trim 이 배달 시점에 여백을 깎아 주면 지정한 높이가 곧 글자 높이가 된다.
// 덤으로 f_auto,q_auto 가 용량을 줄인다(위 로고 기준 393KB → 4.8KB).
//
// [적용 범위] 로고만이다. 상품 이미지는 비율·구도가 상품마다 의도된 것이라 건드리지 않는다.
//
// [안전장치]
//  · res.cloudinary.com 로 시작하는 URL 에만 붙인다. 백엔드 디스크 업로드 경로
//    (BACK_URL/files/...)나 데모 미리보기의 data:image/svg+xml 로고는 그대로 통과시킨다.
//    변환 문법이 없는 호스트에 끼우면 이미지가 통째로 깨진다.
//  · replace 는 첫 '/upload/' 에만 적용한다. replaceAll 을 쓰면 public_id 안에 'upload' 가
//    들어간 파일에서 URL 이 망가진다.
//  · 이미 변환이 붙어 있으면 두 번 끼우지 않는다.
// 값은 표시 최대치(프레임3 헤더 88px)의 2배(레티나) 기준이다.
const CLOUDINARY_DELIVERY = 'https://res.cloudinary.com/';
const LOGO_TRANSFORM = 'e_trim/h_176,w_560,c_fit,f_auto,q_auto';

// 카카오톡 미리보기(og:image)용 변환.
//
// [왜 필요한가]
// 가맹점이 올린 원본이 규격도 용량도 손대지 않은 채 그대로 og:image 로 나갔다.
// mbc01 은 1923x818 · 2,608KB 짜리가 나가고 있었다. 미리보기 한 장에 2.6MB 를 태울 이유가 없고,
// 카카오 권장 규격(2:1 · 800x400)과도 안 맞아 어디서 잘릴지 가맹점이 알 수 없었다.
//
// ⚠ '500KB 를 넘으면 카카오가 아예 안 가져간다'는 말이 이 저장소에 있었는데,
//   출처가 불분명하고 확인된 적이 없다. 근거로 쓰지 말 것.
//   실제로 '바꿔도 반영이 안 되던' 원인은 용량이 아니라 **카카오의 URL 단위 캐시**였다
//   (주소 뒤에 ?v=2 를 붙이니 글·그림이 즉시 새로 떴다 — 2026-08-24 확인).
//   그러니 이 변환은 '안 뜨는 것을 뜨게 하는 수단'이 아니라 규격·용량을 바로잡는 것이다.
//
// [값]
//   c_fill,g_auto  카카오 권장 비율 2:1 로 채워 자른다(g_auto = 중요한 부분을 남긴다)
//   w_800,h_400    카카오 권장 크기
//   f_jpg          형식을 못 박는다. f_auto 는 webp 를 내줄 수 있는데 카카오 수집기가
//                  가져가지 못하면 미리보기가 통째로 비어 버린다.
//   q_auto:good    실측 2,608KB → 62KB
const OG_TRANSFORM = 'c_fill,g_auto,w_800,h_400,f_jpg,q_auto:good';

export const logoDeliveryUrl = (url) => {
  const src = String(url ?? '');
  if (!src.startsWith(CLOUDINARY_DELIVERY)) return src;
  if (!src.includes('/upload/')) return src;
  if (src.includes('/upload/e_trim')) return src;
  return src.replace('/upload/', `/upload/${LOGO_TRANSFORM}/`);
};

// 카카오톡·SNS 미리보기 이미지 주소. 저장된 원본을 800x400 / 60KB 안팎으로 줄여 내보낸다.
// 클라우디너리에 올라간 것만 손대고, 밖에서 온 주소는 그대로 둔다(변환을 붙일 수 없다).
export const ogDeliveryUrl = (url) => {
  const src = String(url ?? '');
  if (!src.startsWith(CLOUDINARY_DELIVERY)) return src;
  if (!src.includes('/upload/')) return src;
  // 이미 변환이 걸린 주소는 두 번 붙이지 않는다.
  if (src.includes('/upload/c_fill')) return src;
  return src.replace('/upload/', `/upload/${OG_TRANSFORM}/`);
};

// 로고 미등록 브랜드 처리:
// 기본(대체) 로고는 쓰지 않는다. 로고가 없으면 아무것도 보이지 않아야 한다.
// 호출부가 54곳이고 전부 폴백 없이 <img src={logoSrc()}> 로 렌더하므로 호출부를 고치는 대신
// 빈 문자열을 돌려주고, globals.css 의 `img[src=""] { display:none }` 이 요소 자체를 숨긴다.
// (undefined 를 돌려주면 React 가 src 속성을 아예 빼버려 alt 텍스트/깨진 아이콘이 노출된다.)
//
// ⚠ 이 함수는 안에서 useSettingsContext() 를 부르는 **사실상 훅**이다. 훅을 더 넣지 말 것
//   (shop/demo-7/header.js 는 이걸 삼항 안에서 조건부로 호출한다 — 훅이 늘면 순서가 깨진다).
//   logoDeliveryUrl 은 순수 문자열 조작이라 안전하다.
// ⚠ 이름은 평범한 함수처럼 생겼지만 **훅이다** (안에서 useSettingsContext 를 쓴다).
//    반드시 컴포넌트 맨 위에서 부르고 그 값을 쓸 것. JSX 안에서 바로 부르면 안 된다.
//
//    실제로 그래서 깨졌다: 헤더들이 <LogoImg src={logoSrc()} /> 를 {loading ? ... : ...}
//    분기 안에 두고 있었다. 첫 렌더(loading=true)에는 안 불리고 그다음 렌더에만 불려
//    훅 개수가 26 → 27 로 바뀌었고, React 가 "change in the order of Hooks" 를 띄웠다.
//    이 상태는 화면이 통째로 백지가 되는 부류의 문제다.
//    (검사: scripts/checks/logo-hook.mjs 가 이 형태를 다시 못 만들게 막는다)
export const logoSrc = () => {
  const { themeDnsData, themeMode } = useSettingsContext();
  // 다크모드 로고를 등록하지 않은 가맹점 처리.
  //
  // 예전엔 다크일 때 dark_logo_img 만 읽어서, 그 값이 없으면 빈 문자열이 되고
  // globals.css 의 img[src=""] { display:none } 이 요소를 없앴다 — 즉 고객이 헤더의
  // 달 아이콘을 누르는 순간 **로고가 통째로 사라졌다**(포스몰 등 실제 가맹점에서 재현).
  // 다크 배경에 어두운 로고가 다소 안 보일 수는 있어도, 아무것도 없는 것보다는 낫다.
  // (다크 전용 로고를 올리면 예전과 똑같이 그 로고가 쓰인다)
  const isDark = themeMode == 'dark';
  const src = (isDark ? (themeDnsData?.dark_logo_img || themeDnsData?.logo_img) : themeDnsData?.logo_img) || '';
  return logoDeliveryUrl(src);
};
export const KAKAO_OBJ = {
  BACKGROUND: '#F9E000',
  FONT_COLOR: '#371C1D'
}

// 데모 번호 목록. 관리자 '데모설정' 탭의 입력칸이 프레임(디자인) 하나로 통합되면서
// 이제 이 목록은 '판매중 프레임(components/main-site/frameList.js 의 FRAMES)에 없는 번호',
// 즉 미판매·레거시 데모를 골라내는 용도로만 쓰인다.
// 기존 브랜드가 쓰고 있는 번호가 선택지에서 빠지면 저장 시 값이 날아가므로 항목을 지우지 말 것.
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