import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync, existsSync } from 'fs';

// 배송 요청사항과 '주문자와 동일'.
//
// 가맹점 요청(2026-08-21):
//   · "정수기 함에 넣어주세요" 같은 배송 메모를 받을 자리가 주문서에 없었다.
//     받기만 하면 안 되고 저장돼야 하고, 관리자도 볼 수 있어야 한다.
//   · 로그인한 손님에게 받는사람·연락처를 다시 치게 하지 말 것.
//
// 이 검사가 잡는 것은 '반쪽 구현'이다 — 입력칸만 만들고 저장을 빼먹거나,
// 저장은 하는데 관리자 화면에 안 띄우면 손님이 적은 말이 아무데도 도착하지 않는다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const sheet = 읽기('src/views/shop/order/OrderSheet.js');

// ── 주문자와 동일 ─────────────────────────────────────────────────────────
t('주문자와 동일 체크가 있다', sheet.includes("translate('주문자와 동일')"));
// 로그인 상태면 기본으로 켠다 — 비회원은 아직 채울 값이 없으므로 꺼진 채 시작한다.
t('로그인이면 기본으로 켜진다', /useState\(!!user\?\.id\)/.test(sheet));
t('켜져 있으면 주문자 값을 따라간다', /if \(!sameAsBuyer\) return;/.test(sheet));
t('켜져 있으면 직접 못 고친다', /disabled=\{sameAsBuyer\}/.test(sheet));
// 값이 같을 때 다시 세팅하면 렌더가 무한히 돈다 — 그 방어가 있어야 한다.
t('같은 값이면 다시 세팅하지 않는다', /prev\.receiver === 이름 && prev\.addr_phone === 전화/.test(sheet));

// ── 배송 요청사항 ─────────────────────────────────────────────────────────
t('주문서에 요청사항 칸이 있다', sheet.includes("translate('배송 요청사항 (선택)')"));
t('요청사항 길이를 제한한다', /maxLength: 200/.test(sheet));
t('payData 에 자리가 있다', /delivery_memo: '',/.test(sheet));

// 관리자가 볼 수 있어야 한다 — 화면과 엑셀 양쪽.
const 관리자 = 읽기('src/pages/manager/orders/trx/[type].js');
t('관리자 주문관리에 보인다', /row\['delivery_memo'\]/.test(관리자));
t('엑셀에도 나간다', /label: '배송요청사항'/.test(관리자));
// 손님도 자기가 뭐라고 적었는지 다시 볼 수 있어야 한다.
t('고객 주문내역에도 보인다', /row\?\.delivery_memo/.test(읽기('src/components/elements/shop/common.js')));

// ── 저장(백엔드) ──────────────────────────────────────────────────────────
if (백엔드있음) {
    const pay = readFileSync(BACK_ROOT + 'controllers/pay.controller.js', 'utf8');
    t('주문 저장이 요청사항을 받는다', /delivery_memo = null,/.test(pay));
    t('컬럼이 없으면 건너뛴다(마이그레이션 전에도 주문은 된다)',
        /hasColumn\('transactions', 'delivery_memo'\)/.test(pay),
        '없는 컬럼을 넣으면 주문 저장이 통째로 실패한다');
    t('길이를 잘라 저장한다', /String\(delivery_memo\)\.slice\(0, 255\)/.test(pay));
    // 마이그레이션 파일이 저장소에 있어야 한다 — 서버에서 돌릴 사람이 찾을 수 있어야 한다.
    t('마이그레이션 파일이 있다', existsSync(BACK_ROOT + 'migrations/2026-08-21_delivery_memo.sql'));
    if (existsSync(BACK_ROOT + 'migrations/2026-08-21_delivery_memo.sql')) {
        const sql = readFileSync(BACK_ROOT + 'migrations/2026-08-21_delivery_memo.sql', 'utf8');
        t('마이그레이션이 transactions 에 칸을 더한다',
            /ALTER TABLE transactions/i.test(sql) && /ADD COLUMN delivery_memo/i.test(sql));
    }
} else {
    console.log('  (백엔드 저장소가 없어 서버 쪽 검사는 건너뜀)');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
