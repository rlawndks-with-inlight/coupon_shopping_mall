import { BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync, existsSync } from 'fs';

// 옵션·옵션그룹·특성이 외국어 화면에서 한국어로 남던 문제 (2026-08-26).
//
// [제보] 영문 주문서인데 옵션만 '장판: 블랙' 으로 나온다.
// [확인] 번역이 실패한 게 아니라 **시도된 적이 없었다.** lang_obj 가 `{}` 였다.
//   · 표시 쪽은 이미 formatLang 을 거친다
//   · product_options·product_option_groups·product_characters 는 번역 대상 목록에 있다
//   · 그런데 **저장할 때 대기열(lang_processes)에 넣는 고리만 없었다**
//   그래서 브랜드 언어 설정을 다시 저장해 백필이 돌 때 말고는 영영 비어 있었다.
//   실제로 mbc06 은 상품 2/2·카테고리 1/1 은 번역됐는데 옵션그룹 0/4 · 옵션 0/9 였다.
//
// 되돌리기 쉬운 자리다 — brand 인자를 안 넘기면 조용히 아무 일도 안 일어난다(경고도 없다).
// 그래서 '넘기는지' 를 못 박아 둔다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

if (!백엔드있음) {
    console.log('  건너뜀 — 백엔드 저장소가 없다(서버에는 프론트만 배포된다)');
    console.log('\n통과 0 / 실패 0');
    process.exit(0);
}
const 읽기 = (p) => readFileSync(BACK_ROOT + p, 'utf8');

// ── 옵션·옵션그룹 ────────────────────────────────────────────────────────
const opt = 주석제거(읽기('utils.js/product-options.js'));

t('옵션 저장이 brand 를 받는다',
    /export const saveOptionGroups = async \(product_id, groups = \[\], brand = null\)/.test(opt),
    '안 받으면 어느 몰의 언어 설정인지 몰라 대기열에 못 싣는다');
