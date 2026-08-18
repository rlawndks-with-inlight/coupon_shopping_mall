import { isShopSectionBuilder, isBlogSectionBuilder } from 'src/utils/section-builder';

// 프레임마다 '먼저 권하는 섹션'.
//
// 왜 필요한가:
//   메인페이지관리의 섹션 목록은 13종이 한 줄로 늘어서 있다. 가맹점 입장에서는 무엇을
//   골라야 이 프레임이 미리보기처럼 보이는지 알 수 없다. "데모3처럼 하고 싶은데요?" 라는
//   물음에 답할 수단이 화면에 없었다.
//
// ⚠ '못 쓰는 섹션' 목록이 아니다. 홈 화면 13종을 프레임 전부가 그린다 — 코드상 의미 없는
//   섹션은 없다. 여기 있는 것은 그 프레임의 성격에 맞아 먼저 권하는 것들이고,
//   나머지도 목록 아래쪽에서 그대로 고를 수 있다. 막지 않고 권하기만 한다.
//
// 근거는 각 프레임의 소개 문구(main-site/frameList.js)다 —
//   shop:1 탐색 중심형 · 다카테고리 — 카테고리 메뉴와 상품 나열이 중심
//   shop:2 비주얼 중심형 · 단일 브랜드 — 큰 배너로 분위기를 잡는다
//   blog:1 매거진형 — Cover Story · Editor's Pick 구성
//   blog:2 스크롤형 — 한 컬럼에 카테고리별 상품을 차례로

const 추천 = {
    'shop:1': ['banner', 'items-with-categories', 'items', 'items-ids', 'post'],
    'shop:2': ['banner', 'item-hero', 'items', 'editor', 'video-slide'],
    'blog:1': ['banner', 'item-hero', 'editor', 'items'],
    'blog:2': ['banner', 'items', 'items-with-categories', 'editor'],
};

// 판매중단 프레임은 성격이 가장 가까운 것으로 떨어뜨린다 — 빈 목록이 되면
// 추천 묶음만 비어 보이고 도움이 안 된다.
const 대체 = { 'shop:3': 'shop:1', 'shop:4': 'shop:1', 'shop:5': 'shop:2',
               'shop:6': 'shop:2', 'shop:9': 'shop:2', 'blog:3': 'blog:2' };

const 프레임키 = (dns) => {
    const shop = Number(dns?.shop_demo_num) || 0;
    if (shop > 0) return `shop:${shop}`;
    const blog = Number(dns?.blog_demo_num) || 0;
    return blog > 0 ? `blog:${blog}` : '';
};

// 이 브랜드에서 먼저 권할 섹션 type 목록. 모르는 프레임이면 빈 배열(=묶지 않고 다 보여준다).
export const 추천섹션 = (dns) => {
    // 섹션빌더가 아닌 프레임은 애초에 이 화면에 오지 않는다(mainDesignRoute 가 null).
    if (!isShopSectionBuilder(dns) && !isBlogSectionBuilder(dns)) return [];
    const key = 프레임키(dns);
    return 추천[key] ?? 추천[대체[key]] ?? [];
};
