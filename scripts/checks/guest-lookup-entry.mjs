import { readFileSync } from 'fs';
import { FRONT_ROOT } from './_roots.mjs';

// 비회원 주문조회 입구는 「비회원 주문조회」(/shop/auth/order-check) 한 화면이다(2026-11-12 가맹점 지적).
//   예전: 로그인 화면(프레임 1~9)에 조회 칸이 따로 있어 그 자리에 결과를 그렸다 — 여러 건이어도 최근 한 건만,
//         취소요청·후기 없음 → 「로그인에 있는 비회원 주문조회로는 취소 불가」.
//   이제: 로그인 화면 조회 칸은 입력값을 들고 비회원 주문조회로 간다(비밀번호는 주소가 아니라 sessionStorage, 꺼내면 지움).
//         결제 직후 「주문 조회하기」는 ?ord=주문번호 를 실어 보내고, 조회하면 그 주문 상세가 바로 열린다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 따로 = [];
for (let n = 1; n <= 9; n++) {
  const s = 읽기(`src/views/shop/demo-${n}/auth/login.js`);
  const ok = !/transactions\/0|noneUserTrxObj/.test(s)
    && /import \{ 비회원조회로 \} from 'src\/utils\/guest-lookup';/.test(s)
    && /const onCheckNoneUserPay = \(\) => \{\s*비회원조회로\(router, noneUserObj\);\s*\}/.test(s);
  if (!ok) 따로.push(`demo-${n}`);
}
t(`로그인 화면 9개는 그 자리에서 조회하지 않고 비회원 주문조회로 보낸다${따로.length ? ' — 다름: ' + 따로.join(', ') : ''}`, 따로.length === 0);

const 도우미 = 읽기('src/utils/guest-lookup.js');
t('비밀번호는 주소에 싣지 않는다(sessionStorage, 꺼내면 지움, 5분)', /sessionStorage\.setItem\(열쇠/.test(도우미) && /sessionStorage\.removeItem\(열쇠\)/.test(도우미)
  && /유효시간 = 5 \* 60 \* 1000/.test(도우미) && /order-check\?ord=\$\{encodeURIComponent/.test(도우미) && !/password[^\n]*encodeURIComponent/.test(도우미));

const 조회 = 읽기('src/pages/shop/auth/order-check.js');
t('비회원 주문조회: 넘겨받은 값으로 바로 조회하고 꺼낸 값은 지운다', /const 넘김 = 비회원조회꺼내기\(\);/.test(조회) && /if \(넘김\.buyer_phone && 넘김\.password\) onSearch\(넘김\);/.test(조회));
t('비회원 주문조회: 주소의 주문번호가 결과에 있으면 그 주문 상세를 연다', /열주문\.current = String\(router\.query\?\.ord \|\| ''\);/.test(조회)
  && /return 보던것 \|\| 방금주문 \|\| \(list\.length === 1 \? list\[0\] : null\);/.test(조회));
t('비회원 주문조회: 버튼 클릭(이벤트 인자)은 입력칸 값을 쓴다', /const 값 = typeof 넘김\?\.buyer_phone === 'string' \? 넘김 : form;/.test(조회));
t('비회원 주문조회: 상세에 취소요청 버튼은 그대로', /canCancelOrder\(selected\) && \(/.test(조회) && /<OrderCancelButton/.test(조회));

const 결과 = 읽기('src/views/shop/order/PayResultView.js');
const 완료 = 읽기('src/pages/shop/auth/order-complete.js');
t('결제 결과·주문완료: 비회원은 주문번호를 실어 비회원 주문조회로', (결과.match(/비회원조회주소\(q\.ord_num\)/g) || []).length === 2
  && (완료.match(/비회원조회주소\(order\?\.ord_num\)/g) || []).length === 2
  && !/'\/shop\/auth\/order-check'/.test(결과) && !/'\/shop\/auth\/order-check'/.test(완료));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
