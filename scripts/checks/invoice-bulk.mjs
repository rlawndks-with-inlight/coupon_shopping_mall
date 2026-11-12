import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';

// 2026-11-12
//   ① 송장 엑셀 등록(가맹점 요청 「엑셀에도 송장번호를 입력할 수 있게」)
//      내려받은 주문 엑셀의 「송장번호」 칸에 번호를 적어 올리면 주문번호로 찾아 한 번에 저장한다.
//      미리 확인(저장 안 함) → 「N건 저장」. 판정 규칙은 서버 utils.js/invoice-bulk.js 하나 — 여기서 진짜 함수를 돌린다.
//   ② 엑셀 내려받기 기록(사장님 요청) — 남기기는 관리자 누구나, 보기는 최상위 관리자(level 50)만.

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };
const eq = (name, got, want) => t(`${name}${JSON.stringify(got) === JSON.stringify(want) ? '' : `\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`}`, JSON.stringify(got) === JSON.stringify(want));
const 읽기 = (root, p) => readFileSync(root + p, 'utf8');

// ── 화면: 엑셀 읽기(진짜 함수) ─────────────────────────────────────────────
const { 송장엑셀읽기 } = await import('file:///' + FRONT_ROOT + 'src/utils/invoice-excel.js');
{
  const 표 = [
    ['주문번호', '승인번호', '구매자명', '송장번호'],
    ['FS1', '1', '김', 'CJ대한통운-640012345678'],   // 내려받은 그대로(이미 있던 송장)
    ['FS2', '2', '이', 640012345679],               // 엑셀 숫자 칸
    ['FS3', '3', '박', ''],                         // 송장 안 적음
    ['', '', '', ''],                               // 빈 줄
    ['FS4', '4', '최', ' 6012-3456-7890 '],
  ];
  const r = 송장엑셀읽기(표);
  eq('읽기: 송장 칸이 있는 줄만, 엑셀 줄 번호와 함께', r.줄들.map((x) => [x.row, x.ord_num, x.invoice]), [[2, 'FS1', 'CJ대한통운-640012345678'], [3, 'FS2', '640012345679'], [6, 'FS4', '6012-3456-7890']]);
  eq('읽기: 송장 칸이 빈 주문은 세기만', r.빈칸, 1);
  eq('읽기: 「택배사」 칸을 만들어 적으면 읽는다', 송장엑셀읽기([['주문번호', '택배사', '송장번호'], ['FS1', '롯데택배', '123456789']]).줄들[0].courier, '롯데택배');
  eq('읽기: 위에 제목 줄이 있어도 머리줄을 찾는다', 송장엑셀읽기([['우리 몰 발송'], ['주문번호', '송장번호'], ['FS1', '123456']]).줄들[0].row, 3);
  t('읽기: 머리줄이 없으면 알린다', !!송장엑셀읽기([['아무거나'], ['1', '2']]).오류);
  eq('읽기: 너무 큰 숫자는 지수 모양 그대로 넘겨 서버가 거절하게', 송장엑셀읽기([['주문번호', '송장번호'], ['FS1', 6.4001234567891e21]]).줄들[0].invoice, '6.4001234567891e+21');
}

