import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 수량을 정하는 자리는 하나여야 한다.
//
// [무엇이 있었나 — 2026-09-09 제보]
// 옵션을 고르면 화면에 수량 조절이 둘이 됐다 — 「선택한 옵션」 줄의 것과, 그 아래 「수량」.
// 두 값이 서로 달랐고(줄 2 / 아래 1), **아래 것은 아무 일도 하지 않았다.**
//   실측: 옵션을 고른 뒤 아래 수량을 3 으로 올려도 총 주문금액은 그대로였고 장바구니엔 1개가 담겼다.
//   손님은 3개를 주문한 줄 알고 1개를 받는다. (앞서 고친 '추가상품 누락' 과 같은 종류다)
//
// [왜 '옵션이 있으면' 으로 가르나]
// 고르기 전에 아래 수량을 3 으로 두면 그 값이 줄 수량으로 넘어가긴 한다(closeOptionLine).
// 그래서 '줄이 생기면 감춘다' 로도 값은 맞출 수 있다. 하지만 수량칸이 떴다 사라지고,
// '옵션보다 수량을 먼저 정한다' 는 순서를 아는 손님만 덕을 본다 — 아무도 그러지 않는다.
// 옵션이 있으면 처음부터 두지 않고 고른 뒤 줄에서 정하게 한다.
//
// ⚠ 필수 옵션이 없는 상품(옵션이 아예 없거나 추가상품만 있는 상품)은 줄이 생기지 않는다.
//   거기서 감추면 수량을 정할 길이 사라진다 — 그래서 '필수 옵션이 있는가' 로 가른다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const opts = 주석제거(읽기('src/data/product-options.js'));
t('판정이 한 곳에 있다', /export const 수량은옵션줄에서정한다 = \(product\) =>/.test(opts),
    '프레임마다 따로 판정하면 한 곳만 빠뜨려도 그 화면에서만 수량칸이 둘이 된다');
t('필수 옵션이 있는가로 가른다', /수량은옵션줄에서정한다 = \(product\) => requiredGroups\(product\)\.length > 0/.test(opts),
    "'줄이 생겼는가' 로 가르면 수량칸이 떴다 사라진다. 추가상품만 있는 상품은 줄이 안 생겨 수량을 못 정하게 된다");

// 상세화면에서 수량칸을 그리는 곳 — 하나라도 빠지면 그 프레임에서만 수량칸이 둘이 된다.
const 화면 = [
    ['프레임1·2 공용', 'src/views/@dashboard/e-commerce/details/ProductDetailsSummary.js', 'product'],
    ['블로그 1', 'src/views/blog/product/id/demo-1.js', 'item'],
    ['블로그 2', 'src/views/blog/product/id/demo-2.js', 'item'],
    ['블로그 4', 'src/views/blog/product/id/demo-4.js', 'item'],
    ['블로그 9', 'src/views/blog/product/id/demo-9.js', 'item'],
];
for (const [이름, 경로, 인자] of 화면) {
    const s = 읽기(경로);
    t(`${이름}: 옵션이 있으면 아래 수량을 안 그린다`,
        s.includes(`{!수량은옵션줄에서정한다(${인자}) &&`),
        '이 프레임에서만 수량칸이 둘이 되고, 아래 것은 먹통이 된다');
    t(`${이름}: 판정을 불러온다`,
        /import \{[^}]*수량은옵션줄에서정한다[^}]*\} from 'src\/data\/product-options'/.test(s));
}

// 줄 수량은 남아 있어야 한다 — 옵션이 있는 상품에서 수량을 정하는 유일한 자리다.
const 줄 = 주석제거(읽기('src/components/elements/shop/SelectedOptionLines.js'));
t('줄마다 수량을 바꿀 수 있다', /수량바꾸기/.test(줄) && /type: 'count'/.test(줄),
    '아래 수량을 없앴으므로 여기가 유일한 자리다');
t('줄을 뺄 수도 있다', /type: 'remove'/.test(줄));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
