import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';

// 제주·도서산간 추가배송비(사장님 결정 2026-11-12).
//   · 몰마다 지역(제주 / 제주 외 도서산간)별 「추가비 없음(기본) · 추가비 받기 · 배송 안 함」, 무료배송이어도 붙고 주문당 한 번.
//   · 지역 기준 = SHOPGO 기준표(공개 기준표 두 곳이 함께 섬으로 본 번호 − 공정위 연륙도서) + 몰이 직접 고친 규칙.
//   · 확실하지 않으면 받지 않는다.
// 붙잡아 두는 것:
//   ① 화면과 서버가 같은 파일로 판정한다(다르면 「결제금액이 변경되었습니다」로 결제가 막힌다)
//   ② 설정 안 한 몰은 어떤 주소든 0원 — 도입해도 기존 몰 결제는 그대로
//   ③ 기준표에 공정위 연륙도서 번호가 섞이지 않는다
//   ④ 부분취소의 「원래 무료배송이었나」 판정이 추가배송비 때문에 틀어지지 않는다

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };
const eq = (name, got, want) => t(`${name}${JSON.stringify(got) === JSON.stringify(want) ? '' : `\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`}`, JSON.stringify(got) === JSON.stringify(want));
const 읽기 = (root, p) => readFileSync(root + p, 'utf8').replace(/\r/g, '');

// ① 같은 파일
if (백엔드있음) {
  t('판정 파일이 화면·서버 똑같다(island-fee.js)', 읽기(FRONT_ROOT, 'src/utils/island-fee.js') === 읽기(BACK_ROOT, 'utils.js/island-fee.js'));
  t('기준표 파일이 화면·서버 똑같다(island-zips.js)', 읽기(FRONT_ROOT, 'src/utils/island-zips.js') === 읽기(BACK_ROOT, 'utils.js/island-zips.js'));
}

const f = await import('file:///' + FRONT_ROOT + 'src/utils/island-fee.js');
const z = await import('file:///' + FRONT_ROOT + 'src/utils/island-zips.js');

// ③ 기준표
t('기준표: 모두 우편번호 5자리, 겹침 없음', [...z.도서산간, ...z.제주섬].every((x) => /^\d{5}$/.test(x)) && new Set(z.도서산간).size === z.도서산간.length);
eq('기준표: 공정위 연륙도서 번호가 하나도 없다', z.도서산간.filter((x) => z.연륙도서.includes(x)), []);
eq('기준표: 제주 안의 섬(추자·우도·가파)', z.제주섬, ['63000', '63001', '63365', '63514', '63515']);
t('기준표: 공정위 붙임1 번호(예: 군산 옥도 54000, 보령 원산도 33411, 무의도 22386)', ['54000', '33411', '22386', '23004', '58820'].every((x) => z.연륙도서.includes(x)));
t(`기준표: 기준일이 있다(${z.기준일})`, /^\d{4}-\d{2}-\d{2}$/.test(z.기준일));

// ② 설정 안 한 몰
const 주소들 = [
  { zonecode: '04524', addr: '서울 중구 세종대로 110' },
  { zonecode: '63309', addr: '제주특별자치도 제주시 연동' },
  { zonecode: '63365', addr: '제주특별자치도 제주시 우도면' },
  { zonecode: '40200', addr: '경북 울릉군 울릉읍' },
];
t('설정 안 한 몰은 어떤 주소든 0원·막지 않음', 주소들.every((a) => { const r = f.추가배송비(a, {}); return r.fee === 0 && !r.blocked; }));
t('잘못 저장된 설정(금액 문자·음수·모르는 방식)도 0원', 주소들.every((a) => { const r = f.추가배송비(a, { island_fee: { jeju: { mode: 'charge', amount: '-5' }, island: { mode: 'free' } } }); return r.fee === 0 && !r.blocked; }));

