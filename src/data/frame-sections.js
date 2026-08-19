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
//
// ── 다시 추린 기준(2026-08-20) ────────────────────────────────────────────
// 처음에는 프레임 소개 문구에 적힌 낱말만 보고 4~5개씩 끊었다. 그 탓에 프레임1에서
// 에디터가 빠졌다 — 소개 문구에 '읽을거리' 가 없었기 때문인데, 정작 상품이 많은 몰일수록
// 배송·교환 안내를 홈에 붙일 자리가 필요하다. 문구에 없다고 뺄 일이 아니었다.
//
// 그래서 기준을 바꿨다. 여기 적는 것은 **'이 프레임 홈을 처음 꾸릴 때의 차례'** 다.
// 위에서 아래로 읽으면 홈 한 장이 되도록 순서까지 맞춰 둔다(화면이 이 순서대로 보여준다).
//
// 섹션을 두 갈래로 본다:
//   · 프레임을 안 타는 것 — 에디터·게시판·동영상·배너 변형. 어디 놓든 넣은 대로 나온다.
//     그래서 '이 프레임에서만 되는 것' 이 아니라 '이 몰에 필요한가' 로 넣고 뺀다.
//   · 프레임을 타는 것 — 상품을 어떻게 늘어놓느냐(카테고리탭·슬라이드·단일 강조).
//     이건 프레임 성격과 맞물리므로 프레임마다 다르게 고른다.
//
// 배너 변형 둘은 조리법에서 뺐다. 못 써서가 아니라 '배너슬라이드' 와 자리가 겹쳐서다 —
// 처음 꾸릴 때 셋 다 권하면 뭘 골라야 할지 더 헷갈린다. 목록 아래쪽에 그대로 있다.
// (다만 shop:2 는 슬로건 한 줄이 화면을 끌고 가는 프레임이라 텍스트형을 조리법에 넣었다)
//
// items-with-categories 가 blog:1·blog:2 에 들어간 이유:
//   프레임3·4 는 헤더에 카테고리가 없다. 좁은 폭 때문에 넣을 수도 없어서 카테고리 이동은
//   /shop/items 화면의 칩으로 붙였는데(CategoryChips.js), 그건 아이콘을 한 번 눌러야 닿는다.
//   홈에서 카테고리를 보여 주는 수단은 이 섹션뿐이다.

const 추천 = {
    // 종합몰. 카테고리로 갈래를 주고, 인기상품·기획전을 얹고, 안내와 공지로 닫는다.
    'shop:1': ['banner', 'items-with-categories', 'items', 'items-ids', 'editor', 'post'],
    // 단일 브랜드. 대표 상품 하나를 세우고 영상·글·슬로건으로 분위기를 만든다.
    'shop:2': ['banner', 'item-hero', 'items', 'video-slide', 'editor', 'text-banner'],
    // 매거진. Cover Story(단일 강조) → Editor's Pick(직접 고른 상품) → 글 → 갈래.
    //   Editor's Pick 은 '고른 상품' 이므로 items 보다 items-ids 가 먼저다.
    'blog:1': ['banner', 'item-hero', 'items-ids', 'editor', 'items', 'items-with-categories'],
    // 한 컬럼 큐레이션. 카테고리별로 차례차례가 이 프레임의 정의다(소개 문구 그대로).
    'blog:2': ['banner', 'items-with-categories', 'items', 'items-ids', 'editor'],
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
