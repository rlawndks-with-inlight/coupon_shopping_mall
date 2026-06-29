export const FRAMES = [
  {
    no: 1,
    key: 'shop:1',
    title: '탐색 중심형',
    category: 'shop',
    demo: 1,
    keyword: '다카테고리 종합몰',
    desc: '상단 카테고리 메뉴를 항상 노출해 다수의 상품을 빠르게 탐색. 전체 폭 슬라이드 배너 + 인기상품/품절임박 섹션.',
    recommend: '카테고리·SKU가 많은 종합 쇼핑몰 (가전·잡화·식품 등)',
  },
  {
    no: 2,
    key: 'shop:2',
    title: '브랜드 무드형',
    category: 'shop',
    demo: 2,
    keyword: '단일/소수 브랜드 매장',
    desc: '큰 메인 배너로 브랜드·시즌 분위기를 강조. 상단 메뉴는 접어두고 비주얼에 집중.',
    recommend: '브랜드 정체성을 강조하는 단일/소수 브랜드 매장 (화장품·패션 등)',
  },
  {
    no: 3,
    key: 'shop:4',
    title: '다카테고리 잡화몰',
    category: 'shop',
    demo: 4,
    keyword: '패션·잡화 다품목',
    desc: '카테고리별 상품 그리드를 다채롭게 배치. 가방·시계·신발·액세서리 등 종류별 분류 진열.',
    recommend: '카테고리가 많고 SKU가 다양한 잡화몰 (가방·시계·신발·액세서리 등)',
  },
  {
    no: 4,
    key: 'blog:1',
    title: '매거진 에디토리얼',
    category: 'blog',
    demo: 1,
    keyword: '디자이너 셀렉트샵',
    desc: '"Cover Story" "Editor\'s Pick" 매거진 형식. 단일 상품을 풍성하게 배너로 표현.',
    recommend: '패션, 주얼리, 액세서리, 라이프스타일 큐레이션, 디자이너 브랜드',
  },
  {
    no: 5,
    key: 'blog:2',
    title: '종합 그리드',
    category: 'blog',
    demo: 2,
    keyword: '종합 큐레이션 몰',
    desc: '다양한 카테고리별 상품 그리드를 빼곡하게 진열. 다품종을 한눈에 보여주는 종합몰 스타일.',
    recommend: '생활/잡화/뷰티/식품 두루 다루는 종합 셀렉트샵, 큐레이션 쇼핑몰',
  },
  {
    no: 6,
    key: 'blog:4',
    title: '럭셔리 미니멀',
    category: 'blog',
    demo: 4,
    keyword: '단일 프리미엄 상품',
    desc: '단일 상품을 큰 비주얼로 매거진처럼 표현. 흑백 톤, 절제된 타이포그래피.',
    recommend: '단일 프리미엄 상품(가전·디자인 가구·아트 굿즈), 한정 에디션 브랜드',
  },
  {
    no: 7,
    key: 'blog:5',
    title: '다크 럭셔리',
    category: 'blog',
    demo: 5,
    keyword: '고급·한정판 브랜드',
    desc: '다크 톤 배경으로 절제·고급·신비로운 무드. 브랜드 헤리티지를 담은 문구.',
    recommend: '럭셔리 침구·생활용품, 프리미엄 브랜드, 한정 컬렉션',
  },
  {
    no: 8,
    key: 'blog:6',
    title: '신뢰형 단일 브랜드',
    category: 'blog',
    demo: 6,
    keyword: '소수 품목 · 신뢰형',
    desc: '정돈된 깔끔한 레이아웃. 신뢰 포인트·통계·갤러리로 믿음을 단계적으로 전달.',
    recommend: '단일/소수 SKU 브랜드 (생수·영양제, 단일 화장품 라인, 일상 소비재 등)',
  },
  {
    no: 9,
    key: 'blog:7',
    title: '동양 미니멀',
    category: 'blog',
    demo: 7,
    keyword: '차·한방·자연주의',
    desc: '베이지 톤 + 한자 키워드. 차분한 카피, 일본·동양 미감.',
    recommend: '차/한방차, 전통식품, 자연주의 화장품, 수공예 라이프스타일',
  },
  {
    no: 10,
    key: 'blog:8',
    title: '트렌디 그래픽',
    category: 'blog',
    demo: 8,
    keyword: 'MZ 타깃 신상',
    desc: '비비드 컬러 + 모노크롬 블록 분할. 강한 카피, 트렌디·세련된 그래픽 무드.',
    recommend: 'MZ 타깃 신상품/한정판 (인디 뷰티, 스니커즈, 헬스케어, 트렌디 액세서리 등)',
  },
  {
    no: 11,
    key: 'blog:9',
    title: '파스텔 감성',
    category: 'blog',
    demo: 9,
    keyword: '여성 라이프스타일',
    desc: '핑크/파스텔 톤. 폴라로이드 모티프, 귀엽고 감성적인 후기. 친근한 여성 타깃 무드.',
    recommend: '향수, 화장품, 액세서리, 캔들·디퓨저 등 여성 라이프스타일',
  },
];

export const findFrameByKey = (key) => FRAMES.find((f) => f.key === key);

// demo-N.<도메인> 미리보기가 연결할 기존 브랜드 dns (frame.no 기준 단일 소스)
const DEMO_PREVIEW_BRAND = {
  1: 'jjpay.co.kr',
  2: 'shop.minbeautym.com',
  3: 'demo4.asapmall.kr',
  4: 'bs-company.co.kr',
  5: 'hynet777.com',
  6: 'glamup.co.kr',
  7: 'babypop.co.kr',
  8: 'dokdoland.com',
  9: 'buddymall.co.kr',
  10: 'malu-79.com',
  11: 'msbtmall.com',
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