// 판정
const 설정 = { island_fee: { jeju: { mode: 'charge', amount: 3000 }, island: { mode: 'charge', amount: 5000 }, rules: [] } };
const 판 = (a) => f.추가배송비(a, 설정);
eq('서울 → 일반 0원', 판({ zonecode: '04524', addr: '서울 중구 세종대로 110' }), { region: 'normal', fee: 0, blocked: false });
eq('제주시 → 제주 3,000원', 판({ zonecode: '63309', addr: '제주특별자치도 제주시 연동' }), { region: 'jeju', fee: 3000, blocked: false });
eq('우도 → 제주 외 도서산간 5,000원', 판({ zonecode: '63365', addr: '제주특별자치도 제주시 우도면' }), { region: 'island', fee: 5000, blocked: false });
eq('울릉 → 도서산간 5,000원', 판({ zonecode: '40200', addr: '경북 울릉군 울릉읍' }), { region: 'island', fee: 5000, blocked: false });
eq('다리로 이어진 섬(신안 압해 58820) → 0원', 판({ zonecode: '58820', addr: '전남 신안군 압해읍' }), { region: 'normal', fee: 0, blocked: false });
eq('제주 주소에 육지 우편번호 → 제주(우편번호만 바꿔 피하지 못함)', 판({ zonecode: '04524', addr: '제주특별자치도 제주시 연동' }).region, 'jeju');
eq('우편번호 없는 제주 주소 → 제주', 판({ addr: '제주특별자치도 서귀포시' }).region, 'jeju');
eq('해외 주소 → 대상 아님', 판({ zonecode: '63309', addr: 'x', country_code: 'US' }), { region: 'overseas', fee: 0, blocked: false });
eq('배송 안 함', f.추가배송비({ zonecode: '63309' }, { island_fee: { jeju: { mode: 'block' } } }), { region: 'jeju', fee: 0, blocked: true });
// 몰이 직접 고친 규칙이 기준표보다 먼저
const 고침 = { island_fee: { ...설정.island_fee, rules: [{ kind: 'remove', type: 'area', text: '경북 울릉군' }, { kind: 'add', type: 'zip', from: '12345', to: '12350' }] } };
eq('몰이 뺀 지역(경북 울릉군) → 일반', f.추가배송비({ zonecode: '40200', addr: '경상북도 울릉군 울릉읍' }, 고침).region, 'normal');
eq('몰이 더한 우편번호 → 도서산간', f.추가배송비({ zonecode: '12348' }, 고침), { region: 'island', fee: 5000, blocked: false });
// 저장 검사
t('검사: 금액 상한(50,000원)', !!f.섬설정검사({ jeju: { mode: 'charge', amount: '50001' } }).오류 && !f.섬설정검사({ jeju: { mode: 'charge', amount: '50,000' } }).오류);
t('검사: 받기인데 금액 없음은 거절', !!f.섬설정검사({ island: { mode: 'charge', amount: '' } }).오류);
t('검사: 시·군은 시·도와 함께(「신안군」만은 거절)', !!f.섬설정검사({ rules: [{ kind: 'add', type: 'area', text: '신안군' }] }).오류);
eq('검사: 「전라남도 신안군」 → 「전남 신안군」으로 정리', f.섬설정검사({ rules: [{ kind: 'add', type: 'area', text: '전라남도  신안군' }] }).값.rules, [{ kind: 'add', type: 'area', text: '전남 신안군' }]);
t('연륙도서 경고: 우편번호 구간·시군 모두', f.연륙겹침({ kind: 'add', type: 'zip', from: '58800', to: '58812' }).length > 0 && f.연륙겹침({ kind: 'add', type: 'area', text: '전남 신안군' }).length > 0 && f.연륙겹침({ kind: 'remove', type: 'area', text: '전남 신안군' }).length === 0);
eq('추가비는 첫 본상품 줄에(추가상품 줄 말고)', f.추가비줄([{ addon_line: 1 }, { addon_line: 0 }]), 1);

