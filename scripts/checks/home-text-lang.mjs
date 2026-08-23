import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';
import { 홈문구 } from 'file:///c:/Users/user/Desktop/project24/shop/coupon_shopping_mall_front-master/src/utils/format.js';
import { HOME_TEXT_SCHEMA } from 'file:///c:/Users/user/Desktop/project24/shop/coupon_shopping_mall_front-master/src/data/home-texts.js';

// 홈 화면 섹션 문구의 다국어.
//
// [무엇이 문제였나]
// 가맹점이 디자인관리 › 홈 문구에 넣는 값(브랜드 소개·특징 제목·스토리 본문 등)은
// 번역이 전혀 안 됐다. 한국어로 넣으면 영어·중국어 화면에도 그 한국어가 그대로 나왔다.
// 다국어를 켠 몰에서는 메인 첫 화면이 통째로 안 맞는 셈이다.
//
// 이유는 저장 위치다. 번역 대기열(lang_processes)은 '테이블 + 컬럼' 단위인데
// 이 값들은 brands.setting_obj 라는 JSON 안에 들어 있어 담을 수가 없었다.
//
// [지금 구조]
//   저장할 때  brandSettingLang 이 home_texts[데모키] 의 문자열 값을 전부 번역해
//              같은 묶음 안에 lang_obj 로 넣는다 (shop_obj 를 다루는 방식과 같다)
//   읽을 때    홈문구(t, '키', currentLang) → formatLang 이 그 lang_obj 를 본다
//
// 두 쪽이 **같은 모양**을 쓰지 않으면 조용히 원문으로 폴백해서, 번역이 되고 있는데도
// 화면에는 한국어가 남는다. 그 계약을 여기서 실제로 돌려 본다.

const 읽기F = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
const 읽기B = (p) => readFileSync(BACK_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 계약: 백엔드가 넣는 모양을 프론트가 읽는가 ────────────────────────────
// 백엔드가 만드는 것은 정확히 이 모양이다.
//   묶음.lang_obj = { 키: { ko: 원문, en: 번역, cn: 번역, ... } }
const 묶음 = {
    brand_intro: '단 하나의 제품에 집중하는 브랜드입니다.',
    edition: '№ 001',
    lang_obj: {
        brand_intro: { ko: '단 하나의 제품에 집중하는 브랜드입니다.', en: 'A brand devoted to a single product.' },
        // edition 은 번역이 없다 — 원문으로 폴백해야 한다.
    },
};
t('영어 화면에서는 번역본이 나온다', 홈문구(묶음, 'brand_intro', 'en') === 'A brand devoted to a single product.');
t('한국어 화면에서는 원문이 나온다', 홈문구(묶음, 'brand_intro', 'ko') === '단 하나의 제품에 집중하는 브랜드입니다.');
// 번역이 없는 키는 원문으로 떨어져야 한다. 빈 값을 돌려주면 화면이 비어 버린다.
t('번역이 없으면 원문으로 떨어진다', 홈문구(묶음, 'edition', 'en') === '№ 001');
t('없는 키는 undefined', 홈문구(묶음, '없는키', 'en') === undefined);
// 언어팩을 안 켠 몰은 lang_obj 자체가 없다.
t('lang_obj 가 없어도 원문이 나온다', 홈문구({ brand_intro: '가나다' }, 'brand_intro', 'en') === '가나다');
t('t 가 없어도 죽지 않는다', 홈문구(undefined, 'brand_intro', 'en') === undefined);
// currentLang 은 객체({value:'en'})로도 들어온다 — formatLang 이 둘 다 받아야 한다.
t('언어를 객체로 넘겨도 된다', 홈문구(묶음, 'brand_intro', { value: 'en' }) === 'A brand devoted to a single product.');

// ── 화면 6개가 전부 홈문구() 로 읽는가 ────────────────────────────────────
// 한 곳이라도 t.키 로 남아 있으면 그 문구만 늘 한국어로 뜬다 — 눈에 잘 안 띈다.
for (const n of [4, 5, 6, 7, 8, 9]) {
    const s = 읽기F(`src/views/blog/home/demo-${n}.js`);
    // 주석은 빼고 본다.
    const 코드 = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const 남은 = (코드.match(/\bt\.[a-zA-Z_][a-zA-Z0-9_]*/g) || []);
    t(`demo-${n} 이 전부 홈문구()로 읽는다`, 남은.length === 0, `남은 것: ${남은.join(', ')}`);
    t(`demo-${n} 이 홈문구를 가져온다`, /홈문구/.test(s));
}

// ── 백엔드 배선 ───────────────────────────────────────────────────────────
const lang = 읽기B('utils.js/schedules/lang-process.js');
t('저장할 때 홈 문구를 번역한다', /const 홈문구 = new_brand_data\?\.setting_obj\?\.home_texts;/.test(lang));
// 키 목록을 박아 두면 화면에 필드가 늘 때마다 여기를 같이 고쳐야 한다 — 그러다 빠뜨린다.
t('키 목록을 박지 않고 문자열 값을 전부 돈다',
    /typeof 묶음\[k\] === 'string'/.test(lang),
    '목록으로 박으면 HOME_TEXT_SCHEMA 에 필드가 늘 때 조용히 빠진다');
t('lang_obj 를 같은 묶음 안에 넣는다', /묶음\.lang_obj = \{/.test(lang));
t('번역이 실패해도 저장은 된다', /홈 문구 번역 실패/.test(lang));
// 언어팩이 꺼져 있으면 settingLangs 가 undefined 를 준다.
t('언어팩이 꺼져 있으면 건너뛴다', /if \(!결과\) continue;/.test(lang));
// setting_obj 는 들어올 때 JSON.parse 된다. 객체 그대로 돌려주면 [object Object] 가 저장된다.
t('setting_obj 를 문자열로 되돌려 준다', /new_brand_data\.setting_obj = 저장용_setting_obj;/.test(lang));

const brand = 읽기B('controllers/brand.controller.js');
t('저장할 때 번역된 setting_obj 를 되받는다',
    /if \(obj\.setting_obj !== undefined && lang_setting\?\.setting_obj !== undefined\) \{/.test(brand));
// 부분 업데이트에서 setting_obj 를 통째로 날리면 안 된다.
t('보내온 경우에만 덮어쓴다', /obj\.setting_obj !== undefined &&/.test(brand));

// ── 스키마 ───────────────────────────────────────────────────────────────
// 화면에서 쓰는 키가 편집 UI 에도 있어야 가맹점이 값을 넣을 수 있다.
for (const n of [4, 5, 6, 7, 8, 9]) {
    const 스키마키 = new Set((HOME_TEXT_SCHEMA?.[n]?.fields ?? []).map((f) => f.key));
    const s = 읽기F(`src/views/blog/home/demo-${n}.js`);
    const 화면키 = [...new Set([...s.matchAll(/홈문구\(t, '([^']+)'/g)].map((m) => m[1]))];
    const 빠진것 = 화면키.filter((k) => !스키마키.has(k));
    t(`demo-${n} 화면 키가 편집 UI 에 다 있다`, 빠진것.length === 0,
        `편집 화면에 없어서 가맹점이 못 넣는 키: ${빠진것.join(', ')}`);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
