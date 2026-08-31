import { BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 본사가 브랜드마다 켜는 기능 두 가지 (2026-08-31).
//
// ① 손님이 적는 항목(행사날짜·각인문구 등)
//    가맹점이 상품마다 거는 기능인데 대부분의 몰에는 필요가 없다. **기본은 꺼짐**이고
//    본사가 켠 몰에서만 상품등록 화면에 그 구역이 뜨고 손님 화면에도 나온다.
//    ⚠ 관리자 화면만 감추면 반쪽이다 — 예전에 걸어 둔 값이 남아 있으면 손님 화면에 계속 뜨고,
//      필수 항목이면 **껐는데도 구매가 막힌다.** 그래서 손님 쪽(getOrderFormFields)도 함께 막는다.
//
// ② 기본 택배사
//    설정관리 › 배송비설정의 「기본 택배사」는 지금까지 주문관리(송장 입력)에서만 쓰였다.
//    늘 같은 택배사로 보내는 몰이라면 손님이 미리 아는 편이 낫다 — 상품 상세의 안내 표에 넣는다.
//    정해 두지 않은 몰에서는 줄 자체가 안 나온다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(p, 'utf8').split(String.fromCharCode(13)).join('');

// ── ① 손님 입력항목 ────────────────────────────────────────────────────
const 설정 = 읽기('src/pages/manager/settings/default/[brand_id].js');
t('본사 화면에 스위치가 있다', /is_use_order_form/.test(설정));
t('그 스위치가 본사 전용 탭에 있다',
    설정.indexOf('is_use_order_form') > 설정.indexOf('currentTab == 4'),
    "데모설정 탭은 user.level >= 50 에서만 보인다 — 가맹점이 스스로 켜면 안 된다");

const 편집기 = 읽기('src/components/manager/ProductOptionEditor.js');
t('상품등록 화면이 브랜드 설정을 본다', /is_use_order_form/.test(편집기));
t('꺼진 몰에서는 구역을 아예 안 그린다', /\{입력항목쓴다 &&/.test(편집기),
    '보이기만 감추면 값이 남아 손님 화면에 계속 나온다');

const 유틸 = 읽기('src/utils/shop-util.js');
t('손님 화면도 꺼진 몰에서는 항목을 안 준다',
    /is_use_order_form/.test(유틸) && /getOrderFormFields/.test(유틸),
    '필수 항목이 남아 있으면 껐는데도 구매가 막힌다');
t('설정을 못 읽으면 끈 것으로 본다', /catch \(e\) \{\s*return \[\];/.test(유틸),
    '기본은 꺼짐이다 — 못 읽었다고 켜 두면 안 된다');

// ── ② 기본 택배사 ──────────────────────────────────────────────────────
const 택배 = 읽기('src/components/elements/shop/CourierLine.js');
t('택배사 줄이 공용 헬퍼를 쓴다', /기본택배사/.test(택배),
    'COURIER_LIST 에 없는 값은 없는 것으로 봐야 한다 — 설정·주문 화면과 규칙이 같아야 한다');
t('정해 두지 않으면 줄이 안 나온다', /if \(!택배사\) return null;/.test(택배));
t('그리드 안에서는 칸만 내놓는다', /if \(inGrid\) return <>/.test(택배),
    '자기 행 상자를 만들면 다른 줄과 세로줄이 어긋난다');

const 표 = 읽기('src/components/elements/shop/DetailNotices.js');
t('안내 표에 택배사가 들어간다', /<CourierLine inGrid/.test(표));
t('배송비 바로 아래에 둔다',
    표.indexOf('<ShippingLine') < 표.indexOf('<CourierLine')
    && 표.indexOf('<CourierLine') < 표.indexOf('<BenefitNotice'),
    '배송 얘기끼리 붙어 있어야 읽힌다');

for (const lang of ['ko', 'en', 'ja', 'cn', 'es']) {
    t(`${lang} 사전에 '택배사' 가 있다`,
        readFileSync(`src/locales/langs/${lang}.js`, 'utf8').includes('"택배사"'));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
