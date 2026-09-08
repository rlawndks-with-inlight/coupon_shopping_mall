import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 추가상품을 **나중에** 눌러도 주문에 들어가는가.
//
// [무엇이 있었나 — 2026-09-08]
// 필수 옵션을 다 고르면 그 조합은 곧바로 '줄' 로 쌓이고 지금 선택은 비워진다(ProductAddons).
// 그 뒤에 누른 추가상품은 빈 '지금 선택' 에 들어가는데, purchaseUnits 는 줄이 하나라도 있으면
// 지금 선택을 '고르다 만 것' 으로 보고 통째로 버린다.
//   → 버튼은 눌린 모양인데 금액·요약·장바구니 어디에도 없다.
//   실측(mbc05 떡갈비): 갯수 먼저 → 매운소스 = 50,000원(빠짐) / 매운소스 먼저 → 갯수 = 50,500원
//
// [이 검사가 왜 필요한가]
// 이 결함은 **누르는 순서**에서만 드러난다. 옵션 가격을 groups 배열을 직접 만들어 넣어
// 검증하면(계산·서버대조) 절대 안 걸린다 — 실제로 그렇게 점검했다가 놓쳤다.
// 그래서 '순서가 있어도 살아남게 하는 갈래' 자체를 못 박는다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const util = 읽기('src/utils/shop-util.js');
const 코드 = 주석제거(util);
const opts = 주석제거(읽기('src/data/product-options.js'));

// ── 갈래가 있다 ──────────────────────────────────────────────────────────
t('추가상품을 줄에 붙이는 갈래가 있다',
    /if \(isAddon\(group\)[\s\S]{0,200}?optionLines\(selectProductGroups\)\.length > 0[\s\S]{0,200}?추가상품을줄에붙이기\(/.test(코드),
    '이 갈래가 없으면 나중에 누른 추가상품은 purchaseUnits 에서 통째로 버려진다');
// 지금 고르는 중인 필수 조합이 있으면 예전처럼 '지금 선택' 에 들어가야 한다
// (그래야 필수가 완성될 때 한 줄로 함께 묶인다 — 원래 되던 순서를 깨면 안 된다).
t('고르는 중일 때는 지금 선택에 그대로 들어간다',
    /!\(selectProductGroups\?\.groups \?\? \[\]\)\.some\(\(g\) => !isAddon\(g\)\)/.test(코드),
    '이 조건을 빼면 고르는 중인 조합이 줄로 새어 나간다');
t('도우미가 있다', /const 추가상품을줄에붙이기 = \(selected, group, option\) =>/.test(코드));

// ── 도우미가 지켜야 하는 것 ──────────────────────────────────────────────
const 도우미 = 코드.slice(코드.indexOf('const 추가상품을줄에붙이기'), 코드.indexOf('export const selectItemOptionUtil'));
t('마지막 줄에 붙인다', /const i = lines\.length - 1;/.test(도우미),
    '어느 줄인지 물어보는 수단이 생기기 전까지는 마지막 줄이다');
t('다시 누르면 빠진다', /if \(oi >= 0\) options\.splice\(oi, 1\);/.test(도우미),
    '지금 선택에서와 같은 규칙이라야 손님이 헷갈리지 않는다');
t('다 빼면 그룹째 지운다', /if \(!options\.length\) groups\.splice\(gi, 1\);/.test(도우미),
    '빈 그룹이 남으면 줄 열쇠(optionLineKey)가 어긋난다');
t('열쇠를 다시 만든다', /const key = optionLineKey\(groups\);/.test(도우미),
    '옵션이 바뀌었는데 옛 열쇠를 두면 같은 조합끼리 합쳐지지 않는다');
t('같은 조합이 되면 합친다', /같은줄 >= 0/.test(도우미),
    '줄이 둘로 갈리면 손님은 왜 갈렸는지 알 수 없다');
t('원본을 고치지 않는다', /const lines = \[\.\.\.optionLines\(selected\)\]/.test(도우미) && /const groups = \[\.\.\.\(lines\[i\]\.groups \?\? \[\]\)\]/.test(도우미),
    'React 가 변화를 못 알아채면 화면이 안 바뀐다');

// ── 버리는 규칙 자체는 그대로 둔다 ───────────────────────────────────────
// '고르다 만 필수 조합' 을 담지 않는 것은 옳다. 그것까지 없애면 손님이 원한 적 없는 줄이 생긴다.
t('고르다 만 조합은 여전히 담지 않는다', /const 지금 = 단위\.length \? \[\] :/.test(opts),
    '이 규칙을 없애는 방식으로 고치면 중간 조합이 주문에 섞인다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
