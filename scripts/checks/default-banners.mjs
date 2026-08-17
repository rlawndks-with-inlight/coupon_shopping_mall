import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 기본 배너 — '고르는 목록'과 '자동으로 깔리는 것'이 갈려 있는지 고정.
//
// 붙잡아 두는 사고: 목록(DEFAULT_BANNERS)을 그대로 신규 개설 몰에 심고 있었다.
//   업종 사진 17종을 목록에 넣자 개설만 해도 배너가 23장 깔리는 꼴이 됐다.
//   자동으로 깔리는 것은 seed 표시가 붙은 6장으로 고정한다.
import { readFileSync, existsSync } from 'fs';

const FRONT = FRONT_ROOT;
const BACK = BACK_ROOT;

const src = readFileSync(FRONT + 'src/data/default-banners.js', 'utf8');
const mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
const {
    DEFAULT_BANNERS, DEFAULT_BANNERS_2X1, getDefaultBanners, getSeedBanners, getDefaultHomeContent,
} = mod;

let pass = 0, fail = 0;
const eq = (name, got, want) => {
    if (JSON.stringify(got) === JSON.stringify(want)) pass++;
    else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

// ── 목록은 늘었다 ────────────────────────────────────────────────────────
eq('2.35:1 목록 23종', DEFAULT_BANNERS.length, 23);
eq('2:1 목록 23종', DEFAULT_BANNERS_2X1.length, 23);
eq('두 세트 개수 같음', DEFAULT_BANNERS.length, DEFAULT_BANNERS_2X1.length);
// 같은 사진의 두 비율본이므로 이름이 짝을 이뤄야 한다(한쪽만 추가하면 데모별로 목록이 달라진다)
eq('두 세트 이름이 같은 순서', DEFAULT_BANNERS.map((b) => b.label), DEFAULT_BANNERS_2X1.map((b) => b.label));

// ── 자동으로 깔리는 것은 그대로 6장 ──────────────────────────────────────
// 이게 이번 작업의 본체다. 여기가 늘면 신규 가맹점 홈에 배너가 20장씩 깔린다.
eq('seed 6장(2.35:1)', getSeedBanners(1).length, 6);
eq('seed 6장(2:1)', getSeedBanners(5).length, 6);
eq('신규 몰 홈 배너 6장', getDefaultHomeContent(1)[0].list.length, 6);
eq('신규 몰 홈 배너 6장(2:1 데모)', getDefaultHomeContent(5)[0].list.length, 6);
eq('신규 몰 홈은 원래 사진만', getDefaultHomeContent(1)[0].list.map((b) => b.src), [
    '/assets/images/banners/banner-1.jpg',
    '/assets/images/banners/banner-2.jpg',
    '/assets/images/banners/banner-3.jpg',
    '/assets/images/banners/banner-4.jpg',
    '/assets/images/banners/banner-5.jpg',
    '/assets/images/banners/banner-6.jpg',
]);
// 업종 사진에 seed 가 붙으면 안 된다
eq('업종 사진엔 seed 없음', DEFAULT_BANNERS.filter((b) => b.seed && !/banner-[1-6]\.jpg$/.test(b.src)), []);

// ── 데모별 세트 선택 ─────────────────────────────────────────────────────
eq('demo1 은 2.35:1 세트', getDefaultBanners(1)[0].src, '/assets/images/banners/banner-1.jpg');
eq('demo5 는 2:1 세트', getDefaultBanners(5)[0].src, '/assets/images/banners/banner-2x1-1.jpg');

// ── id·경로 위생 ─────────────────────────────────────────────────────────
const ids = [...DEFAULT_BANNERS, ...DEFAULT_BANNERS_2X1].map((b) => b.id);
eq('id 중복 없음', ids.length, new Set(ids).size);
// 파일명이 곧 URL 이다. 한글·공백이 들어가면 인코딩 문제로 깨질 수 있다.
const 나쁜경로 = [...DEFAULT_BANNERS, ...DEFAULT_BANNERS_2X1]
    .filter((b) => /[^\x20-\x7E]/.test(b.src) || /\s/.test(b.src)).map((b) => b.src);
eq('경로에 한글·공백 없음', 나쁜경로, []);

// ── 이미지 파일이 실제로 있는지 ──────────────────────────────────────────
const 없는파일 = [...DEFAULT_BANNERS, ...DEFAULT_BANNERS_2X1]
    .filter((b) => !existsSync(FRONT + 'public' + b.src)).map((b) => b.src);
eq('이미지 전부 존재', 없는파일, []);

// ── 백엔드 개설 시드와 어긋나지 않는지 ───────────────────────────────────
// 백엔드는 하드코딩이라 프론트 목록을 늘려도 안 따라온다 — 그게 의도다.
// 다만 '자동으로 깔리는 6장'과는 반드시 같아야 한다(개설 직후와 폴백 화면이 달라 보이면 안 된다).
const back = readFileSync(BACK + 'utils.js/default-home.js', 'utf8');
const 백엔드235 = [...back.matchAll(/'(\/assets\/images\/banners\/banner-\d\.jpg)'/g)].map((m) => m[1]);
eq('백엔드 시드 = 프론트 seed(2.35:1)', 백엔드235, getSeedBanners(1).map((b) => b.src));
const 백엔드2x1 = [...back.matchAll(/'(\/assets\/images\/banners\/banner-2x1-\d\.jpg)'/g)].map((m) => m[1]);
eq('백엔드 시드 = 프론트 seed(2:1)', 백엔드2x1, getSeedBanners(5).map((b) => b.src));
eq('백엔드에 업종 사진 없음', /banner-(dried|mens|womens|cosmetics|food|meat|vegetable)/.test(back), false);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
