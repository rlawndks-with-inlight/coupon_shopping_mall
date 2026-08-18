import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 조합형 상품에서 '옵션 이름을 고쳐도 그 조합의 추가금·재고가 살아남는가'.
//
// 붙잡아 두는 사고:
//   조합을 옵션 '이름' 으로 묶던 때가 있었다. 그래서
//     블랙/S 추가금 5,000 · 재고 20  →  '블랙' 을 '블랙(무광)' 으로 고치는 순간
//     블랙(무광)/S 추가금 0 · 재고 무제한        (경고도 없이 초기화)
//   오타 하나 고치려다 조합표를 처음부터 다시 채워야 했다.
//   같은 이름 옵션을 둘 만들면 조합 줄이 중복으로 생기기도 했다.
//
// 지금은 '옵션 식별자'(저장된 것은 id:N, 새 것은 tmp_xxx)로 묶는다.
// 이 검사는 화면 코드에서 그 계산을 그대로 떼어 와 돌린다 — 코드가 되돌아가면 여기서 걸린다.

let pass = 0, fail = 0;
const eq = (name, got, want) => {
    if (JSON.stringify(got) === JSON.stringify(want)) { pass++; }
    else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};
const ok = (name, cond) => eq(name, !!cond, true);

const src = readFileSync(FRONT_ROOT + 'src/components/manager/ProductOptionEditor.js', 'utf8');

// 소스에 섞이면 안 되는 문자. 한 번 들어간 적이 있고, 그러면 grep 이 이 파일을
// 바이너리로 보고 검사 도구들이 통째로 못 읽는다.
ok('소스에 NUL 문자 없음', !src.includes('\0'));

// 화면이 정말 식별자로 묶는지 — 이 확인이 실패하면 아래 검증은 의미가 없다
ok('조합을 option_keys 로 묶는다', /조합키\(c\?\.option_keys \?\? \[\]\)/.test(src));
ok('새 옵션에 식별자를 붙인다', /_k: 새옵션키\(\)/.test(src));
ok('저장 payload 에는 이름을 그대로 싣는다(서버가 이름→id 로 푼다)', /option_names: names/.test(src));

// ── 화면 계산을 그대로 옮겨 돌린다 ────────────────────────────────────────
const 살아있는 = (list) => (list ?? []).filter((x) => x?.is_delete != 1);
const 옵션키 = (o) => (o?._k ? String(o._k) : o?.id ? `id:${o.id}` : `name:${String(o?.option_name ?? '').trim()}`);
const 조합키 = (keys) => [...keys].sort().join(' ');
const 조합목록 = (groups) => {
    const 축 = groups
        .filter((g) => g?.is_delete != 1 && (Number(g?.group_type) || 0) === 0)
        .map((g) => 살아있는(g.options)
            .filter((o) => String(o?.option_name ?? '').trim())
            .map((o) => ({ k: 옵션키(o), name: String(o.option_name).trim() })))
        .filter((칸) => 칸.length > 0);
    if (!축.length) return [];
    return 축.reduce((acc, 칸) => acc.flatMap((prev) => 칸.map((x) => [...prev, x])), [[]]);
};
const 동기화 = (groups, combinations) => 조합목록(groups).map((칸) => {
    const keys = 칸.map((x) => x.k);
    const names = 칸.map((x) => x.name);
    const 옛것 = new Map((combinations ?? [])
        .filter((c) => (c?.option_keys?.length ?? 0) > 0)
        .map((c) => [조합키(c.option_keys), c])).get(조합키(keys));
    return 옛것 ? { ...옛것, option_keys: keys, option_names: names }
        : { option_keys: keys, option_names: names, add_price: 0, stock_qty: '' };
});

// 색상(블랙·화이트) × 사이즈(S·M). 가맹점이 값을 채워 뒀다.
const 상품 = () => [
    { id: 10, group_type: 0, options: [{ id: 1, option_name: '블랙' }, { id: 2, option_name: '화이트' }] },
    { id: 11, group_type: 0, options: [{ id: 3, option_name: 'S' }, { id: 4, option_name: 'M' }] },
];
let groups = 상품();
let combos = 동기화(groups, [
    { option_keys: ['id:1', 'id:3'], option_names: ['블랙', 'S'], add_price: 5000, stock_qty: 20 },
    { option_keys: ['id:1', 'id:4'], option_names: ['블랙', 'M'], add_price: 7000, stock_qty: 15 },
]);
eq('처음엔 4조합', combos.length, 4);

