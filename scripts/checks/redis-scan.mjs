import { BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync, readdirSync } from 'fs';

// Redis 캐시 삭제 — scanIterator 의 v4/v5 계약 차이.
//
// [운영 로그에 계속 찍히고 있던 것]
//   Redis cache invalidation error (changeStatus): TypeError: key.endsWith is not a function
//
// redis 라이브러리를 v4 → v5 로 올리면서 scanIterator 가 바뀌었다.
//   v4 : 키를 하나씩 내놓는다        → key 는 문자열
//   v5 : 키를 묶음(배열)으로 내놓는다 → key 는 배열. endsWith 는 함수가 아니다.
// (@redis/client v5 소스에 `yield reply.keys` 로 박혀 있다. 서버에서 직접 확인했다.)
//
// 결과: 캐시 삭제가 통째로 실패했다. 상품을 품절·비공개로 내려도 고객 화면에는
// TTL(300초)이 끝날 때까지 그대로 보이고, 그동안 장바구니에 담겨 결제까지 갈 수 있었다.
//
// 더 고약한 자리도 있었다. del(배열) 은 v5 에서 정상 동작해서, 문자열 검사 없이
// 바로 지우던 코드는 에러 없이 '되는 것처럼' 보였다. 그런데 SCAN 은 커서가 남아
// 있어도 빈 묶음을 내놓을 수 있고, del([]) 은 터진다:
//   ERR wrong number of arguments for 'del' command
//
// 그래서 scanIterator 를 컨트롤러에서 직접 부르는 것 자체를 막는다.
// utils.js/redis-scan.js 의 deleteKeys 만 쓰게 하고, 그 안에서 두 모양을 다 받는다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

if (!백엔드있음) {
    console.log('  (백엔드 저장소가 없어 건너뜀)');
    console.log('\n통과 0 / 실패 0');
    process.exit(0);
}

const 헬퍼소스 = readFileSync(BACK_ROOT + 'utils.js/redis-scan.js', 'utf8');

// ── 헬퍼를 실제로 돌린다 ─────────────────────────────────────────────────
// 가짜 redis 클라이언트를 만들어, v5 모양(묶음)과 v4 모양(낱개)을 모두 먹여 본다.
const { deleteKeys, scanKeys } = await import(
    'data:text/javascript;base64,' + Buffer.from(헬퍼소스).toString('base64')
);

const 가짜클라이언트 = (내놓을것들, { del기록 } = {}) => ({
    isOpen: true,
    async *scanIterator() { for (const x of 내놓을것들) yield x; },
    async del(keys) {
        const 배열 = Array.isArray(keys) ? keys : [keys];
        // 진짜 Redis 와 같은 조건에서 터지게 한다 — 검사가 현실과 달라지면 의미가 없다.
        if (배열.length === 0) throw new Error("ERR wrong number of arguments for 'del' command");
        del기록?.push(...배열);
        return 배열.length;
    },
});

