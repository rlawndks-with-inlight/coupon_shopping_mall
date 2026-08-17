// 서버가 내려주는 실패 사유가 화면 언어로 나오는지 고정.
//
// 붙잡아 두는 것:
//   ① utils/api.js 가 서버 message 를 그대로 toast 에 넣던 것(항상 한국어였다)
//   ② 사전에 없는 메시지는 원문 그대로 나가야 한다(i18next 는 못 찾은 키를 그대로 돌려준다)
//   ③ 5개 언어 사전이 서로 어긋나지 않는지
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const FRONT = 'c:/Users/user/Desktop/project24/shop/coupon_shopping_mall_front-master';
const BACK = 'c:/Users/user/Desktop/project24/shop/coupon_shopping_mall_back-master';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) pass++;
  else { fail++; console.log(`FAIL ${name}${extra ? `\n  ${extra}` : ''}`); }
};
const eq = (name, got, want) => ok(name, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)} / want ${JSON.stringify(want)}`);

// ── ① api.js 배선 ────────────────────────────────────────────────────────
const api = readFileSync(join(FRONT, 'src/utils/api.js'), 'utf8');
ok('api.js 가 i18n 을 들여온다', /import\s+i18n\s+from\s+["']src\/locales\/i18n["']/.test(api));
ok('serverMessage 가 있다', /const\s+serverMessage\s*=/.test(api));
// 서버 message 를 감싸지 않고 그대로 넣는 자리가 남아 있으면 안 된다
const 맨살 = [...api.matchAll(/toast\.error\(\s*(?!serverMessage)(?:err|response)\?\./g)];
eq('감싸지 않은 서버 메시지 없음', 맨살.length, 0);
eq('serverMessage 로 감싼 자리', (api.match(/toast\.error\(serverMessage\(/g) ?? []).length, 7);

// serverMessage 의 동작을 실제로 돌려 본다(i18n 은 가짜로 끼운다)
const cut = (s, e) => { const i = api.indexOf(s); return api.slice(i, api.indexOf(e, i) + e.length); };
const make = (dict) => new Function('i18n', `${cut('const serverMessage =', '\n};')}\nreturn serverMessage;`)(
  { t: (k) => dict[k] ?? k }
);
const sm = make({ '상품을 찾을 수 없습니다.': 'The product could not be found.' });
eq('사전에 있으면 번역', sm('상품을 찾을 수 없습니다.'), 'The product could not be found.');
eq('사전에 없으면 원문 그대로', sm('처음 보는 메시지'), '처음 보는 메시지');
eq('앞뒤 공백은 다듬는다', sm('  상품을 찾을 수 없습니다.  '), 'The product could not be found.');
eq('빈 값은 그대로', sm(''), '');
eq('undefined 도 터지지 않는다', sm(undefined), undefined);
// i18n 이 던져도 화면이 죽지 않아야 한다
const 터짐 = new Function('i18n', `${cut('const serverMessage =', '\n};')}\nreturn serverMessage;`)(
  { t: () => { throw new Error('boom'); } }
);
eq('i18n 이 터져도 원문을 돌려준다', 터짐('아무 말'), '아무 말');

// ── ② 사전 ───────────────────────────────────────────────────────────────
const load = (f) => {
  const s = readFileSync(join(FRONT, `src/locales/langs/${f}.js`), 'utf8');
  const i = s.indexOf('{');
  let d = 0, e = i;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '{') d++;
    else if (s[k] === '}') { d--; if (d === 0) { e = k; break; } }
  }
  return new Function(`return ${s.slice(i, e + 1)}`)();
};
const DICT = Object.fromEntries(['ko', 'en', 'ja', 'cn', 'es'].map((l) => [l, load(l)]));
for (const [l, d] of Object.entries(DICT)) {
  ok(`${l} 사전이 읽힌다`, Object.keys(d).length > 600, `${Object.keys(d).length}개`);
  ok(`${l} 빈 번역 없음`, Object.values(d).every((v) => String(v).trim() !== ''));
}
// ko 는 키=값이어야 한다(원문 사전). 공백 차이는 눈감아 준다 —
// 오래된 항목 하나에 값 쪽만 공백이 겹쳐 있는데, 지금은 화면에서 안 쓰는 문구다.
const 공백정리 = (s) => String(s).replace(/\s+/g, ' ').trim();
const 다른것 = Object.entries(DICT.ko).filter(([k, v]) => 공백정리(k) !== 공백정리(v));
ok('ko 는 키와 값이 같다', 다른것.length === 0, 다른것.slice(0, 3).map(([k]) => k.slice(0, 40)).join(' · '));

// ── ③ 백엔드가 실제로 쓰는 메시지가 사전에 있는가 ────────────────────────
// 고객이 볼 수 있는 컨트롤러만 본다(관리자 화면은 한국어 전용).
const 고객 = /^(auth|pay|shop|user|transaction|product|product_review|user_wish|user_address|post|product_faq|point|product_category)\.controller\.js$/;
const 메시지 = new Set();
for (const f of readdirSync(join(BACK, 'controllers'))) {
  if (!고객.test(f)) continue;
  const s = readFileSync(join(BACK, 'controllers', f), 'utf8');
  for (const m of s.matchAll(/response\(req,\s*res,\s*-?\d+,\s*(['"])([^'"]*[가-힣][^'"]*)\1/g)) 메시지.add(m[2]);
}
ok('백엔드에서 메시지를 찾았다', 메시지.size > 50, `${메시지.size}종`);
const 빠진것 = [...메시지].filter((m) => !(m in DICT.ko));
ok('고객이 볼 메시지가 사전에 다 있다', 빠진것.length === 0,
  `${빠진것.length}종 빠짐: ${빠진것.slice(0, 5).join(' · ')}`);

for (const l of ['en', 'ja', 'cn', 'es']) {
  const 없음 = [...메시지].filter((m) => !(m in DICT[l]));
  ok(`${l} 에도 다 있다`, 없음.length === 0, `${없음.length}종`);
  const 안번역 = [...메시지].filter((m) => DICT[l][m] === m);
  ok(`${l} 이 한국어를 그대로 두지 않았다`, 안번역.length === 0, `${안번역.length}종`);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
