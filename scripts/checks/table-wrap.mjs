import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync, existsSync } from 'fs';

// 표가 옆으로 늘어나 가로 스크롤이 생기던 것과, 줄바꿈이 어색하던 것.
//
// 가맹점 피드백(2026-08-21): "노트북에서 어드민이 좌우로 스크롤되는데, 스크롤 막대가
// 맨 아래에 있어 거기까지 내려가서 좌우로 끌어야 한다. 줄바꿈도 어색하다."
//
// 둘은 같은 뿌리였다 — 표 칸에 white-space:pre 가 걸려 있었다.
//   pre 는 (1) 줄을 절대 바꾸지 않고 (2) 데이터에 든 개행을 그대로 살린다.
//   그래서 글이 길수록 표가 옆으로 늘어나고, 엉뚱한 자리에서 끊겨 보였다.
//
// 지금 규칙(관리자 표·고객 표 공통):
//   white-space:pre-line   원문 줄바꿈은 살리되 칸을 넘치면 줄을 바꾼다
//   word-break:keep-all    한국어를 글자 단위로 쪼개지 않는다
//   overflow-wrap:anywhere 그래도 안 들어가는 긴 토막(주문번호·URL)은 끊어 넘긴다

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// 어디에도 'pre' 단독 규칙이 남으면 안 된다(pre-line·pre-wrap 은 괜찮다).
const 표파일 = [
    'src/components/elements/content-table.js',
    'src/views/shop/demo-4/auth/my-page.js',
    'src/views/shop/demo-5/auth/my-page.js',
    'src/views/shop/demo-9/auth/my-page.js',
];
for (const f of 표파일) {
    const s = 읽기(f);
    const 이름 = f.split('/').slice(-2).join('/');
    t(`${이름} 에 white-space:pre 단독 규칙이 없다`, !/white-space: ?pre;/.test(s));
    t(`${이름} 이 줄을 바꾼다`, /white-space: ?pre-line;/.test(s));
    t(`${이름} 이 한국어를 단어째 넘긴다`, /word-break: ?keep-all;/.test(s));
    t(`${이름} 이 긴 토막도 끊어 넘긴다`, /overflow-wrap: ?anywhere;/.test(s));
}

// 관리자 표: 첫 칸 붙박이 + 스크롤 영역이 화면 안에 남는지
const 관리자표 = 읽기('src/components/elements/content-table.js');
t('첫 칸을 붙박이로 둔다', /td:first-child\{[\s\S]{0,80}position:sticky;/.test(관리자표));
t('한 칸이 표 전체를 늘리지 못한다', /max-width:260px;/.test(관리자표));
t('스크롤 영역이 화면 안에 묶여 있다', /maxHeight: '78vh'/.test(관리자표));

// 장바구니: 필요 이상으로 폭을 강제하지 않는다
const 장바구니 = 읽기('src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProductList.js');
t('장바구니가 720px 를 강제하지 않는다', !/minWidth: 720/.test(장바구니));
t('장바구니 글자도 단어째 넘긴다', /wordBreak: 'keep-all'/.test(장바구니));

// ── 관리자 표(ManagerTable) ───────────────────────────────────────────────
// ⚠ 관리자 화면(주문관리·회원관리…)이 쓰는 표는 content-table 이 아니라 이쪽이다.
//   처음에 content-table 만 고쳐서 '뭐가 바뀐 거냐' 는 말을 들었다 — 두 개를 헷갈리지 말 것.
const 매니저표 = 읽기('src/views/manager/mui/table/ManagerTable.js');
t('관리자 표: 스크롤 영역이 화면 안에 묶여 있다', /maxHeight: '76vh'/.test(매니저표),
    '막대가 표 맨 아래에만 있으면 줄이 많을 때 거기까지 내려가야 한다');
t('관리자 표: 머리줄이 붙박이다', /<Table stickyHeader/.test(매니저표));
t('관리자 표: 첫 칸이 붙박이다', /tbody td:first-of-type[\s\S]{0,120}position: 'sticky'/.test(매니저표));
t('관리자 표: 글은 단어째 접힌다', /wordBreak: 'keep-all'/.test(매니저표));
// 버튼 글씨가 접히면 상자 밖으로 삐져나온다 — 조작 요소는 접지 않는다.
t('관리자 표: 버튼·칩·입력은 줄을 바꾸지 않는다', /MuiButton-root[\s\S]{0,80}whiteSpace: 'nowrap'/.test(매니저표));
const 주문관리 = 읽기('src/pages/manager/orders/trx/[type].js');
t('부분/전체 취소 버튼이 한 줄로 나온다', /whiteSpace: 'nowrap'[\s\S]{0,120}부분\/전체 취소/.test(주문관리));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
