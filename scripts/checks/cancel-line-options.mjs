import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 부분취소 창이 '어느 줄' 인지 읽을 수 있는가.
//
// [왜 — 2026-09-09 점검]
// 같은 상품을 옵션만 다르게 두 줄 주문할 수 있다(사과 중과 2개 / 사과 대과 1개 — 상품상세의
// '선택한 옵션' 줄 쌓기). 그런데 부분취소 창은 줄마다 **상품명만** 보여 줬고, 서버 응답
// (pays/cancel-partial/:id GET)에는 옵션이 아예 없었다. 관리자는 똑같은 이름 두 줄 중
// 어느 것을 취소하는지 알 수 없었다 — 엉뚱한 줄을 취소하면 손님은 받을 것을 못 받고
// 안 받을 것을 받는다.
//
// 고객 취소요청 창(OrderCancelButton)·주문관리 목록은 이미 옵션을 그린다. 그 둘과 같은
// 표기(getOptionLabel)를 쓰게 붙잡아 둔다.

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const dlg = 읽기(FRONT_ROOT, 'src/components/manager/PartialCancelDialog.js');
t('취소창이 공용 옵션 표기(getOptionLabel)를 쓴다', dlg.includes("import { getOptionLabel } from 'src/utils/shop-util'"));
t('줄의 옵션을 글로 만드는 자리가 있다(order_groups → 옵션글)', dlg.includes('const 옵션글 = (line)') && dlg.includes('line.order_groups'));
{
  // 고르는 목록, 확인 단계, 고객요청 안내 — 세 자리 모두에서 옵션이 보여야 한다
  const 목록 = dlg.indexOf('{lines.map((l) => (');
  const 확인 = dlg.indexOf('{고른줄.map((l) => (');
  const 안내 = dlg.indexOf('요청줄.map((l) =>');
  t('고르는 목록에서 옵션이 보인다', 목록 > 0 && dlg.slice(목록, 목록 + 900).includes('옵션글(l)'));
  t('확인 단계에서 옵션이 보인다', 확인 > 0 && dlg.slice(확인, 확인 + 700).includes('옵션글(l)'));
  t('고객요청 안내에서 옵션이 보인다', 안내 > 0 && dlg.slice(안내, 안내 + 200).includes('옵션글(l)'));
}
t('그룹 이름도 같이 적는다(중량: 2kg 대과 처럼)', dlg.includes('`${이름}: ${값}`'));

if (백엔드있음) {
  const ctrl = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
  const 응답 = ctrl.slice(ctrl.indexOf('cancelState: async'), ctrl.indexOf('cancelPartial: async'));
  t('서버 cancelState 가 줄마다 order_groups 를 돌려준다', 응답.includes('order_groups: 옵션스냅샷(l.order_groups)'));
  t('깨진 JSON 이어도 취소 자체는 막지 않는다(빈 배열)', /const 옵션스냅샷 = \(raw\) => \{[\s\S]*?catch \(e\) \{ return \[\]; \}/.test(ctrl));
} else {
  console.log('  (백엔드 없음 — 서버 쪽은 건너뜀)');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
if (fail) process.exit(1);
