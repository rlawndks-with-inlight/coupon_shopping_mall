// 「단일 상품 강조」 디자인 타입 목록과, 미리보기를 찍을 때 쓰는 견본 상품.
//
// [왜 한 곳에 두나]
// 같은 목록이 세 곳에서 필요하다.
//   ① 관리자 '디자인 타입' 고르는 칸 (views/manager/main_obj/setting.js)
//   ② 캡처 전용 화면          (pages/manager/designs/preview-capture.js)
//   ③ 캡처 스크립트           (scripts/section-preview/capture.cjs)
// 세 곳에 각각 적어 두면 타입을 하나 추가했을 때 어느 하나가 빠진다 —
// 그러면 고를 수는 있는데 미리보기가 없는(또는 그 반대인) 타입이 생긴다.
//
// ⚠ value 는 DB(main_obj 의 style.hero_type)에 저장되는 값이다. 순서를 바꿔도
//   value 는 절대 바꾸지 말 것 — 이미 그 값으로 저장된 가맹점 홈이 다른 모양으로 바뀐다.

export const HERO_TYPES = [
    { value: 1, label: '매거진 커버 스토리 (에디토리얼)' },
    { value: 2, label: '매거진 피처 스프레드 (다크)' },
    { value: 3, label: '매거진 인터뷰 (인용구 중심)' },
    { value: 4, label: '매거진 에디토리얼 (Serif 감성)' },
    { value: 5, label: '프로모션 와이드 배너 (홈쇼핑 스타일)' },
    { value: 6, label: '풀블리드 이미지 배너 (프리미엄 쇼핑몰)' },
    { value: 7, label: '스포트라이트 (다크 럭셔리)' },
    { value: 8, label: '그리드 쇼케이스 (모듈식 블록)' },
];

// 미리보기 이미지에 쓰는 견본 상품.
//
// 실제 가맹점 상품을 쓰지 않는다 — 그 몰의 상품 사진과 이름이 다른 가맹점 관리자 화면에
// 그대로 박히게 된다. 할인 있는 상품으로 둔 이유는 타입 몇 개가 'ON SALE' 배지와
// 할인율을 그리기 때문이다. 할인이 없으면 그 자리들이 빈 채로 찍힌다.
// 견본 사진은 **자리표시자**다. 실제 사진을 쓰지 않는 이유가 둘이다.
//   ① 가맹점 상품 사진을 쓰면 그 몰의 물건이 다른 가맹점 관리자 화면에 박힌다.
//   ② 기본 배너(2.35:1)를 썼더니 타입7(원형 크롭)에서 사진의 흰 여백만 잡혀
//      **아무것도 없는 흰 원**으로 찍혔다. 미리보기가 오히려 오해를 만든다.
// 정사각 SVG 는 어떤 크롭(원형·꽉찬배경·좌우분할)에서도 같은 모양으로 보이고,
// '여기에 상품 사진이 들어간다' 는 것도 분명해진다. 파일이 아니라 코드라 잃어버릴 일도 없다.
const 자리표시사진 = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">'
    + '<rect width="800" height="800" fill="#e9ecef"/>'
    + '<rect x="230" y="250" width="340" height="250" rx="14" fill="none" stroke="#adb5bd" stroke-width="10"/>'
    + '<circle cx="320" cy="330" r="30" fill="#adb5bd"/>'
    + '<path d="M250 480 L360 370 L430 440 L500 390 L550 480 Z" fill="#adb5bd"/>'
    + '<text x="400" y="580" font-family="sans-serif" font-size="40" fill="#868e96" text-anchor="middle">'
    + '상품 사진</text></svg>'
);

export const 견본상품 = {
    id: 0,
    product_name: '샘플 상품',
    product_comment: '상품 한 줄 설명이 이 자리에 들어갑니다',
    product_img: 자리표시사진,
    // 할인가를 넣어 둔다 — 타입 몇 개가 'ON SALE' 배지와 할인율을 그린다.
    // 할인이 없으면 그 자리들이 빈 채로 찍혀 실제보다 허전해 보인다.
    product_price: 120000,
    product_sale_price: 89000,
};

// 만들어진 미리보기 이미지의 주소. 없으면 관리자 화면은 그냥 안 그린다.
export const heroPreviewSrc = (value) => `/section-preview/item-hero-${value}.png`;
