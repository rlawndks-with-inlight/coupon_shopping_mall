import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 상품 옵션 개편 — 선택옵션 / 추가상품 / 조합형 / 재고 배선 고정.
//
// 붙잡아 두는 것 (전부 실제로 났던 사고이거나, 나면 돈이 새는 것):
//  · 추가상품이 다시 '필수'가 되면 첫돌공방 상품처럼 355,000원을 붙여야만 살 수 있게 된다
//  · 특성이 다시 '고르는 것'이 되면 프레임마다 같은 상품이 다르게 팔린다
//  · 조합 추가금을 서버가 안 세면 조합을 고른 주문이 그만큼 싸게 결제된다(가맹점 손실)
//  · 재고 기본값이 0 이 되면 마이그레이션 직후 전 상품이 품절이 된다
//  · 새 테이블 조회가 배치 쿼리에 들어가면 마이그레이션 전 배포 때 몰이 통째로 죽는다
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const BACK = BACK_ROOT;

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};
const 주석뺀 = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// ── 마이그레이션 불변식 ────────────────────────────────────────────────────
const mig = readFileSync(BACK + 'migrations/2026-08-13_option_renewal.sql', 'utf8');
// 재고는 NULL 이 무제한이다. DEFAULT 0 이면 돌리는 순간 전 상품이 품절이 된다.
eq('상품 재고 기본 NULL', /stock_qty INT NULL DEFAULT NULL/.test(mig), true);
eq('옵션 재고 기본 NULL', /ADD COLUMN stock_qty INT NULL DEFAULT NULL/.test(mig), true);
// 새 컬럼 기본값이 지금 동작과 같아야 한다 — SQL 만 돌려도 화면이 안 바뀐다
eq('group_type 기본 0(선택옵션)', /group_type TINYINT\(1\)\s+NOT NULL DEFAULT 0/.test(mig), true);
eq('option_mode 기본 0(단독형)', /option_mode TINYINT\(1\) NOT NULL DEFAULT 0/.test(mig), true);
// 조합키는 유일해야 한다 — 아니면 같은 조합의 재고가 두 벌이 된다
eq('조합 유니크', /UNIQUE KEY uq_product_combo \(product_id, combo_key\)/.test(mig), true);
// 재고 원장 유니크가 이중 차감·이중 복구를 DB 에서 막는다
eq('재고원장 유니크', /UNIQUE KEY uq_stock_move \(trans_id, kind, product_id, option_id, combo_id\)/.test(mig), true);
// ⚠ MySQL UNIQUE 는 NULL 중복을 안 막는다 — 0 을 써야 한다
eq('원장 option_id NOT NULL DEFAULT 0', /option_id  BIGINT UNSIGNED NOT NULL DEFAULT 0/.test(mig), true);
eq('기존 컬럼을 지우지 않음', /DROP COLUMN/.test(mig.split('되돌리기')[0]), false);