// ── 오타 하나 고친다: '블랙' → '블랙(무광)' ───────────────────────────────
groups = 상품();
groups[0].options[0].option_name = '블랙(무광)';
const 이후 = 동기화(groups, combos);

const 찾기 = (list, name, size) => list.find((c) => c.option_names[0] === name && c.option_names[1] === size);
eq('이름을 고쳐도 추가금이 남는다', 찾기(이후, '블랙(무광)', 'S')?.add_price, 5000);
eq('이름을 고쳐도 재고가 남는다', 찾기(이후, '블랙(무광)', 'S')?.stock_qty, 20);
eq('두 번째 조합도 남는다', 찾기(이후, '블랙(무광)', 'M')?.add_price, 7000);
eq('건드리지 않은 조합은 그대로', 찾기(이후, '화이트', 'S')?.add_price, 0);
eq('저장에 나갈 이름은 바뀐 이름', 찾기(이후, '블랙(무광)', 'S')?.option_names, ['블랙(무광)', 'S']);

// ── 이름이 겹쳐도 조합 줄이 안 겹친다 ─────────────────────────────────────
const 겹침 = 상품();
겹침[0].options[1].option_name = '블랙(무광)';
겹침[0].options[0].option_name = '블랙(무광)';
const 겹침목록 = 조합목록(겹침);
eq('같은 이름 옵션 2개여도 4줄', 겹침목록.length, 4);
eq('줄마다 식별자가 다르다', new Set(겹침목록.map((칸) => 조합키(칸.map((x) => x.k)))).size, 4);

// ── 아직 저장 안 된 새 옵션도 따라간다 ────────────────────────────────────
const 새것 = [
    { group_type: 0, options: [{ option_name: '레드', _k: 'tmp_a' }] },
    { group_type: 0, options: [{ option_name: 'L', _k: 'tmp_b' }] },
];
let 새조합 = 동기화(새것, []);
새조합[0].add_price = 3000;
새것[0].options[0].option_name = '레드(신형)';
eq('저장 전 옵션도 이름 바꾸면 값이 남는다', 동기화(새것, 새조합)[0].add_price, 3000);


// ── 여기서부터는 '코드에 그 글자가 있나' 가 아니라 실제로 돌려 본다 ──────────
// 글자만 확인하면 '함수는 있는데 안 불린다' 나 '조건이 뒤집혔다' 를 못 잡는다.

// 화면의 일괄적용을 그대로 옮긴다
const 일괄적용 = (combinations, 일괄) => {
  const patch = {};
  if (String(일괄.add_price).trim() !== '') patch.add_price = 일괄.add_price;
  if (String(일괄.stock_qty).trim() !== '') patch.stock_qty = 일괄.stock_qty;
  if (!Object.keys(patch).length) return null;
  return combinations.map((c) => ({ ...c, ...patch }));
};
{
  const 목록 = [
    { option_keys: ['id:1'], option_names: ['블랙'], add_price: 5000, stock_qty: 20 },
    { option_keys: ['id:2'], option_names: ['화이트'], add_price: 0, stock_qty: '' },
  ];
  eq('빈 칸만 넣으면 아무것도 안 바꾼다', 일괄적용(목록, { add_price: '', stock_qty: '' }), null);
  const 재고만 = 일괄적용(목록, { add_price: '', stock_qty: 7 });
  eq('재고만 넣으면 재고만 바뀐다', [재고만[0].add_price, 재고만[0].stock_qty], [5000, 7]);
  eq('두 번째 줄도 재고만', [재고만[1].add_price, 재고만[1].stock_qty], [0, 7]);
  const 둘다 = 일괄적용(목록, { add_price: 0, stock_qty: 0 });
  eq('0 은 빈 칸이 아니다 — 0 도 적용된다', [둘다[0].add_price, 둘다[0].stock_qty], [0, 0]);
}

