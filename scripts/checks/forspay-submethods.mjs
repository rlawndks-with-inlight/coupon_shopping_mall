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

// 페이코·토스페이(간편결제 route 4·5) — 프론트 아이콘 목록과 백엔드 카탈로그 키가 같아야 한다
const 페이코 = 수단.find((m) => m.key === 'payco'), 토스 = 수단.find((m) => m.key === 'tosspay');
t('페이코=간편결제 route 4, 토스페이=route 5', 페이코?.pg === 3 && 페이코?.route === '4' && 토스?.pg === 3 && 토스?.route === '5');
const 프론트목록 = readFileSync(new URL('../../src/utils/format.js', import.meta.url), 'utf8').match(/export const forspayMethodList = \[([\s\S]*?)\n\]/)?.[1] ?? '';
const 프론트키 = [...프론트목록.matchAll(/key: '(\w+)'/g)].map((m) => m[1]);
t('프론트 결제수단 목록 키 = 백엔드 카탈로그 키(같은 순서)', 프론트키.join(',') === 수단.map((m) => m.key).join(','));

// 거절 코드 → 손님 안내(원문은 보이지 않는다)
t('거절 코드 PV408·PV407·PV413·PV433 은 우리 문구로 안내', ['PV408', 'PV407', 'PV413', 'PV433'].every((c) => new RegExp(`${c}: '`).test(fs)));
t('세션 생성 실패·결제창 주소 없음 둘 다 거절 안내를 쓴다',
  /거절안내\(거절코드\(session\)\) \?\? 결제시작실패문구/.test(pay) && /거절안내\(거절코드\(e\?\.response\?\.data\)\) \?\? 결제시작실패문구/.test(pay));
t('포스페이 경고(warnings)는 1시간에 한 번 서버 기록', /export const 경고기록 = async/.test(al) && /EX: 3600/.test(al));
t('ping 에서 sub_methods[대분류].available 을 읽는다', /checkout\?\.sub_methods/.test(fs) && /v\?\.available/.test(fs));
t('결제창 실패 뒤 다시 확인은 세부 수단까지(수단 전체를 넘긴다)', /실패후대분류다시확인\(brand_id, creds\.app_key, fsMethod\)/.test(pay));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
