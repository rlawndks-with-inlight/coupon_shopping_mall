import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 섹션 편집칸이 '실제로 화면에 반영되는 값' 만 보여 주는지 본다.
//
// 왜 필요한가:
//   '단일 상품 강조' 에 상품 설명 배치·배경색상·슬라이더 속도·컨텐츠 개수 네 칸이 떠 있었다.
//   그런데 HomeItemHero 가 읽는 값은 hero_type 과 margin_top 둘뿐이다 — 네 칸은 상품슬라이드
//   에서 복사돼 따라온 것이고, 고쳐도 화면이 하나도 안 바뀐다.
//   되지도 않는 칸은 없는 것보다 나쁘다. 가맹점은 값을 바꾸고 저장한 뒤 화면을 보고
//   '내가 뭘 잘못했나' 를 찾는다. 그 시간이 전부 문의로 온다.
//
//   편집칸과 컴포넌트는 서로 다른 파일이라 아무도 어긋난 걸 모른다. 여기서 맞춰 본다.

const 설정 = readFileSync(FRONT_ROOT + 'src/views/manager/main_obj/setting.js', 'utf8');

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// isProductList={1} 을 넘기면 두 칸이 함께 뜬다.
// 2026-09-02: 상품 슬라이드가 '레일(가로 스크롤)' 로 바뀌면서 슬라이더 속도·컨텐츠 개수 칸은 읽는 곳이 없어 제거했다.
//   되지도 않는 칸은 없는 것보다 나쁘다 — 남은 건 배치(text_align)·배경색(back_color) 뿐이다.
const 두칸 = ['text_align', 'back_color'];
const 사라진칸 = ['slider_speed', 'rows'];
t('두 칸이 한 묶음으로 뜬다', /isProductList == 1 &&/.test(설정)
    && 두칸.every((k) => 설정.includes(`['${k}']`)));
t('레일 전환으로 안 쓰는 슬라이더 칸은 없다', 사라진칸.every((k) => !설정.includes(`['${k}']`)));

// 섹션 블록을 잘라 그 안에서 isProductList 를 넘겼는지 본다.
const 블록 = (type) => {
    const i = 설정.indexOf(`conditionOfSection('${type}', item)`);
    if (i < 0) return '';
    const j = 설정.indexOf('conditionOfSection(', i + 30);
    return 설정.slice(i, j < 0 ? i + 4000 : j);
};
const 네칸띄우나 = (type) => /isProductList=\{1\}/.test(블록(type));

// 컴포넌트가 그 값을 실제로 읽는가.
const 읽나 = (경로, 키) => readFileSync(FRONT_ROOT + 경로, 'utf8').includes(키);

const 대상 = [
    ['item-hero', ['src/views/section/shop/HomeItemHero.js']],
    ['items', ['src/views/section/shop/HomeItems.js', 'src/views/section/blog/HomeItems.js']],
    ['items-ids', ['src/views/section/shop/HomeItems.js', 'src/views/section/blog/HomeItems.js']],
    ['items-property-group-:num', ['src/views/section/shop/HomeItemsPropertyGroups.js',
                                   'src/views/section/blog/HomeItemsPropertyGroups.js']],
];
for (const [type, 파일들] of 대상) {
    const 뜬다 = 네칸띄우나(type);
    // ⚠ some 이 아니라 every 다. 프레임마다 컴포넌트가 따로라, 한쪽만 읽으면 그 프레임에서는
    //   여전히 죽은 칸이다 — 실제로 블로그형 특성 섹션이 그랬다(쇼핑몰형만 네 칸을 썼다).
    const 쓴다 = 두칸.every((k) => 파일들.every((f) => 읽나(f, k)));
    t(`${type}: 칸을 띄우는 것과 값을 쓰는 것이 맞는다 (칸 ${뜬다 ? '뜸' : '안뜸'} / 값 ${쓴다 ? '씀' : '안씀'})`,
        뜬다 === 쓴다);
}

// 단일 상품 강조가 실제로 읽는 두 값은 편집칸이 그대로 있어야 한다.
const hero = readFileSync(FRONT_ROOT + 'src/views/section/shop/HomeItemHero.js', 'utf8');
t('단일 상품 강조는 hero_type 을 쓴다', hero.includes('hero_type'));
t('단일 상품 강조는 margin_top 을 쓴다', hero.includes('margin_top'));
t('디자인 타입 칸이 남아 있다', /label='디자인 타입'/.test(설정));
// 윗마진은 네 칸 묶음 밖이라 isProductList 와 무관하게 늘 뜬다.
t('윗마진은 묶음 밖이다', 설정.indexOf("label='윗마진'") > 설정.indexOf('isProductList == 1 &&'));

// 제목은 죽은 칸이 아니다 — 비우면 안 나오고, 채우면 섹션 위에 붙는다(번역도 탄다).
t('제목은 실제로 그려진다', /column\?\.title && <SectionTitle>/.test(hero));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
