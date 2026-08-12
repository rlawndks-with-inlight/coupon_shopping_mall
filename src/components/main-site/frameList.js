// 프레임 계열 — 6장을 나란히 놓으면 "서로 다른 6개 몰"로 읽히지만,
// 실제로 갈리는 경계는 3개다. 카탈로그를 이 단위로 묶어 무엇이 같고 무엇이 다른지 밝힌다.
//   shop    프레임1·2   카테고리 메뉴와 상품목록 화면을 갖춘 쇼핑몰형
//   column  프레임3·4   모바일에 맞춘 좁은 한 컬럼(840px / 720px)
//   landing 프레임5·6   홈·상품상세만 프레임 전용. 헤더·푸터·장바구니·주문·마이페이지는 같은 화면을 쓴다
//                      (레이아웃 파일 자체가 BlogLayout6 하나다)
// 주문서·결제·주문내역·배송지·약관은 6개 프레임 전부 공용이다.
//
// ⚠ no(보여주는 번호)와 key(저장되는 값)는 다르다. key 뒷숫자가 shop_demo_num/blog_demo_num 이며
//   운영 중인 가맹점 화면을 고르는 값이다 — key 는 절대 바꾸지 않는다.
export const FRAME_GROUP_ORDER = ['shop', 'column', 'landing'];

export const FRAMES = [
  // 구 프레임1 (shop:1)
  {
    no: 1,
    group: 'shop',
    key: 'shop:1',
    title: "탐색 중심형",
    category: 'shop',
    demo: 1,
    keyword: "다카테고리",
    desc: "많은 상품을 쉽고 빠르게 찾아볼 수 있는 쇼핑몰. 상단 카테고리 메뉴와 전체 폭 슬라이드 배너, 인기상품·품절임박 섹션.",
    recommend: "종합 쇼핑몰 (가전·잡화·식품 등)",
  },
  // 구 프레임2 (shop:2)
  {
    no: 2,
    group: 'shop',
    key: 'shop:2',
    title: "비주얼 중심형",
    category: 'shop',
    demo: 2,
    keyword: "단일 브랜드",
    desc: "브랜드의 이미지와 감성을 효과적으로 보여주는 쇼핑몰. 큰 메인 배너로 분위기를 강조하고 상단 메뉴는 간결하게.",
    recommend: "화장품 · 패션 등 단일/소수 브랜드 매장",
  },
  // 구 프레임4 (blog:1)
  {
    no: 3,
    group: 'column',
    key: 'blog:1',
    title: "매거진형",
    category: 'blog',
    demo: 1,
    keyword: "디자이너 셀렉트샵",
    desc: "상품과 브랜드 스토리를 감각적으로 보여주는 쇼핑몰. Cover Story·Editor’s Pick 구성으로 매거진처럼 소개.",
    recommend: "패션, 주얼리, 액세서리, 디자이너 브랜드",
  },
  // 구 프레임5 (blog:2)
  {
    no: 4,
    group: 'column',
    key: 'blog:2',
    // '종합몰'이 아니다 — 720px 한 컬럼이고 상품목록 전용 화면이 없다(/shop/items 는 쇼핑몰1 화면으로 폴백).
    // 다품목 종합몰을 기대하고 고르면 프레임1·3을 골랐어야 하는 상황이 된다.
    // 카탈로그·신청서에 보이는 문구는 landingStrings 의 frame.blog:2.* 이며 여기와 같은 내용으로 맞춰 둔다
    // (이 값은 본사 관리자의 프레임 선택 목록에서 쓰인다).
    title: "스크롤형",
    category: 'blog',
    demo: 2,
    keyword: "한 컬럼 큐레이션",
    desc: "상품을 자연스럽게 둘러보기 좋은 심플한 쇼핑몰. 카테고리별 상품을 한 컬럼에 차례로 배치.",
    recommend: "상품 수가 많지 않은 큐레이션 · 셀렉트샵",
  },
  // 구 프레임6 (blog:4)
  {
    no: 5,
    group: 'landing',
    key: 'blog:4',
    title: "프리미엄 에디토리얼형",
    category: 'blog',
    demo: 4,
    keyword: "단일·소수 카테고리",
    desc: "하나의 상품을 작품처럼 돋보이게 보여주는 쇼핑몰. 큰 비주얼과 매거진형 레이아웃, 흑백 톤과 절제된 타이포그래피.",
    recommend: "프리미엄 디자인 가구 · 한정 에디션 브랜드",
  },
  // 구 프레임11 (blog:9)
  {
    no: 6,
    group: 'landing',
    key: 'blog:9',
    title: "매거진형",
    category: 'blog',
    demo: 9,
    keyword: "단일·소수 카테고리",
    desc: "부드럽고 따뜻한 분위기로 상품을 보여주는 쇼핑몰. 핑크·파스텔 톤과 폴라로이드 감성.",
    recommend: "향수 · 화장품 · 액세서리 · 캔들 · 디퓨저",
  },
];

