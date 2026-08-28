import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 상품상세 '혜택 안내' 배선 고정.
//
// 붙잡아 두는 것:
//  · 6개 프레임 전부에 들어가야 한다(하나라도 빠지면 그 프레임 가맹점만 안내가 없다)
//  · 소유자는 본사다 — 가맹점 브랜드로 조회하면 늘 빈 목록이 된다
//  · 쓰기는 레벨50(본사)만 — 한 줄이 전 가맹점 화면에 동시에 나간다
//  · benefit_notice_tabs 에는 brand_id 가 없다. 언어팩 켜기 루프가 그걸 모르면
//    Unknown column 으로 그 브랜드 번역이 통째로 실패한다
//  · 확인용 임시 스텁이 커밋에 섞여 들어가면 안 된다
import { readFileSync, existsSync } from 'fs';

const FRONT = FRONT_ROOT;
const BACK = BACK_ROOT;
const rd = (p) => readFileSync(p, 'utf8');
const 주석뺀 = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

// ── 6개 프레임 전부에 들어갔는지 ─────────────────────────────────────────
// 프레임1 은 공용 요약 컴포넌트(ProductDetailsSummary)를 쓴다.
const 화면 = {
  '프레임1': 'src/views/@dashboard/e-commerce/details/ProductDetailsSummary.js',
  '프레임2': 'src/views/shop/demo-2/item/[id].js',
  '프레임3': 'src/views/blog/product/id/demo-1.js',
  '프레임4': 'src/views/blog/product/id/demo-2.js',
  '프레임5': 'src/views/blog/product/id/demo-4.js',
  '프레임6': 'src/views/blog/product/id/demo-9.js',
};
// 2026-08-28 부터 대부분의 프레임은 <DetailNotices> 를 쓴다 — 배송비·배송안내·혜택을
// 한 그리드에 넣어 라벨 칸을 함께 나누게 한 묶음 컴포넌트다(그 안에서 BenefitNotice 를 그린다).
// blog-2 처럼 자기 '배송정보' 표를 가진 프레임만 아직 BenefitNotice 를 직접 쓴다.
// 어느 쪽이든 '혜택이 그 화면에 나온다' 는 사실은 같다.
for (const [이름, rel] of Object.entries(화면)) {
  const s = 주석뺀(rd(FRONT + rel));
  const 묶음 = /<DetailNotices[\s/>]/.test(s);
  eq(`${이름} import`, 묶음
    || /import BenefitNotice from 'src\/components\/elements\/shop\/BenefitNotice'/.test(s), true);
  eq(`${이름} 사용`, 묶음 || /<BenefitNotice[\s/>]/.test(s), true);
}

