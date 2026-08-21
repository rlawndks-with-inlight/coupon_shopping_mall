import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync, existsSync } from 'fs';

// 손님이 주문을 취소하려고 누르는 자리를 잠근다.
//
// 가맹점 피드백(2026-08-21):
//   · 「주문 전체 취소요청 / 고른 상품 취소요청」이 무슨 말인지 되물어 왔다.
//     가맹점이 쓰는 말은 「전체취소요청 / 부분취소요청」이다.
//   · 이 창에는 '판매자 확인 후 환불됩니다' 한 줄뿐이라, 무엇이 취소되고 무엇이 안 되는지를
//     출고 뒤에 눌러 보고서야 알았다. 이용약관처럼 펼쳐볼 수 있어야 한다는 요청.
//
// 안내 본문은 손으로 적지 않는다 — scripts/policy/source/cancel.txt 에서 생성한다.
// 여기서는 '생성물이 원본과 같은가'까지 본다(원본만 고치고 빌드를 안 돌리면 화면은 옛 문구다).

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const btn = 읽기('src/components/elements/shop/OrderCancelButton.js');

// ── 버튼 이름 ─────────────────────────────────────────────────────────────
t('전체취소요청 이라고 쓴다', btn.includes("translate('전체취소요청')"));
t('부분취소요청 이라고 쓴다', btn.includes("translate('부분취소요청')"));
t('되물음이 왔던 옛 문구는 없다',
    !btn.includes('주문 전체 취소요청') && !btn.includes('고른 상품 취소요청'));

// 이름만 바뀌고 동작이 뒤집히면 안 된다 — 아무것도 안 고르면 전체가 요청되던 사고의 재발 방지.
t('고른 게 없으면 부분취소를 못 누른다', btn.includes('줄선택가능 && 고른줄.length === 0'));
t('전체취소는 따로 눌러야 한다', btn.includes('onClick={() => request([])}'));

// ── 취소·반품 안내 ────────────────────────────────────────────────────────
t('취소 창에서 안내를 펼쳐볼 수 있다',
    btn.includes("translate('주문 취소 및 반품 안내')") && btn.includes('openNotice'));
t('안내 본문은 생성물을 쓴다(손으로 적지 않는다)',
    btn.includes("import { CANCEL } from 'src/data/policy-content'") && btn.includes('blocks={CANCEL}'));

// ── 원본 ↔ 생성물 ─────────────────────────────────────────────────────────
const 원본경로 = 'scripts/policy/source/cancel.txt';
t('원본 텍스트가 저장소에 있다', existsSync(FRONT_ROOT + 원본경로));
if (existsSync(FRONT_ROOT + 원본경로)) {
    const 원본 = 읽기(원본경로).replace(/\r\n/g, '\n');
    const 생성 = 읽기('src/data/policy-content.js');
    const i = 생성.indexOf('export const CANCEL = [');
    t('policy-content 에 CANCEL 이 생성돼 있다', i > 0);
    const 조각 = i > 0 ? 생성.slice(i, 생성.indexOf('];', i)) : '';
    // 원본의 모든 문장이 생성물에 그대로 있는가(빌드를 안 돌린 채 원본만 고친 상태를 잡는다)
    const 문장 = 원본.split('\n').map((l) => l.trim())
        .filter((l) => l && l !== '주문 취소 및 반품 안내');
    const 빠진 = 문장.filter((l) => !조각.includes(JSON.stringify(l).slice(1, -1)));
    t('원본 문장이 모두 생성물에 있다', 빠진.length === 0, 빠진.slice(0, 2).join(' / '));
    t('제목 줄은 본문에 넣지 않는다(화면이 그린다)', !조각.includes('"주문 취소 및 반품 안내"'));
}

// ── 약관 화면에서도 열 수 있어야 한다 ─────────────────────────────────────
// 창을 닫고 나서 다시 읽고 싶을 때 갈 곳이 없으면 안 된다.
const page = 읽기('src/pages/shop/auth/policy.js');
t('약관 화면에 취소·반품 안내 종류가 있다', /CANCEL: 4/.test(page) && page.includes("4: '주문 취소 및 반품 안내'"));
t('약관 화면이 CANCEL 블록을 그린다', page.includes('POLICY_TYPE.CANCEL ? CANCEL'));

// 취소 가능 상태는 서버와 같아야 한다(이 값이 어긋나면 눌러 놓고 거절당한다).
//
// 결제대기(0)는 취소요청 대상이 아니다 — 승인되지 않은 주문이라 돌려줄 돈이 없다.
// 여기 0 이 들어가면 결제도 안 된 주문에 취소요청이 쌓이고, 가맹점은 환불할 것도 없는
// 건을 처리해야 한다(2026-08-21 지적). 세 곳이 같은 값을 써야 한다:
//   OrderCancelButton(버튼 노출) · shop/common.js(표의 판정) · 백엔드 cancelRequest(진짜 관문)
t('취소 가능 상태에 결제대기가 없다', btn.includes('const CANCELABLE_STATUS = [5, 10];'));
const 표 = 읽기('src/components/elements/shop/common.js');
t('주문내역 표도 같은 값을 쓴다', 표.includes('const CANCELABLE_STATUS = [5, 10];'));

// ── 배송비 기준은 양쪽 화면에 같이 ──────────────────────────────────────
// 관리자 창에는 있는데 손님 창에는 없었다 — 손님은 취소를 누르기 전에 배송비가 어떻게
// 되는지 알 수 없었다(가맹점 지적 2026-08-21). 두 화면이 같은 말을 해야 한다.
const 관리자창 = 읽기('src/components/manager/PartialCancelDialog.js');
for (const 문구 of ['부분 취소에는 배송비가 환불되지 않습니다', '배송비도 함께 환불됩니다']) {
    t(`손님 창에도 「${문구}」 가 있다`, btn.includes(문구));
    t(`관리자 창에도 「${문구}」 가 있다`, 관리자창.includes(문구));
}
// 금액 계산은 서버가 한다 — 화면이 따로 계산하면 어긋났을 때 어느 쪽이 맞는지 알 수 없다.
t('손님 창이 배송비를 직접 계산하지 않는다', !/환불예상|예상액/.test(btn));

// ── 주문서에서도 미리 읽을 수 있다 ──────────────────────────────────────
const 주문서 = 읽기('src/views/shop/order/OrderSheet.js');
t('주문서에 취소·반품 안내 보기가 있다',
    주문서.includes("translate('주문 취소 및 반품 안내')") && 주문서.includes('POLICY_TYPE.CANCEL'));
t('동의 항목이 아니라 읽을거리로 둔다', !/agree3/.test(주문서));

// 백엔드가 진짜 관문이다. 화면에서 감춰도 옛 화면·직접 호출이 남아 있다.
if (백엔드있음) {
    const 서버 = readFileSync(BACK_ROOT + 'controllers/transaction.controller.js', 'utf8');
    t('서버도 결제대기를 막는다', 서버.includes('const CANCELABLE_STATUS = [5, 10];'));
    t('결제대기는 이유를 따로 알려준다', 서버.includes('아직 결제가 완료되지 않은 주문입니다'));
} else {
    console.log('  (백엔드 저장소가 없어 서버 쪽 검사는 건너뜀)');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