// 판매를 중단한 프레임. 목록에서만 빠지고 화면 코드는 그대로 남는다.
//
// 지우면 안 되는 이유:
//   · 이 프레임으로 운영 중인 브랜드가 있다(전부 ShopGo 산하가 아닌 다른 클라이언트다).
//   · 이미 접수·승인된 가맹점 신청서에 이 key 가 저장돼 있다 — 목록에서 없애면
//     관리자 신청 목록에 프레임이 "---" 로만 뜬다.
// 새 신청에서 고를 수는 없다(SELECTABLE_FRAMES 참고).
export const LEGACY_FRAMES = [
  // 구 프레임3
  {
    no: null, // 판매 중단 — 번호를 주지 않는다
    group: 'shop',
    key: 'shop:4',
    title: '다카테고리 잡화몰',
    category: 'shop',
    demo: 4,
    keyword: '패션·잡화 다품목',
    desc: '카테고리별 상품 그리드를 다채롭게 배치. 가방·시계·신발·액세서리 등 종류별 분류 진열.',
    recommend: '카테고리가 많고 SKU가 다양한 잡화몰 (가방·시계·신발·액세서리 등)',
  },
  // 구 프레임7
  {
    no: null, // 판매 중단 — 번호를 주지 않는다
    group: 'landing',
    key: 'blog:5',
    title: '다크 럭셔리',
    category: 'blog',
    demo: 5,
    keyword: '고급·한정판 브랜드',
    desc: '다크 톤 배경으로 절제·고급·신비로운 무드. 브랜드 헤리티지를 담은 문구.',
    recommend: '럭셔리 침구·생활용품, 프리미엄 브랜드, 한정 컬렉션',
  },
  // 구 프레임8
  {
    no: null, // 판매 중단 — 번호를 주지 않는다
    group: 'landing',
    key: 'blog:6',
    title: '신뢰형 단일 브랜드',
    category: 'blog',
    demo: 6,
    keyword: '소수 품목 · 신뢰형',
    desc: '정돈된 깔끔한 레이아웃. 신뢰 포인트·통계·갤러리로 믿음을 단계적으로 전달.',
    recommend: '단일/소수 SKU 브랜드 (생수·영양제, 단일 화장품 라인, 일상 소비재 등)',
  },
  // 구 프레임9
  {
    no: null, // 판매 중단 — 번호를 주지 않는다
    group: 'landing',
    key: 'blog:7',
    title: '동양 미니멀',
    category: 'blog',
    demo: 7,
    keyword: '차·한방·자연주의',
    desc: '베이지 톤 + 한자 키워드. 차분한 카피, 일본·동양 미감.',
    recommend: '차/한방차, 전통식품, 자연주의 화장품, 수공예 라이프스타일',
  },
  // 구 프레임10
  {
    no: null, // 판매 중단 — 번호를 주지 않는다
    group: 'landing',
    key: 'blog:8',
    title: '트렌디 그래픽',
    category: 'blog',
    demo: 8,
    keyword: 'MZ 타깃 신상',
    desc: '비비드 컬러 + 모노크롬 블록 분할. 강한 카피, 트렌디·세련된 그래픽 무드.',
    recommend: 'MZ 타깃 신상품/한정판 (인디 뷰티, 스니커즈, 헬스케어, 트렌디 액세서리 등)',
  },
];

