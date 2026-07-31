// 메인페이지 배너슬라이드에 바로 넣을 수 있는 기본 배너 이미지 세트.
// - 디자인관리 › 메인페이지관리의 '배너슬라이드' 섹션에서 썸네일 클릭 시 슬라이드에 추가됨.
// - 여기 src는 이미 완성된 이미지 경로라서 저장 시 업로드 없이 그대로 반영됨(교체·삭제 가능).
// - 실사진(무료·상업적 이용 가능, Unsplash 라이선스 / 출처표기 불필요)을 public/assets/images/banners/에
//   self-host. 다른 사진으로 바꾸려면 그 폴더에 2000x850 권장 이미지를 넣고 아래 목록만 수정. (README 참고)
export const DEFAULT_BANNERS = [
  { id: 'photo1', label: '기본 사진 1', src: '/assets/images/banners/banner-1.jpg' },
  { id: 'photo2', label: '기본 사진 2', src: '/assets/images/banners/banner-2.jpg' },
  { id: 'photo3', label: '기본 사진 3', src: '/assets/images/banners/banner-3.jpg' },
  { id: 'photo4', label: '기본 사진 4', src: '/assets/images/banners/banner-4.jpg' },
  { id: 'photo5', label: '기본 사진 5', src: '/assets/images/banners/banner-5.jpg' },
  { id: 'photo6', label: '기본 사진 6', src: '/assets/images/banners/banner-6.jpg' },
];

export default DEFAULT_BANNERS;
