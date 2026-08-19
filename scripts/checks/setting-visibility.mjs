import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 설정관리에서 '누구에게 보이나' 를 잠근다.
//
// 왜 필요한가:
//   등급 판정이 화면 곳곳에 흩어진 `user?.level >= N` 이라, 한 줄만 바꿔도 아무 소리 없이
//   가맹점에게 열린다. 실제로 SEO설정이 그렇게 열려 있었다 — 탭 이름만 보고 '검색 노출
//   문구는 가맹점이 써야 한다' 고 판단했는데, 정작 그 탭에 든 것은 네이버토큰·구글토큰
//   두 칸뿐이었다. 서치어드바이저에서 발급받아 붙이는 소유확인 값이라 가맹점이 채울
//   성질이 아니다. 이름이 아니라 내용으로 정한 결과를 여기에 박아 둔다.
//
// 이것은 권한 장치가 아니다. 화면에서 감추기만 한다(서버 판정은 따로다).

const src = readFileSync(FRONT_ROOT + 'src/pages/manager/settings/default/[brand_id].js', 'utf8');

let pass = 0, fail = 0;
const eq = (name, got, want) => {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (ok) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log(`  FAIL ${name}  (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`); }
};

// 탭 label 바로 앞에 붙은 등급 조건을 읽는다.
const 탭등급 = (label) => {
    const i = src.indexOf(`label: '${label}'`);
    if (i < 0) return '탭없음';
    const 앞 = src.slice(Math.max(0, i - 400), i);
    const m = [...앞.matchAll(/user\?\.level >= (\d+)/g)];
    return m.length ? Number(m[m.length - 1][1]) : '조건없음';
};

// 칸 앞에 붙은 등급 조건을 읽는다(탭이 아니라 개별 입력칸).
const 칸등급 = (label) => {
    const i = src.indexOf(`label='${label}'`);
    if (i < 0) return '칸없음';
    const 앞 = src.slice(Math.max(0, i - 300), i);
    const m = [...앞.matchAll(/user\?\.level >= (\d+)/g)];
    return m.length ? Number(m[m.length - 1][1]) : '조건없음';
};

// ── 본사만 ────────────────────────────────────────────────────────────────
// 네이버토큰·구글토큰뿐이다. 가맹점이 발급받아 넣을 수 있는 값이 아니고,
// 비어 있어도 몰은 정상 동작한다.
eq('SEO설정은 본사만', 탭등급('SEO설정'), 50);
eq('데모설정은 본사만', 탭등급('데모설정'), 50);          // 프레임 교체는 본사 결정
eq('발송번호설정은 본사만', 탭등급('발송번호설정'), 50);   // 문자 게이트웨이 미사용

// 고객 화면 어디에도 안 나가고 코드가 읽지도 않는 개인정보 — 받아 둘 이유가 없다.
eq('주민등록번호는 본사만', 칸등급('주민등록번호'), 50);
// 쓰이는 곳이 약관 시행일 한 곳뿐이고, created_at 이 있으면 그쪽을 쓴다.
eq('법인설립일자는 본사만', 칸등급('법인설립일자'), 50);

// ── 가맹점도 ──────────────────────────────────────────────────────────────
// 배송비는 가맹점이 자기 몰 기준으로 정하는 값이다. 닫으면 매번 본사에 요청해야 한다.
eq('배송비설정은 가맹점도', 탭등급('배송비설정'), 40);

// 포인트설정은 등급만이 아니라 shopgo 산하인지도 본다 — 조건을 통째로 확인한다.
eq('포인트설정은 본사 또는 shopgo 가맹점',
    /user\?\.level >= 50 \|\| isShopgoMerchant\(item\)/.test(src), true);

// ── 근거가 주석으로 남아 있는가 ───────────────────────────────────────────
// 이유가 없으면 다음 사람이 '왜 닫혀 있지?' 하고 그냥 연다. 실제로 그렇게 열렸다.
eq('SEO를 닫은 이유가 적혀 있다', /네이버토큰·구글토큰/.test(src), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
