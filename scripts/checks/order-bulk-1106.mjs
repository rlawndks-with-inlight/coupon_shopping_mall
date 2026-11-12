import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { 칸펼치기 } from './_order-columns.mjs'; // 공용 칸(OrderColumns.js)을 화면 소스에 펼쳐 넣는다(2026-11-12)

// 주문 목록 — 번호·일괄 상태 변경·상태 변경 확인 창(가맹점 요청 2026-11-06, 사장님 선택)
//   번호: 게시판식 역순 / 일괄: 모든 탭에서 상태를 골라 적용(체크한 주문만) / 확인 창: 모든 상태 변경

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 목록 = 칸펼치기(읽기(FRONT_ROOT, 'src/pages/manager/orders/trx/[type].js'));
const 표 = 읽기(FRONT_ROOT, 'src/views/manager/mui/table/ManagerTable.js');

// 번호
{
  const 식 = 목록.match(/const 번호 = ([^\n]*);/);
  const 셈 = 식 && new Function('data', '줄', 'searchObj', `return ${식[1]};`);
  t('번호: 역순 — 총 87건 1쪽 맨 위 87, 2쪽 맨 위 77', !!셈 && 셈({ total: 87 }, 0, { page: 1, page_size: 10 }) === 87 && 셈({ total: 87 }, 0, { page: 2, page_size: 10 }) === 77 && 셈({ total: 87 }, 9, { page: 1, page_size: 10 }) === 78);
  t('번호: 새 주문이 들어와도 기존 주문 번호는 그대로(총 +1, 줄 +1)', !!셈 && 셈({ total: 87 }, 3, { page: 1, page_size: 10 }) === 셈({ total: 88 }, 4, { page: 1, page_size: 10 }));
}
t('번호·체크칸이 맨 앞', 목록.indexOf("id: 'select'") < 목록.indexOf("id: 'no'") && 목록.indexOf("id: 'no'") < 목록.indexOf("id: 'buyer_name'"));

