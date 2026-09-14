import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync, existsSync } from 'fs';

// 상품후기 규칙이 화면과 서버에서 같은지, 그리고 2026-08-07 에 감췄던 이유가 되살아나지 않는지 본다.
//
// [왜 필요한가]
//   후기는 2026-09-14 에 다시 켰다(설계: ShopGo 후기·별점 설계). 감춘 이유는 '구매 확인 없음 ·
//   설정 스위치 없음 · 누구나 작성' 이었고, 이제 규칙이 프론트(src/utils/review.js)와
//   백엔드(utils.js/review-policy.js) 두 벌로 산다. 두 벌이 어긋나면 '버튼은 있는데 누르면 거절되는'
//   일이 나고, 켜고 끄기 판정이 한 곳이라도 옛 isShopgoBrand 로 남아 있으면 정책이 반쪽이 된다.
//   별점은 정수 1~5 — 예전엔 폼이 ×2 로 보내고 서버가 1~5 만 받아 3점 이상이 거절됐다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// ── 두 벌의 기본값이 같다 ──────────────────────────────────────────────────
const front = 읽기('src/utils/review.js');
const 기본값 = (src) => src.match(/REVIEW_DEFAULT_ON_SHOPGO = (true|false)/)?.[1];
t('프론트 규칙 파일이 있다', /export const isReviewEnabled/.test(front));
if (백엔드있음) {
    const back = readFileSync(BACK_ROOT + 'utils.js/review-policy.js', 'utf8');
    t('shopgo 산하 기본값이 프론트·백엔드에서 같다', 기본값(front) !== undefined && 기본값(front) === 기본값(back),
        `프론트 ${기본값(front)} / 백엔드 ${기본값(back)} — 한쪽만 바꾸면 화면엔 있는데 서버가 거절한다`);
    // 같은 상한·하한(창·수정·글자 수)
    for (const [이름, 정규식] of [['최소 글자', /review_min_length, 10\)/], ['작성 기간', /review_window_days, 90\)/], ['수정 기간', /review_edit_days, 7\)/], ['BEST 개수', /review_best_max, 3\)/]]) {
        t(`${이름} 기본값이 두 벌에서 같다`, 정규식.test(front) && 정규식.test(back));
    }
    // ── 서버가 다시 판정하는 것 ─────────────────────────────────────────
    const ctrl = 주석제거(readFileSync(BACK_ROOT + 'controllers/product_review.controller.js', 'utf8'));
    t('서버가 별점을 정수 1~5 로만 받는다', /\^\\d\+\$/.test(ctrl) && /n < 1 \|\| n > 5/.test(ctrl));
    t('서버가 주문 줄(order_id)로 구매를 확인한다', /reviewState\(\{ brand, userId, line, trx: line, existing \}\)/.test(ctrl),
        '구매 판정 없이 저장하면 2026-08-07 에 감췄던 이유로 되돌아간다');
    t('작성은 로그인한 본인 이름으로만(body 의 user_id 를 안 쓴다)', /user_id: userId/.test(ctrl) && !/user_id: req\.body/.test(ctrl));
    t('손님 목록은 숨긴 후기를 뺀다', /is_hidden=0/.test(ctrl));
    t('손님 목록의 작성자는 마스킹된다', /writer: maskWriter\(/.test(ctrl));
    t('관리자 답글·숨김·BEST 는 레벨 10 이상', (ctrl.match(/checkLevel\(req\.cookies\.token, 10, res\)/g) || []).length >= 4);
    // 주석에도 '/:id' 가 적혀 있다(왜 앞에 두는지 설명) — 코드만 본다.
    const route = 주석제거(readFileSync(BACK_ROOT + 'routes/product_review.route.js', 'utf8'));
    t("고정 경로(summary·writable·manage)가 '/:id' 보다 앞이다",
        route.indexOf("'/summary'") < route.indexOf("'/:id'") && route.indexOf("'/writable'") < route.indexOf("'/:id'") && route.indexOf("'/manage'") < route.indexOf("'/:id'"),
        "뒤에 두면 :id 가 'summary' 를 먹는다");
    const cancel = 주석제거(readFileSync(BACK_ROOT + 'utils.js/cancel.js', 'utf8'));
    t('취소 두 경로(전체·줄 단위) 모두 후기를 숨긴다', (cancel.match(/hideReviewsForCanceled\(tid\)/g) || []).length >= 2,
        '설계 §4.6 — 전액 취소·반품이면 숨김, 일부면 유지');
    const agg = 주석제거(readFileSync(BACK_ROOT + 'controllers/product.controller.js', 'utf8'));
    t('평균 별점은 /2 없이 1~5 눈금으로 센다', /ROUND\(AVG\(scope\), 1\)/.test(agg) && !/AVG\(scope\)\/2/.test(agg));
    t('마이그레이션 파일이 있다(컬럼 ①·별점 눈금 ②)', existsSync(BACK_ROOT + 'migrations/2026-09-14_product_reviews_v2.sql') && existsSync(BACK_ROOT + 'migrations/2026-09-14_product_reviews_scope.sql'),
        '별점 눈금 변환은 집계 코드 배포와 같은 자리에서 돌려야 해서 파일을 나눴다');
} else {
    console.log('  --  백엔드 폴더가 없어 서버 쪽 검사는 건너뜀');
}