// 신청서·관리자 화면이 저장된 key 로 프레임을 되찾을 때 쓴다.
// 판매를 중단한 프레임도 찾아야 한다 — 과거 신청건이 화면에서 사라지면 안 된다.
export const findFrameByKey = (key) =>
  FRAMES.find((f) => f.key === key) || LEGACY_FRAMES.find((f) => f.key === key);

// 새 신청에서 고를 수 있는 프레임의 key. 백엔드 화이트리스트와 같은 목록이어야 한다.
export const SELECTABLE_FRAME_KEYS = FRAMES.map((f) => f.key);

// demo-N.<도메인> 미리보기가 연결할 기존 브랜드 dns.
//
// ⚠ 이 표의 숫자는 **화면에 보이는 프레임 번호**다. 프레임 번호를 다시 매기면
//   이 표도 같은 커밋에서 함께 옮겨야 한다 — 안 그러면 demo-3 이 새 프레임3 이 아니라
//   예전 3번(다른 디자인의 남의 운영몰)을 띄운다.
//   판매 중단한 프레임(구 3·7·8·9·10)은 여기서 뺀다. 번호가 겹치기 때문이다 —
//   구 3번을 남겨두면 새 프레임3 과 키가 충돌해 뒤엣것이 이긴다.
//   남는 demo-7 ~ demo-11 호스트는 카탈로그로 돌려보낸다(getDemoRedirect).
const DEMO_PREVIEW_BRAND = {
  1: 'jjpay.co.kr', // shop:1 (구 프레임1)
  2: 'shop.minbeautym.com', // shop:2 (구 프레임2)
  3: 'bs-company.co.kr', // blog:1 (구 프레임4)
  4: 'hynet777.com', // blog:2 (구 프레임5)
  5: 'glamup.co.kr', // blog:4 (구 프레임6)
  6: 'msbtmall.com', // blog:9 (구 프레임11)
};

// 판매 중단으로 갈 곳이 없어진 미리보기 호스트인지(demo-7 ~ demo-11).
// 북마크·기존 링크로 들어오면 없는 브랜드를 조회하다 화면이 깨지므로 카탈로그로 보낸다.
export const isRetiredDemoHost = (host) => {
  const m = /^demo-(\d+)\./.exec(host || '');
  if (!m) return false;
  const no = Number(m[1]);
  return no > FRAMES.length && !DEMO_PREVIEW_BRAND[no];
};

// 프레임 번호 → 미리보기 연결 브랜드 (없으면 null)
export const getFramePreviewBrand = (no) => DEMO_PREVIEW_BRAND[no] || null;

// 호스트(demo-N.<도메인>) → 연결할 기존 브랜드 dns (아니면 null)
export const getDemoBrandDns = (host) => {
  const m = /^demo-(\d+)\./.exec(host || '');
  if (!m) return null;
  return DEMO_PREVIEW_BRAND[Number(m[1])] || null;
};

// 현재 호스트가 데모 미리보기 서브도메인(demo-N.*)인지 (브라우저 전용)
export const isDemoHost = () => {
  if (typeof window === 'undefined') return false;
  return /^demo-\d+\./.test(window.location.host || '');
};

