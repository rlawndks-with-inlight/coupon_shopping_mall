import { BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

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

// 언어팩을 안 켠 몰에서는 아무 일도 없어야 한다 — 대부분의 몰이 그렇다.
const util = 주석제거(읽기('utils.js/util.js'));
t('언어팩 꺼진 몰은 그냥 지나간다', /is_use_lang != 1\)\s*\{\s*return;/.test(util),
    '이 가드가 없으면 언어를 안 쓰는 몰까지 번역 대기열을 채운다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
