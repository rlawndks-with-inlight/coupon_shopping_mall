import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// logoDeliveryUrl — Cloudinary 로고에만 여백제거(e_trim) 변환을 끼운다.
// 회귀 방지 핵심: Cloudinary 가 아닌 URL 을 건드리면 그 브랜드 로고가 통째로 깨진다.
// (백엔드 디스크 업로드 BACK_URL/files/..., 데모 미리보기의 data:image/svg+xml 등)
import { readFileSync, readdirSync, statSync } from 'fs';

const SRC = FRONT_ROOT + 'src/data/data.js';
const code = readFileSync(SRC, 'utf8');
// useSettingsContext import 를 뺀 뒤 순수 함수만 뽑아 평가한다(훅은 노드에서 못 돈다).
const grab = (start, endMark) => {
  const i = code.indexOf(start);
  const j = code.indexOf(endMark, i) + endMark.length;
  return code.slice(i, j).replace(/export const /g, 'const ');
};
const F = new Function(
  grab("const CLOUDINARY_DELIVERY", "';") + '\n' +
  grab("const LOGO_TRANSFORM", "';") + '\n' +
  grab('export const logoDeliveryUrl', '\n};') + '\n' +
  'return { logoDeliveryUrl };'
)();
const t = F.logoDeliveryUrl;

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (got === want) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${got}\n  want: ${want}`); }
};
const TR = 'e_trim/h_176,w_560,c_fit,f_auto,q_auto';

// ── 붙어야 하는 경우 ──────────────────────────────────────────────────────
const real = 'https://res.cloudinary.com/dkbh8wdxa/image/upload/v1786343886/oxaumjj3gep8tbnlh9vz.png';
eq('실제 로고 URL', t(real),
  `https://res.cloudinary.com/dkbh8wdxa/image/upload/${TR}/v1786343886/oxaumjj3gep8tbnlh9vz.png`);
eq('버전 없는 URL', t('https://res.cloudinary.com/x/image/upload/abc.png'),
  `https://res.cloudinary.com/x/image/upload/${TR}/abc.png`);
eq('폴더 있는 public_id', t('https://res.cloudinary.com/x/image/upload/v1/logos/a/b.png'),
  `https://res.cloudinary.com/x/image/upload/${TR}/v1/logos/a/b.png`);

// ── 절대 건드리면 안 되는 경우 ────────────────────────────────────────────
const legacy = 'https://api.shopgo.co.kr/files/logo_img/20250801/abc.png';
eq('백엔드 디스크 업로드', t(legacy), legacy);
const oldHost = 'https://purplevery19.cafe24.com:8443/image/content/a.png';
eq('구 서버 호스트', t(oldHost), oldHost);
const demoSvg = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3C%2Fsvg%3E';
eq('데모 마스킹 SVG', t(demoSvg), demoSvg);
eq('빈 문자열(로고 미등록)', t(''), '');
eq('null', t(null), '');
eq('undefined', t(undefined), '');
// http(비-https) Cloudinary — api.js 가 https 로 치환하지만 옛 데이터가 있을 수 있다.
// 화이트리스트가 https 만이므로 건드리지 않고 통과시킨다(깨뜨리는 것보다 낫다).
const httpCld = 'http://res.cloudinary.com/x/image/upload/v1/a.png';
eq('http Cloudinary 는 통과', t(httpCld), httpCld);
// 다른 cloudinary 호스트(업로드 엔드포인트)는 배달 URL 이 아니다
const api = 'https://api.cloudinary.com/v1_1/x/image/upload';
eq('업로드 엔드포인트는 통과', t(api), api);
// 호스트 위장 방어 — 화이트리스트 문자열 끝의 '/' 가 호스트 경계 역할을 한다.
// 'https://res.cloudinary.com' 처럼 슬래시를 빼면 아래가 통과해 엉뚱한 호스트에 변환이 붙는다.
const fake = 'https://res.cloudinary.com.evil.example/image/upload/v1/a.png';
eq('유사 호스트는 통과(변환 안 붙음)', t(fake), fake);

// ── 중복 적용 방지 ────────────────────────────────────────────────────────
const once = t(real);
eq('두 번 호출해도 한 번만', t(once), once);
eq('세 번 호출해도 동일', t(t(once)), once);

