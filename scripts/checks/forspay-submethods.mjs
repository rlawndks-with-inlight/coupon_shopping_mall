import { readFileSync } from 'fs';
import { BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 포스페이 결제 API 변경(2026-10-26) 대응.
//   · 알리페이·위챗페이·라인페이는 해외결제(pg_method_id=5 + foreign_method) — 간편결제 route 2·3·6 은 PV433 거절
//   · ping 의 checkout.sub_methods[대분류].available 에 있는 세부 수단만 주문서에 보인다(꺼진 수단 = PV433)
//   · sub_methods 를 못 읽으면 예전처럼 대분류만 거른다(막지 않는다)

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

if (!백엔드있음) {
  console.log('  (백엔드 없음 — 건너뜀)');
  process.exit(0);
}
const fs = readFileSync(BACK_ROOT + 'utils.js/payments/forspay.js', 'utf8');
const al = readFileSync(BACK_ROOT + 'utils.js/payments/forspay-allowed.js', 'utf8');
const pay = readFileSync(BACK_ROOT + 'controllers/pay.controller.js', 'utf8');

// 카탈로그
const 카탈로그 = fs.match(/export const FORSPAY_METHODS = \[([\s\S]*?)\n\];/)?.[1] ?? '';
const 수단 = [...카탈로그.matchAll(/\{ key: '(\w+)'[^}]*?pg_method_id: (\d)(?:, route: (null|\d+))?(?:, foreign_method: '(\w+)')?/g)]
  .map((m) => ({ key: m[1], pg: Number(m[2]), route: m[3], foreign: m[4] }));
const 라인 = 수단.find((m) => m.key === 'linepay');
t('라인페이는 해외결제(5) + foreign_method=linepay', 라인?.pg === 5 && 라인?.foreign === 'linepay');
t('간편결제(3)로 route 2·3·6 을 보내는 수단이 없다', !수단.some((m) => m.pg === 3 && ['2', '3', '6'].includes(m.route)));
t('알리페이·위챗페이도 해외결제(5)', ['alipay', 'wechat'].every((k) => 수단.find((m) => m.key === k)?.pg === 5));

// 세부 수단 판정(결제가능)을 소스에서 꺼내 실제로 돌려 본다
const 맞춤식 = al.match(/const 맞춤 = (\(v\) => [^;]+);/)?.[1];
const 판정식 = al.match(/export const 결제가능 = (\(allowed, m\) => \{[\s\S]*?\n\});/)?.[1];
const 결제가능 = 맞춤식 && 판정식 && new Function(`const 맞춤 = ${맞춤식}; return ${판정식};`)();
if (결제가능) {
  const 몰 = { ids: [0, 3, 5], sub: { '3': [0, 1, 4], '5': ['card', 'alipay'] } };
  t('간편결제: available 에 있는 route 만', 결제가능(몰, { pg_method_id: 3, route: 0 }) && !결제가능(몰, { pg_method_id: 3, route: 5 }));
  t('해외결제: available 에 있는 foreign_method 만(라인페이 미허용이면 숨김)', 결제가능(몰, { pg_method_id: 5, foreign_method: 'alipay' }) && !결제가능(몰, { pg_method_id: 5, foreign_method: 'linepay' }));
  t('대분류가 없으면 숨김', !결제가능({ ids: [0], sub: null }, { pg_method_id: 3, route: 0 }));
  t('세부 정보가 없으면(예전 저장값·조회 실패) 대분류만 본다', 결제가능([0, 3], { pg_method_id: 3, route: 1 }) && 결제가능(null, { pg_method_id: 5, foreign_method: 'wechat' }));
} else {
  t('결제가능 함수를 찾을 수 있다', false);
}

t('주문서 목록은 결제가능으로 거른다', /if \(!결제가능\(allowedIds, m\)\) return false;/.test(al));
t('ping 에서 sub_methods[대분류].available 을 읽는다', /checkout\?\.sub_methods/.test(fs) && /v\?\.available/.test(fs));
t('결제창 실패 뒤 다시 확인은 세부 수단까지(수단 전체를 넘긴다)', /실패후대분류다시확인\(brand_id, creds\.app_key, fsMethod\)/.test(pay));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
