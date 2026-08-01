# 기본 배너 이미지

메인페이지 '배너슬라이드' 섹션에서 **기본 배너**로 제공되는 이미지 폴더입니다.
관리자 › 디자인관리 › 메인페이지관리 › 배너슬라이드에서 썸네일을 클릭하면 슬라이드에 바로 추가됩니다.

현재는 쇼핑몰에 어울리는 **따뜻한 뉴트럴/제품·라이프스타일 무드의 실사진 6종**(banner-1~6.jpg, 2000x850)이 들어 있습니다. 다른 사진으로 교체하는 방법:

## 1) 실제 사진으로 교체
- 권장 크기: **2000 x 850px** (가로 배너). JPG/PNG/WEBP 모두 가능.
- 이 폴더에 파일을 넣고, `src/data/default-banners.js` 목록에 한 줄 추가:
  ```js
  { id: 'myphoto', label: '내 배너 이름', src: '/assets/images/banners/myphoto.jpg' },
  ```

## 2) 무료(상업적 이용·출처표기 불필요) 사진 받는 곳
아래 3곳은 모두 **커머스/상업적 사용 가능, 출처 표기 의무 없음**입니다.
- **Unsplash** — https://unsplash.com  (검색 후 Download 오른쪽 화살표 → 크기 선택)
- **Pexels** — https://www.pexels.com  (무료 다운로드, 라이선스 표기 불필요)
- **Pixabay** — https://pixabay.com  (Content License, 대부분 자유 이용)

### 검색 키워드 예시 (배너용 가로 사진)
- 쇼핑몰/패션: `fashion banner`, `clothing rack`, `minimal studio`, `flat lay`
- 잡화/라이프: `lifestyle desk`, `cozy interior`, `product minimal`
- 뷰티/향수: `beauty flatlay`, `cosmetics soft light`
- 음식/카페: `coffee table`, `food banner wide`
- 배너에 어울리는 가로형은 검색 시 **Orientation: Landscape**(가로) 필터를 켜세요.

> 저작권 주의: 위 3곳 외의 이미지는 상업적 사용 가능 여부를 반드시 확인하세요.
> 인물이 크게 나온 사진은 초상권 이슈가 있을 수 있어 제품/배경 위주를 권장합니다.
