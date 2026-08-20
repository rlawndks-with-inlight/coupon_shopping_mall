import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 가이드에 적힌 '이 순서로 넣으세요' 가 실제 추천 목록과 같은지 본다.
//
// 왜 이런 검사가 필요한가:
//   guideContent.js 는 import 를 쓸 수 없다. PDF 추출기(extract.mjs)가 그 파일을 data URL 로
//   감싸 통째로 평가하기 때문에, 다른 파일을 불러오는 순간 경로를 못 찾고 PDF 빌드가 깨진다.
//   그래서 프레임별 섹션 차례를 frame-sections.js 에서 가져다 쓰지 못하고 옮겨 적었다.
//   옮겨 적은 값은 반드시 어긋난다 — 한쪽만 고치는 날이 오기 때문이다. 여기서 묶어 둔다.
//
// 판정: 가이드 문장에서 '→' 로 이어진 섹션 이름을 뽑아, 추천 목록의 type 순서와 맞춘다.

const 가이드 = readFileSync(FRONT_ROOT + 'src/components/manager/guideContent.js', 'utf8');
const 섹션데이터 = readFileSync(FRONT_ROOT + 'src/data/frame-sections.js', 'utf8');
const 스키마 = readFileSync(FRONT_ROOT + 'src/utils/format.js', 'utf8');

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// 섹션 type ↔ 화면에 보이는 이름(label). 편집기 목록과 같은 이름으로 안내해야 찾을 수 있다.
const 조각 = 스키마.slice(스키마.indexOf('export const mainObjSchemaList'));
const 이름 = {};
for (const m of 조각.matchAll(/label: '([^']+)',\s*\n\s*type: '([^']+)'/g)) 이름[m[2]] = m[1];
t('섹션 이름표를 읽었다', Object.keys(이름).length >= 10);

// 추천 목록(진짜 값)
const 추천 = {};
const 추천조각 = 섹션데이터.slice(섹션데이터.indexOf('const 추천 = {'), 섹션데이터.indexOf('};', 섹션데이터.indexOf('const 추천 = {')));
for (const m of 추천조각.matchAll(/'(shop:\d|blog:\d)':\s*\[([^\]]+)\]/g)) {
    추천[m[1]] = m[2].split(',').map((s) => s.trim().replace(/'/g, '')).filter(Boolean);
}
t('추천 목록을 읽었다', Object.keys(추천).length === 4, JSON.stringify(Object.keys(추천)));

// 가이드에 적힌 차례
const 가이드차례 = (라벨) => {
    const i = 가이드.indexOf(`label: '${라벨}'`);
    if (i < 0) return null;
    const desc = 가이드.slice(i, 가이드.indexOf('\n', i));
    const m = desc.match(/desc: '([^']+)'/);
    if (!m) return null;
    // 첫 문장(마침표 앞)까지가 차례다. 뒤 설명에 섹션 이름이 또 나와도 안 섞이게 자른다.
    const 앞 = m[1].split('. ')[0];
    return 앞.split('→').map((s) => s.trim()).filter(Boolean);
};

const 짝 = [
    ['프레임1 이 순서로', 'shop:1'],
    ['프레임2 이 순서로', 'shop:2'],
    ['프레임3 이 순서로', 'blog:1'],
    ['프레임4 이 순서로', 'blog:2'],
];
for (const [라벨, 키] of 짝) {
    const 적힌것 = 가이드차례(라벨);
    const 진짜 = (추천[키] ?? []).map((tp) => 이름[tp] ?? ('?' + tp));
    t(`${라벨} (${키}) 가 추천 목록과 같다`,
        적힌것 !== null && JSON.stringify(적힌것) === JSON.stringify(진짜),
        `가이드: ${JSON.stringify(적힌것)}\n        실제 : ${JSON.stringify(진짜)}`);
}

// ── 계열별 항목이 실제로 갈라져 있는가 ────────────────────────────────────
// 예전에는 프레임1·2 와 3·4 가 디자인관리 한 항목을 같이 봤다. 그러면 '어떤 섹션을 어떤
// 차례로' 를 계열별로 적을 수가 없다 — 그게 가맹점이 가장 많이 묻는 것이다.
for (const [id, group] of [['menu-design-shop', 'shop'], ['menu-design-column', 'column'], ['menu-design-landing', 'landing']]) {
    const i = 가이드.indexOf(`id: '${id}'`);
    t(`${id} 항목이 있다`, i > 0);
    if (i > 0) t(`${id} 는 ${group} 계열 전용`, 가이드.slice(i, i + 200).includes(`groups: ['${group}']`));
}
t('옛 공용 항목(menu-design)이 남아 있지 않다', !/id: 'menu-design',/.test(가이드));

// 프레임3·4 는 메뉴 이름이 다르다. 「메인페이지관리」로 안내하면 못 찾는다.
const i34 = 가이드.indexOf("id: 'menu-design-column'");
t('프레임3·4 는 블로그 메인페이지관리로 안내한다',
    가이드.slice(i34, i34 + 900).includes('블로그 메인페이지관리'));
t('프레임3·4 경로도 blog-main 이다',
    가이드.slice(i34, i34 + 3000).includes("/manager/designs/blog-main/all"));

// 가맹점에게 감춘 것을 가이드가 안내하면 안 된다(특성 섹션은 메뉴에서 뺐다).
t('가이드가 특성 섹션을 권하지 않는다', !/특성별 슬라이드/.test(가이드));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
