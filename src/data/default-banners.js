// 메인페이지 배너슬라이드에 바로 넣을 수 있는 기본 배너 이미지 세트.
// - 디자인관리 › 메인페이지관리의 '배너슬라이드' 섹션에서 썸네일 클릭 시 슬라이드에 추가됨.
// - src는 이미 완성된 이미지 경로라서 저장 시 업로드 없이 그대로 반영됨(교체·삭제 가능).
//
// 데모마다 메인배너 컨테이너 비율이 달라 두 세트를 제공한다:
//   - 2.35:1 (2000x850)  : demo-1·2·3 (cover)     → DEFAULT_BANNERS
//   - 2:1    (2000x1000) : demo-4·5·6·9 (contain) → DEFAULT_BANNERS_2X1
//   (2:1 세트는 2.35:1 원본을 좌우 센터크롭한 동일 사진들)
// 스토어 데모(shop_demo_num)에 맞는 세트를 getDefaultBanners()로 고른다.
//
// ⚠ seed: true 의 의미 — '고르는 목록'과 '자동으로 깔리는 것'은 다르다.
//   목록(DEFAULT_BANNERS)은 가맹점이 골라 쓰는 카탈로그라 얼마든지 늘려도 된다.
//   그런데 신규 개설 몰에 자동으로 심기는 배너는 이 목록 **전체**를 쓰고 있었다.
//   업종별 사진 17종을 목록에 넣자 개설만 하면 배너가 23장씩 깔리는 꼴이 됐다.
//   그래서 자동으로 깔리는 것은 seed 표시가 붙은 것(원래의 6장)만으로 고정한다.
//   목록에 사진을 더 넣을 때 seed 를 붙이지 말 것 — 붙이면 신규 몰 배너가 그만큼 늘어난다.
//   (백엔드 utils.js/default-home.js 의 하드코딩 목록도 이 6장과 같아야 한다)

// 처음부터 있던 무드 사진 6종. 신규 개설 몰에 자동으로 깔리는 것이 이것이다.
const SEED_235 = [
  { id: 'photo1', label: '테라코타 도자기', src: '/assets/images/banners/banner-1.jpg', seed: true },
  { id: 'photo2', label: '화분 · 창가 햇살', src: '/assets/images/banners/banner-2.jpg', seed: true },
  { id: 'photo3', label: '세라믹 소품', src: '/assets/images/banners/banner-3.jpg', seed: true },
  { id: 'photo4', label: '아늑한 거실', src: '/assets/images/banners/banner-4.jpg', seed: true },
  { id: 'photo5', label: '앰버 제품 보틀', src: '/assets/images/banners/banner-5.jpg', seed: true },
  { id: 'photo6', label: '무광 세라믹', src: '/assets/images/banners/banner-6.jpg', seed: true },
];

const SEED_2X1 = [
  { id: 'photo1_2x1', label: '테라코타 도자기', src: '/assets/images/banners/banner-2x1-1.jpg', seed: true },
  { id: 'photo2_2x1', label: '화분 · 창가 햇살', src: '/assets/images/banners/banner-2x1-2.jpg', seed: true },
  { id: 'photo3_2x1', label: '세라믹 소품', src: '/assets/images/banners/banner-2x1-3.jpg', seed: true },
  { id: 'photo4_2x1', label: '아늑한 거실', src: '/assets/images/banners/banner-2x1-4.jpg', seed: true },
  { id: 'photo5_2x1', label: '앰버 제품 보틀', src: '/assets/images/banners/banner-2x1-5.jpg', seed: true },
  { id: 'photo6_2x1', label: '무광 세라믹', src: '/assets/images/banners/banner-2x1-6.jpg', seed: true },
];