// 확인 창(한 건)
t('한 건 변경: 바로 저장하지 않고 확인 창에서 「확인」일 때만', /setModal\(\{\s*func: \(\) => \{ onChangeStatus\(row\?\.id, 새값\) \},[\s\S]{0,120}title: '주문 상태를 바꿀까요\?'/.test(목록) && !/onChange=\{\(e\) => \{\s*onChangeStatus\(row\?\.id, e\.target\.value\);/.test(목록));
t('한 건 변경: 드롭다운은 저장된 값 그대로(취소하면 안 바뀜)', /value=\{row\?\.trx_status\}/.test(목록) && !/defaultValue=\{row\?\.trx_status\}/.test(목록));
t('한 건 변경: 같은 상태를 고르면 아무 일도 안 한다', /if \(새값 === Number\(row\?\.trx_status\)\) return;/.test(목록));

// 일괄
t('일괄: 고를 수 있는 상태는 결제완료·입고·출고·배송중·배송완료(취소요청·결제대기 없음)', /const 일괄상태 = \[5, 10, 15, 20, 25\];/.test(목록));
t('일괄: 취소요청·취소·결제 안 된 줄은 체크칸이 잠긴다', /const 일괄가능 = \(row\) => 바꿀수있음\(row\) && Number\(row\?\.trx_status\) !== 1;/.test(목록) && /disabled=\{!일괄가능\(row\)\}/.test(목록));
t('일괄: 결제실패/미완료 목록에는 체크칸·일괄 막대가 없다', /\.\.\.\(실패목록 \? \[\] : \[\{\s*id: 'select'/.test(목록) && /\{!실패목록 && \(\(\) => \{/.test(목록));
t('일괄: 「이 화면 전체 선택」은 지금 화면에서 고를 수 있는 줄만', /const 보이는 = \(data\?\.content \?\? \[\]\)\.filter\(일괄가능\)\.map\(\(r\) => r\.id\);/.test(목록));
t('일괄: 확인 창을 거친다', /func: onBulkStatus,[\s\S]{0,120}title: `선택한 \$\{선택\.length\}건의 상태를 바꿀까요\?`/.test(목록));
t('일괄: 목록이 바뀌면 체크를 비운다', /useEffect\(\(\) => \{ set선택\(\[\]\); \}, \[data\?\.content\]\);/.test(목록));
t('일괄: 건너뛴 건수·사유를 알려 준다', /건 변경, \$\{건너뜀\.length\}건 건너뜀/.test(목록));
t('일괄: 샵고 가맹점에는 입고완료를 안 보인다', /일괄상태\.filter\(\(v\) => v !== 10 \|\| !isShopgoMerchant\(themeDnsData\)\)/.test(목록));

// 표: 줄이 바뀐 열 정의(체크 상태)를 다시 그린다
t('표: 줄 그리기가 columns 도 본다(체크 표시가 안 바뀌던 문제)', /\}, \[contentList, columns\]\)/.test(표));

if (!백엔드있음) {
  console.log('  (백엔드 없음 — 서버 검사 건너뜀)');
} else {
  const 유틸 = 읽기(BACK_ROOT, 'controllers/util.controller.js');
  const 라우트 = 읽기(BACK_ROOT, 'routes/util.route.js');
  const 일괄 = 유틸.slice(유틸.indexOf('changeTrxStatusBulk: async'), 유틸.indexOf('unipass: async'));
  const 한건 = 유틸.slice(유틸.indexOf('changeStatus: async'), 유틸.indexOf('changeTrxStatusBulk: async'));
  t('라우트: POST /util/transactions/trx_status/bulk (/:table/:column_name 보다 먼저)', 라우트.indexOf("/transactions/trx_status/bulk") > 0 && 라우트.indexOf("/transactions/trx_status/bulk") < 라우트.indexOf("'/:table/:column_name'"));
  t('한 건·일괄이 같은 규칙(주문상태검사)', /await 주문상태검사\(\{ id, value, decode_user, scope \}\)/.test(한건) && /await 주문상태검사\(\{ id, value, decode_user, scope \}\)/.test(일괄));
  t('규칙: 결제대기·취소완료·결제실패·포스페이 미승인 거부(본사 예외 유지)', /결제대기로는 되돌릴 수 없습니다/.test(유틸) && /취소 완료된 주문은 상태를 바꿀 수 없습니다/.test(유틸) && /이전상태 === 0 && Number\(이전\.trx_method\) === 41 && Number\(decode_user\?\.level\) < 50/.test(유틸));
  t('일괄: 상태 목록·100건 상한·빈 선택 거부', /const 일괄상태 = \[5, 10, 15, 20, 25\];/.test(유틸) && /ids\.length > 일괄최대/.test(일괄) && /if \(!ids\.length\) return response/.test(일괄));
  t('일괄: 자기 몰 주문만(테넌트 범위)', /buildTenantScope\('transactions', decode_dns\?\.id \?\? 0\)/.test(일괄) && /\$\{scope\.sql\}`,\s*\[value, id, 검사\.이전상태, \.\.\.scope\.params\]/.test(일괄));
  t('일괄: 읽은 상태 그대로일 때만 바꾼다(그 사이 바뀐 건 건너뜀)', /WHERE id=\? AND trx_status=\? AND IFNULL\(is_cancel,0\)=0/.test(일괄) && /그 사이 상태가 바뀌었습니다/.test(일괄));
  t('일괄: 취소요청 주문은 건너뛴다', /if \(검사\.이전상태 === 1\) \{ 건너뜀\.push/.test(일괄));
  t('일괄: 이력은 주문마다 「(일괄)」', /note: `\$\{statusText\(검사\.이전상태\)\} → \$\{statusText\(value\)\} \(일괄\)`/.test(일괄));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
