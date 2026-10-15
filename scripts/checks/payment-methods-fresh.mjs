import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 주문서 결제수단 '지금 확인' (2026-10-15).
//
// 포스페이에서 결제 대분류(카드·계좌이체·간편결제·해외결제)를 꺼도 주문서에는 한참 남아 있었다
// (몰 설정 3분 캐시 + 대분류 저장 1시간). 손님이 누르면 결제창에서 실패했다.
//   · 주문서가 열리면 /api/shop/payment-methods 로 '지금' 확인한 목록으로 갈아 끼운다(포스페이 쪽만 30초 재사용, 2.5초에서 끊음).
//   · 고른 수단이 새 목록에서 빠지면 선택을 푼다.
//   · 대분류 저장은 5분, 결제창 열기에 실패하면 다시 물어 바로 숨긴다.

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 주문서 = 읽기(FRONT_ROOT, 'src/views/shop/order/OrderSheet.js');
t('주문서가 열리면 결제수단을 새로 받는다', /apiShop\('payment-methods', 'get'/.test(주문서));
t('새 목록이 오면 그걸 쓰고, 못 받으면 몰 설정 목록을 쓴다', /\(최신결제수단 \?\? themeDnsData\?\.payment_modules \?\? \[\]\)/.test(주문서));
t('고른 수단이 새 목록에서 빠지면 선택을 푼다', /if \(!남아있음\) \{ setBuyType\(undefined\); setBuyPayMethod\(undefined\); \}/.test(주문서));

if (백엔드있음) {
  const 도우미 = 읽기(BACK_ROOT, 'utils.js/payments/forspay-allowed.js');
  const 라우트 = 읽기(BACK_ROOT, 'routes/shop.route.js');
  const 샵 = 읽기(BACK_ROOT, 'controllers/shop.controller.js');
  const 결제 = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
  t('주문서용 API 가 있다', /\.route\('\/payment-methods'\)\s*\.get\(shopCtrl\.paymentMethods\)/.test(라우트));
  t('대분류 저장은 5분(1시간이 아니다)', /export const 대분류보관초 = 300;/.test(도우미) && !/EX: 3600/.test(샵));
  t('지금 확인은 30초 재사용 · 2.5초에서 끊는다', /const 지금보관초 = 30;/.test(도우미) && /const 기다림한도 = 2500;/.test(도우미));
  t('몰 설정과 주문서용 API 가 같은 목록 규칙을 쓴다', (샵.match(/결제수단목록\(/g) || []).length >= 2);
  t('결제창 열기 실패 시 다시 확인한다(두 실패 경로 모두)', (결제.match(/대분류다시확인\(\);/g) || []).length >= 2);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
