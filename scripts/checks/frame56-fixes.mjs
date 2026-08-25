import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 프레임5·6 관련 두 건 (포스페이 요청서 20260824).
//
//  ② "5번 타입 모바일 — 사진 이미지와 제목 순서 변경. 모바일상에서도 사진이 먼저"
//  ③ "5,6번 타입 — 영문버젼 하단 가맹점 정보 한글로 계속 보임"
//
// ② 는 CSS order 로만 뒤집는다. JSX 순서를 바꾸면 데스크톱의 좌(글)/우(사진)가 함께
//    뒤집히고 테두리 규칙(HeroLeft 의 border-right)도 어긋난다.
//    구분선도 같이 옮겨야 한다 — 안 옮기면 Hero 자체의 border-bottom 과 겹쳐 두 줄이 되고
//    정작 사진과 글 사이는 붙어 버린다.
//
// ③ 은 **라벨만** 번역한다. 값(상호명·대표자명·주소)은 등기된 고유명사라 그대로 둔다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// ── ② 프레임5 히어로 순서 ────────────────────────────────────────────────
const home5 = 읽기('src/views/blog/home/demo-4.js');
const 코드5 = 주석제거(home5);

// JSX 는 글(HeroLeft) → 사진(HeroRight) 순서 그대로여야 한다.
const iLeft = 코드5.indexOf('<HeroLeft>');
const iRight = 코드5.indexOf('<HeroRight>');
t('JSX 순서는 글 → 사진 그대로', iLeft > 0 && iRight > 0 && iLeft < iRight,
    'DOM 을 바꾸면 데스크톱 좌우가 함께 뒤집힌다 — 뒤집는 것은 CSS order 로만 한다');

// HeroRight 의 모바일 블록에 order:-1 과 구분선이 있어야 한다.
const heroRight = 코드5.slice(코드5.indexOf('const HeroRight = styled.div`'));
const heroRight블록 = heroRight.slice(0, heroRight.indexOf('`', heroRight.indexOf('`') + 1) + 1);
t('모바일에서 사진을 위로 올린다', /@media \(max-width: 840px\)[\s\S]*?order: -1;/.test(heroRight블록));
t('사진 아래에 구분선이 있다', /@media \(max-width: 840px\)[\s\S]*?border-bottom: 1px solid #000;/.test(heroRight블록),
    '없으면 사진과 글이 붙는다');

// HeroLeft 의 모바일 블록에는 구분선이 남아 있으면 안 된다(두 줄이 된다).
const heroLeft = 코드5.slice(코드5.indexOf('const HeroLeft = styled.div`'));
const heroLeft블록 = heroLeft.slice(0, heroLeft.indexOf('`', heroLeft.indexOf('`') + 1) + 1);
t('글 아래 구분선은 없앴다', !/@media \(max-width: 840px\)[\s\S]*?border-bottom: 1px solid #000;/.test(heroLeft블록),
    'Hero 자체의 border-bottom 과 겹쳐 두 줄이 된다');
t('데스크톱 세로 구분선은 그대로', /border-right: 1px solid #000;/.test(heroLeft블록));

// ── ③ 프레임5·6 푸터 라벨 번역 ───────────────────────────────────────────
// BlogLayout6 은 blog 데모 4~9 가 모두 쓴다 = 프레임5·6 양쪽.
const layout = 읽기('src/layouts/shop/blog/demo-6/BlogLayout6.js');
const 코드L = 주석제거(layout);

const 라벨들 = ['상호', '대표', '사업자등록번호', '통신판매업신고번호', '고객센터', '주소', '개인정보보호책임자'];
for (const 라벨 of 라벨들) {
    t(`푸터 '${라벨}' 라벨이 번역을 거친다`,
        new RegExp(`\\{translate\\('${라벨}'\\)\\} ·`).test(코드L),
        '영문 화면에서 이 라벨만 한글로 남는다');
}
// 값까지 번역에 넣으면 안 된다 — 상호명·대표자명은 등기된 고유명사다.
t('값은 번역하지 않는다',
    /translate\('상호'\)\} · \{themeDnsData\.company_name\}/.test(코드L)
    && !/translate\(themeDnsData/.test(코드L));

// 사전에 다섯 언어 모두 있어야 한다. 하나라도 빠지면 그 언어에서 한글 키가 그대로 나온다.
for (const lang of ['ko', 'en', 'ja', 'cn', 'es']) {
    const d = 읽기(`src/locales/langs/${lang}.js`);
    const 빠진것 = 라벨들.filter((k) => !d.includes(`"${k}":`));
    t(`${lang} 사전에 푸터 라벨이 다 있다`, 빠진것.length === 0, 빠진것.join(', '));
}
// '대표' 는 푸터 11곳이 함께 쓴다. 대기업 CEO 가 아니라 사업자정보의 대표자다.
{
    const en = 읽기('src/locales/langs/en.js');
    t("영문 '대표' 가 소문자 ceo 가 아니다", !/"대표": "ceo"/.test(en),
        '화면에 ceo · 김성모 로 나온다');
    const ja = 읽기('src/locales/langs/ja.js');
    t("일문 '대표' 가 最高経営責任者 가 아니다", !/"대표": "最高経営責任者"/.test(ja),
        '사업자정보의 대표자를 대기업 CEO 로 옮긴 것이다');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
