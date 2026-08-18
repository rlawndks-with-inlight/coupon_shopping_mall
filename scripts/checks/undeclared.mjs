import { FRONT_ROOT } from './_roots.mjs';
import { readdirSync, readFileSync, statSync } from 'fs';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

const traverse = _traverse.default ?? _traverse;

// 쓰는데 **가져오지도, 선언하지도 않은 이름**을 잡는다.
//
// 붙잡아 두는 사고(오늘 하루에 세 번 났다):
//   · <Box> 를 쓰면서 import 를 빠뜨림        → 브랜드 설정 화면이 백지
//   · onSelect={onSelectOption} 인데 선언 없음 → 프레임6 상품상세가 백지
//   · optionExtraPrice(...) 인데 import 없음   → 장바구니 줄이 백지
//
// 왜 다른 검사로 못 잡았나:
//   · parse 는 **문법**만 본다 — 없는 이름을 부르는 건 문법 오류가 아니다
//   · jsx-undefined 는 태그 이름과 ={이름} 속성만 정규식으로 본다 — 함수 호출은 안 본다
//   · next dev 는 컴파일을 통과시키고 curl 은 200 이다(화면은 클라이언트에서 그려진다)
//   → '검사 통과 · 200 · 그런데 백지' 가 된다
//
// 판정은 스코프로 한다(정규식이 아니다). 바벨이 만든 스코프에서 '어디에도 묶이지 않은 참조'만
// 남기고, 브라우저·Node 전역은 뺀다. 전역 목록에 없는 진짜 전역이 있으면 여기에 추가할 것.

const 전역 = new Set([
    // 표준
    'undefined', 'NaN', 'Infinity', 'globalThis', 'console', 'JSON', 'Math', 'Date', 'Object',
    'Array', 'String', 'Number', 'Boolean', 'RegExp', 'Error', 'TypeError', 'Promise', 'Symbol',
    'Map', 'Set', 'WeakMap', 'WeakSet', 'Proxy', 'Reflect', 'BigInt', 'parseInt', 'parseFloat',
    'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame',
    'cancelAnimationFrame', 'queueMicrotask', 'structuredClone', 'atob', 'btoa',
    // 브라우저
    'window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
    'fetch', 'Headers', 'Request', 'Response', 'FormData', 'Blob', 'File', 'FileReader', 'URL',
    'URLSearchParams', 'Image', 'Audio', 'Event', 'CustomEvent', 'MutationObserver',
    'IntersectionObserver', 'ResizeObserver', 'XMLHttpRequest', 'AbortController', 'alert',
    'confirm', 'prompt', 'scrollTo', 'scrollBy', 'scroll', 'open', 'close', 'print', 'postMessage', 'self', 'top', 'parent', 'innerWidth', 'innerHeight', 'pageYOffset', 'pageXOffset', 'getComputedStyle', 'matchMedia', 'CSS', 'DOMParser', 'Node', 'Element',
    'HTMLElement', 'Canvas', 'HTMLCanvasElement', 'crypto', 'performance', 'screen', 'frames',
    // Node · 번들러
    'process', 'Buffer', 'global', 'require', 'module', 'exports', '__dirname', '__filename',
    // 표준인데 위에서 빠진 것들
    'Intl', 'Uint8Array', 'Uint32Array', 'Int8Array', 'Float32Array', 'ArrayBuffer', 'DataView', 'TextEncoder', 'TextDecoder',
    // PG 가 <script> 로 얹는 전역. 이 저장소에 선언이 없는 게 맞다.
    'SendPay',      // 핀트리
    'SETTLE_PG',    // 헥토
]);

