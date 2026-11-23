import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 관리자 메뉴 「결제완료」「취소요청」 옆 건수(해담수산 요청 2026-11-23).
//   그 상태에 남은 주문 수를 띄우고, 다른 상태로 옮기면 줄어 0이면 사라진다.
//   ① 숫자 = 그 메뉴를 기간·검색 없이 열었을 때의 줄 수(목록과 같은 범위·같은 조건)
//   ② 상위 메뉴(주문관리·주문취소관리)는 접혀 있을 때만 숫자 — 펼치면 하위 칸이 제 숫자를 보인다
//   ③ 주문을 바꾸는 요청이 성공하면 바로 다시 받는다(그 밖엔 1분마다·탭 복귀·페이지 이동)

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// ── 프론트: 숫자 받기 ─────────────────────────────────────────────────────
const 건수 = 읽기(FRONT_ROOT, 'src/utils/order-menu-counts.js');
t('① 조용히 받는다(공용 get() 은 실패 때 알림을 띄운다)', /axios\.get\('\/api\/transactions\/menu-counts'\)/.test(건수) && !/from '\.\/api'/.test(건수));
t('③ 1분마다·탭 복귀·페이지 이동·주문 바뀜', /const 주기 = 60 \* 1000;/.test(건수) && /addEventListener\('visibilitychange', 탭으로돌아옴\)/.test(건수)
  && /Router\.events\.on\('routeChangeComplete', 페이지옮김\)/.test(건수) && /window\.addEventListener\(신호, 주문바뀜\)/.test(건수));
t('③ 숨은 탭에서는 1분 주기로 묻지 않는다', /if \(!바로 && \(!보는중\(\) \|\| Date\.now\(\) - 마지막 < 최소간격\)\) return null;/.test(건수));
t('③ 받는 도중 주문이 바뀌면 끝난 뒤 한 번 더', /if \(진행중\) \{ if \(바로\) 다시 = true; return 진행중; \}/.test(건수) && /if \(다시\) \{ 다시 = false; 받기\(true\); \}/.test(건수));
t('메뉴가 모두 사라지면 타이머·듣기를 거둔다', /if \(듣는것\.size === 0\) 멈춤\(\);/.test(건수) && /clearInterval\(타이머\)/.test(건수)
  && /Router\.events\.off\('routeChangeComplete', 페이지옮김\)/.test(건수));

// 주문을 바꾸는 주소 — 실제로 관리자 화면이 부르는 주소로 맞춰 본다
const 주소식 = new Function(`${건수.match(/const 주문바꾸는주소 = .+;/)[0]}\nreturn 주문바꾸는주소;`)();
const 바꾸는것 = ['/api/transactions/123', '/api/transactions/123/invoice', '/api/transactions/9/cancel-request/reject', '/api/pays/cancel', '/api/pays/cancel-partial/9',
  '/api/util/transactions/trx_status', '/api/util/transactions/trx_status/bulk', '/api/transactions'];
const 아닌것 = ['/api/transactions-x', '/api/pays/forspay/confirm', '/api/products/1', '/api/excel-logs', '/api/util/products/status', '/api/transactions/menu-counts?x'];
t('③ 주문 바꾸는 주소만 신호', 바꾸는것.every((u) => 주소식.test(u)) && 아닌것.slice(0, 5).every((u) => !주소식.test(u)));
const 글자 = new Function(`${건수.match(/export const 건수글자 = .+;/)[0].replace('export ', '')}\nreturn 건수글자;`)();
t('100 이상은 99+', 글자(1) === '1' && 글자(99) === '99' && 글자(100) === '99+' && 글자(2500) === '99+');

