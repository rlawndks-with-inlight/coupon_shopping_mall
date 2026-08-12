# 기본 배너 이미지

메인페이지 '배너슬라이드' 섹션에서 **기본 배너**로 제공되는 이미지 폴더입니다.
관리자 › 디자인관리 › 메인페이지관리 › 배너슬라이드에서 썸네일을 클릭하면 슬라이드에 바로 추가됩니다.

## 데모별 두 가지 비율 세트

메인배너 컨테이너 비율이 데모마다 달라서 **두 세트**를 제공합니다. 관리자 화면은 현재 스토어 데모(`shop_demo_num`)에 맞는 세트를 자동으로 보여줍니다.

| 세트 | 파일 | 크기 | 비율 | 사용 데모 | 맞춤 방식 |
|---|---|---|---|---|---|
| 기본 | `banner-*.jpg` | 2000 x 850 | 2.35:1 | demo-1·2·3 | cover (꽉 참) |
| 와이드 2:1 | `banner-2x1-*.jpg` | 2000 x 1000 | 2:1 | demo-4·5·6·9 | contain (전체 표시) |

> `banner-2x1-*`는 `banner-*`(2.35:1) 원본을 좌우 센터크롭한 **동일 사진**입니다.
> demo-7·8은 자체 배너(동영상 등)를 쓰고, demo-10은 배너가 없어 위 세트와 무관합니다.

## 두 가지 목록을 구분하세요 ⚠

| | 무엇 | 지금 |
|---|---|---|
| **고르는 목록** | 관리자 배너슬라이드에서 클릭해 넣는 카탈로그 | 23종 |
| **자동으로 깔리는 것** | 신규 개설 몰 홈에 처음부터 들어가는 배너 | **6종** (`banner-1~6`) |

`src/data/default-banners.js` 에서 **`seed: true`** 가 붙은 것만 자동으로 깔립니다.
목록에 사진을 더 넣을 때 **`seed` 를 붙이지 마세요** — 붙이면 신규 개설 몰의 배너가 그만큼 늘어납니다.
(백엔드 `utils.js/default-home.js` 의 하드코딩 목록도 이 6종과 같아야 합니다)

## 사진 구성

- **무드 사진 6종**(`banner-1~6`) — 따뜻한 뉴트럴/제품·라이프스타일. 자동으로 깔리는 것이 이것입니다.
- **업종 사진 17종** — 건어물 · 남성의류 · 여성의류 · 의류잡화 · 액세서리 · 잡화 · 화장품1·2 ·
  음식1·2 · 정육 · 채소 · 송이버섯 · 바다 · 바다와 회 · 봄 들녘 · 사계절.
  파일명은 영문 슬러그입니다(`banner-dried-seafood.jpg` 등) — 파일명이 곧 URL 이라 한글·공백을 쓰지 않습니다.
  원본 PNG(장당 1~2.7MB)는 JPEG 품질 82로 변환해 넣었습니다(장당 70~330KB).

## 사진 교체 방법
- 권장 크기: 해당 데모 비율에 맞춤 — **2.35:1 데모는 2000 x 850**, **2:1 데모는 2000 x 1000**. JPG/PNG/WEBP 가능.
- 이 폴더에 파일을 넣고, `src/data/default-banners.js`의 해당 목록(`DEFAULT_BANNERS` 또는 `DEFAULT_BANNERS_2X1`)에 한 줄 추가:
  ```js
  { id: 'myphoto', label: '내 배너 이름', src: '/assets/images/banners/myphoto.jpg' },
  ```
- 데모↔비율 매핑은 같은 파일의 `RATIO_2X1_DEMOS`(현재 `[4, 5, 6, 9]`)에서 관리합니다.

## 무료(상업적 이용·출처표기 불필요) 사진 받는 곳
- **Unsplash** — https://unsplash.com  (검색 후 Download 오른쪽 화살표 → 크기 선택)
- **Pexels** — https://www.pexels.com  (무료 다운로드, 라이선스 표기 불필요)
- **Pixabay** — https://pixabay.com  (Content License, 대부분 자유 이용)

### 검색 키워드 예시 (배너용 가로 사진)
- 쇼핑몰/패션: `fashion banner`, `clothing rack`, `minimal studio`, `flat lay`
- 잡화/라이프: `lifestyle desk`, `cozy interior`, `product minimal`
- 뷰티/향수: `beauty flatlay`, `cosmetics soft light`
- 음식/카페: `coffee table`, `food banner wide`
- 가로형은 검색 시 **Orientation: Landscape**(가로) 필터를 켜세요.

> 저작권 주의: 위 3곳 외의 이미지는 상업적 사용 가능 여부를 반드시 확인하세요.
> 인물이 크게 나온 사진은 초상권 이슈가 있을 수 있어 제품/배경 위주를 권장합니다.