// 업종별 사진. 고르는 목록에만 들어간다(seed 없음 → 자동으로 깔리지 않는다).
// 파일명이 곧 URL 이라 한글·공백을 쓰지 않고 영문 슬러그로 둔다.
const 업종배너 = [
  ['dried-seafood', '건어물'],
  ['mens-clothing', '남성의류'],
  ['womens-clothing', '여성의류'],
  ['apparel-goods', '의류·잡화'],
  ['accessory', '액세서리'],
  ['goods', '잡화'],
  ['cosmetics-1', '화장품 1'],
  ['cosmetics-2', '화장품 2'],
  ['food-1', '음식 1'],
  ['food-2', '음식 2'],
  ['meat', '정육'],
  ['vegetable', '채소'],
  ['pine-mushroom', '송이버섯'],
  ['sea', '바다'],
  ['sea-sashimi', '바다와 회'],
  ['spring-field', '봄 들녘'],
  ['four-seasons', '사계절'],
];

const 업종세트 = (prefix, idSuffix) =>
  업종배너.map(([slug, label]) => ({
    id: `${slug}${idSuffix}`,
    label,
    src: `/assets/images/banners/${prefix}${slug}.jpg`,
  }));

export const DEFAULT_BANNERS = [...SEED_235, ...업종세트('banner-', '')];
export const DEFAULT_BANNERS_2X1 = [...SEED_2X1, ...업종세트('banner-2x1-', '_2x1')];

// contain(2:1) 배너 컨테이너를 쓰는 스토어 데모 번호.
// 나머지(demo-1·2·3 등)는 cover(2.35:1). demo-7·8은 자체 배너, demo-10은 배너 없음 → 2.35:1로 취급.
export const RATIO_2X1_DEMOS = [4, 5, 6, 9];

// 권장 배너 크기(사용자 업로드 안내용) — 데모 비율에 맞춰 표기.
export const getBannerRatio = (shopDemoNum) =>
  RATIO_2X1_DEMOS.includes(Number(shopDemoNum))
    ? { w: 2000, h: 1000, label: '2000x1000', aspect: 2 / 1 }
    : { w: 2000, h: 850, label: '2000x850', aspect: 2000 / 850 };

// 현재 스토어 데모에 맞는 '고를 수 있는' 기본 배너 전체 목록.
export const getDefaultBanners = (shopDemoNum) =>
  RATIO_2X1_DEMOS.includes(Number(shopDemoNum)) ? DEFAULT_BANNERS_2X1 : DEFAULT_BANNERS;

// 신규 개설 몰에 '자동으로 깔릴' 배너만. 목록을 늘려도 여기는 늘지 않는다.
export const getSeedBanners = (shopDemoNum) =>
  getDefaultBanners(shopDemoNum).filter((b) => b.seed);

// 섹션 빌더형 데모(shop 1·2·3·4·5·6·9, blog 1·2·3)에서 shop_obj/blog_obj가 비었을 때
// 홈이 완전 백지가 되지 않도록 렌더 시점에만 끼워 넣는 기본 구성.
// - DB에 저장하지 않는다. 가맹점이 섹션을 하나라도 만들면 즉시 사라진다.
// - 배너만 넣는다. 상품 섹션은 상품 id를 직접 지정해야 하는 구조라 브랜드 공통 기본값이 성립하지 않음.
// - ⚠ getDefaultBanners(전체 목록)가 아니라 getSeedBanners(6장)를 쓴다.
//   전체를 쓰면 목록에 사진을 추가할 때마다 신규 몰 홈의 배너가 같이 늘어난다.
// 항목 shape은 관리자 편집기 addDefaultBanner / 백엔드 utils.js/default-home.js 와 동일하게 유지.
export const getDefaultHomeContent = (shopDemoNum) => ([
  {
    type: 'banner',
    is_default: 1, // 기본 구성 표시용(저장 대상 아님)
    list: getSeedBanners(shopDemoNum).map((b) => ({
      src: b.src,
      title: '',
      title_color: '#ffffff',
      sub_title: '',
      sub_title_color: '#ffffff',
      link: '',
    })),
  },
]);

export default DEFAULT_BANNERS;