// ── 공용 컴포넌트 ────────────────────────────────────────────────────────
const cmp = rd(FRONT + 'src/components/elements/shop/BenefitNotice.js');
eq('컴포넌트 존재', existsSync(FRONT + 'src/components/elements/shop/BenefitNotice.js'), true);
// 확인용 스텁이 남아 있으면 실제 데이터와 무관하게 늘 같은 문구가 뜬다
eq('임시 스텁 없음', /임시확인|BENEFIT_PREVIEW/.test(cmp), false);
// 비어 있을 때 아무것도 안 그려야 한다 — 안 그러면 가격 아래 빈 줄이 남는다
eq('빈 목록이면 렌더 안 함', /if \(!\(list\.length > 0\)\) return null/.test(cmp), true);
// 문구는 번역본 우선
eq('번역 경유(label)', /formatLang\(n, 'label'/.test(cmp), true);
eq('번역 경유(summary)', /formatLang\(n, 'summary'/.test(cmp), true);
eq('번역 경유(탭 본문)', /formatLang\(open\.tabs\[[^\]]+\], 'tab_content'/.test(cmp), true);
// 색을 컴포넌트가 정해 버리면 어두운 프레임에서 글자가 사라진다 — tone 으로 덮을 수 있어야 한다
eq('tone 으로 색을 덮을 수 있음', /\.\.\.기본톤, \.\.\.tone/.test(cmp), true);
// 카드사 로고 원본이 크면 팝업에 가로 스크롤이 생긴다
eq('팝업 이미지 폭 제한', /'& img': \{ maxWidth: '100%'/.test(cmp), true);

// ── 백엔드 ───────────────────────────────────────────────────────────────
const ctrl = rd(BACK + 'controllers/benefit_notice.controller.js');
// 쓰기는 '본사 브랜드의 관리자'만.
//
// ⚠ 레벨 50 으로 걸면 안 된다 — ShopGo 본사 운영자는 레벨 40 이고 본사에 50 계정이 없다.
//   (그래서 처음엔 본사에서 '권한이 없습니다'만 떴다)
//   레벨만 보면 가맹점 관리자도 통과하므로 is_main_dns 를 함께 봐야 한다.
eq('레벨 40 이상', /Number\(decode_user\?\.level\) < 40/.test(ctrl), true);
eq('마스터 브랜드 검사', /Number\(decode_dns\?\.is_main_dns\) !== 1/.test(ctrl), true);
eq('레벨50 조건이 남아있지 않음', /level.{0,12}< 50/.test(ctrl), false);
// 모든 진입점이 같은 판정을 거쳐야 한다(list·get·create·update·remove = 5곳)
eq('5개 진입점 전부 같은 판정', (ctrl.match(/본사관리자\(decode_user, decode_dns\)/g) || []).length, 5);
// body 의 brand_id 를 믿으면 남의 본사 행을 만들 수 있다
eq('brand_id 를 body 에서 받지 않음', /brand_id: *req\.body/.test(ctrl), false);
eq('저장 후 전 브랜드 캐시 무효화', /invalidateAllShopSettingCache\(\)/.test(ctrl), true);

const cache = rd(BACK + 'utils.js/cache.js');
eq('전 브랜드 캐시 무효화 함수', /export const invalidateAllShopSettingCache/.test(cache), true);
eq('와일드카드로 지운다', /keys\(`shop:setting:\*`\)/.test(cache), true);

// 스토어프론트는 **본사(부모)** 것을 읽어야 한다
const shop = rd(BACK + 'controllers/shop.controller.js');
eq('소유 브랜드 = 부모(본사)', /parent_id\) > 0[\s\S]{0,80}parent_id/.test(shop), true);
eq('setting 묶음에 실림(줄)', /table: 'benefit_notices'/.test(shop), true);
eq('setting 묶음에 실림(탭)', /table: 'benefit_notice_tabs'/.test(shop), true);
// 탭은 brand_id 가 없어 부모 조인으로 걸러야 한다
eq('탭은 부모 조인으로 필터', /LEFT JOIN benefit_notices ON benefit_notice_tabs\.notice_id/.test(shop), true);

// 번역 등록
const langp = rd(BACK + 'utils.js/schedules/lang-process.js');
eq('번역 대상 등록(줄)', /benefit_notices: \[/.test(langp), true);
eq('번역 대상 등록(탭)', /benefit_notice_tabs: \[/.test(langp), true);
// 이 분기가 없으면 언어팩 켜기가 Unknown column 으로 통째로 실패한다
eq('탭 brand_id 없음 분기 있음', /table == 'benefit_notice_tabs'/.test(langp), true);
const util = rd(BACK + 'utils.js/util.js');
eq('탭 본문은 HTML 로 취급', /benefit_notice_tabs: \['tab_content'\]/.test(util), true);

// 라우터 등록
eq('라우터 등록', /router\.use\("\/benefit-notices", benefitNoticeRoutes\)/.test(rd(BACK + 'routes/index.js')), true);
eq('컨트롤러 등록', /benefitNoticeCtrl,/.test(rd(BACK + 'controllers/index.js')), true);

// ── 관리 화면 ────────────────────────────────────────────────────────────
const admin = 주석뺀(rd(FRONT + 'src/pages/manager/designs/benefit-notice/index.js'));
eq('본사 아니면 막는다', /themeDnsData\?\.is_main_dns != 1/.test(admin), true);
eq('전 가맹점 반영 경고', /전 가맹점 상품상세/.test(rd(FRONT + 'src/pages/manager/designs/benefit-notice/index.js')), true);
// 메뉴 위치 — 마스터는 isMasterSite() 블록에서 return 으로 빠져나간다.
// 그 아래(디자인관리 등)에 넣으면 조건이 맞아도 본사 화면에 영영 안 뜬다. 실제로 그랬다.
const nav = rd(FRONT + 'src/layouts/manager/nav/config-navigation.js');
const 마스터블록 = nav.slice(nav.indexOf('if (isMasterSite()) {'), nav.indexOf('\n  return [', nav.indexOf('if (isMasterSite()) {')));
eq('메뉴가 마스터 전용 블록 안에 있음', /benefitNotice/.test(마스터블록), true);
// 레벨 조건을 걸면 '본사로 들어왔는데 메뉴가 없다'가 또 생긴다.
// 권한은 화면(본사 아니면 경고)과 API(레벨50 미만 403)가 막는다.
eq('메뉴에 추가 조건 없음', /\.\.\.\([^)]*\?\s*\[\s*\{\s*items:\s*\[\s*\{ title: '혜택 안내/.test(마스터블록), false);
// 마스터 블록 밖(가맹점도 보는 목록)에 남아 있으면 가맹점 관리자에게 노출된다
eq('마스터 블록 밖에는 없음', /benefitNotice/.test(nav.slice(nav.indexOf('\n  return [', nav.indexOf('if (isMasterSite()) {')))), false);

// ── 마이그레이션 ─────────────────────────────────────────────────────────
const mig = rd(BACK + 'migrations/2026-08-12_benefit_notices.sql');
eq('테이블 2개 생성', (mig.match(/CREATE TABLE IF NOT EXISTS/g) || []).length, 2);
eq('번역 컬럼 포함', (mig.match(/lang_obj/g) || []).length >= 2, true);
eq('백업 경고 있음', /DB 백업/.test(mig), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