// ── 서버에서 불러온 직후의 순서 사고 ──────────────────────────────────────
// 변환(combo_key → option_keys)보다 동기화가 먼저 돌면 기존 값을 하나도 못 찾아
// 전부 0원·무제한으로 깔아 버린다. 그 뒤엔 변환 조건도 깨져 서버 값이 영영 안 돌아온다.
// 가맹점이 상품을 열기만 해도 조합표가 날아가는 사고다.
const 아직변환전 = (combinations) => (combinations ?? []).some(
  (c) => c?.combo_key && !(c?.option_keys?.length > 0));
{
  ok('변환 전이면 동기화를 멈춘다', 아직변환전([{ combo_key: '1-3', add_price: 5000 }]));
  const 변환후 = [{ combo_key: '1-3', option_keys: ['id:1', 'id:3'], option_names: ['블랙', 'S'], add_price: 5000, stock_qty: 20 }];
  ok('변환이 끝나면 동기화를 돈다', !아직변환전(변환후));
  eq('변환 뒤 동기화해도 값이 남는다',
     동기화(상품(), 변환후).find((c) => c.option_names.join('/') === '블랙/S')?.add_price, 5000);
  ok('화면 코드에도 같은 방어가 있다', /const 아직변환전 =/.test(src) && /if \(아직변환전\) return;/.test(src));
}

// ── 품절 값이 저장 payload 까지 실려 가는가 ───────────────────────────────
{
  const 조합수정 = (list, keys, names, patch) => {
    const idx = list.findIndex((c) => 조합키(c?.option_keys ?? []) === 조합키(keys));
    const next = [...list];
    if (idx >= 0) next[idx] = { ...next[idx], ...patch };
    else next.push({ option_keys: keys, option_names: names, add_price: 0, stock_qty: '', ...patch });
    return next;
  };
  let list = 동기화(상품(), []);
  list = 조합수정(list, ['id:1', 'id:3'], ['블랙', 'S'], { is_soldout: 1 });
  eq('조합 품절이 값에 남는다', list.find((c) => c.option_names.join('/') === '블랙/S')?.is_soldout, 1);
  const g = 상품(); g[0].options[0].option_name = '블랙(무광)';
  eq('이름을 고쳐도 품절이 유지된다',
     동기화(g, list).find((c) => c.option_names.join('/') === '블랙(무광)/S')?.is_soldout, 1);
  ok('옵션 줄 스위치가 옵션수정을 부른다', /옵션수정\(gIdx, oIdx, \{ is_soldout:/.test(src));
  ok('조합 줄 스위치가 조합수정을 부른다', /조합수정\(keys, names, \{ is_soldout:/.test(src));
}

// ── 손님 화면 요약이 필수와 추가를 제대로 가르는가 ────────────────────────
{
  const 요약 = (groups) => ({
    필수: groups.filter((g) => (Number(g?.group_type) || 0) === 0).map((g) => g.group_name),
    추가: groups.filter((g) => Number(g?.group_type) === 1).flatMap((g) => 살아있는(g.options).map((o) => o.option_name)),
  });
  const r = 요약([
    { group_name: '색상', group_type: 0, options: [{ option_name: '블랙' }] },
    { group_name: '촬영 추가', group_type: 1, options: [{ option_name: '성장영상' }, { option_name: '한복', is_delete: 1 }] },
  ]);
  eq('선택옵션은 그룹 이름으로', r.필수, ['색상']);
  eq('추가상품은 항목 이름으로 · 지운 것은 뺀다', r.추가, ['성장영상']);
  ok('요약이 필수와 추가를 다른 말로 적는다',
     /반드시 골라야 합니다/.test(src) && /원하는 것만 고릅니다/.test(src));
}

// ── 조합표 접기 ───────────────────────────────────────────────────────────
{
  const 보일줄 = (전체, 펼침) => (전체 > 20 && !펼침 ? 20 : 전체);
  eq('20줄 이하는 다 보인다', 보일줄(12, false), 12);
  eq('100줄은 접힌다', 보일줄(100, false), 20);
  eq('펼치면 다 보인다', 보일줄(100, true), 100);
  ok('화면도 같은 기준', /조합목록\.length > 20 && !조합펼침/.test(src));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