// ── 서버 판정(진짜 함수) ──────────────────────────────────────────────────
if (백엔드있음) {
  const 규칙 = await import('file:///' + BACK_ROOT + 'utils.js/invoice-bulk.js');
  const { COURIER_LIST } = await import('file:///' + FRONT_ROOT + 'src/data/couriers.js');
  eq('택배사 목록: 서버와 화면이 같다', 규칙.택배사목록, COURIER_LIST);
  const 정 = (invoice, courier, 기본 = '우체국택배') => 규칙.송장정리({ invoice, courier }, 기본);
  eq('정리: 번호만 → 기본 택배사', 정('640012345678').값, '우체국택배-640012345678');
  eq('정리: 기본 택배사가 없으면 번호만', 정('640012345678', '', '').값, '640012345678');
  eq('정리: 알려진 택배사가 앞에 붙어 있으면 그대로', 정('롯데택배-123456789').값, '롯데택배-123456789');
  eq('정리: 「택배사」 칸 값이 기본보다 먼저', 정('123456789', '한진택배').값, '한진택배-123456789');
  eq('정리: 줄표가 든 번호는 번호로', 정('6012-3456-7890').값, '우체국택배-6012-3456-7890');
  t('정리: 모르는 택배사 이름(CJ택배-…)은 거절', !!정('CJ택배-123456').오류);
  t('정리: 「택배사」 칸에 모르는 이름이면 거절', !!정('123456', '쿠팡택배').오류);
  t('정리: 엑셀이 지수로 바꾼 번호는 거절(뒷자리가 이미 사라졌다)', /E\+/.test(정('6.40012E+11').오류 ?? '') && !!정('6.4001234567891e+21').오류);
  t('정리: 한 칸에 여러 송장(쉼표)은 거절', !!정('111111,222222').오류);
  t('정리: 너무 짧은 번호는 거절', !!정('1234').오류);
  t('정리: 빈 칸', 정('  ').빈칸 === true);

  const 주문 = new Map([
    ['A1', { id: 1, invoice_num: '', trx_status: 5, is_cancel_trans: 0 }],
    ['A2', { id: 2, invoice_num: '우체국택배-111111', trx_status: 20, is_cancel_trans: 0 }],
    ['A3', { id: 3, invoice_num: '', trx_status: 1, is_cancel_trans: 0 }],
    ['A4', { id: 4, invoice_num: 'CJ대한통운-444444', trx_status: 5, is_cancel_trans: 1 }],
    ['A5', { id: 5, invoice_num: '', trx_status: 0, is_cancel_trans: 0 }],
    ['A6', { id: 6, invoice_num: '', trx_status: 15, is_cancel_trans: 0 }],
  ]);
  const 판 = 규칙.일괄판정([
    { row: 2, ord_num: 'A1', invoice: '640012345678' },
    { row: 3, ord_num: 'A2', invoice: '222222' },
    { row: 4, ord_num: 'A3', invoice: '333333' },
    { row: 5, ord_num: 'A4', invoice: 'CJ대한통운-444444' },
    { row: 6, ord_num: 'A4', invoice: '' },
    { row: 7, ord_num: 'A5', invoice: '555555' },
    { row: 8, ord_num: 'ZZ', invoice: '666666' },
    { row: 9, ord_num: 'A6', invoice: '777777' },
    { row: 10, ord_num: 'A6', invoice: '888888' },
    { row: 11, ord_num: '', invoice: '999999' },
  ], 주문, '우체국택배');
  const 줄 = (n) => 판.결과.find((x) => x.줄 === n);
  eq('판정: 새로 등록', [줄(2).결과, 줄(2).새값], ['등록', '우체국택배-640012345678']);
  eq('판정: 이미 있던 송장이 바뀌면 「변경」(이전 값과 함께)', [줄(3).결과, 줄(3).이전, 줄(3).새값], ['변경', '우체국택배-111111', '우체국택배-222222']);
  eq('판정: 취소요청 중인 주문은 저장 안 함', 줄(4).결과, '오류');
  eq('판정: 내려받은 그대로 다시 올린 줄은 취소된 주문이어도 「같음」(오류로 쏟아지지 않게)', 줄(5).결과, '같음');
  eq('판정: 결제가 끝나지 않은 주문은 저장 안 함', 줄(7).결과, '오류');
  eq('판정: 이 몰 주문이 아니면 저장 안 함', 줄(8).결과, '오류');
  eq('판정: 같은 주문에 다른 송장 두 줄이면 둘 다 저장 안 함', [줄(9).결과, 줄(10).결과], ['오류', '오류']);
  eq('판정: 주문번호 없이 송장만 있으면 저장 안 함', 줄(11).결과, '오류');
  eq('판정: 요약', 판.요약, { 등록: 1, 변경: 1, 같음: 1, 오류: 6, 빈칸: 1 });
  t('판정: 저장할 줄에만 주문 id 가 붙는다', 판.결과.filter((x) => x.id).every((x) => ['등록', '변경', '같음'].includes(x.결과)));

  const 서버 = 주석제거(읽기(BACK_ROOT, 'controllers/transaction.controller.js'));
  const 길 = 주석제거(읽기(BACK_ROOT, 'routes/transaction.route.js'));
  t('서버: 관리자(40 이상)·자기 몰만', /invoiceBulk: async[\s\S]{0,200}checkLevel\(req\.cookies\.token, 40, res\)[\s\S]{0,300}canWriteBrand\(decode_user, brand_id\)/.test(서버));
  t('서버: 미리 확인이 기본(apply 를 줘야 저장)', /const 저장 = req\.body\?\.apply === true \|\| req\.body\?\.apply === 1 \|\| req\.body\?\.apply === '1';/.test(서버));
  t('서버: 원주문 줄만(취소 원장 줄 제외), 자기 몰 조건으로 저장', /WHERE brand_id=\? AND is_cancel=0 AND is_delete=0 AND ord_num IN \(\?\)/.test(서버) && /UPDATE \$\{table_name\} SET invoice_num=\? WHERE id=\? AND brand_id=\?/.test(서버));
  t('서버: 저장한 주문마다 이력에 「(엑셀)」', /송장 변경\(엑셀\)/.test(서버) && /송장 입력\(엑셀\)/.test(서버));
  t('서버: 1,000줄 제한', /rows\.length > 최대줄/.test(서버) && 규칙.최대줄 === 1000);
  t('서버: /invoice-bulk 길이 /:id 보다 먼저', 길.indexOf("'/invoice-bulk'") > 0 && 길.indexOf("'/invoice-bulk'") < 길.indexOf("'/:id'"));

  // ② 내려받기 기록
  const 기록 = 주석제거(읽기(BACK_ROOT, 'controllers/excel_log.controller.js'));
  t('기록 보기: 최상위 관리자(50)만', /list: async[\s\S]{0,120}checkLevel\(req\.cookies\.token, 50, res\)/.test(기록));
  t('기록 남기기: 사람은 토큰으로(화면이 보낸 이름은 안 씀), 자기 몰만', /decode_user\.user_name/.test(기록) && !/req\.body\?\.user_name/.test(기록) && /canWriteBrand\(decode_user, brand_id\)/.test(기록));
  t('기록: 검색어 내용은 남기지 않는다(썼는지만)', /search: Boolean\(/.test(기록));
  t('기록: 테이블 마이그레이션이 있다', /CREATE TABLE IF NOT EXISTS excel_download_logs/.test(읽기(BACK_ROOT, 'migrations/2026-11-12_excel_download_logs.sql')));
  t('기록: 길 등록', /router\.use\("\/excel-logs", excelLogRoutes\);/.test(읽기(BACK_ROOT, 'routes/index.js')));
}

// ── 화면 배선 ────────────────────────────────────────────────────────────
const 목록 = 주석제거(읽기(FRONT_ROOT, 'src/pages/manager/orders/trx/[type].js'));
const 창 = 주석제거(읽기(FRONT_ROOT, 'src/components/manager/InvoiceExcelDialog.js'));
const 메뉴 = 읽기(FRONT_ROOT, 'src/layouts/manager/nav/config-navigation.js');
const 기록화면 = 주석제거(읽기(FRONT_ROOT, 'src/pages/manager/orders/excel-logs.js'));
// 2026-11-12 사장님 결정: 송장 엑셀 등록은 보류(운영 검증 뒤 다시). 단추·창만 감추고 서버·창 코드는 남긴다.
t('주문관리: 「송장 엑셀 등록」은 보류 중이라 감춘다(켜면 관리자 40 이상, 결제실패 목록엔 없음)',
  /export const 송장엑셀사용 = false;/.test(창) && /\{송장엑셀사용 && !실패목록 && Number\(user\?\.level\) >= 40 &&\s*<Button[^>]*onClick=\{\(\) => set송장창\(true\)\}/.test(목록)
  && /\{송장엑셀사용 && <InvoiceExcelDialog/.test(목록));
t('이용가이드: 보류 중에는 송장 엑셀 등록을 안내하지 않는다', !/송장 엑셀/.test(읽기(FRONT_ROOT, 'src/components/manager/guideContent.js')));
t('송장 창: JSON 으로 보낸다(multipart 는 필드 500개 제한)', /axios\.post\('\/api\/transactions\/invoice-bulk', \{ rows, apply: apply \? 1 : 0 \}\)/.test(창));
t('송장 창: 미리 확인 뒤 「N건 저장」, 바뀌는 줄은 경고', /\$\{commarNumber\(저장할수\)\}건 저장/.test(창) && /새 번호로 바뀝니다/.test(창));
t('주문관리: 내려받은 뒤 기록을 남긴다(실패해도 조용히)', /axios\.post\('\/api\/excel-logs', \{ kind: 'orders'[\s\S]{0,160}\}\)\.catch\(\(\) => \{\}\);/.test(목록));
t('메뉴: 「엑셀 내려받기 기록」은 최상위 관리자에게만', 메뉴.includes("...(Number(user?.level) >= 50 ? [{ title: '엑셀 내려받기 기록', path: '/manager/orders/excel-logs' }] : []),"));
t('기록 화면: 최상위 관리자가 아니면 목록을 부르지 않는다', /if \(!최상위\) return;/.test(기록화면) && /최상위 관리자만 볼 수 있는 화면입니다/.test(기록화면));
t('엑셀 창: 기록이 남는다고 알린다', /내려받으면 받은 사람과 시각, 건수가 기록됩니다/.test(읽기(FRONT_ROOT, 'src/components/manager/OrderExcelDialog.js')));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