const api = 읽기(FRONT_ROOT, 'src/utils/api.js');
t('③ 공용 post·put·delete 성공 때 신호', (api.match(/if \(response\?\.result > 0\) \{\n\s*주문건수바뀜\(url\);/g) ?? []).length === 3);

// ── 프론트: 메뉴 ──────────────────────────────────────────────────────────
const 메뉴 = 읽기(FRONT_ROOT, 'src/layouts/manager/nav/config-navigation.js');
const 모양 = 읽기(FRONT_ROOT, 'src/layouts/manager/nav/MenuCount.js');
t('관리자만, 본사 화면 빼고 묻는다', /useOrderMenuCounts\(Number\(user\?\.level\) >= 10 && Number\(themeDnsData\?\.id\) > 0 && Number\(themeDnsData\?\.id\) !== SHOPGO_MASTER_ID\)/.test(메뉴));
t('훅은 조기 return 앞(원래 훅들과 같은 자리)', 메뉴.indexOf('useOrderMenuCounts(') < 메뉴.indexOf('if (!isSettingComplete)') && 메뉴.indexOf('useOrderMenuCounts(') < 메뉴.indexOf('useEffect('));
t('결제완료·취소요청 칸에 숫자', /\{ title: '결제완료', path: PATH_MANAGER\.orders\.trx \+ '\/5', info: 메뉴건수\(결제완료수, `결제완료 \$\{결제완료수\}건`\) \}/.test(메뉴)
  && /\{ title: '취소요청', path: PATH_MANAGER\.orders\.trxCancel \+ '\/1', info: 메뉴건수\(취소요청수, `취소요청 \$\{취소요청수\}건`\) \}/.test(메뉴));
t('② 상위 메뉴는 infoClosed(접혔을 때만)', (메뉴.match(/infoClosed: 메뉴건수\(/g) ?? []).length === 3
  && /infoClosed: 메뉴건수\(결제완료수 \+ 취소요청수,/.test(메뉴) && /infoClosed: 메뉴건수\(취소요청수,/.test(메뉴));
t('0이면 아무것도 안 붙인다', /if \(!수\) return null;/.test(모양) && /bgcolor: 'error\.main'/.test(모양) && /aria-label=\{이름\}/.test(모양));

const 세로 = 읽기(FRONT_ROOT, 'src/components/nav-section/vertical/NavItem.js');
const 가로 = 읽기(FRONT_ROOT, 'src/components/nav-section/horizontal/NavItem.js');
const 접힌 = 읽기(FRONT_ROOT, 'src/components/nav-section/mini/NavItem.js');
t('② 세로·가로 메뉴: 펼치면 상위 숫자 숨김', [세로, 가로].every((s) => /const 표시 = info \|\| \(!!children && !open \? item\.infoClosed : null\);/.test(s) && /\{표시 && \(/.test(s) && !/\{info && \(/.test(s)));
t('② 아이콘 메뉴: 맨 위 칸은 늘, 하위 칸은 세로와 같은 규칙',
  /const 표시 = subItem \? \(info \|\| \(!!children && !open \? item\.infoClosed : null\)\) : \(info \|\| item\.infoClosed \|\| null\);/.test(접힌) && /position: 'absolute', top: 0, left: 'calc\(50% \+ 2px\)'/.test(접힌));

// ── 백엔드 ───────────────────────────────────────────────────────────────
if (!백엔드있음) {
  console.log('  (백엔드 저장소 없음 — 서버 쪽 검사 건너뜀)');
} else {
  const 길 = 읽기(BACK_ROOT, 'routes/transaction.route.js');
  const 주문 = 읽기(BACK_ROOT, 'controllers/transaction.controller.js');
  t('주소가 /:id 보다 위', 길.indexOf(".route('/menu-counts')") > 0 && 길.indexOf(".route('/menu-counts')") < 길.indexOf(".route('/:id')") && /\.get\(transactionCtrl\.menuCounts\)/.test(길));
  t('① 목록과 메뉴 건수가 같은 범위 함수', /const 범위 = 주문범위\(decode_user, decode_dns, type\);\n\s*sql \+= ` WHERE \$\{범위\.sql\} `;\n\s*let params = \[\.\.\.범위\.params\];/.test(주문)
    && /const 범위 = 주문범위\(decode_user, decode_dns\);/.test(주문));
  t('① 범위: 영업자(15)·셀러몰 주소·셀러(10)', /seller_id IN \(SELECT id FROM users WHERE oper_id=\?\)/.test(주문) && /if \(decode_dns\?\.seller_id > 0\)/.test(주문)
    && /else if \(decode_user\?\.level == 10 && type != 'user'\)/.test(주문) && (주문.match(/SELECT id FROM users WHERE oper_id=\?/g) ?? []).length === 1);
  t('관리자(10 이상)만', /const decode_user = checkLevel\(req\.cookies\?\.token, 10\);\n\s*const decode_dns = checkDns\(req\.cookies\.dns\);\n\s*if \(!decode_user \|\| !decode_dns\) return lowLevelException\(req, res\);/.test(주문));
  t('① 살아 있는 주문만(취소·삭제 제외)', /is_cancel=0 AND \$\{table_name\}\.is_cancel_trans=0 AND \$\{table_name\}\.is_delete=0 `;/.test(주문));
  t('① 결제완료 = 상태 5', /SELECT COUNT\(\*\) AS n \$\{살아있는\} AND \$\{table_name\}\.trx_status=5`/.test(주문));
  t('① 취소요청 = 상태 1 + 일부 상품만 요청한 주문(목록 cancel_status=1 과 같게)', /const 대기식 = 주문목록식\(await 요청대기주문\(decode_dns\?\.id\), table_name\);\n\s*const \[\[\[결제완료\]\], \[\[취소요청\]\]\]/.test(주문)
    && /AND \(\$\{table_name\}\.trx_status=1\$\{대기식 \? ` OR \$\{대기식\}` : ''\}\)`/.test(주문));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