// 데모 미리보기에서 노출되면 안 되는 실제 가맹점의 민감 사업자/개인정보 필드.
// demo-N은 실제 운영 브랜드의 DNS 데이터를 그대로 조회하므로, 화면에 뜨기 전에 가려야 한다.
export const DEMO_MASKED_BRAND_FIELDS = [
  'company_name', // 회사명(상호)
  'business_num', // 사업자등록번호
  'ceo_name', // 대표자명
  'phone_num', // 고객센터/대표 전화
  'fax_num', // 팩스
  'pvcy_rep_name', // 개인정보 보호책임자
  'mail_order_num', // 통신판매번호
  'addr', // 사업장 주소
  'name', // 브랜드 표시명 (헤더 텍스트 · 브라우저 탭 제목 · og:title)
  'og_description', // 사이트 설명(메타)
];

// 호스트(demo-N.<도메인>)에서 데모 번호 N을 추출 (아니면 null)
export const getDemoNum = (host) => {
  const m = /^demo-(\d+)\./.exec(host || '');
  return m ? Number(m[1]) : null;
};

// 데모에서 실제 값 대신 보여줄 문구 (예: 데모3). 번호를 모르면 '데모'.
// 값을 빈 문자열로 두면 푸터의 `{field && <Row>}` 가드 때문에 줄이 통째로 사라져 푸터가 휑해진다.
// 비어있지 않은 문구로 대체하면 라벨·줄은 그대로 유지되고 값만 가려진다.
export const demoMaskPlaceholder = (demoNum) => (demoNum ? `데모${demoNum}` : '데모');

// 로고 슬롯에 넣을 '데모N' 이미지 (data URI SVG).
// 로고 필드를 빈 값으로 두면 폴백 없이 `<img src={logoSrc()}>`로 렌더하는 푸터/헤더가 깨지므로,
// 실제 로고 대신 '데모N' 글자를 그린 이미지를 넣어 어디서든 안전하게 표시되게 한다.
const demoLogoDataUri = (label, fill) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48">` +
    `<text x="80" y="24" dominant-baseline="central" text-anchor="middle" ` +
    `font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="800" fill="${fill}">` +
    `${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// 로고 이미지 필드 → '데모N' SVG 로고로 치환 (라이트/다크 헤더별 글자색)
const DEMO_MASKED_LOGO_FIELDS = [
  { key: 'logo_img', fill: '#222' }, // 라이트 헤더용(어두운 글자)
  { key: 'dark_logo_img', fill: '#eee' }, // 다크 헤더용(밝은 글자)
];
// 투명 1x1 PNG — 파비콘을 투명 아이콘으로 강제해 탭에서 안 보이게 한다.
// (빈 문자열로 두면 브라우저가 /favicon.ico 기본 아이콘으로 폴백해 여전히 보일 수 있음)
const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 원래 값이 있던 민감/식별 필드만 데모용으로 치환한 사본 반환.
// - 텍스트 필드: '데모N'으로 치환 (회사명·브랜드명·사업자정보·탭 제목 등)
// - 로고 필드: '데모N' SVG 로고로 치환 (헤더·푸터 로고 슬롯)
// - 파비콘: 투명 픽셀로 강제 → 탭 아이콘 안 보이게 (브랜드 파비콘 유무와 무관)
// - OG 이미지: 비움
// 그 외 원래 값이 없던 필드는 건드리지 않아 실제 사이트와 동일하게 동작한다.
export const maskDemoBrandData = (dns_data, demoNum) => {
  if (!dns_data || typeof dns_data !== 'object') return dns_data;
  const placeholder = demoMaskPlaceholder(demoNum);
  const masked = { ...dns_data };
  DEMO_MASKED_BRAND_FIELDS.forEach((key) => {
    if (masked[key]) masked[key] = placeholder;
  });
  DEMO_MASKED_LOGO_FIELDS.forEach(({ key, fill }) => {
    if (masked[key]) masked[key] = demoLogoDataUri(placeholder, fill);
  });
  masked.favicon_img = TRANSPARENT_PIXEL; // 파비콘 안 보이게(강제)
  if (masked.og_img) masked.og_img = '';
  return masked;
};
