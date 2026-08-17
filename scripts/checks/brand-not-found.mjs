import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 등록되지 않은 주소 처리 고정.
//
// 붙잡아 두는 사고:
//   ① 브랜드를 못 찾으면 아무것도 안 그려 **흰 화면 + HTTP 200** 이 나가던 것
//      (원인은 ThemeProvider 가 `paletteObj?.is_dns_data` 로 children 을 통째로 막는 것)
//   ② 그래서 안내 화면을 프로바이더 **바깥**에 그려야 한다 — 안쪽에 두면 또 안 보인다
//   ③ 메인 호스트(랜딩)는 404 로 덮으면 안 된다(백엔드 장애를 '없는 주소'로 오인)
//   ④ 문구가 5개 언어에 다 있어야 한다
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const app = readFileSync(`${FRONT}src/pages/_app.js`, 'utf8');
const page = readFileSync(`${FRONT}src/components/main-site/BrandNotFound.js`, 'utf8');
const theme = readFileSync(`${FRONT}src/theme/index.js`, 'utf8');

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) pass++;
  else { fail++; console.log(`FAIL ${name}${extra ? `\n  ${extra}` : ''}`); }
};

// ── ① 서버가 404 를 준다 ────────────────────────────────────────────────
ok('브랜드를 못 찾으면 404 로 표시', /statusCode\s*=\s*404/.test(app));
ok('안내 플래그를 넘긴다', /is_brand_not_found:\s*true/.test(app));
ok('어떤 주소였는지 함께 넘긴다', /is_brand_not_found:\s*true,\s*host/.test(app));

// ── ③ 메인 호스트는 제외 ────────────────────────────────────────────────
ok('메인 호스트는 404 로 덮지 않는다', /if\s*\(!dns_data\s*&&\s*!isMainHost\)/.test(app));

// ── ② 안내 화면은 테마 프로바이더 바깥에서 그린다 ────────────────────────
// ThemeProvider 가 브랜드 없을 때 children 을 막는다는 사실 자체를 고정한다.
// (이 게이트가 사라지면 이 테스트의 전제가 바뀌므로 같이 깨져야 한다)
ok('ThemeProvider 는 브랜드가 있을 때만 children 을 그린다',
  /paletteObj\?\.is_dns_data\s*&&/.test(theme));

const 이른반환 = app.indexOf('if (head_data?.is_brand_not_found)');
const 프로바이더 = app.indexOf('<AuthProvider>');
ok('안내 화면을 이른 반환으로 그린다', 이른반환 > 0);
ok('프로바이더 트리보다 앞에서 반환한다', 이른반환 > 0 && 프로바이더 > 이른반환,
  `이른반환@${이른반환} · AuthProvider@${프로바이더}`);
ok('검색엔진에 색인하지 말라고 표시', /content='noindex'|content="noindex"/.test(app));

// ── 안내 화면 자체 ──────────────────────────────────────────────────────
// useLocales 는 안에서 useSettingsContext 를 부른다 → 프로바이더 밖에서 쓰면 터진다.
// 주석에는 '왜 안 쓰는지' 설명이 들어 있으므로 코드만 보고 판단한다.
const 코드 = page.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
ok('useLocales 를 쓰지 않는다', !/useLocales/.test(코드));
ok('useTranslation 을 쓴다', /useTranslation/.test(코드));
ok('themeDnsData 에 기대지 않는다', !/themeDnsData/.test(코드));
ok('들어온 주소를 보여준다', /\{host\}/.test(page));
ok('ShopGo 홈 링크가 있다', /translate\('ShopGo 홈으로'\)/.test(코드));
// ⚠ 이 화면에서 router.push 로 안쪽 경로로 보내면 안 된다. 지금 호스트가 '없는 주소'라
//    /apply 로 보내도 같은 404 화면을 다시 만난다(실제로 그렇게 만들었다가 고쳤다).
//    나가는 길은 다른 호스트로 나가는 절대 주소 하나뿐이어야 한다.
ok('안쪽 경로로 보내지 않는다', !/router\.push/.test(코드), '없는 주소 안에서는 어디로 가도 404다');
ok('나가는 길은 절대 주소', /href=\{mainUrl\}/.test(코드));

// ── ④ 문구가 5개 언어에 다 있다 ─────────────────────────────────────────
const load = (f) => {
  const s = readFileSync(`${FRONT}src/locales/langs/${f}.js`, 'utf8');
  const i = s.indexOf('{');
  let d = 0, e = i;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '{') d++;
    else if (s[k] === '}') { d--; if (d === 0) { e = k; break; } }
  }
  return new Function(`return ${s.slice(i, e + 1)}`)();
};
const 키 = [...page.matchAll(/translate\('([^']+)'\)/g)].map((m) => m[1]);
ok('안내 화면 문구를 찾았다', 키.length >= 3, `${키.length}개`);   // 제목 · 설명 · 홈 버튼
for (const lang of ['ko', 'en', 'ja', 'cn', 'es']) {
  const d = load(lang);
  const 없음 = 키.filter((k) => !(k in d));
  ok(`${lang} 사전에 다 있다`, 없음.length === 0, 없음.join(' · '));
  const 안번역 = lang === 'ko' ? [] : 키.filter((k) => d[k] === k);
  ok(`${lang} 이 한국어를 그대로 두지 않았다`, 안번역.length === 0, 안번역.join(' · '));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