// ── 화면: 켜고 끄기 판정이 한 곳도 옛 방식으로 남지 않았다 ──────────────────
const 후기화면 = [
    'src/views/@dashboard/e-commerce/details/ProductDetailsReview.js',
    'src/views/@dashboard/e-commerce/details/ProductDetailsSummary.js',
    'src/views/section/shop/HomeProductReview.js',
    'src/views/section/blog/HomeProductReview.js',
    'src/views/blog/product/id/demo-2.js',
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `src/views/shop/demo-${n}/item/[id].js`),
];
for (const p of 후기화면) {
    const src = 주석제거(읽기(p));
    t(`${p.replace('src/views/', '')}: 후기 판정이 isReviewEnabled 다`, /isReviewEnabled\(/.test(src) && !/isShopgoBrand\(themeDnsData\)/.test(src),
        'isShopgoBrand 로 막으면 가맹점이 후기설정에서 켜도 안 보인다');
}

// ── 화면: 여섯 프레임 전부 같은 컴포넌트를 쓴다 ─────────────────────────────
for (const [p, variant] of [['src/views/shop/demo-1/item/[id].js', 'full'], ['src/views/shop/demo-2/item/[id].js', 'full'],
    ['src/views/blog/product/id/demo-1.js', 'compact'], ['src/views/blog/product/id/demo-2.js', 'compact'],
    ['src/views/blog/product/id/demo-4.js', 'panel'], ['src/views/blog/product/id/demo-9.js', 'pastel']]) {
    t(`${p.replace('src/views/', '')}: 후기 컴포넌트(variant=${variant})`, new RegExp(`<ProductDetailsReview product=\\{[^}]+\\} variant="${variant}"`).test(읽기(p)));
}

// ── 화면: 별점은 정수, 제목 없음, 사진은 우리 업로더 ───────────────────────
const dialog = 주석제거(읽기('src/components/elements/shop/review/ReviewWriteDialog.js'));
t('작성 창의 별점은 정수(precision=1)이고 ×2 하지 않는다', /precision=\{1\}/.test(dialog) && !/\* 2/.test(dialog) && !/\/ 2/.test(dialog));
// 'subtitle2' 같은 MUI 변형 이름에 걸리지 않게 낱말 경계로 본다.
t('작성 창에 제목 칸이 없다', !/\btitle\b/.test(dialog.replace(/DialogTitle/g, '')));
t('사진은 Cloudinary 업로더(uploadFilesByManager)로 올린다', /uploadFilesByManager\(/.test(dialog) && !/upload\/single/.test(dialog));
t('사진은 최대 5장', /max_images/.test(dialog));

// ── 주문내역: 줄마다 후기 버튼 ────────────────────────────────────────────
for (const p of ['src/components/elements/shop/common.js', 'src/views/blog/auth/my-page/order/demo-1.js', 'src/views/blog/auth/my-page/order/demo-2.js', 'src/views/blog/auth/my-page/order/demo-4.js']) {
    const src = 읽기(p);
    t(`${p.replace('src/', '')}: 주문 줄에 「후기 쓰기」 버튼`, /<ReviewWriteButton line=\{reviewLines\[/.test(src) && /useReviewWritable\(\)/.test(src));
}

// ── 관리자: 메뉴·설정 탭 ──────────────────────────────────────────────────
const nav = 읽기('src/layouts/manager/nav/config-navigation.js');
t('상품관리 아래 「후기관리」 메뉴', /title: '후기관리', path: PATH_MANAGER\.products\.reviews/.test(nav));
t('후기관리 화면이 있다', existsSync(FRONT_ROOT + 'src/pages/manager/products/reviews.js'));
const 설정 = 읽기('src/pages/manager/settings/default/[brand_id].js');
t('기본설정에 「후기설정」 탭(레벨 40)', /label: '후기설정'/.test(설정) && /currentTab == 9 &&/.test(설정));
t('후기설정 탭이 is_use_review 를 저장한다', /\['is_use_review'\]: e\.target\.checked \? 1 : 0/.test(설정));

// ── 「도움돼요」(2026-09-14, 선택 기능) ────────────────────────────────
t('후기설정 탭이 review_use_helpful 을 저장한다', /\['review_use_helpful'\]: e\.target\.checked \? 1 : 0/.test(설정));
t('프론트가 use_helpful 을 읽는다', /use_helpful:/.test(front));
if (백엔드있음) {
    const back2 = readFileSync(BACK_ROOT + 'utils.js/review-policy.js', 'utf8');
    const ctrl2 = 주석제거(readFileSync(BACK_ROOT + 'controllers/product_review.controller.js', 'utf8'));
    const route2 = 주석제거(readFileSync(BACK_ROOT + 'routes/product_review.route.js', 'utf8'));
    t('백엔드도 use_helpful 을 같은 기본값(켜짐)으로 읽는다', /review_use_helpful === ''\) \? true/.test(back2) && /review_use_helpful === ''\) \? true/.test(front));
    t('도움돼요는 회원만·관리자 제외·내 후기 제외', /helpful: async/.test(ctrl2) && /내 후기에는 누를 수 없습니다/.test(ctrl2) && /관리자 계정으로는 누를 수 없습니다/.test(ctrl2));
    t('도움돼요 건수는 실제로 바뀐 때만 ±1', /ins\.affectedRows > 0/.test(ctrl2) && /del\.affectedRows > 0/.test(ctrl2));
    t('도움돼요 경로가 /:id 앞에 있다', route2.indexOf("'/:id/helpful'") > -1 && route2.indexOf("'/:id/helpful'") < route2.indexOf("'/:id'"));
    t('도움돼요 표 마이그레이션 ③ 이 있다', existsSync(BACK_ROOT + 'migrations/2026-09-14_product_review_votes.sql'));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