// ── /upload/ 가 없는 Cloudinary URL ───────────────────────────────────────
const fetchUrl = 'https://res.cloudinary.com/x/image/fetch/http://a.com/b.png';
eq('fetch 타입은 통과', t(fetchUrl), fetchUrl);
const rawUrl = 'https://res.cloudinary.com/x/raw/upload/v1/a.json';
eq('raw/upload 도 붙는다(무해)', t(rawUrl),
  `https://res.cloudinary.com/x/raw/upload/${TR}/v1/a.json`);

// ── public_id 에 'upload' 가 들어간 경우 — 첫 매치만 치환해야 한다 ─────────
const tricky = 'https://res.cloudinary.com/x/image/upload/v1/my-upload-logo.png';
eq('public_id 의 upload 는 안 건드림', t(tricky),
  `https://res.cloudinary.com/x/image/upload/${TR}/v1/my-upload-logo.png`);
const tricky2 = 'https://res.cloudinary.com/x/image/upload/v1/upload/a.png';
eq('경로에 upload 가 또 있어도 첫 것만', t(tricky2),
  `https://res.cloudinary.com/x/image/upload/${TR}/v1/upload/a.png`);

// ── 변환 문자열 자체 점검 ─────────────────────────────────────────────────
const out = t(real);
eq('e_trim 이 크기지정보다 앞(체이닝)', out.indexOf('e_trim') < out.indexOf('h_176'), true);
eq('세그먼트 구분자 /', out.includes('/e_trim/h_176,'), true);
eq('원본 확장자 유지', out.endsWith('.png'), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);

// ── 로고 크기 조절(--logo-scale) ──────────────────────────────────────────
//
// 로고를 그리는 자리가 프레임 11개에 걸쳐 25곳이 넘고 기준 높이도 제각각이다(28~88px).
// 그래서 '한 값으로 통일'이 아니라 각자의 기준에 배율을 곱한다.
// 자리마다 훅을 하나 더 부르면 훅 순서가 깨질 수 있어(demo-7 헤더는 logoSrc() 를
// 삼항 안에서 조건부로 부른다) CSS 변수로 내린다.
//
// 새 프레임을 만들 때 로고에 배율을 안 붙이면 그 프레임만 조절이 안 먹는다 — 여기서 잡는다.
{
  const 훑기 = (d, out = []) => {
    for (const f of readdirSync(d)) {
      const p = d + '/' + f;
      if (statSync(p).isDirectory()) 훑기(p, out);
      else if (/\.js$/.test(f)) out.push(p);
    }
    return out;
  };
  const 빠진곳 = [];
  for (const p of 훑기(FRONT_ROOT + 'src/layouts/shop')) {
    const 원문 = readFileSync(p, 'utf8');
    if (!/logoSrc\(\)|logoDeliveryUrl\(/.test(원문)) continue;
    // 로고 크기를 정하는 자리가 있는데 배율이 안 걸린 파일
    const 크기있음 = /(Logo|LogoImg|MainLogo)\s*=\s*styled/.test(원문)
      || /logoSrc\(\)[^\n]*(height|width):/.test(원문);
    if (크기있음 && !원문.includes('--logo-scale')) 빠진곳.push(p.replace(FRONT_ROOT, ''));
  }
  eq('프레임 로고에 배율이 다 걸려 있음', 빠진곳, []);

  const 스타일 = readFileSync(FRONT_ROOT + 'src/components/elements/shop/LogoScaleStyle.js', 'utf8');
  eq('배율을 html 에 건다(포털까지 상속)', /documentElement\.style\.setProperty\('--logo-scale'/.test(스타일), true);
  eq('_app 이 LogoScaleStyle 을 그린다',
     /<LogoScaleStyle \/>/.test(readFileSync(FRONT_ROOT + 'src/pages/_app.js', 'utf8')), true);
  // 이상한 값이 들어와도 화면이 깨지면 안 된다
  const { logoScaleOf } = new Function(
    스타일.slice(스타일.indexOf('export const logoScaleOf')).split('\n').slice(0, 5).join('\n')
      .replace('export const ', 'const ') + '\nreturn { logoScaleOf };')();
  eq('설정 없으면 1배', logoScaleOf({}), 1);
  eq('150 → 1.5배', logoScaleOf({ logo_scale: 150 }), 1.5);
  eq('너무 크면 최대치로', logoScaleOf({ logo_scale: 9999 }), 2);
  eq('너무 작으면 최소치로', logoScaleOf({ logo_scale: 1 }), 0.6);
  eq('숫자가 아니면 1배', logoScaleOf({ logo_scale: 'abc' }), 1);
}
