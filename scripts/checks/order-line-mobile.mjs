import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 주문서·장바구니의 「주문 상품」 줄 — 휴대폰에서는 표가 아니라 카드로 쌓인다.
//
// [왜 — 2026-09-08 가맹점 제보(mbc01예시.pptx): "옵션내용에 대한 내역 보여줬으면 좋겠음"]
// 이 표는 칸이 여섯 개다(상품·옵션·배송비·가격·수량·총액). 휴대폰(폭 359px)에서 실측하니
// 표가 930px 로 벌어지고 **상품 칸 하나가 352px** 을 먹어 나머지가 전부 화면 밖이었다.
// overflow-x:auto 라 밀면 볼 수는 있었지만 밀 수 있다는 표시가 없어 아무도 밀지 않는다.
//   → 손님이 주문서에서 보는 건 위쪽 '상품 이름' 과 아래쪽 '총 결제금액' 뿐이었고,
//     자기가 고른 옵션도 거기 붙은 추가금도 어디에서도 확인할 수 없었다.
//
// ⚠ 금액 계산은 이 건과 무관하다(서버 재계산과 원 단위까지 맞는 것을 따로 확인했다).
//   이건 '보임' 의 문제다 — 그래서 **값을 새로 그리지 않고** 배치만 바꾼 것이 핵심이다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 목록 = 읽기('src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProductList.js');
const 줄 = 읽기('src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProduct.js');

// ── 휴대폰에서 카드로 쌓인다 ─────────────────────────────────────────────
t('휴대폰 전용 배치가 있다', /@media \(max-width:599\.95px\)/.test(목록),
    '없으면 표가 930px 로 벌어져 옵션·금액이 화면 밖으로 나간다');
t('표를 세로로 푼다', /'& tbody': \{ display: 'block' \}/.test(목록) && /'& tr': \{[\s\S]{0,200}display: 'block'/.test(목록));
t('머리글은 감춘다', /'& thead': \{ display: 'none' \}/.test(목록),
    '카드로 쌓이면 머리글 줄은 뜻이 없다');
t('가로로 밀 일이 없게 최소폭을 푼다', /@media \(max-width:599\.95px\)[\s\S]{0,120}minWidth: 0/.test(목록));

// ── 값이 아니라 배치만 바꾼다 ────────────────────────────────────────────
// ⚠ 여기가 이 검사의 핵심이다. 카드용으로 옵션명·금액을 다시 그리는 코드를 만들면
//   표와 카드가 언젠가 어긋난다(한쪽만 고치게 된다).
t('라벨은 data-label 을 :before 로 세운다', /content: 'attr\(data-label\)'/.test(목록),
    '값을 다시 그리지 말 것 — 칸은 그대로 두고 라벨만 얹는다');
for (const 칸 of ['옵션', '배송비', '가격', '수량', '총액']) {
    t(`${칸} 칸에 라벨이 붙어 있다`, 줄.includes("data-label={translate('" + 칸 + "')}"),
        '라벨이 없으면 카드에서 무슨 값인지 알 수 없다');
}
// 라벨 글자는 언어마다 달라진다 — 총액만 따로 잡는 표식이 있어야 굵게가 모든 언어에서 먹는다.
t('총액은 글자가 아니라 표식으로 고른다', /data-total="1"/.test(줄) && /'& td\[data-total\]'/.test(목록),
    "라벨 글자로 고르면 영어·중국어 화면에서 안 먹는다");

// ── 되돌아가면 안 되는 두 가지 ───────────────────────────────────────────
// MUI 는 align="right" 칸에 flex-direction: row-reverse 를 건다(.MuiTableCell-alignRight).
// 그대로 두면 카드에서 '37,000원 총액' 처럼 라벨이 값 뒤로 밀린다(실제로 그렇게 나왔다).
t('카드에서는 라벨이 값 앞에 온다', /flexDirection: 'row'/.test(목록),
    "MUI 의 row-reverse 를 되돌리지 않으면 '37,000원 총액' 으로 거꾸로 읽힌다");
// 삭제 버튼이 오른쪽 위에 얹히므로 상품명이 그 아래로 파고들면 안 된다(실측 28px 겹쳤다).
t('휴대폰에서 상품명을 좁힌다', /maxWidth: \{ xs: 175, sm: 240 \}/.test(줄),
    '240 그대로면 상품명이 삭제 버튼 아래로 파고든다');

// ── PC 는 건드리지 않는다 ────────────────────────────────────────────────
t('PC 는 예전 표 그대로', /minWidth: 560/.test(목록),
    '휴대폰만 바꾼 것이다 — PC 표를 없애면 다른 이야기가 된다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
