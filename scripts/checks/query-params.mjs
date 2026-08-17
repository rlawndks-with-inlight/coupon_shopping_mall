import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// GET 쿼리스트링 직렬화 규칙 고정.
//
// 회귀 방지 대상: new URLSearchParams({ user_id: undefined }) 가 키를 빼는 게 아니라
// `user_id=undefined` 라는 문자열을 만들던 문제. 서버는 그걸 Number('undefined')=NaN 으로
// 읽고 조건을 못 맞춰 거절했다 — 배송지 목록이 비어 보이고 5xx 가 쌓였다.
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const src = readFileSync(FRONT + 'src/utils/api.js', 'utf8');
const body = src.slice(src.indexOf('const toQuery'), src.indexOf('export const get ='));
const { toQuery } = new Function(body + '\nreturn { toQuery };')();

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (got === want) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

// ── 이게 고친 문제다 ─────────────────────────────────────────────────────
eq('undefined 는 아예 빠진다', toQuery({ page: 1, user_id: undefined }), 'page=1');
eq('null 도 빠진다', toQuery({ page: 1, category_id: null }), 'page=1');
eq('여러 개가 섞여도', toQuery({ brand_id: undefined, root_id: undefined, is_manager: 0 }), 'is_manager=0');

// (옛 동작을 함께 고정해 둔다 — 왜 고쳤는지가 코드에서 사라지지 않게)
eq('(옛 동작) URLSearchParams 는 문자열로 만든다',
  new URLSearchParams({ user_id: undefined }).toString(), 'user_id=undefined');
eq('(옛 동작) null 도 마찬가지', new URLSearchParams({ c: null }).toString(), 'c=null');

// ── 지켜야 할 것 ─────────────────────────────────────────────────────────
// 빈 문자열은 '조건 없음'이라는 뜻이 있다(검색어 없음, 기간 없음) — 빼면 안 된다.
eq("빈 문자열은 남는다", toQuery({ search: '', s_dt: '', page: 1 }), 'search=&s_dt=&page=1');
// 0 은 유효한 값이다(판매중 상태, is_manager=0 등)
eq('0 은 남는다', toQuery({ status: 0, is_manager: 0 }), 'status=0&is_manager=0');
eq('false 도 남는다', toQuery({ flag: false }), 'flag=false');
// 순서는 그대로(캐시 키가 쿼리 문자열을 쓰는 곳이 있다)
eq('키 순서 유지', toQuery({ b: 2, a: 1 }), 'b=2&a=1');
// 이스케이프는 URLSearchParams 규칙 그대로
eq('한글 인코딩', toQuery({ search: '피자' }), 'search=%ED%94%BC%EC%9E%90');
eq('& 이스케이프', toQuery({ search: 'a&b' }), 'search=a%26b');
// 빈 입력
eq('빈 객체', toQuery({}), '');
eq('인자 없음', toQuery(undefined), '');
eq('전부 undefined 면 빈 문자열', toQuery({ a: undefined, b: null }), '');
// 배열은 기존과 같게(URLSearchParams 는 콤마로 이어 붙인다)
eq('배열', toQuery({ ids: [1, 2] }), 'ids=1%2C2');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
