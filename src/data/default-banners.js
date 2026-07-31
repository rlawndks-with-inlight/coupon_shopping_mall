// 메인페이지 배너슬라이드에 바로 넣을 수 있는 기본 배너 이미지 세트.
// - 디자인관리 › 메인페이지관리의 '배너슬라이드' 섹션에서 썸네일 클릭 시 슬라이드에 추가됨.
// - 여기 src는 이미 완성된 이미지 경로라서 저장 시 업로드 없이 그대로 반영됨(교체·삭제 가능).
// - 실제 사진으로 바꾸려면 public/assets/images/banners/ 아래 파일을 교체하거나,
//   무료 사진(Unsplash·Pexels·Pixabay, 상업적 이용·출처표기 불필요)을 2000x850 권장으로 넣고
//   아래 목록에 { id, label, src } 한 줄만 추가하면 됩니다. (README 참고)
export const DEFAULT_BANNERS = [
  { id: 'sunset', label: '선셋 (따뜻한 코랄)', src: '/assets/images/banners/banner-sunset.svg' },
  { id: 'ocean', label: '오션 (시원한 블루)', src: '/assets/images/banners/banner-ocean.svg' },
  { id: 'noir', label: '느와르 (다크 럭셔리)', src: '/assets/images/banners/banner-noir.svg' },
  { id: 'blossom', label: '블라썸 (파스텔 핑크)', src: '/assets/images/banners/banner-blossom.svg' },
  { id: 'forest', label: '포레스트 (프레시 그린)', src: '/assets/images/banners/banner-forest.svg' },
  { id: 'sand', label: '샌드 (뉴트럴 베이지)', src: '/assets/images/banners/banner-sand.svg' },
];

export default DEFAULT_BANNERS;
