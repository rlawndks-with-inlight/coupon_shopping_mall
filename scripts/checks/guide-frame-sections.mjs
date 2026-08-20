import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 가이드의 디자인관리 안내가 화면과 어긋나지 않는지 본다.
//
// 이 파일이 지키는 것:
//   · 계열(프레임1·2 / 3·4 / 5·6)별로 항목이 갈라져 있는가
//   · 없는 메뉴 이름으로 안내하지 않는가
//   · 미리보기 구성 안내가 프레임마다 있는가
//   · 우리가 임의로 짠 섹션 차례를 다시 권하지 않는가
//
// guideContent.js 는 import 를 쓸 수 없다 — PDF 추출기가 파일을 통째로 평가하므로 다른
// 파일을 불러오는 순간 PDF 빌드가 깨진다. 그래서 내용을 옮겨 적을 수밖에 없고,
// 옮겨 적은 것은 언젠가 어긋난다. 그 어긋남을 여기서 잡는다.

const 가이드 = readFileSync(FRONT_ROOT + 'src/components/manager/guideContent.js', 'utf8');
const 섹션데이터 = readFileSync(FRONT_ROOT + 'src/data/frame-sections.js', 'utf8');
const 스키마 = readFileSync(FRONT_ROOT + 'src/utils/format.js', 'utf8');

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// 예전에는 가이드에 우리가 짠 섹션 차례를 프레임마다 적어 두고, 그것이
// frame-sections.js 의 추천 목록과 같은지 여기서 대조했다. 그 문구를 없앴으므로
// 대조할 대상도 사라졌다 — 이제 가이드는 미리보기 구성만 말한다.
// (없앤 이유는 guideContent.js 주석 참고: 미리보기와 다른 차례를 나란히 두니 어긋나 보였고,
// '미리보기엔 에디터도 동영상도 없는데 왜 넣으라 하냐'는 물음이 바로 나왔다)
// 조리법이 되살아나면 같은 어긋남이 다시 생기므로 그것만 막는다.
t('가이드가 임의의 섹션 차례를 권하지 않는다', 가이드.indexOf(" 이 순서로', desc:") < 0);
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
// 메뉴 이름은 계열과 무관하게 「메인페이지관리」다. 코드에 '블로그 ' 접두어를 붙이는 분기가
// 있지만, 쇼핑몰·블로그 데모 번호가 **둘 다** 설정된 브랜드에만 붙는다 — 122개 중 데모 1곳뿐이다.
// 예전 가이드는 이걸 반대로 적어 가맹점이 없는 이름을 찾게 만들었다.
t('프레임3·4 도 메뉴 이름은 메인페이지관리',
    /where: '디자인관리 › 메인페이지관리'/.test(가이드.slice(i34, i34 + 1200)));
t('없는 메뉴 이름으로 안내하지 않는다', !/블로그 메인페이지관리/.test(
    가이드.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')));
t('프레임3·4 경로도 blog-main 이다',
    가이드.slice(i34, i34 + 3000).includes("/manager/designs/blog-main/all"));

// 가맹점에게 감춘 것을 가이드가 안내하면 안 된다(특성 섹션은 메뉴에서 뺐다).
t('가이드가 특성 섹션을 권하지 않는다', !/특성별 슬라이드/.test(가이드));

// ── 미리보기 구성 안내 ────────────────────────────────────────────────────
// 가맹점은 미리보기를 보고 프레임을 고른다. 그러면 가장 먼저 묻는 것이 '그 화면을 어떻게
// 만드냐'다. 예전 가이드는 우리가 짠 조리법만 적어 두고 미리보기 이야기가 없었고,
// 한때는 '이 순서로 넣으면 그 구성이 된다'고 잘못 적기까지 했다(실제로는 전혀 다르다).
//
// 여기서는 '그 안내가 프레임마다 있는가'만 본다. 구성 내용 자체는 우리 저장소 밖의
// 데이터(실제 가맹점 몰의 DB)라 코드로 확인할 수 없다 — 그 한계는 guideContent 주석에 적었다.
for (const [id, 문구] of [
    ['menu-design-shop', ['프레임1 미리보기는 이렇게', '프레임2 미리보기는 이렇게']],
    ['menu-design-column', ['프레임3 미리보기는 이렇게', '프레임4 미리보기는 이렇게']],
    ['menu-design-landing', ['미리보기는 이렇게']],
]) {
    const i = 가이드.indexOf(`id: '${id}'`);
    const 끝 = 가이드.indexOf("    id: '", i + 10);
    const 조각 = 가이드.slice(i, 끝 < 0 ? i + 4000 : 끝);
    for (const f of 문구) t(`${id} 에 「${f}」 안내가 있다`, 조각.includes(f));
}
// 잘못 적었던 문장이 되살아나지 않게 못 박는다.
t("'그 구성이 됩니다' 라고 단정하지 않는다", !/대로 섹션을 넣으면 그 구성이 됩니다/.test(가이드));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
