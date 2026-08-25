import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 프레임5·6 관련 두 건 (포스페이 요청서 20260824).
//
//  ② "5번 타입 — 사진 이미지와 제목 순서 변경. 모바일상에서도 사진이 먼저"
//  ③ "5,6번 타입 — 영문버젼 하단 가맹점 정보 한글로 계속 보임"
//
// ② 는 처음에 모바일만 CSS order 로 뒤집었는데, 2026-08-26 에 사장님이 보완 지시를 주셨다:
//    "PC 버전도 이 화면 좌우 영역을 바꾸는 것이 포함되어 있었다. 기계적으로 좌우 영역만
//     바꾸지 말고 UI 등도 적절하게 변경해야 함."
//    그래서 DOM 순서를 사진 → 글로 바꾸고(PC 왼쪽·모바일 위가 사진), order 뒤집기는 없앴다.
//    구분선도 사진 칸 쪽으로 옮겼다 — 양쪽이 그으면 두 줄이 되고, 아무도 안 그으면 붙어 버린다.
//    좌우만 바꾸면 드러나는 것들(빈 자리·잘린 버튼·동동 뜬 사진)도 함께 손봤다.
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

// PC 도 좌우를 바꾼다(2026-08-26 보완 지시). 사진이 왼쪽, 글이 오른쪽이다.
// PC·모바일 모두 사진이 먼저이므로 DOM 순서 자체가 사진 → 글이고, CSS order 뒤집기는 없앴다.
const 블록 = (이름) => {
    const s = 코드5.slice(코드5.indexOf(`const ${이름} = styled`));
    return s.slice(0, s.indexOf('`', s.indexOf('`') + 1) + 1);
};
const iMedia = 코드5.indexOf('<HeroMedia>');
const iInfo = 코드5.indexOf('<HeroInfo>');
t('JSX 순서가 사진 → 글', iMedia > 0 && iInfo > 0 && iMedia < iInfo,
    'PC 왼쪽·모바일 위가 사진이다 — DOM 순서가 곧 화면 순서다');
t('order 로 다시 뒤집지 않는다', !/order:\s*-1/.test(코드5),
    'DOM 이 이미 사진 먼저다 — order 까지 주면 두 번 뒤집혀 원래대로 돌아간다');

const media블록 = 블록('HeroMedia');
t('사진 칸이 데스크톱 세로 구분선을 갖는다', /border-right: 1px solid #000;/.test(media블록),
    '사진이 왼쪽이 되었으므로 선도 사진 칸 오른쪽에 있어야 한다');
t('사진 아래에 모바일 구분선이 있다',
    /@media \(max-width: 840px\)[\s\S]*?border-bottom: 1px solid #000;/.test(media블록),
    '없으면 사진과 글이 붙는다');

const info블록 = 블록('HeroInfo');
t('글 칸에는 구분선이 없다',
    !/border-right: 1px solid #000;/.test(info블록) && !/border-bottom: 1px solid #000;/.test(info블록),
    '사진 칸이 이미 긋고 있다 — 양쪽이 그으면 두 줄이 된다');

// 아래는 좌우 교체와 함께 손본 것들. 되돌아가기 쉬운 자리라 못 박아 둔다.
const hero블록 = 블록('Hero');
t('히어로 높이가 헤더를 감안한다', /min-height: calc\(100vh - 5rem\)/.test(hero블록),
    'sticky 헤더가 위를 차지해 100vh 그대로면 구매하기 버튼이 잘린다');
t('주소창 높이 변화도 견딘다', /min-height: calc\(100svh - 5rem\)/.test(hero블록));
t('버튼을 칸 맨 아래에 붙이지 않는다', !/justify-content: space-between;/.test(info블록),
    '100vh 칸에서 글과 버튼 사이가 화면 절반만큼 비었다');
t('제목·정보·버튼을 가운데 모은다', /justify-content: center;/.test(블록('HeroBody')));

const img블록 = 블록('HeroImage');
t('사진이 칸 너비를 따라간다', /width: 100%;/.test(img블록) && /max-width:/.test(img블록),
    '400px 고정이라 960px 짜리 칸 안에서 사진이 동동 떠 보였다');
t('사진이 정사각을 유지한다', /aspect-ratio: 1 \/ 1;/.test(img블록));
t('제목 크기가 칸 너비를 따라간다', /font-size: clamp\(/.test(블록('HeroTitle')),
    '96px 고정이면 노트북 폭에서 긴 상품명이 칸을 넘친다');

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
