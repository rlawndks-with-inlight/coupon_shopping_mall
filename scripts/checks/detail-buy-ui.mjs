import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 상품상세에서 '담기'와 팝업 크기.
//
// 가맹점 피드백(2026-08-21):
//   · 프레임3·4 상세에 장바구니 담기 버튼이 없다 → 실은 「구매하기」를 눌러야 열리는 서랍 안에만
//     있었다. 살지 말지 고르는 자리에 담기가 없으면 손님은 그 몰에 담기가 없다고 읽는다.
//   · 홈 팝업이 손바닥만 하게 뜬다 → 폭을 내용에 맡겨 둬서 글만 몇 줄인 팝업이 그렇게 됐다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 담기 버튼 ─────────────────────────────────────────────────────────────
for (const n of [1, 2, 3]) {
    const f = `src/views/blog/product/id/demo-${n}.js`;
    const s = 읽기(f);
    const 이름 = `blog demo-${n}`;
    t(`${이름} 상세에 장바구니 버튼이 보인다`, s.includes("{translate('장바구니')}\n") || /\{translate\('장바구니'\)\}/.test(s));
    t(`${이름} 담기가 구매하기 옆에 있다`, s.includes("requiredGroups(item).length > 0 ? setCartOpen(true) : handleAddCart()"));
    // 옵션이 걸린 상품을 옵션 없이 담으면 안 된다 — 그때는 고를 자리(서랍)를 열어야 한다.
    t(`${이름} 옵션 상품은 서랍을 연다`, s.includes('requiredGroups(item).length > 0 ? setCartOpen(true)'));
    // 품절 상품의 버튼은 죽어 있어야 한다.
    t(`${이름} 품절이면 담기도 막힌다`, /disabled=\{!purchasable\} style=\{\{ width: '38%' \}\}/.test(s));
}

// ── 팝업 크기 ─────────────────────────────────────────────────────────────
const popup = 읽기('src/components/elements/shop/StorefrontPopups.js');
t('팝업에 최소 폭이 있다', /min-width:min\(360px, 82vw\);/.test(popup));
t('팝업이 화면을 넘지 않는다', /max-width:min\(560px, 88vw\);/.test(popup));
t('작은 화면에서는 최소 폭을 풀어 준다', /min-width:0;/.test(popup));
t('팝업 안 이미지가 카드를 뚫지 않는다', /img\{max-width:100%;height:auto;\}/.test(popup));
// 예전에 고친 것들 — 같이 잠가 둔다(헤더 뒤로 숨어 못 닫던 문제, 다크모드 흰 글자 문제).
t('팝업이 헤더보다 위에 있다', /z-index:1300;/.test(popup));
t('팝업 글자색을 고정한다', /color:#212121;/.test(popup));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