// 이 검사를 만들기 전부터 있던 구멍.
//
// 전부 '그 자리를 누르면 ReferenceError 로 화면이 죽는' 진짜 버그다. 다만 오늘 작업과
// 무관한 화면들이라 한꺼번에 손대지 않는다 — 여기 적어 두고 고칠 때마다 지운다.
// **새 코드가 이 목록에 추가되는 일은 없어야 한다.**
//
//   find-info demo-1~5 : setUserId·setUserName — 아이디/비밀번호 찾기에서 글자를 치면 죽는다
//   pay-result demo-4·9: payData — 결제 결과 화면
//   demo-9 cart        : makeOrdNum — 주문번호 만들기
//   consignment-guide  : index·setOpenAllCategory
//   points/index       : changePasswordUserByManager
//   blog·shop common   : router
const 알려진구멍 = new Set([
    'src/views/blog/auth/find-info/demo-1.js:122  setUserId',
    'src/views/blog/auth/find-info/demo-1.js:176  setUserName',
    'src/views/blog/auth/find-info/demo-2.js:122  setUserId',
    'src/views/blog/auth/find-info/demo-2.js:176  setUserName',
    'src/views/blog/auth/find-info/demo-3.js:120  setUserId',
    'src/views/blog/auth/find-info/demo-3.js:174  setUserName',
    'src/views/blog/auth/find-info/demo-4.js:122  setUserId',
    'src/views/blog/auth/find-info/demo-4.js:176  setUserName',
    'src/views/blog/auth/find-info/demo-5.js:122  setUserId',
    'src/views/blog/auth/find-info/demo-5.js:176  setUserName',
    'src/views/shop/demo-4/auth/pay-result.js:65  payData',
    'src/views/shop/demo-9/auth/pay-result.js:63  payData',
    'src/views/shop/demo-9/auth/cart.js:263  makeOrdNum',
    'src/views/shop/demo-4/guide/consignment-guide.js:491  index',
    'src/views/shop/demo-4/guide/consignment-guide.js:492  setOpenAllCategory',
    'src/pages/manager/users/points/index.js:118  changePasswordUserByManager',
    'src/components/elements/blog/common.js:561  router',
    'src/components/elements/shop/common.js:609  router',
]);

const 훑기 = (d, out = []) => {
    for (const f of readdirSync(d)) {
        const p = d + '/' + f;
        if (statSync(p).isDirectory()) 훑기(p, out);
        else if (/\.jsx?$/.test(f)) out.push(p);
    }
    return out;
};

let pass = 0, fail = 0;
const eq = (n, g, w) => {
    if (JSON.stringify(g) === JSON.stringify(w)) { pass++; }
    else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); }
};

export const 없는이름 = (code) => {
    const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining',
                  'nullishCoalescingOperator', 'dynamicImport', 'topLevelAwait'],
    });
    const 나온것 = new Map();
    traverse(ast, {
        Program(path) {
            for (const [이름, refs] of Object.entries(path.scope.globals ?? {})) {
                if (전역.has(이름)) continue;
                const 줄 = refs?.loc?.start?.line ?? 0;
                if (!나온것.has(이름)) 나온것.set(이름, 줄);
            }
        },
    });
    return [...나온것.entries()].map(([이름, 줄]) => ({ 이름, 줄 }));
};

// 규칙이 실제로 잡는지 양쪽으로 확인한다 — 조용한 검사는 믿을 수 없다.
eq('가져오지 않은 함수를 잡는다',
   없는이름(`const a = () => optionExtraPrice(1);`).map((x) => x.이름), ['optionExtraPrice']);
eq('가져온 것은 안 운다',
   없는이름(`import { optionExtraPrice } from 'x';\nconst a = () => optionExtraPrice(1);`), []);
eq('이 파일에서 만든 것도 안 운다',
   없는이름(`const b = 1;\nconst a = () => b + 1;`), []);
eq('JSX 태그도 본다',
   없는이름(`const a = () => <Box>hi</Box>;`).map((x) => x.이름), ['Box']);
eq('브라우저 전역은 세지 않는다', 없는이름(`window.scrollTo(0, 0); console.log(document.title);`), []);
eq('구조분해로 받은 것도 안 운다', 없는이름(`const { a } = require('x');\nconst b = () => a;`), []);

const 걸린것 = [];
const 파일들 = 훑기(FRONT_ROOT + 'src');
for (const p of 파일들) {
    let 목록 = [];
    try { 목록 = 없는이름(readFileSync(p, 'utf8')); }
    catch (e) { continue; }   // 문법 오류는 parse.mjs 가 본다
    for (const { 이름, 줄 } of 목록) {
        const 줄글 = `${p.replace(FRONT_ROOT, '')}:${줄}  ${이름}`;
        if (!알려진구멍.has(줄글)) 걸린것.push(줄글);
    }
}

if (걸린것.length) console.log(걸린것.map((x) => '  ' + x).join('\n'));
eq(`가져오지 않은 이름 없음 (${파일들.length}개 검사)`, 걸린것.length, 0);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
