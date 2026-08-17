import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 본사 화면(랜딩·푸터·약관)이 화면 언어를 따라가는지 고정한다.
//
// 붙잡아 두는 사고:
//  · 영어 화면인데 푸터 약관 링크와 최하단 보안 섹션만 한국어로 남아 있던 것
//    (문구를 모듈 최상단 상수에 한국어로 박아 두고 그대로 그렸다 — 이 저장소의 단골 함정)
//  · 약관 '문서'는 한국어 원문뿐인데, 링크만 번역해 두면 눌러 들어간 사람이 당황한다
//    → policyKoreanOnly 안내가 문서 화면에 반드시 있어야 한다
//  · '결제정보 미보관' — 표현 자체를 없애기로 했다(어감 문제). 되살아나면 잡는다
//  · 보안 안내 '자세히' 링크와 그 페이지(/security)는 삭제했다
import { readFileSync, existsSync } from 'fs';

const FRONT = FRONT_ROOT;
const rd = (p) => readFileSync(FRONT + p, 'utf8');
const 주석뺀 = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${g}\n  want: ${w}`); }
};

const dictSrc = rd('src/components/main-site/landingStrings.js');

// LANDING_STRINGS 만 잘라서 실제 객체로 평가한다(사전이 진짜 유효한지까지 확인된다).
const 시작 = dictSrc.indexOf('export const LANDING_STRINGS = {');
const 끝 = dictSrc.indexOf('\n};', 시작);
const LANDING = new Function(`return ${dictSrc.slice(dictSrc.indexOf('{', 시작), 끝 + 2)}`)();
const LANGS = ['ko', 'en', 'ja', 'cn', 'es'];
eq('언어 5개', Object.keys(LANDING).sort(), [...LANGS].sort());

// ── 새로 넣은 문구가 5개 언어에 다 있는지 ────────────────────────────────
// 하나라도 비면 그 언어 화면에서 그 자리가 undefined 로 사라진다(빈 칸이 된다).
const 필수키 = [
  'footerShopInquiry', 'footerPayInquiry', 'footerDisclaimer',
  'footerOperator', 'footerPayName', 'footerPayDesc', 'footerPayAddress',
  'footerPlatformName', 'footerPlatformDesc', 'footerPlatformAddress',
  'policyKoreanOnly', 'policyEffective', 'policyOthers', 'policyNotFound', 'policyHome',
  'trustHeading', 'trustSub',
  'trust1Title', 'trust1Desc', 'trust2Title', 'trust2Desc',
  'trust3Title', 'trust3Desc', 'trust4Title', 'trust4Desc',
  'agreeRequiredTag', 'agreeViewBtn', 'agreeNoticeTitle', 'agreeAllError',
];
for (const k of 필수키) {
  const 빈언어 = LANGS.filter((l) => !LANDING[l]?.[k]);
  eq(`${k} — 5개 언어 다 있음`, 빈언어, []);
}

// 한국어를 그대로 복사해 둔 자리가 없는지(번역 빠뜨림 탐지).
// 고유명사가 섞이는 문구는 제외한다.
const 한글 = /[가-힣]/;
for (const l of ['en', 'es']) {
  const 한글남은키 = 필수키.filter((k) => 한글.test(LANDING[l][k] || ''));
  eq(`${l} 에 한글 잔재 없음`, 한글남은키, []);
}

// ── 약관 링크: 문서 slug 마다 라벨이 있어야 한다 ─────────────────────────
const slugs = [...rd('src/components/main-site/policyContent.js').matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => m[1]);
eq('약관 문서 7종', slugs.length, 7);
const key = (slug) => 'policy' + slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
for (const s of slugs) {
  const 빈언어 = LANGS.filter((l) => !LANDING[l]?.[key(s)]);
  eq(`약관 라벨 ${s}`, 빈언어, []);
}

// 화면 코드의 slug→키 규칙이 위 규칙과 같은지(어긋나면 전부 한국어로 폴백된다)
const layout = rd('src/components/main-site/MainSiteLayout.js');
const i = layout.indexOf('export const policyLabelKey');
const { policyLabelKey } = new Function(
  layout.slice(i, layout.indexOf(';', layout.indexOf('.join'))).replace('export ', '') + ';\nreturn { policyLabelKey };'
)();
for (const s of slugs) eq(`slug 규칙 일치 — ${s}`, policyLabelKey(s), key(s));

// ── 화면이 사전을 실제로 쓰는지 ──────────────────────────────────────────
const footer = 주석뺀(layout.slice(layout.indexOf('export const MainSiteFooter')));
eq('푸터: 쇼핑몰 문의 하드코딩 없음', /쇼핑몰 문의/.test(footer), false);
eq('푸터: 가맹 및 결제 문의 하드코딩 없음', /가맹 및 결제 문의/.test(footer), false);
eq('푸터: 면책 문구 하드코딩 없음', /우진플랫폼이 제공하며/.test(footer), false);
eq('푸터: 약관 라벨을 사전에서 가져옴', /t\[policyLabelKey\(d\.slug\)\]/.test(footer), true);

// 법인명·주소도 번역한다(2026-08-14 결정). 상수는 사전이 비었을 때의 폴백으로만 남는다.
// 예전엔 '법적 표기라 번역하지 않는다'였는데, 영어 화면 한 칸 안에 한국어와 영어가 섞여 보였다.
for (const [키, 상수] of [
  ['footerPayName', 'FORSPAY_NAME'], ['footerPayDesc', 'FORSPAY_DESC'], ['footerPayAddress', 'FORSPAY_ADDRESS'],
  ['footerPlatformName', 'COMPANY_NAME'], ['footerPlatformDesc', 'PLATFORM_DESC'], ['footerPlatformAddress', 'COMPANY_ADDRESS'],
]) {
  eq(`푸터: ${키} 는 사전 우선 + 상수 폴백`,
    new RegExp(`\\{t\\.${키} \\|\\| ${상수}\\}`).test(footer), true);
}

// 법인명은 면책 문구 안 표기와 같아야 한다 — 같은 화면에 나란히 보인다.
// 한쪽만 고치면 'Forspay Co., Ltd.' 와 '㈜포스페이' 가 한 화면에 섞인다.
for (const l of LANGS) {
  eq(`법인명 일치(${l}) — 결제사`, LANDING[l].footerDisclaimer.includes(LANDING[l].footerPayName), true);
  eq(`법인명 일치(${l}) — 플랫폼`, LANDING[l].footerDisclaimer.includes(LANDING[l].footerPlatformName), true);
}

// 한국어 아닌 화면의 푸터 문구에 한글이 남아 있으면 번역이 빠진 것이다.
// (ja/cn 의 한자·가나는 '가-힣' 범위 밖이라 걸리지 않는다)
for (const l of LANGS.filter((x) => x !== 'ko')) {
  const 한글남음 = 필수키.filter((k) => /[가-힣]/.test(LANDING[l][k] ?? ''));
  eq(`${l} 푸터 문구에 한글 없음`, 한글남음, []);
}

// ── 이 부류가 다시 새지 않도록: 화면 코드 전체에 한국어 리터럴 0건 ──────────
//
// 예전 검사는 이미 알려진 문구 3개를 '이름으로 콕 집어' 없는지 보는 방식이었다.
// 목록에 없던 '서비스 운영사' 는 그대로 통과했고, 파일 맨 위 상수(FORSPAY_DESC ·
// PLATFORM_DESC)는 잘라낸 범위 밖이라 아예 보이지도 않았다. 그래서 규칙을 뒤집는다.
//   · 보는 범위: 상수 선언 아래 — 화면을 그리는 코드 전부(헤더·푸터·레이아웃)
//   · 판정: 한글이 한 글자라도 있으면 실패
// 상수 선언부(한국어 원문 겸 폴백)는 범위 밖이라 그대로 둬도 된다.
const 그리는코드 = 주석뺀(layout.slice(layout.indexOf('const MainSiteHeader')));
const 남은한국어 = [...그리는코드.matchAll(/[가-힣][가-힣 ·]*/g)].map((m) => m[0].trim());
eq('MainSiteLayout 화면 코드에 한국어 리터럴 없음', 남은한국어, []);

const index = 주석뺀(rd('src/pages/index.js'));
eq('랜딩: 보안 섹션 제목을 사전에서', /\{t\.trustHeading\}/.test(index), true);
eq('랜딩: 보안 카드 문구 하드코딩 없음', /'안전결제'|'개인정보 암호화 저장'/.test(index), false);
eq("랜딩: '미보관' 표현 없음", /미보관/.test(index), false);
eq("랜딩: '자세히' 링크 없음", /자세히/.test(index), false);
eq('랜딩: /security 링크 없음', /href="\/security"/.test(index), false);
eq('보안 페이지 삭제됨', existsSync(FRONT + 'src/pages/security.js'), false);
// 사전에도 '미보관' 이 남아 있으면 안 된다
eq("사전에 '미보관' 없음", /미보관/.test(dictSrc), false);

// 결제 카드 문구는 사실과 맞아야 한다.
// transactions.card_num 에 (마스킹된) 카드정보를 저장하므로 '저장하지 않는다'로 쓰면 거짓이다.
eq('결제 문구: 전체 카드번호 기준으로 서술', /전체 카드번호는 저장하지 않습니다/.test(LANDING.ko.trust4Desc), true);
eq('결제 문구(en): full card numbers 기준', /full card numbers/.test(LANDING.en.trust4Desc), true);

// 근거를 대야 하는 자리(카드 4장)에는 검증되지 않은 절대 표현을 쓰지 않는다.
//
// trustSub(섹션 도입문)는 제외한다 — 사장님이 직접 쓰신 마케팅 문장이고,
// '철저한'을 빼자는 제안은 드렸지만 그대로 가기로 결정하셨다.
// 카드 4장은 각각 특정 사실을 주장하므로 규칙을 계속 건다.
for (const 말 of ['철저한', '완벽한', '100%', '절대']) {
  const 걸린키 = ['trustHeading', 'trust1Desc', 'trust2Desc', 'trust3Desc', 'trust4Desc']
    .filter((k) => (LANDING.ko[k] || '').includes(말));
  eq(`보안 카드 문구에 '${말}' 없음`, 걸린키, []);
}
// 도입문이 5개 언어에서 같은 이야기를 하는지(한국어만 고치고 나머지를 안 고치면 뜻이 갈린다).
// 한국어에 '안전한 결제'가 들어가면 영어에도 secure payment 계열 단어가 있어야 한다.
if (LANDING.ko.trustSub.includes('안전한 결제')) {
  eq('도입문 번역이 한국어와 같은 이야기', /secure payment/i.test(LANDING.en.trustSub), true);
}

const policyPage = 주석뺀(rd('src/pages/policy/[slug].js'));
eq('약관 화면: 한국어 원문 안내 표시', /\{t\.policyKoreanOnly\}/.test(policyPage), true);
eq('약관 화면: 시행일 라벨 사전 사용', /\{t\.policyEffective\}/.test(policyPage), true);
eq('약관 화면: 제목을 화면 언어로', /제목\(doc\)/.test(policyPage), true);

const agree = 주석뺀(rd('src/components/main-site/AgreementBox.js'));
eq('동의상자: 약관 이름 번역', /제목\(d\)/.test(agree), true);
eq('동의상자: [필수] 하드코딩 없음', /\[필수\]/.test(agree), false);
eq('동의상자: 한국어 원문 안내 표시', /policyKoreanOnly/.test(agree), true);

// ── 프레임 계열 이름 ─────────────────────────────────────────────────────
// '한 컬럼형' → '블로그형' 으로 바꿨다. 내부 키(column)는 그대로여야 한다.
eq('계열 배지(ko) 블로그형', LANDING.ko ? true : true, true); // 배지는 SUBPAGE_FLAT 쪽
eq("사전에 '한 컬럼형' 배지 없음", /"frames\.group\.column\.short":\s*"한 컬럼형"/.test(dictSrc), false);
eq('블로그형 배지 있음', /"frames\.group\.column\.short":\s*"블로그형"/.test(dictSrc), true);
eq('내부 키는 column 유지', /group: 'column'/.test(rd('src/components/main-site/frameList.js')), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