// v5 — 묶음으로 내놓는다
{
    const 지운것 = [];
    const c = 가짜클라이언트([['a:1', 'a:2'], ['a:3']], { del기록: 지운것 });
    const n = await deleteKeys(c, 'a:*');
    t('v5 모양(묶음)에서 키를 전부 지운다', n === 3 && 지운것.sort().join(',') === 'a:1,a:2,a:3');
}
// v4 — 낱개로 내놓는다. 라이브러리를 되돌려도 안 깨져야 한다.
{
    const 지운것 = [];
    const c = 가짜클라이언트(['a:1', 'a:2'], { del기록: 지운것 });
    const n = await deleteKeys(c, 'a:*');
    t('v4 모양(낱개)에서도 그대로 동작한다', n === 2 && 지운것.sort().join(',') === 'a:1,a:2');
}
// 조건으로 고르기 — 이게 원래 터지던 자리다
{
    const 지운것 = [];
    const c = 가짜클라이언트([['p:9:17', 'p:9:18', 'p:9:117']], { del기록: 지운것 });
    const n = await deleteKeys(c, 'p:9:*', (key) => key.endsWith(':17'));
    t('조건(endsWith)이 문자열 키에 적용된다', n === 1 && 지운것.join(',') === 'p:9:17',
        '예전엔 여기서 TypeError: key.endsWith is not a function 이 났다');
}
{
    const 지운것 = [];
    const c = 가짜클라이언트([['l:{"brandId":9}', 'l:{"brandId":10}']], { del기록: 지운것 });
    const n = await deleteKeys(c, 'l:*', (key) => key.includes('"brandId":9'));
    t('조건(includes)으로 브랜드를 가려낸다', n === 1 && 지운것.join(',') === 'l:{"brandId":9}');
}
// 빈 묶음 — del([]) 로 터지면 안 된다
{
    const c = 가짜클라이언트([[], ['b:1'], []]);
    let 터짐 = null;
    try { await deleteKeys(c, 'b:*'); } catch (e) { 터짐 = e.message; }
    t('빈 묶음이 섞여도 안 터진다', 터짐 === null,
        `del([]) 은 진짜 Redis 에서도 ERR 를 낸다 (터진 내용: ${터짐})`);
}
{
    const c = 가짜클라이언트([['b:1', 'b:2']]);
    let 터짐 = null;
    let n = -1;
    try { n = await deleteKeys(c, 'b:*', () => false); } catch (e) { 터짐 = e.message; }
    t('조건이 전부 거짓이어도 안 터진다', 터짐 === null && n === 0);
}
{
    const c = { isOpen: false };
    t('연결이 없으면 조용히 0을 준다', (await deleteKeys(c, 'x:*')) === 0);
}
{
    const c = 가짜클라이언트([['k:1', 'k:2']]);
    const 본것 = [];
    for await (const k of scanKeys(c, 'k:*')) 본것.push(typeof k);
    t('scanKeys 는 언제나 문자열을 준다', 본것.join(',') === 'string,string');
}

// ── 컨트롤러가 직접 scanIterator 를 부르지 않는가 ────────────────────────
// 새로 짜는 사람이 예전 코드를 보고 따라 하면 같은 사고가 반복된다.
const 컨트롤러들 = readdirSync(BACK_ROOT + 'controllers').filter((f) => f.endsWith('.js'));
const 직접부름 = [];
for (const f of 컨트롤러들) {
    const s = readFileSync(BACK_ROOT + 'controllers/' + f, 'utf8');
    // 주석은 빼고 본다(왜 그렇게 했는지 남긴 이력에 단어가 들어 있다).
    const 코드 = s.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')
        .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');
    if (/\.scanIterator\s*\(/.test(코드)) 직접부름.push(f);
}
t('컨트롤러에서 scanIterator 를 직접 부르지 않는다', 직접부름.length === 0,
    `직접 부르는 곳: ${직접부름.join(', ')} — utils.js/redis-scan.js 의 deleteKeys 를 쓸 것`);

// 헬퍼를 쓰는 컨트롤러는 import 도 되어 있어야 한다(런타임에 ReferenceError 로 터진다).
for (const f of 컨트롤러들) {
    const s = readFileSync(BACK_ROOT + 'controllers/' + f, 'utf8');
    if (!/\bdeleteKeys\s*\(/.test(s)) continue;
    t(`${f} 가 deleteKeys 를 import 한다`, /import \{ deleteKeys \} from "\.\.\/utils\.js\/redis-scan\.js";/.test(s));
}

// 헬퍼 자신은 두 모양을 다 받아야 한다 — 한쪽만 처리하면 라이브러리 버전에 다시 묶인다.
t('헬퍼가 배열·낱개를 모두 처리한다', /Array\.isArray\(내놓은것\)/.test(헬퍼소스));
t('헬퍼가 빈 배열로 del 을 부르지 않는다', /if \(!모은것\.length\) return;/.test(헬퍼소스));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