t('옵션 저장이 settingLangs 를 부른다', /settingLangs\(/.test(opt),
    '이 호출이 빠져 있어서 옵션만 한국어로 남았다');
t('옵션그룹 이름도 대기열에 싣는다', /product_option_groups'/.test(opt));
t('옵션 이름도 대기열에 싣는다', /product_options'/.test(opt));

// 안 바뀐 이름까지 매번 담으면 번역 API 호출이 몰려 막힌다(lang-process 에 429 처리가 있다).
t('이름이 그대로면 다시 담지 않는다',
    /옛그룹이름\[group_id\] !== /.test(opt) && /옛옵션이름\[option_id\] !== /.test(opt),
    '매번 전부 담으면 고치지도 않은 이름을 계속 번역기에 보낸다');

// 저장은 이미 끝난 뒤다. 대기열 적재가 실패해도 저장을 되돌리면 안 된다.
t('대기열 적재 실패가 저장을 깨지 않는다', /catch \(e\) \{[\s\S]{0,200}옵션 번역 대기열 적재 실패/.test(opt));

// ── 상품 컨트롤러 배선 ───────────────────────────────────────────────────
const ctrl = 주석제거(읽기('controllers/product.controller.js'));

t('옵션 저장에 brand 를 넘긴다', /saveOptionGroups\(product_id, groups, brand\)/.test(ctrl),
    '안 넘기면 함수는 있는데 아무 일도 안 일어난다 — 가장 되돌아가기 쉬운 자리다');
t('옵션일체저장이 brand 를 받는다', /옵션일체저장 = async \(product_id, groups, combinations, order_form_fields, brand = null\)/.test(ctrl));

// 특성은 create·update 두 갈래가 따로 있다. 한쪽만 붙이면 '새로 만들면 되는데
// 수정하면 안 되는'(또는 그 반대) 종류의 버그가 된다 — 이 파일이 이미 겪은 실패다.
t('특성 대기열 함수가 있다', /const 특성번역대기 = async \(/.test(ctrl));
// 정의부는 `특성번역대기 = async (` 라 아래 셈에 안 잡힌다 — 호출만 센다.
const 특성호출 = ctrl.match(/await 특성번역대기\(/g) ?? [];
t('특성을 create·update 양쪽에서 담는다', 특성호출.length === 2,
    `호출이 둘이어야 한다 — create 와 update (지금 ${특성호출.length})`);
t('특성 대기열이 lang_obj_columns 를 쓴다',
    /lang_obj_columns\['product_characters'\]/.test(ctrl),
    '컬럼 목록을 손으로 적으면 목록이 바뀔 때 어긋난다');
t('고친 특성은 다시 담는다', /update_character_ids/.test(ctrl),
    '이름을 고쳤으면 옛 번역은 못 쓴다');
t('번역 없는 특성만 담는다', /비었나\(r\.lang_obj\)/.test(ctrl),
    '전부 담으면 저장할 때마다 상품의 특성 전체를 다시 번역한다');
t('특성 대기열 실패가 저장을 깨지 않는다', /특성 번역 대기열 적재 실패/.test(ctrl));

// ── 대상 목록 ────────────────────────────────────────────────────────────
// 담아도 이 목록에 없으면 스케줄러가 '번역 대상 컬럼 정의 없음' 으로 격리해 버린다.
const sched = 주석제거(읽기('utils.js/schedules/lang-process.js'));
for (const [표, 칸] of [
    ['product_options', 'option_name'],
    ['product_option_groups', 'group_name'],
    ['product_characters', 'character_name'],
]) {
    t(`${표} 가 번역 대상 목록에 있다`,
        new RegExp(`${표}: \\[[\\s\\S]*?'${칸}'`).test(sched),
        '목록에 없으면 스케줄러가 격리(is_confirm=2)해 버린다');
}

// ── 백필 스크립트가 스케줄러와 같은 조인을 갖고 있나 ─────────────────────
//
// brand_id 컬럼이 없는 표는 부모로 조인해야 한다. 두 곳이 같은 목록을 따로 갖고 있어서
// 한쪽에만 추가하면 어긋난다 — 실제로 그랬다.
// 백필은 표 하나를 건너뛰는 게 아니라 **Unknown column 으로 통째로 멈춘다.**
// 그래서 옵션 번역을 채우려고 돌렸을 때 아무것도 못 채우고 죽어 있었다.
const backfill = 주석제거(읽기('scripts/lang-backfill.js'));
const 조인필요 = [...sched.matchAll(/table == '([a-z_]+)'/g)].map((m) => m[1]);
const 백필조인 = new Set([...backfill.matchAll(/table === '([a-z_]+)'/g)].map((m) => m[1]));
t('조인이 필요한 표를 스케줄러에서 찾았다', 조인필요.length >= 4);
for (const 표 of 조인필요) {
    t(`백필도 '${표}' 를 부모로 조인한다`, 백필조인.has(표),
        'brand_id 가 없는 표라 WHERE brand_id=? 로 떨어지면 백필 전체가 멈춘다');
}

const util = 주석제거(읽기('utils.js/util.js'));

// ── 팝업·혜택안내 (2026-08-26) ───────────────────────────────────────────
//
// 팝업은 세 군데가 동시에 비어 있었다: 테이블에 lang_obj 없음 · 대상 목록에 없음 ·
// 화면이 원문을 그대로 그림. 하나만 채우면 여전히 한국어로 나오므로 셋 다 본다.
t('팝업이 번역 대상 목록에 있다', /popups: \[[\s\S]*?'popup_title'[\s\S]*?'popup_content'/.test(sched));
t('팝업 본문을 HTML 로 다룬다', /popups: \['popup_content'\]/.test(util),
    'Quill 이 만든 마크업이라 통째로 번역기에 넣으면 태그가 깨진다');
const popupCtrl = 주석제거(읽기('controllers/popup.controller.js'));
t('팝업 저장이 대기열에 싣는다', (popupCtrl.match(/settingLangs\(/g) ?? []).length === 2,
    '만들 때와 고칠 때 둘 다 실어야 한다');
t('팝업 마이그레이션 파일이 있다',
    existsSync(BACK_ROOT + 'migrations/2026-08-26_popups_lang_obj.sql'),
    'popups 에는 lang_obj 컬럼이 없다 — 컬럼 없이 목록에만 넣으면 스케줄러가 실패한다');

// 혜택안내 팝업 머리글. 화면은 formatLang 으로 부르는데 대상 목록에 없어 늘 원문이었다.
t('혜택안내 popup_title 이 대상에 있다',
    /benefit_notices: \[[\s\S]*?'popup_title'/.test(sched));

// 대상 목록에 표를 새로 넣을 때 마이그레이션이 늦으면 백필이 통째로 멈춘다.
t('백필이 lang_obj 없는 표를 건너뛴다',
    /COLUMN_NAME = 'lang_obj'/.test(backfill) && /건너뜁니다/.test(backfill),
    '한 표를 건너뛰는 게 아니라 Unknown column 으로 전체가 멈춘다');

// ── HTML 본문 번역이 조각수 불일치로 포기하던 것 (2026-08-26) ────────────
//
// 텍스트 조각을 줄바꿈으로 이어 한 번에 번역하고 다시 쪼개는데, 번역기가 줄을 합치거나
// 더 쪼개면 수가 어긋난다. 예전에는 그때 그 언어를 통째로 포기했다 —
// **문단이 여러 개인 글이 조용히 원문으로 남았다.** 언어마다 결과가 달라
// 같은 팝업이 일본어는 되고 영어·중국어·스페인어만 빠졌다(mbc01·테스트01 실측).
// 게시글 본문·상품 상세설명·혜택안내 탭도 같은 규칙을 탄다.
{
    const g = util.slice(util.indexOf('export const gtransHtml'));
    const 본체 = g.slice(0, g.indexOf('export const settingLangs'));
    t('조각수가 어긋나도 포기하지 않는다',
        !/parts\.length !== texts\.length\) \{[\s\S]{0,200}?return null;/.test(본체),
        '어긋나자마자 null 을 돌려주면 문단 여러 개인 글은 영영 원문으로 남는다');
    t('어긋나면 조각별로 다시 번역한다', /for \(const t of texts\)/.test(본체));
    t('조각 하나라도 실패하면 그 언어는 포기한다', /if \(!r\) \{[\s\S]{0,160}?return null;/.test(본체),
        '반쪽만 번역하면 한 문단만 한국어로 남아 더 이상해 보인다');
    t('먼저 한 번에 보내 본다', 본체.indexOf('texts.join') < 본체.indexOf('for (const t of texts)'),
        '조각별 번역은 호출이 문단 수만큼 늘어난다 — 어긋났을 때만 쓴다');
}

// 언어팩을 안 켠 몰에서는 아무 일도 없어야 한다 — 대부분의 몰이 그렇다.
t('언어팩 꺼진 몰은 그냥 지나간다', /is_use_lang != 1\)\s*\{\s*return;/.test(util),
    '이 가드가 없으면 언어를 안 쓰는 몰까지 번역 대기열을 채운다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