// ④ 부분취소 판정 — 함수 본문을 떼어 돌린다(파일을 통째로 불러오면 DB 풀이 뜬다)
if (백엔드있음) {
  const 취소 = 읽기(BACK_ROOT, 'utils.js/cancel.js');
  const a = 취소.indexOf('export const calcDeliveryAdjust'); const b = 취소.indexOf('\n};', a) + 3;
  const 조정 = new Function(취소.slice(a, b).replace('export const calcDeliveryAdjust', 'const calcDeliveryAdjust') + '\nreturn calcDeliveryAdjust;')();
  const setting = { delivery_fee_default: 3000, free_ship_min: 50000 };
  eq('부분취소: 무료배송+제주 3,000원 주문이 기준 미달 → 기본 배송비 상계(무료였던 주문으로 읽는다)', 조정({ 전체취소: false, 취소후남은상품가: 30000, 총배송비: 3000, setting, 섬추가비: 3000 }), -3000);
  eq('부분취소: 유료배송+제주 주문은 상계 없음', 조정({ 전체취소: false, 취소후남은상품가: 30000, 총배송비: 6000, setting, 섬추가비: 3000 }), 0);
  eq('전체취소: 추가배송비까지 환불', 조정({ 전체취소: true, 취소후남은상품가: 0, 총배송비: 6000, setting, 섬추가비: 3000 }), 6000);
  eq('추가비 없는 예전 주문은 예전과 같다', 조정({ 전체취소: false, 취소후남은상품가: 30000, 총배송비: 0, setting }), -3000);

  const 결제 = 주석제거(읽기(BACK_ROOT, 'controllers/pay.controller.js'));
  t('서버 재계산: 배송지를 넘기고, 첫 본상품 줄에 추가비를 얹는다', /recalcOrderAmount\(brand_id, products, use_point, seller_id, \{ zonecode, addr, country_code, country_name \}\)/.test(결제)
    && /\+ \(i === 섬줄 \? 섬\.fee : 0\)/.test(결제));
  t('서버 재계산: 「배송 안 함」이면 결제를 받지 않는다', /if \(expected\.blocked\) \{/.test(결제) && /if \(섬\.blocked\) return \{ blocked: true, region: 섬\.region \};/.test(결제));
  t('주문 저장: 칸이 있을 때만 island_region·island_fee', /await hasColumn\('transactions', 'island_fee'\)/.test(결제) && /island_fee: Number\(island\?\.fee\) \|\| 0/.test(결제));
  t('취소: 칸이 있을 때만 island_fee 를 읽고 판정에 넘긴다', /if \(await hasColumn\('transactions', 'island_fee'\)\) \{/.test(취소) && /섬추가비: Number\(state\.trx\?\.island_fee\) \|\| 0/.test(취소));
  t('몰 설정 저장: 서버가 같은 검사로 막는다', /const 검사 = 섬설정검사\(설정\.island_fee\);/.test(읽기(BACK_ROOT, 'controllers/brand.controller.js')));
  t('마이그레이션: INSTANT 로만(복사 방식으로 넘어가지 않게)', /ALGORITHM=INSTANT/.test(읽기(BACK_ROOT, 'migrations/2026-11-12_island_fee.sql')));
}

// 화면 배선
const 유틸 = 주석제거(읽기(FRONT_ROOT, 'src/utils/shop-util.js'));
const 주문서 = 주석제거(읽기(FRONT_ROOT, 'src/views/shop/order/OrderSheet.js'));
t('화면 계산: 결제 데이터와 요약이 같은 규칙(첫 본상품 줄에 얹음)', /const 섬 = 섬추가비\(payData\);/.test(유틸) && /\+ \(i === 섬줄 \? 섬\.fee : 0\)/.test(유틸)
  && /amount: merchTotal \+ delivery \+ island\.fee - point,/.test(유틸));
t('주문서: 배송지를 넘겨 계산하고 요약 세 곳에 추가비 줄', /calcOrderTotals\(products, payData\?\.use_point, payData\)/.test(주문서) && (주문서.match(/island=\{orderTotals\.island\}/g) || []).length === 3);
t('주문서: 「배송 안 함」 지역이면 결제 전에 막는다', /if \(orderTotals\.island\?\.blocked\) \{/.test(주문서));
t('상품 상세: 공용 배송비 줄에 안내(금액까지)', /섬안내문\(currentLang\?\.value\)/.test(읽기(FRONT_ROOT, 'src/components/elements/shop/ShippingLine.js')));
t('설정 화면: 배송비설정 탭에 붙어 있다', /<IslandFeeSettings/.test(읽기(FRONT_ROOT, 'src/pages/manager/settings/default/[brand_id].js')));
t('관리자 주문: 금액 칸에 추가비를 나눠 적고 주소 칸에 표시', /섬비 > 0/.test(읽기(FRONT_ROOT, 'src/components/manager/OrderColumns.js')) && /<섬표시 row=\{row\} \/>/.test(읽기(FRONT_ROOT, 'src/components/manager/OrderColumns.js')));

// ── 11/12 점검 뒤 고친 것 ──
eq('해외로 골라도 나라가 대한민국이면 국내로 판정(추가비 회피 막기)', 판({ zonecode: '63100', addr: '제주특별자치도 제주시 1', country_code: 'ZZ', country_name: '대한민국' }).region, 'jeju');
eq('해외로 골라도 주소가 국내 시·도로 시작하면 국내로 판정', 판({ zonecode: '40200', addr: '경북 울릉군 울릉읍 1', country_code: 'ZZ', country_name: 'USA' }).region, 'island');
eq('진짜 해외 주소는 우편번호가 겹쳐도 해외(프랑스 63000)', 판({ zonecode: '63000', addr: '12 Rue Blatin, Clermont-Ferrand', country_code: 'ZZ', country_name: 'France' }).region, 'overseas');
t('규칙 상한은 저장 칸 수 제한 안쪽(80개)', f.규칙최대 === 80);
t('화면 판정에 나라 이름도 넘긴다', /country_name: 배송지\?\.country_name/.test(유틸));
t('「배송 안 함」 안내 문장 틀에 「지역」이 또 붙지 않는다', !/\{\{list\}\} 지역은 배송하지 않습니다/.test(유틸) && /\{\{list\}\}에는 배송하지 않습니다/.test(유틸));
const api = 읽기(FRONT_ROOT, 'src/utils/api.js');
t('몰 저장: 추가배송비를 바꾼 화면만 island_fee 를 보낸다', /if \(table == 'brands'\) obj = 섬설정빼고\(obj\);/.test(api) && /섬설정저장 === true/.test(api));
t('설정 화면: 추가배송비가 바뀐 경우만 섬설정저장', /섬설정저장 \}\)/.test(읽기(FRONT_ROOT, 'src/pages/manager/settings/default/[brand_id].js')));
if (백엔드있음) {
    const 브랜드 = 읽기(BACK_ROOT, 'controllers/brand.controller.js');
    t('서버: island_fee 가 안 오면 DB 값을 유지한다', /JSON_EXTRACT\(setting_obj, '\$\.island_fee'\)/.test(브랜드) && /island_fee: 기존값/.test(브랜드));
    t('서버: 결제 재계산에 나라 이름도 넘긴다', /\{ zonecode, addr, country_code, country_name \}/.test(읽기(BACK_ROOT, 'controllers/pay.controller.js')));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
