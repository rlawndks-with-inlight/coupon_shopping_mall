import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// 손님·관리자 화면에서 translate('…') / 번역('…') 로 부르는 글자 키가, 고를 수 있는 언어 사전에 다 있는지 본다.
//
// 붙잡아 두는 사고(2026-09-11):
//   · 주문서 포인트 칸 「이번 주문에 사용 가능」·「이번 주문 적립예정」 이 어느 사전에도 없어 영어 화면에도 한국어로 나왔다
//   · 결제 미완료 안내(shop-util)와 프레임7·8 홈·가입 문구 등 36개가 영어·일본어·스페인어 사전에 빠져 있었다
// 사전 키 = 한국어 원문이라 ko 는 빠져도 화면이 같다 — 나머지 언어만 본다.
// 언어 목록은 config-lang(화면에서 고르는 목록)에서 읽는다. src/locales/langs 의 fr·vi·ar 는 템플릿 잔재로
// 어디서도 불러오지 않는다 — 보지 않는다.
// 본사 화면(main-site)은 자체 사전(landingStrings)을 쓰고 main-site-i18n.mjs 가 따로 본다 — 여기선 뺀다.
// 글자 키만 본다. translate(변수) 는 여기서 못 잡는다(포인트 칸 이유 문구처럼 따로 검사한다 — point-policy.mjs).

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 언어목록 = [...읽기('src/locales/config-lang.js').matchAll(/value: '([a-z]+)'/g)].map((m) => m[1]);
t('언어 목록을 읽었다(ko·en 포함 4개 이상)', 언어목록.length >= 4 && 언어목록.includes('ko') && 언어목록.includes('en'));
const i18n = 읽기('src/locales/i18n.js');
t('사전을 부르는 곳(i18n.js)이 언어 목록의 사전을 전부 부른다',
  언어목록.every((l) => new RegExp(`from '\\./langs/${l}'`).test(i18n)));

const 볼언어 = 언어목록.filter((l) => l !== 'ko');
const 사전 = {};
for (const l of 볼언어) 사전[l] = (await import('file:///' + FRONT_ROOT + `src/locales/langs/${l}.js`)).default;

const 제외 = (rel) => rel.startsWith('src/locales/') || rel.startsWith('src/components/main-site/')
  || /^src\/pages\/(index\.js|policy\/|security)/.test(rel);
const 파일들 = [];
const 훑기 = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) 훑기(p);
    else if (/\.jsx?$/.test(n)) 파일들.push(p);
  }
};
훑기(FRONT_ROOT + 'src');

