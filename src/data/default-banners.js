// 메인페이지 배너슬라이드에 바로 넣을 수 있는 기본 배너 이미지 세트.
// - 디자인관리 › 메인페이지관리의 '배너슬라이드' 섹션에서 썸네일 클릭 시 슬라이드에 추가됨.
// - src는 이미 완성된 이미지 경로라서 저장 시 업로드 없이 그대로 반영됨(교체·삭제 가능).
// - 실사진(무료·상업적 이용 가능, Unsplash/Pexels 라이선스 / 출처표기 불필요)을
//   public/assets/images/banners/ 에 self-host.
//
// 데모마다 메인배너 컨테이너 비율이 달라 두 세트를 제공한다:
//   - 2.35:1 (2000x850)  : demo-1·2·3 (cover)     → DEFAULT_BANNERS
//   - 2:1    (2000x1000) : demo-4·5·6·9 (contain) → DEFAULT_BANNERS_2X1
//   (2:1 세트는 2.35:1 원본을 좌우 센터크롭한 동일 사진들)
// 스토어 데모(shop_demo_num)에 맞는 세트를 getDefaultBanners()로 고른다.
// 새 사진으로 바꾸려면 해당 폴더에 권장 크기 이미지를 넣고 아래 목록만 수정. (README 참고)

export const DEFAULT_BANNERS = [
  { id: 'photo1', label: '테라코타 도자기', src: '/assets/images/banners/banner-1.jpg' },
  { id: 'photo2', label: '화분 · 창가 햇살', src: '/assets/images/banners/banner-2.jpg' },
  { id: 'photo3', label: '세라믹 소품', src: '/assets/images/banners/banner-3.jpg' },
  { id: 'photo4', label: '아늑한 거실', src: '/assets/images/banners/banner-4.jpg' },
  { id: 'photo5', label: '앰버 제품 보틀', src: '/assets/images/banners/banner-5.jpg' },
  { id: 'photo6', label: '무광 세라믹', src: '/assets/images/banners/banner-6.jpg' },
];

// 2:1(2000x1000) 세트 — contain 컨테이너를 쓰는 데모(4·5·6·9)에서 여백 없이 딱 맞음.
export const DEFAULT_BANNERS_2X1 = [
  { id: 'photo1_2x1', label: '테라코타 도자기', src: '/assets/images/banners/banner-2x1-1.jpg' },
  { id: 'photo2_2x1', label: '화분 · 창가 햇살', src: '/assets/images/banners/banner-2x1-2.jpg' },
  { id: 'photo3_2x1', label: '세라믹 소품', src: '/assets/images/banners/banner-2x1-3.jpg' },
  { id: 'photo4_2x1', label: '아늑한 거실', src: '/assets/images/banners/banner-2x1-4.jpg' },
  { id: 'photo5_2x1', label: '앰버 제품 보틀', src: '/assets/images/banners/banner-2x1-5.jpg' },
  { id: 'photo6_2x1', label: '무광 세라믹', src: '/assets/images/banners/banner-2x1-6.jpg' },
];

// contain(2:1) 배너 컨테이너를 쓰는 스토어 데모 번호.
// 나머지(demo-1·2·3 등)는 cover(2.35:1). demo-7·8은 자체 배너, demo-10은 배너 없음 → 2.35:1로 취급.
export const RATIO_2X1_DEMOS = [4, 5, 6, 9];

// 권장 배너 크기(사용자 업로드 안내용) — 데모 비율에 맞춰 표기.
export const getBannerRatio = (shopDemoNum) =>
  RATIO_2X1_DEMOS.includes(Number(shopDemoNum))
    ? { w: 2000, h: 1000, label: '2000x1000', aspect: 2 / 1 }
    : { w: 2000, h: 850, label: '2000x850', aspect: 2000 / 850 };

// 현재 스토어 데모에 맞는 기본 배너 세트를 반환.
export const getDefaultBanners = (shopDemoNum) =>
  RATIO_2X1_DEMOS.includes(Number(shopDemoNum)) ? DEFAULT_BANNERS_2X1 : DEFAULT_BANNERS;

export default DEFAULT_BANNERS;