// ── 백엔드 공용 로직 ───────────────────────────────────────────────────────
const po = readFileSync(BACK + 'utils.js/product-options.js', 'utf8');
// 조합키는 정렬해야 한다. 안 하면 '101-205' 와 '205-101' 이 갈려 재고가 두 벌이 된다.
eq('조합키 정렬', /\.sort\(\(a, b\) => a - b\)/.test(po), true);
eq('조합키 중복 제거', /new Set\(/.test(po), true);
// create/update 가 같은 저장 함수를 써야 한다
eq('저장 공용화', /export const saveOptionGroups/.test(po), true);
const prod = readFileSync(BACK + 'controllers/product.controller.js', 'utf8');
eq('create·update 모두 공용 저장 호출', (prod.match(/await 옵션일체저장\(/g) || []).length, 2);
// 차감은 원장에 INSERT IGNORE 로 남긴다 — 결제 콜백이 두 번 와도 한 번만 준다
eq('중복 차감 방지', /INSERT IGNORE INTO product_stock_moves[\s\S]{0,200}'out'/.test(po), true);
eq('중복 복구 방지', /INSERT IGNORE INTO product_stock_moves[\s\S]{0,200}'in'/.test(po), true);
// 음수 재고가 화면에 뜨면 아무도 못 믿는다(복구 경로)
eq('음수 재고 방지', /GREATEST\(IFNULL\(stock_qty,0\) \+ \?, 0\)/.test(po), true);
// 차감은 **조건부 한 문장**이어야 한다. 무조건 빼면 마지막 1개를 두 사람이 동시에 사도
// 둘 다 통과하고 재고만 0 이 된다. WHERE stock_qty >= ? 로 DB 가 한 명만 통과시킨다.
eq('차감은 조건부(초과판매 차단)', /SET stock_qty = stock_qty - \?[\s\S]{0,120}stock_qty >= \?/.test(po), true);
eq('차감 실패를 로그로 남김', /초과 판매 — 주문/.test(po), true);
// 재고 NULL 은 무제한 — 검사에서 건너뛴다
eq('NULL 은 무제한', /if \(need\.stock === null \|\| need\.stock === undefined\) continue/.test(po), true);
// 같은 옵션을 두 줄에 나눠 담아 재고를 우회하지 못하게 합산해서 본다
eq('줄을 합쳐서 재고 판정', /합계\.set\(k, prev \? \{ \.\.\.prev, qty: prev\.qty \+ need\.qty \}/.test(po), true);

// ── 결제 금액 재계산 ───────────────────────────────────────────────────────
const pay = readFileSync(BACK + 'controllers/pay.controller.js', 'utf8');
// 조합 추가금을 서버가 세지 않으면 조합을 고른 주문이 그만큼 싸게 결제된다
eq('서버가 조합 추가금 반영', /comboPriceByKey\.get\(`\$\{line_product_id\}:\$\{key\}`\)/.test(pay), true);
// 조합형의 선택옵션을 개별가로도 세면 이중 청구가 된다
eq('조합형 선택옵션은 개별가 제외', /if \(조합형 && 종류 === 0\) \{ 선택옵션ids\.push\(oid\); continue; \}/.test(pay), true);
// 추가상품은 조합과 무관하게 늘 개별가
eq('추가상품은 개별가 유지', /추가상품\(종류 1\)은 조합과 무관하게 늘 개별 가격이 붙는다/.test(pay), true);
// ⚠ 새 테이블 조회가 실패해도 결제가 막히면 안 된다(마이그레이션 전 배포)
eq('조합 조회 실패해도 결제 진행', /조합형 금액 조회 실패\(추가금 0원으로 진행\)/.test(pay), true);
// 재고는 결제 '전'에 막고, 차감 실패는 결제를 막지 않는다
eq('재고 검사는 결제 전', pay.indexOf('await checkStock(줄)') < pay.indexOf('encForSave(\'transactions\''), true);
eq('차감 실패는 주문을 막지 않음', /재고 차감 실패\(주문은 그대로 진행\)/.test(pay), true);
// 부수처리는 utils.js/cancel.js 로 옮겼다(취소 경로마다 달랐던 것을 하나로).
eq('복구 실패는 취소를 막지 않음', /\[취소\] 재고 복구 실패/.test(readFileSync(BACK + 'utils.js/cancel.js', 'utf8')), true);
// ⚠ 재고는 주문을 만들 때 미리 잡는다(결제창 띄운 사이 남이 못 사가게).
//   잡기만 하고 놓아주는 자리가 없으면 카드 실패가 반복될 때마다 재고가 잠긴다.
const ready = pay.slice(pay.indexOf('  ready: async'), pay.indexOf('  result: async'));
eq('결제 실패 12경로 전부 재고 복구',
  (ready.match(/return 결제실패응답\(trans_id, req, res, -100,/g) || []).length, 12);
eq('차감 이후 맨 응답이 안 남음', /return response\(req, res, -100,/.test(
  ready.slice(ready.indexOf('await decreaseStock'))), false);
// 예외로 빠져도 놓아준다. trans_id 가 try 밖에 있어야 catch 에서 보인다.
eq('예외 경로도 복구', /if \(trans_id\) await 결제실패정리\(trans_id\)/.test(pay), true);
eq('trans_id 를 try 밖에 선언', /let trans_id = 0;[\s\S]{0,20}try \{/.test(pay), true);
// 결제창 닫고 사라진 거래를 지울 때도 놓아줘야 한다 — 안 그러면 영영 잠긴다.
const cleanup = readFileSync(BACK + 'utils.js/schedules/cleanup-abandoned.js', 'utf8');
eq('버려진 결제대기 정리 시 재고 복구', /await restoreStock\(id\)/.test(cleanup), true);
eq('원장은 복구 뒤에 지운다',
  cleanup.indexOf('await restoreStock(id)') < cleanup.indexOf('DELETE FROM product_stock_moves'), true);

// ── 배포 순서 안전장치 ─────────────────────────────────────────────────────
// 새 테이블을 배치 쿼리에 넣으면 하나가 터질 때 상품 상세가 통째로 죽는다 = 모든 몰 정지
eq('신규 테이블은 안전조회로 분리', /const 안전조회 = async \(sql, params = \[\]\) => \{[\s\S]{0,400}return \[\];/.test(prod), true);
eq('조합 조회도 안전조회', /combinations: await 안전조회\(/.test(prod), true);

// ── 프론트 공용 판정 ───────────────────────────────────────────────────────
const fpo = readFileSync(FRONT + 'src/data/product-options.js', 'utf8');
// 프론트 조합키 규칙이 백엔드와 같아야 한다 — 어긋나면 화면 가격과 청구 금액이 달라진다
eq('프론트 조합키도 정렬', /\.sort\(\(a, b\) => a - b\)/.test(fpo), true);
// 재고 문구를 데이터 계층에서 만들면 사전에 없어서 외국어 화면에 한국어가 박힌다
eq('재고 문구는 화면이 만든다', /return `\$\{s\}개 남음`/.test(fpo), false);

const util = 주석뺀(readFileSync(FRONT + 'src/utils/shop-util.js', 'utf8'));
// 필수 판정은 '선택옵션'만 본다. 추가상품까지 필수로 보면 예전 사고가 그대로 재현된다.
eq('필수는 선택옵션만', /const required = requiredGroups\(product\)/.test(util), true);
eq('안 파는 조합 차단', /선택하신 조합은 판매하지 않습니다/.test(util), true);
// 목록 카드는 옵션을 안 싣고 담기를 부른다 — '모르면 통과' 로 빠져나가면
// 옵션 없는 주문이 그대로 접수된다. 개수만이라도 보고 막아야 한다.
eq('목록 카드 담기도 막는다', /Number\(product\?\.required_option_count\) > 0/.test(util), true);
const 카드 = readFileSync(FRONT + 'src/components/elements/shop/common.js', 'utf8');
eq('옵션 있으면 상세로 보낸다', /required_option_count\) > 0[\s\S]{0,80}router\.push/.test(카드), true);
// ⚠ 마지막 관문은 서버다. 프론트 검사는 우회할 수 있다.
eq('서버가 필수옵션 재검사', /findMissingRequiredOption\(줄\)/.test(pay), true);
eq('추가상품은 필수검사 제외(서버)', /g\.group_type=0/.test(po), true);
// 남의 상품 옵션 id 로 그룹을 채운 것처럼 속이지 못하게 소속을 확인한다
eq('옵션 소속 그룹 확인', /소속\.get\(oid\)/.test(po), true);
// 담기·바로구매 두 곳 모두 재고를 본다(한 쪽만 걸면 그 경로로 초과 주문이 들어온다)
eq('담기·바로구매 두 곳 다 재고검사', (util.match(/if \(!assertStock\(/g) || []).length, 2);
// 추가상품은 다시 누르면 빠져야 한다
eq('추가상품 토글', /if \(idx >= 0\) options\.splice\(idx, 1\);/.test(util), true);
eq('빈 그룹은 제거', /if \(!options\.length\) groups\.splice\(find_group_idx, 1\);/.test(util), true);
// 화면 금액도 조합 추가금을 써야 한다
eq('화면 금액도 공용 계산', /optionExtraPrice\(item, \{ groups \}\)/.test(util), true);

// ── 프레임 배선 ────────────────────────────────────────────────────────────
// 옵션 UI 를 프레임마다 따로 그리면 '이 프레임에서만 못 사는 상품'이 생긴다.
const 프레임 = {
  '프레임1': 'src/views/@dashboard/e-commerce/details/ProductDetailsSummary.js',
  '프레임2': 'src/views/shop/demo-2/item/[id].js',
  '프레임3': 'src/views/blog/product/id/demo-1.js',
  '프레임4': 'src/views/blog/product/id/demo-2.js',
  '프레임5': 'src/views/blog/product/id/demo-4.js',
  '프레임6': 'src/views/blog/product/id/demo-9.js',
};
for (const [이름, rel] of Object.entries(프레임)) {
  const s = 주석뺀(readFileSync(FRONT + rel, 'utf8'));
  // 추가상품은 어느 프레임에서나 고를 수 있어야 한다
  // ProductOptions 는 안에서 ProductAddons 를 쓴다 — 둘 중 하나면 된다
  eq(`${이름} 추가상품 렌더`, /<ProductAddons|<ProductOptions/.test(s), true);
  // 필수 옵션만 필수로 그려야 한다 — 추가상품이 '선택하세요' 드롭다운으로 뜨면 안 된다
  eq(`${이름} 선택옵션만 필수로 그림`, /requiredGroups\(|<ProductOptions/.test(s), true);
  // 특성을 '고르는 것'으로 그리면 안 된다(프레임2 에서 실제로 그랬다)
  eq(`${이름} 특성을 선택지로 안 그림`, /onSelectOption\(character/.test(s), false);
}
// 다른 프레임(블로그형 5~9)도 추가상품이 필수 드롭다운으로 새지 않아야 한다
for (const n of [3, 5, 6, 7, 8]) {
  const s = readFileSync(FRONT + `src/views/blog/product/id/demo-${n}.js`, 'utf8');
  eq(`블로그 데모${n} 선택옵션만 그림`, /requiredGroups\(item\)/.test(s), true);
}

// 특성은 보여주기 전용 컴포넌트가 따로 있다
const info = readFileSync(FRONT + 'src/components/elements/shop/ProductInfoRows.js', 'utf8');
eq('상품정보는 읽기 전용', /onClick|onChange/.test(info), false);

// ── 관리자 화면 ────────────────────────────────────────────────────────────
const editor = readFileSync(FRONT + 'src/components/manager/ProductOptionEditor.js', 'utf8');
eq('선택옵션·추가상품 구분', /그룹추가\(추가상품\)/.test(editor), true);
eq('조합표 자동 생성', /const 조합목록 = useMemo/.test(editor), true);
// 조합은 이름으로 들고 있어야 한다 — 새 옵션은 저장 전이라 id 가 없다
eq('조합은 이름 기준', /option_names/.test(editor), true);
// 조합형에서 개별 변동가 칸을 남겨 두면 넣은 값이 왜 반영 안 되는지 알 수 없다
eq('조합형은 개별 변동가 칸 숨김', /!\(조합형 && !추가상품인가\)/.test(editor), true);
eq('재고 비우면 무제한 안내', /비우면 무제한입니다/.test(editor), true);
// ⚠ 손대지 않은 조합도 반드시 저장돼야 한다.
//   안 그러면 6개 중 1개만 고친 가맹점은 나머지 5개 조합을 '판매하지 않음' 으로 못 판다.
//   화면에 0원으로 보이는 줄은 '0원짜리 조합'이지 '없는 조합'이 아니다.
eq('조합표 전체를 저장 대상에 맞춤', /const 맞춘것 = 조합목록\.map/.test(editor), true);
eq('무한 렌더 방지(달라졌을 때만 set)', /if \(!같다\) set\(\{ combinations: 맞춘것 \}\)/.test(editor), true);

const page = readFileSync(FRONT + 'src/pages/manager/products/[edit_category]/[id].js', 'utf8');
eq('상품등록이 통합 편집기 사용', /<ProductOptionEditor/.test(page), true);
// 옛 '상품특성'·'상품옵션' 두 덩어리가 남아 있으면 안 된다(뜻이 다시 겹친다)
// 옛 블록의 버튼들이 남아 있으면 '상품특성'과 '상품옵션' 두 덩어리가 아직 그대로라는 뜻이다
// (themeDnsData.id==5 전용 고정 특성 블록은 다른 클라이언트 것이라 건드리지 않는다)
eq('옛 특성 추가 버튼 제거', /새 특성 추가/.test(page), false);
eq('옛 옵션그룹 추가 버튼 제거', /옵션그룹 추가/.test(page), false);
eq('저장 요청에 옵션 개편분 포함', (page.match(/\.\.\.옵션페이로드\(item\)/g) || []).length, 4);
// 재고 빈 문자열을 0 으로 접으면 저장하자마자 품절이 된다
eq('재고 빈값은 그대로 보냄', /stock_qty: item\?\.stock_qty \?\? ''/.test(page), true);

// ── 한정판(1인당 구매 개수) ────────────────────────────────────────────────
const mig2 = readFileSync(BACK + 'migrations/2026-08-13_purchase_limit.sql', 'utf8');
// 제한 없음이 기본이어야 한다. 0 이 기본이면 전 상품이 '구매 불가' 가 된다.
eq('제한 기본 NULL', /purchase_limit INT NULL DEFAULT NULL/.test(mig2), true);
eq('재실행 안전', /information_schema\.COLUMNS/.test(mig2), true);
// 비회원은 같은 사람인지 확인할 방법이 없다 — 제한을 건 상품은 회원만 산다.
eq('비회원은 차단', /회원만 구매할 수 있는 한정 상품입니다/.test(po), true);
eq('서버가 1인 구매수 검사', /await checkPurchaseLimit\(user_id, 줄\)/.test(pay), true);
// 취소된 주문은 개수에서 빠져야 한다. 안 그러면 취소해도 영영 못 산다.
eq('취소 주문은 안 센다', /t\.is_cancel = 0 AND t\.is_cancel_trans = 0/.test(po), true);
// 같은 상품을 옵션만 달리해 여러 줄로 담아 제한을 우회하지 못하게 합산한다
eq('한 주문 안에서도 합산', /lines\.filter\(\(l\) => Number\(l\?\.id\) === pid\)/.test(po), true);
// 담기 단계에서 알려야 한다 — 담아 놓고 결제 직전에 막히면 그게 더 나쁘다
eq('담기에서 비회원 차단', (util.match(/if \(!assertMemberOnly\(/g) || []).length, 2);
const addon = readFileSync(FRONT + 'src/components/elements/shop/ProductAddons.js', 'utf8');
eq('상세에 한정 안내 표시', /한정 상품/.test(addon), true);
eq('추가상품 없어도 한정 안내는 뜬다', /if \(!추가\.length && !한정\) return null/.test(addon), true);


// ── 조합형: 앞 선택으로 뒤 선택지 거르기 ──────────────────────────────────
//
// 예전엔 안 파는 조합도 고를 수 있었고, 담기를 눌러야 '판매하지 않습니다' 가 떴다.
// 이제 앞 그룹의 선택과 같이 팔리는 것만 고를 수 있다.
//
// 앞 그룹만 기준으로 삼는 게 핵심이다. 서로 제약하면 막다른 길이 생긴다 —
// 분홍/S 를 고른 뒤 파랑/L 로 가고 싶은데 파랑/S 도 분홍/L 도 안 팔면 갇힌다.
// 그래서 첫 그룹은 늘 자유롭다. 이 성질이 깨지면 손님이 상품을 못 산다.
const NL = String.fromCharCode(10);   // 여러 줄 문자열 escape 사고 방지
const 옵션원문 = readFileSync(FRONT + 'src/data/product-options.js', 'utf8');
const 조합떼기 = (이름) => {
  const i = 옵션원문.search(new RegExp(`export const ${이름} = `));
  const rest = 옵션원문.slice(i);
  const m = rest.slice(1).match(/\nexport const /);
  return rest.slice(0, m ? m.index + 1 : rest.length);
};
// 모듈 최상단 상수(선택옵션·추가상품)까지 같이 떼야 isAddon 이 돈다.
const 조합본체 = ['선택옵션', '추가상품', 'isAddon', 'requiredGroups', 'isComboMode',
                  'isSameGroup', 'selectableOptionIds']
  .map(조합떼기).join(NL).replace(/export const /g, 'const ');
const { selectableOptionIds } = new Function(조합본체 + NL + 'return { selectableOptionIds };')();

// 색상(1 분홍 / 2 파랑) x 사이즈(3 S / 4 L)
// 파는 조합: 분홍/S, 파랑/L   (분홍/L 과 파랑/S 는 안 판다)
const 색상 = { id: 10, group_name: '색상', group_type: 0, options: [{ id: 1 }, { id: 2 }] };
const 사이즈 = { id: 11, group_name: '사이즈', group_type: 0, options: [{ id: 3 }, { id: 4 }] };
const 조합상품 = {
  option_mode: 1, groups: [색상, 사이즈],
  combinations: [{ combo_key: '1-3' }, { combo_key: '2-4' }],
};
const 고름 = (그룹, id) => ({ groups: [{ ...그룹, options: [{ id }] }] });
const 배열 = (s) => (s === null ? null : [...s].sort((a, b) => a - b));

eq('첫 그룹은 늘 자유롭다(막다른 길 방지)', 배열(selectableOptionIds(조합상품, 고름(사이즈, 3), 색상)), null);
eq('앞을 안 골랐으면 거르지 않는다', 배열(selectableOptionIds(조합상품, { groups: [] }, 사이즈)), null);
eq('분홍(1) 고르면 사이즈는 S(3) 만', 배열(selectableOptionIds(조합상품, 고름(색상, 1), 사이즈)), [1, 3]);
eq('파랑(2) 고르면 사이즈는 L(4) 만', 배열(selectableOptionIds(조합상품, 고름(색상, 2), 사이즈)), [2, 4]);
eq('조합형이 아니면 거르지 않는다',
   배열(selectableOptionIds({ ...조합상품, option_mode: 0 }, 고름(색상, 1), 사이즈)), null);
eq('조합이 하나도 없으면 거르지 않는다',
   배열(selectableOptionIds({ ...조합상품, combinations: [] }, 고름(색상, 1), 사이즈)), null);
eq('지운 조합은 세지 않는다',
   배열(selectableOptionIds({ ...조합상품, combinations: [{ combo_key: '1-3', is_delete: 1 }, { combo_key: '2-4' }] },
                            고름(색상, 1), 사이즈)), []);

// 화면이 실제로 이 판정을 쓰는지 — 안 쓰면 로직만 맞고 화면은 예전 그대로다
const 상세원문 = 주석뺀(readFileSync(FRONT + 'src/components/elements/shop/ProductOptions.js', 'utf8'));
eq('상세가 selectableOptionIds 를 씀', /selectableOptionIds\(product, selected, group\)/.test(상세원문), true);
eq('못 고르는 조합은 disabled', /disabled=\{품절 \|\| 조합없음\}/.test(상세원문), true);
eq("필수 그룹에 '필수' 표시", /translate\('필수'\)/.test(상세원문), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
