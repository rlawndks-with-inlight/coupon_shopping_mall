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

// ─────────────────────────────────────────────────────────────────────────
// 섹션 종류별 미리보기 (요청서 8번).
//
// [제보] "가맹점에서는 섹션 가지고 정확한 이미지를 알기 어렵습니다.
//        해당 페이지 각 색션별로 이미지화 해서 보여줄 수 있게 요청 드립니다."
//
// 섹션마다 필요한 데이터 모양이 다르다(배너는 이미지 목록, 상품슬라이드는 상품 배열,
// 게시판은 게시판+글 목록…). 그 견본을 여기 한곳에 둔다 —
// 캡처 화면과 검사가 같은 것을 쓰게 하기 위해서다.
//
// ⚠ 여기 type 값은 utils/format.js 의 mainObjSchemaList 와 같아야 한다.
//   다르면 '고를 수는 있는데 미리보기가 없는' 섹션이 생긴다(검사가 잡는다).

export const 견본상품들 = (n) => Array.from({ length: n }, (_, i) => ({
    ...견본상품,
    id: i + 1,
    product_name: `샘플 상품 ${i + 1}`,
    product_sale_price: 89000 - i * 7000,
}));

// 배너 한 장. 실제 저장소에 있는 기본 배너를 쓴다 — 배너 섹션은 '사진이 어떻게 놓이는지'
// 를 보여주는 것이라 자리표시자보다 진짜 사진이 낫다.
const 견본배너 = (n) => Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    src: `/assets/images/banners/banner-${i + 1}.jpg`,
    title: '',
    link: '',
}));

export const SECTION_SAMPLES = [
    { type: 'banner', label: '배너슬라이드',
        column: { type: 'banner', list: 견본배너(1), style: {} } },
    { type: 'items', label: '상품슬라이드',
        column: { type: 'items', title: '인기 상품', sub_title: '', list: 견본상품들(4), style: {} } },
    { type: 'items-ids', label: 'ID 선택형 상품슬라이드',
        column: { type: 'items-ids', title: '이달의 추천', sub_title: '', list: 견본상품들(4), style: {} } },
    // 이 섹션은 한동안 미리보기를 못 만들었다(skip 이었다). 탭까지만 그려지고
    // 상품 격자가 비었으며, 그 빈 영역 높이가 33,554,432px(2^25)라 크롬이 캡처를 거절했다.
    // 견본 데이터 탓이 아니라 섹션 자체의 결함이었다 —
    // 원인과 수정은 views/section/blog/HomeItemsWithCategories.js 주석에 적었다.
    // 지금은 정상이라 다른 섹션과 똑같이 찍는다.
    { type: 'items-with-categories', label: '카테고리탭별 상품리스트',
        column: {
            type: 'items-with-categories', title: '카테고리별 상품', sub_title: '', is_vertical: 0,
            list: [
                { category_name: '상의', list: 견본상품들(4) },
                { category_name: '하의', list: 견본상품들(4) },
            ],
            style: {},
        } },
    { type: 'item-hero', label: '단일 상품 강조',
        column: { type: 'item-hero', title: '', list: [견본상품], style: { hero_type: '1' } } },
    { type: 'button-banner', label: '버튼형 배너슬라이드',
        column: { type: 'button-banner', list: 견본배너(1), style: {} } },
    { type: 'text-banner', label: '텍스트형 배너슬라이드',
        column: {
            type: 'text-banner',
            // 이 섹션은 칸을 세로줄로 나눠 늘어놓는다. 한 칸만 두면 글자 한 줄로만 보여
            // '무슨 섹션인지' 가 안 드러난다 — 세 칸으로 둔다.
            list: [
                { id: 1, title: '무료배송', link: '' },
                { id: 2, title: '당일출고', link: '' },
                { id: 3, title: '교환·반품 안내', link: '' },
            ],
            style: {},
        } },
    { type: 'video-slide', label: '동영상 슬라이드',
        column: {
            type: 'video-slide', title: '브랜드 영상',
            list: [{ id: 1, title: '영상 제목', link: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' }],
            style: {},
        } },
    { type: 'editor', label: '에디터',
        column: {
            type: 'editor',
            content: '<h3>자유롭게 쓰는 자리</h3><p>배송 안내·교환 규정처럼 홈에 붙이고 싶은 글을 넣습니다.</p>',
            style: {},
        } },
    { type: 'post', label: '게시판',
        column: {
            type: 'post',
            list: [{
                id: 1, post_category_title: '공지사항',
                recent_posts: [
                    { id: 1, post_title: '추석 연휴 배송 안내' },
                    { id: 2, post_title: '신규 회원 적립금 안내' },
                ],
            }],
            style: {},
        } },
];

export const sectionPreviewSrc = (type) => `/section-preview/section-${type}.png`;

// ─────────────────────────────────────────────────────────────────────────
// 「홈 문구」가 화면 어디에 나오는지 (요청서 10번).
//
// [제보] "정확히 어디 문구 인지 이미지로 보여주면 좋을 듯 합니다."
//
// 좌표를 손으로 적어 두지 않는다. 대신 **문구 자리에 그 칸의 이름을 넣고** 홈을 찍는다 —
// 사진 속 글자가 곧 라벨이 되므로 좌표 데이터가 아예 필요 없고,
// 디자인이 바뀌어 자리가 옮겨져도 다시 찍기만 하면 맞는다.
//
// ⚠ 값이 빈 칸이면 데모가 자기 기본값을 쓴다(예: '№ 001'). 그래서 반드시 채워 넣어야
//   그 자리가 어느 칸인지 드러난다.

// HOME_TEXT_SCHEMA 의 필드 목록을 '① 라벨' 로 채운 home_texts 객체로 바꾼다.
export const 홈문구표시값 = (fields) => {
    const 번호 = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫'];
    const out = {};
    (fields ?? []).forEach((f, i) => {
        out[f.key] = `${번호[i] ?? `(${i + 1})`} ${f.label}`;
    });
    return out;
};

export const homeTextPreviewSrc = (demoNum) => `/section-preview/home-text-${demoNum}.png`;