const 키모양 = /(?:translate|번역)\(\s*(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`([^`$\\]*)`)/g;
const 풀기 = (raw) => raw.replace(/\\(n|t|r|'|"|\\)/g, (_, c) => ({ n: '\n', t: '\t', r: '\r', "'": "'", '"': '"', '\\': '\\' })[c]);
let 읽은수 = 0;
const 빠짐 = new Map(); // 키 → { 언어, 파일 }
for (const f of 파일들) {
  const rel = relative(FRONT_ROOT, f).split('\\').join('/');
  if (제외(rel)) continue;
  for (const m of readFileSync(f, 'utf8').matchAll(키모양)) {
    const raw = m[1] ?? m[2] ?? m[3];
    if (!raw) continue;
    읽은수++;
    const 키 = 풀기(raw);
    const 없는언어 = 볼언어.filter((l) => !사전[l][키]);
    if (!없는언어.length) continue;
    const e = 빠짐.get(키) || { 언어: new Set(), 파일: new Set() };
    없는언어.forEach((l) => e.언어.add(l)); e.파일.add(rel);
    빠짐.set(키, e);
  }
}
t(`글자 키를 충분히 읽었다(${읽은수}건)`, 읽은수 >= 2000);
const 목록 = [...빠짐.entries()].slice(0, 15).map(([k, e]) => `{${[...e.언어].join(',')}} ${k} ← ${[...e.파일][0]}`);
t(`손님·관리자 화면 글자 키가 ${볼언어.join('·')} 사전에 다 있다(빠진 키 ${빠짐.size}개)`, 빠짐.size === 0, 목록.join('\n        '));

// ── 판매 프레임·공용 화면에 translate 없이 박혀 있던 한국어(2026-09-11 정리) — 되살아나면 잡는다 ─────────
// 위 검사는 translate('…') 안의 키만 보므로, 아예 translate 를 안 거친 글자는 여기서 자리별로 본다.
for (const [파일, 없어야, 있어야] of [
  ['src/views/blog/home/demo-6.js', null, "translate('저희는 여러 가지를 한꺼번에 만들기보다"],
  ['src/views/blog/home/demo-6.js', null, "translate('이것이 저희가 고객에게 드릴 수 있는 가장 정성스러운 선물입니다.')"],
  ['src/views/shop/demo-1/auth/sign-up.js', "alert('성공적으로 발송되었습니다.')", "alert(translate('성공적으로 발송되었습니다.'))"],
  ['src/views/shop/demo-2/auth/sign-up.js', "alert('성공적으로 발송되었습니다.')", "alert(translate('성공적으로 발송되었습니다.'))"],
  ['src/views/blog/auth/my-page/user-info/demo-3.js', "confirm('정말 회원탈퇴", "confirm(translate('정말 회원탈퇴 하시겠습니까?'))"],
  ['src/views/blog/auth/my-page/user-info/demo-5.js', "confirm('정말 회원탈퇴", "confirm(translate('정말 회원탈퇴 하시겠습니까?'))"],
  ['src/components/elements/shop/common.js', "aria-label='이전 상품'", "aria-label={translate('이전 상품')}"],
  ['src/components/elements/shop/common.js', "aria-label='다음 상품'", "aria-label={translate('다음 상품')}"],
  ['src/components/elements/blog/common.js', "aria-label='이전 상품'", "aria-label={translate('이전 상품')}"],
  ['src/components/elements/blog/common.js', "aria-label='다음 상품'", "aria-label={translate('다음 상품')}"],
  ['src/views/blog/auth/my-page/point/demo-2.js', '<Balance>보유 포인트 :', "<Balance>{translate('보유 포인트')} :"],
  ['src/views/blog/service/article_category/id/demo-2.js', '>작성자 {', ">{translate('작성자')} {"],
  ['src/views/blog/service/article_category/id/demo-4.js', '>답변{', ">{translate('답변')}{"],
  ['src/views/blog/auth/my-page/order/demo-3.js', '<div>받는분 :', "<div>{translate('받는분')} :"],
  ['src/views/blog/auth/my-page/order/demo-5.js', '<div>송장번호 :', "<div>{translate('송장번호')} :"],
  ['src/views/section/shop/HomeItemHero.js', "}}>원</span>", '}}>{getPriceUnitByLang()}</span>'],
]) {
  const s = 읽기(파일);
  t(`${파일.split('/').slice(-3).join('/')}: ${있어야.slice(0, 40)}…`, s.includes(있어야) && (!없어야 || !s.includes(없어야)));
}
{
  // 상품 줄 화살표 이름표를 번역하려고 Items 에 훅을 하나 더 불렀다 — 컴포넌트 맨 위, 다른 훅 옆이어야 한다
  const 공용 = 읽기('src/components/elements/shop/common.js');
  const 시작 = 공용.indexOf('export const Items = props => {');
  t('Items 는 맨 위에서 useLocales 를 부른다(조건문·반복문 밖)', 시작 >= 0
    && 공용.slice(시작, 시작 + 200).includes("const { themeDnsData } = useSettingsContext()\n  const { translate } = useLocales()"));
  // 블로그 프레임은 같은 모양의 Items 를 따로 갖고 있다(components/elements/blog/common.js) — 같이 본다
  const 블로그 = 읽기('src/components/elements/blog/common.js');
  const 시작2 = 블로그.indexOf('export const Items = props => {');
  t('블로그 Items 도 맨 위에서 useLocales 를 부른다', 시작2 >= 0
    && 블로그.slice(시작2, 시작2 + 200).includes("const { themeDnsData } = useSettingsContext()\n    const { translate } = useLocales()"));
}

// ── 글자 키 대신 식·상태·서버값으로 부르는 문구 — 영어로 켠 판매 프레임 크롤에서 한국어로 남아 있던 것(2026-09-11) ─────────
{
  const 사전에있다 = (k) => 볼언어.every((l) => 사전[l][k]);
  const 비번 = 읽기('src/components/elements/PasswordField.js');
  t('비밀번호 칸 눈 아이콘 이름표는 번역한다(두 부품 모두)',
    (비번.match(/aria-label=\{translate\(보임 \? '비밀번호 숨기기' : '비밀번호 보기'\)\}/g) || []).length === 2
    && (비번.match(/useState\(false\);\n    const \{ translate \} = useLocales\(\);/g) || []).length === 2
    && 사전에있다('비밀번호 보기') && 사전에있다('비밀번호 숨기기'));
  const 버튼파일 = [1, 2, 3, 4, 5].flatMap((n) => [`src/views/blog/auth/find-info/demo-${n}.js`, `src/views/blog/auth/sign-up/demo-${n}.js`]);
  const 날것 = 버튼파일.filter((f) => 읽기(f).includes('>{buttonText}</Button>'));
  t('블로그 찾기·가입 화면 「인증받기/재전송」 버튼은 번역해서 그린다', 날것.length === 0 && 사전에있다('인증받기') && 사전에있다('재전송'), 날것.join(', '));
  if (백엔드있음) {
    // 결제수단 이름·설명은 백엔드 기본값(getPayType)이 그대로 내려오고, 주문서는 translate(item.title/description) 로 그린다.
    // 기본값에 문구를 새로 넣으면 사전에도 넣어야 한다(시험용 test·테스트 모듈은 손님 화면에 안 나오므로 뺀다).
    const util = readFileSync(BACK_ROOT + 'utils.js/util.js', 'utf8');
    const 시작 = util.indexOf('export const getPayType');
    const 끝 = util.indexOf('\nexport ', 시작 + 10);
    const 기본값 = [...util.slice(시작, 끝 > 0 ? 끝 : undefined).matchAll(/(?:title|description): [`']([^`']+)[`']/g)]
      .map((m) => m[1]).filter((x) => !/test|테스트/i.test(x));
    const 빠진 = [...new Set(기본값)].filter((k) => !사전에있다(k));
    t(`결제수단 기본 이름·설명 ${new Set(기본값).size}개가 사전에 다 있다`, 기본값.length >= 10 && 빠진.length === 0, 빠진.join(' / '));
  }
}

// ── 함수가 돌려주는 한국어(주문 상태·포인트 내역 종류) — 값은 사전에, 손님 화면은 translate 를 거쳐 그린다(2026-09-11) ─────────
{
  const 함수 = 읽기('src/utils/function.js');
  const 몸통 = (이름) => { const i = 함수.indexOf(`export const ${이름} = `); const j = 함수.indexOf('\nexport const ', i + 10); return i < 0 ? '' : 함수.slice(i, j > 0 ? j : undefined); };
  const 값들 = ['getTrxStatusByNumber', 'getOrderStatusText', 'getPointType']
    .flatMap((f) => [...몸통(f).matchAll(/return '([^']*[가-힣][^']*)'/g)].map((m) => m[1]));
  const 빠진값 = [...new Set(값들)].filter((k) => !볼언어.every((l) => 사전[l][k]));
  t(`주문 상태·포인트 종류 ${new Set(값들).size}개가 사전에 다 있다`, 값들.length >= 12 && 빠진값.length === 0, 빠진값.join(' / '));
  // 손님 화면(관리자·본사 화면 제외)에서 이 함수들 결과를 translate 없이 그리는 곳
  const 날것 = [];
  for (const f of 파일들) {
    const rel = relative(FRONT_ROOT, f).split('\\').join('/');
    // 판매 중단 shop 프레임(3~9)은 화면 대부분이 한국어로 박혀 있어(로그인 화면에 translate 가 아예 없는 곳도 있다) 여기선 뺀다
    if (제외(rel) || /^src\/(pages|views|layouts)\/manager\//.test(rel) || rel === 'src/utils/function.js'
      || /^src\/(views\/shop|layouts\/shop\/shop)\/demo-[3-9]\//.test(rel)) continue;
    const s = readFileSync(f, 'utf8');
    for (const m of s.matchAll(/[{=]\s*(getOrderStatusText|getTrxStatusByNumber|getPointType)\(/g)) 날것.push(`${rel}: ${m[1]}`);
  }
  t('손님 화면은 주문 상태·포인트 종류를 translate 를 거쳐 그린다', 날것.length === 0, 날것.join(' / '));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
if (fail) process.exit(1);
