import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { 칸펼치기 } from './_order-columns.mjs';

// 관리자 주문관리 2026-11-12 가맹점 요청.
//   ① 「구매금액」을 눌러야 상품명이 보였다 → 상품명·수량·금액 칸을 따로, 칸 순서는
//      구매자명 / 상품명 / 수량 / 금액 / 주문번호·승인번호 / 구매시간 / 받는사람 / 주소
//   ② 엑셀 내려받기는 지금 메뉴 조건 그대로였다 → 창에서 기간·상태(여러 개)를 고르거나 체크한 주문만
//      처음엔 지금 메뉴 조건이 채워져 있어 그대로 받으면 예전과 같다.

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };
const eq = (name, got, want) => t(`${name}${JSON.stringify(got) === JSON.stringify(want) ? '' : `\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`}`, JSON.stringify(got) === JSON.stringify(want));

const 화면 = readFileSync(FRONT_ROOT + 'src/pages/manager/orders/trx/[type].js', 'utf8');
const 코드 = 주석제거(화면);
const 공용 = 주석제거(readFileSync(FRONT_ROOT + 'src/components/manager/OrderColumns.js', 'utf8'));

// ① 칸 순서 — 두 화면 모두. 공용 칸 이름을 정의로 펼친 뒤 defaultColumns 안의 label 을 나온 순서대로(조건부 칸 포함)
const 요청순서 = ['구매자명 / 연락처', '상품명', '수량', '금액', '주문번호 / 승인번호', '구매시간', '받는사람 / 연락처', '주소'];
const 칸이름들 = (src) => {
  const 펼침 = 주석제거(칸펼치기(src));
  const 칸 = 펼침.slice(펼침.indexOf('const defaultColumns = ['), 펼침.indexOf('const router = useRouter();'));
  return [...칸.matchAll(/label: [`']([^`']*)[`']/g)].map((m) => m[1]).filter(Boolean);
};
const 이름들 = 칸이름들(화면);
const 취소화면 = readFileSync(FRONT_ROOT + 'src/pages/manager/orders/trx-cancel/[type].js', 'utf8');
const 취소이름들 = 칸이름들(취소화면);
eq('주문관리: 칸 순서가 요청대로(사이에 조건부 칸은 끼어도 된다)', 이름들.filter((n) => 요청순서.includes(n)), 요청순서);
eq('주문취소관리: 같은 칸 순서', 취소이름들.filter((n) => 요청순서.includes(n)), 요청순서);
t('주문관리: 구매자 칸이 번호 바로 다음(옆으로 밀어도 붙어 있는 세 번째 칸)', 이름들.indexOf('구매자명 / 연락처') === 1 && 이름들[0] === '번호');
t('주문취소관리: 구매자 칸이 맨 앞(옆으로 밀어도 붙어 있는 칸)', 취소이름들[0] === '구매자명 / 연락처');
t('두 화면 모두 「구매금액」 펼침 칸이 없다', ![...이름들, ...취소이름들].includes('구매금액') && !/AccordionSummary/.test(주석제거(화면) + 주석제거(취소화면)));
t('두 화면 모두 칸 정의를 공용 파일에서 가져온다', [화면, 취소화면].every((src) => /import \{ 구매자칸, 상품명칸, 수량칸, 금액칸, 주문번호칸, 구매시간칸, 받는사람칸, 주소칸 \} from 'src\/components\/manager\/OrderColumns';/.test(src)));
t('주문관리: 상태·결제타입·이력은 그대로 뒤에 남는다', ['결제타입', '상태', '이력'].every((n) => 이름들.indexOf(n) > 이름들.indexOf('주소')));
t('주문취소관리: 결제타입·취소·이력은 뒤에 남는다', ['결제타입', '취소', '이력'].every((n) => 취소이름들.indexOf(n) > 취소이름들.indexOf('주소')));
t('상품명 칸은 훅을 컴포넌트 안에서 쓴다(action 안에서 useState 금지)', /action: \(row\) => <상품칸 key=\{row\?\.id\} row=\{row\} \/>/.test(공용)
  && /const 상품칸 = \(\{ row \}\) => \{\s*const \[펼침, set펼침\] = useState\(false\);/.test(공용));
t('여러 줄이면 「외 N건 보기」로 펼친다', /외 \$\{줄들\.length - 1\}건 보기/.test(공용));
t('옵션 금액이 상품명 아래에 그대로 보인다(예전 펼침과 같은 표기)', /commarNumber\(option\.option_price\)\}원\)/.test(공용));
t('금액 칸: 결제금액 + 배송비 포함 표시', /\{commarNumber\(row\['amount'\]\)\}원/.test(공용) && /배송비 \{commarNumber\(배송비\)\}원 포함/.test(공용));
t('받는사람은 주소 칸에서 떼어 따로', /export const 받는사람칸 = \{\s*id: 'receiver',\s*label: '받는사람 \/ 연락처'/.test(공용) && !/export const 주소칸[\s\S]{0,400}row\['receiver'\]/.test(공용));
t('주문관리 파일 맨 위 상수들이 그대로(취소요청 강조·상태 이름·일괄·이력주문·입력값묶음)',
  ['const 취소요청강조 =', 'const 상태이름 =', 'const 일괄상태 =', 'const 일괄최대 =', 'const 이력주문 =', 'const 입력값묶음 ='].every((x) => 코드.includes(x)));

// ② 엑셀 창 — 고르는 규칙은 진짜 함수를 돌린다
const 규칙 = await import('file:///' + FRONT_ROOT + 'src/utils/order-excel-filter.js');
const 샵고 = { id: 141, parent_id: 98, payment_modules: [{ type: 'forspay', trx_type: 41 }] };
const 샵고무통장 = { id: 141, parent_id: 98, payment_modules: [{ type: 'virtual_account' }] };
const 그밖 = { id: 34, parent_id: 0 };
const 키 = (dns) => 규칙.엑셀상태목록(dns).map((s) => s.key);
eq('샵고 가맹점 상태 목록(메뉴와 같다: 입고 없음, 입금대기 수단 없으면 결제대기 없음)', 키(샵고), ['5', '15', '20', '25', '1', 'cancelled', 'failed']);
eq('입금대기 수단이 있으면 결제대기(입금확인)', 키(샵고무통장)[0], 'waiting');
eq('그 밖 가맹점 상태 목록', 키(그밖), ['0', '5', '10', '15', '20', '25', '1', 'cancelled', 'failed']);
eq('처음 체크 — 샵고 「전체」 = 결제된 주문 + 취소된 주문(서버 settled 와 같다)', 규칙.메뉴상태('all', 샵고무통장), ['5', '15', '20', '25', '1', 'cancelled']);
eq('처음 체크 — 그 밖 「전체」 = 취소되지 않은 주문 전부', 규칙.메뉴상태('all', 그밖), ['0', '5', '10', '15', '20', '25', '1', 'failed']);
eq('처음 체크 — 상태 메뉴는 그 상태 하나', 규칙.메뉴상태('20', 샵고), ['20']);
eq('처음 체크 — 샵고 결제대기 메뉴는 waiting', 규칙.메뉴상태('0', 샵고무통장), ['waiting']);
eq('처음 체크 — 결제실패/미완료', 규칙.메뉴상태('failed', 샵고), ['failed']);
eq('서버로 가는 조건 — 목록 조건(kind·trx_status)은 싣지 않는다', 규칙.엑셀조건({ s_dt: '2026-11-01', e_dt: '', statuses: ['5', '20'], search: '' }),
  { s_dt: '2026-11-01', e_dt: '', search: '', statuses: '5,20' });
eq('기간 버튼 — 오늘', 규칙.기간범위('today').map(규칙.날글), [규칙.날글(new Date()), 규칙.날글(new Date())]);

const 창 = 주석제거(readFileSync(FRONT_ROOT + 'src/components/manager/OrderExcelDialog.js', 'utf8'));
t('창: 체크한 주문만 받기가 있다', /표에서 체크한 \$\{선택수\}건만 받기/.test(창));
t('창: 받기 전에 건수를 센다(page_size 1 로 total 만)', /page: 1, page_size: 1/.test(창) && /조건에 맞는 주문 \$\{commarNumber\(건수\)\}건/.test(창));
t('창: 상태를 하나도 안 고르면 못 받는다', /상태\.length > 0 && 건수 !== 0/.test(창));
t('창: 개인정보가 담긴다고 알린다', /이름, 연락처, 주소가 그대로 들어갑니다/.test(창));
t('화면: 버튼은 창을 연다, 창은 지금 메뉴 조건으로 시작', /onClick=\{\(\) => set엑셀창\(true\)\}/.test(코드) && /statuses: 메뉴상태\(router\.query\?\.type, themeDnsData\)/.test(코드));
t('화면: 체크한 줄만 받을 때는 지금 목록에서 고른다', /모은것 = \(data\?\.content \?\? \[\]\)\.filter\(\(r\) => 선택\.includes\(r\?\.id\)\);/.test(코드));
t('화면: 결제실패를 넣어 받으면 실패 사유 열', /split\(','\)\.includes\('failed'\)/.test(코드));

// 메뉴와 엑셀 창이 같은 판정을 쓴다
const 메뉴 = readFileSync(FRONT_ROOT + 'src/layouts/manager/nav/config-navigation.js', 'utf8');
t('입금대기 수단 판정은 한 곳(order-menu.js)', /import \{ 입금대기수단있음 \} from 'src\/utils\/order-menu';/.test(메뉴) && !/const 입금대기수단있음 =/.test(메뉴));

// 서버 — 상태 열쇠가 화면과 같고, 관리자 화면에서만 쓴다
if (백엔드있음) {
  const 서버 = 주석제거(readFileSync(BACK_ROOT + 'controllers/transaction.controller.js', 'utf8'));
  const 서버키 = [...서버.slice(서버.indexOf('export const 엑셀상태조건 = {'), 서버.indexOf('export const 엑셀상태읽기')).matchAll(/^\s+'?([a-z0-9]+)'?:/gm)].map((m) => m[1]);
  eq('서버 상태 열쇠 = 화면 상태 열쇠 전부', [...new Set(서버키)].sort(), [...new Set([...키(그밖), ...키(샵고무통장)])].sort());
  t('서버: 손님 화면에서는 statuses 를 안 본다', /const 엑셀상태 = 손님화면 \? null : 엑셀상태읽기\(req\.query\.statuses\);/.test(서버));
  t('서버: 아는 상태가 없으면 아무것도 안 준다(조건이 빠져 전부 나가지 않게)', /: ` AND 1=0 `;/.test(서버));
  t('서버: statuses 가 오면 목록 조건(kind·cancel_status)을 건너뛴다', /if \(엑셀상태\) \{[\s\S]{0,300}\} else if \(kind === 'failed'\)/.test(서버)
    && /if \(is_confirm && !엑셀상태\)/.test(서버) && /if \(엑셀상태\) \{\s*\} else if \(kind === 'settled' \|\| type == 'user'\)/.test(서버));
  t('서버: 결제실패를 넣어 받으면 실패 사유를 붙인다', /\(kind === 'failed' \|\| 엑셀상태\?\.includes\('failed'\)\)/.test(서버));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
