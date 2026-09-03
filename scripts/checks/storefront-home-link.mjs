import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync, readdirSync } from 'fs';

// 고객 화면의 「홈으로」는 몰 홈(/shop)으로 가야 한다.
//
// [제보 2026-09-03] 「상품을 찾을 수 없습니다」 화면에서 홈으로를 누르면 **본사 ShopGo 랜딩**이 떴다.
//
// [왜 그랬나 — 헷갈리기 쉬운 지점]
// 브랜드 주소의 루트(/)를 몰 홈으로 돌리는 장치가 둘 있다.
//     next.config.js  rewrite  '/' → '/shop/'   (랜딩 호스트가 아닐 때)
//     _app.js         302      is_main_dns != 1 이면 '/shop/'
// 그런데 **둘 다 서버 쪽**이다(_app 쪽은 ctx.res 가 있을 때만 돈다).
// 주소창에 직접 치면 서버를 거치니 몰 홈이 뜨지만, 화면 안에서 router.push('/') 로 움직이면
// 서버를 안 거쳐서 pages/index.js(= 본사 랜딩)가 그대로 그려진다.
// 그래서 '주소창은 되는데 버튼만 새는' 모양이 됐다 — 눈으로 훑어서는 못 잡는다.
//
// 프레임 로고는 전부 '/shop' 을 쓴다. 고객 화면의 홈 버튼도 거기에 맞춘다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 공용 안내 화면 두 개 ─────────────────────────────────────────────────
for (const f of [
    'src/components/elements/shop/ProductNotFound.js',
    'src/components/elements/shop/EmptyResult.js',
]) {
    const s = 주석제거(읽기(f));
    t(`${f.split('/').pop()} : 홈으로가 몰 홈으로 간다`, /router\.push\('\/shop'\)/.test(s));
    t(`${f.split('/').pop()} : 루트로 보내지 않는다`, !/router\.push\('\/'\)/.test(s),
        '루트로 보내면 본사 ShopGo 랜딩이 뜬다');
}

// ── 고객 화면 전체 ───────────────────────────────────────────────────────
// 손님이 보는 화면에서 화면 안 이동으로 루트를 찍는 곳이 새로 생기면 같은 함정에 빠진다.
// 본사 사이트 화면(가맹신청·정책·랜딩 레이아웃)은 루트가 맞으므로 제외한다.
const 본사화면 = [
    'src/pages/index.js',
    'src/pages/apply.js',
    'src/pages/apply-complete.js',
    'src/pages/policy/[slug].js',
    'src/layouts/main/Header.js',
];
const 뒤지기 = (디렉토리, 담기 = []) => {
    for (const e of readdirSync(FRONT_ROOT + 디렉토리, { withFileTypes: true })) {
        const 경로 = `${디렉토리}/${e.name}`;
        if (e.isDirectory()) 뒤지기(경로, 담기);
        else if (e.name.endsWith('.js')) 담기.push(경로);
    }
    return 담기;
};
const 샌곳 = 뒤지기('src')
    .filter((f) => !f.startsWith('src/pages/manager') && !f.startsWith('src/views/manager')
        && !f.startsWith('src/components/manager') && !f.startsWith('src/components/main-site')
        && !f.startsWith('src/views/home') && !본사화면.includes(f))
    .filter((f) => /router\.push\('\/'\)|router\.replace\('\/'\)/.test(주석제거(읽기(f))));
t('고객 화면에서 화면 안 이동으로 루트를 찍는 곳이 없다', 샌곳.length === 0,
    `${샌곳.join('\n        ')}\n        서버를 안 거치므로 본사 랜딩이 그대로 뜬다 — '/shop' 으로 보낼 것`);

// ── 루트를 몰 홈으로 돌리는 장치가 살아 있는가 ────────────────────────────
// 이게 빠지면 주소창에 브랜드 주소만 쳤을 때 본사 랜딩이 뜬다.
const conf = 읽기('next.config.js');
t('next.config 가 브랜드 루트를 몰 홈으로 돌린다',
    /source:\s*'\/'/.test(conf) && /destination:\s*'\/shop\/'/.test(conf));
t('본사 랜딩 호스트는 그 대상에서 뺀다', /missing:\s*\[\{\s*type:\s*'host'/.test(conf),
    '안 빼면 본사 랜딩이 통째로 가려진다');
const app = 읽기('src/pages/_app.js');
t('_app 에도 302 폴백이 남아 있다', /writeHead\(302,\s*\{\s*Location:\s*'\/shop\/'/.test(app),
    'rewrite 가 안 걸리는 경우(MAIN_FRONT_URL 미설정)의 그물이다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
