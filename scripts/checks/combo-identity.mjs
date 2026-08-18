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

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
