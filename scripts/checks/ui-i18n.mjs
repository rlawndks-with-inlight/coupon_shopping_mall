import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 고객 화면 문구가 언어를 따라가는지 고정.
//
// 붙잡아 두는 사고:
//   ① 단계 이름·라벨을 모듈 최상단에 두면 translate 를 못 써서 그 자리만 한국어로 굳는다
//      (회원가입 제목은 'Sign up' 인데 밑의 단계만 '약관동의/정보입력/가입완료' 로 남았던 건)
//   ② 자리표시자 키({{n}}개월)를 5개 언어 어디 하나라도 빠뜨리면 화면에 '{{n}}개월' 이 그대로 뜬다
//   ③ 할부 개월수를 charAt(1) 로 읽어 12개월이 2개월로 보이던 것
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const read = (rel) => readFileSync(FRONT + rel, 'utf8');

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) pass++;
  else { fail++; console.log(`FAIL ${name}${extra ? `\n  ${extra}` : ''}`); }
};

// ── ① 단계 이름은 컴포넌트 안에서 만든다 ────────────────────────────────
// 모듈 최상단(들여쓰기 없음)에 STEPS 를 두면 translate 를 못 쓴다.
for (const rel of [
  'src/views/shop/demo-4/auth/sign-up.js',
  'src/components/dialog/DialogBuyNow.js',
  'src/components/dialog/DialogAddAddress.js',
]) {
  const s = read(rel);
  ok(`모듈 최상단 STEPS 없음 — ${rel.split('/').pop()}`, !/^const STEPS = \[/m.test(s));
}
for (const rel of [
  'src/views/shop/demo-1/auth/sign-up.js',
  'src/views/shop/demo-2/auth/sign-up.js',
  'src/views/shop/demo-4/auth/sign-up.js',
  'src/components/dialog/DialogBuyNow.js',
]) {
  const s = read(rel);
  const m = /const STEPS = \[([^\]]*)\]/.exec(s);
  ok(`단계 이름이 번역을 탄다 — ${rel.split('/').pop()}`,
    !!m && !/'[^']*[가-힣][^']*'/.test(m[1].replace(/translate\('[^']*'\)/g, '')),
    m ? m[1].slice(0, 80) : '못 찾음');
}

// ── ② 자리표시자 키 ─────────────────────────────────────────────────────
const load = (f) => {
  const s = read(`src/locales/langs/${f}.js`);
  const i = s.indexOf('{');
  let d = 0, e = i;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '{') d++;
    else if (s[k] === '}') { d--; if (d === 0) { e = k; break; } }
  }
  return new Function(`return ${s.slice(i, e + 1)}`)();
};
const LANGS = ['ko', 'en', 'ja', 'cn', 'es'];
const DICT = Object.fromEntries(LANGS.map((l) => [l, load(l)]));
for (const key of ['{{n}}개월', '{{n}}개']) {
  for (const l of LANGS) {
    ok(`${l} 에 ${key} 있음`, key in DICT[l]);
    ok(`${l} 의 ${key} 가 자리표시자를 지켰다`, String(DICT[l][key] ?? '').includes('{{n}}'), String(DICT[l][key]));
  }
}
// 소스가 실제로 그 키를 옵션과 함께 부르는지
const pay1 = read('src/views/shop/demo-1/auth/pay-result.js');
const pay2 = read('src/views/shop/demo-2/auth/pay-result.js');
for (const [name, s] of [['demo-1', pay1], ['demo-2', pay2]]) {
  ok(`${name} 할부 개월수가 번역을 탄다`, /translate\('\{\{n\}\}개월',\s*\{\s*n:/.test(s));
  // ③ charAt(1) 은 '12' 에서 '2' 만 집는다 — 숫자로 읽어야 한다
  ok(`${name} 할부 개월수를 숫자로 읽는다`, !/installment\.charAt\(1\)/.test(s));
  ok(`${name} 일시불도 번역을 탄다`, /translate\('일시불'\)/.test(s));
}

// ── 화면에서 쓰는 키가 5개 언어에 다 있는지 ─────────────────────────────
// (한 언어라도 빠지면 그 언어에서만 한국어가 튀어나온다)
const 쓰는키 = new Set();
for (const rel of [
  'src/pages/shop/auth/order-check.js', 'src/pages/shop/auth/order-complete.js',
  'src/pages/shop/auth/inquiry-check.js', 'src/components/dialog/DialogPolicy.js',
  'src/components/dialog/DialogBuyNow.js', 'src/components/elements/shop/SecurityQuestionBanner.js',
  'src/views/section/shop/HomeItemHero.js', 'src/views/shop/demo-4/auth/sign-up.js',
  'src/views/blog/auth/my-page/order/demo-5.js',
]) {
  // 소스의 \n 은 두 글자지만 실행할 때는 줄바꿈 한 글자다. 사전 키와 맞추려면 풀어야 한다.
  for (const m of read(rel).matchAll(/translate\((['"])([^'"]*[가-힣][^'"]*)\1/g)) {
    쓰는키.add(m[2].replace(/\\n/g, '\n').replace(/\\t/g, '\t'));
  }
}
ok('화면에서 쓰는 한글 키를 찾았다', 쓰는키.size > 20, `${쓰는키.size}개`);
for (const l of LANGS) {
  const 없음 = [...쓰는키].filter((k) => !(k in DICT[l]));
  ok(`${l} 사전에 다 있다`, 없음.length === 0, `${없음.length}개 빠짐: ${없음.slice(0, 5).join(' · ')}`);
}

// ── 서버 메시지를 그대로 띄우는 자리가 남지 않았는지 ────────────────────
const api = read('src/utils/api.js');
ok('서버 메시지를 감싸지 않은 toast 없음',
  !/toast\.error\(\s*(?!serverMessage)(?:err|response)\?\./.test(api));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
