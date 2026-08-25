import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 팝업관리 메뉴 위치.
//
// 가맹점 의견으로 「디자인관리 › 팝업관리」를 「게시판관리 › 팝업관리」로 옮겼다.
// 공지·문의처럼 '손님에게 알리는 것'이라 한자리에 모이는 편이 찾기 쉽다는 이유다.
//
// 옮기면서 세 가지가 같이 따라와야 한다 —
//   ① 주소(/manager/designs/popup)는 그대로. 파일을 옮기면 북마크와 가이드 링크가 깨진다.
//   ② 권한은 옮겨 간 그룹(게시판관리, 레벨10 이상)에 맞춘다.
//   ③ 디자인관리에서 팝업이 빠지면서 하위가 통째로 빌 수 있게 됐다 — 비면 그룹을 안 그린다.
//      빈 채로 두면 눌렀을 때 /manager/designs → 메인페이지관리로 튕기는데,
//      그 몰에는 메인페이지관리가 없어서 엉뚱한 화면으로 간다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

const nav = 읽기('src/layouts/manager/nav/config-navigation.js');

// 주석을 걷어내고 '진짜 코드'만 본다 — 주석에 남은 옛 흔적을 코드로 착각하면 안 된다.
// (예전에 주석 안의 logoSrc() 를 코드로 보고 엉뚱한 파일을 고친 적이 있다.)
// ⚠ 직접 짜지 말 것 — CRLF 파일에서 조용히 새는 함정이 있다(_roots.mjs 주석 참고).
const 코드 = 주석제거(nav);

// ── ① 주소는 그대로 ──────────────────────────────────────────────────────
t('팝업 주소는 designs/popup 그대로', /PATH_MANAGER\.designs\.popup/.test(코드),
    '파일을 articles 아래로 옮기면 가맹점 북마크와 가이드 링크가 깨진다');
const paths = 읽기('src/data/manager-data.js');
t('경로 상수가 /designs/popup 을 가리킨다',
    /popup: path\(ROOTS_MANAGER, '\/designs\/popup'\)/.test(paths));
const 실제파일 = 읽기('src/pages/manager/designs/popup/index.js');
t('그 주소의 화면 파일이 실제로 있다', 실제파일.includes('PopupList'));

// ── ② 어느 그룹 아래에 있는가 ────────────────────────────────────────────
// 게시판관리 블록과 디자인관리 블록을 각각 잘라 그 안에 있는지로 판단한다.
const i게시판 = 코드.indexOf("title: '게시판관리'");
const i디자인 = 코드.indexOf("title: '디자인관리'");
t('게시판관리 · 디자인관리 두 그룹을 모두 찾았다', i게시판 > 0 && i디자인 > 0);
t('게시판관리가 디자인관리보다 앞에 있다', i게시판 < i디자인,
    '순서가 바뀌면 아래 구간 계산이 어긋난다');

const 게시판블록 = 코드.slice(i게시판, i디자인);
const 디자인블록 = 코드.slice(i디자인);
t('팝업관리가 게시판관리 아래에 있다', /팝업관리/.test(게시판블록));
t('팝업관리가 디자인관리에 남아 있지 않다', !/{ title: '팝업관리'/.test(디자인블록),
    '두 곳에 다 있으면 메뉴에 두 번 나온다');

// 권한: 게시판관리 그룹은 레벨10 이상. 팝업만 따로 레벨 조건을 달지 않았는지 본다.
t('게시판관리 그룹은 레벨10 이상에서 열린다', /user\?\.level >= 10 \? \[/.test(코드));
t('팝업관리에 별도 레벨 조건을 달지 않았다',
    /\{ title: '팝업관리', path: PATH_MANAGER\.designs\.popup \},/.test(코드),
    '그룹 권한(레벨10)에 맞추기로 했다 — 항목에 조건을 더 걸면 기준이 두 개가 된다');

// ── ③ 디자인관리가 비면 그리지 않는다 ────────────────────────────────────
t('디자인관리 하위를 먼저 만들어 본다', /const 디자인_하위 = \[/.test(코드));
t('하위가 비면 그룹을 내린다', /디자인_하위\.length === 0\) return \[\]/.test(코드));
t('레벨 조건도 그대로 유지한다', /!isManager\(\) \|\| 디자인_하위\.length === 0/.test(코드));

// ── 가이드 문구도 같이 옮겼는가 ──────────────────────────────────────────
// 화면과 가이드가 다르면 가맹점은 가이드대로 찾다가 못 찾는다.
const guide = 읽기('src/components/manager/guideContent.js');
t('가이드의 팝업 위치가 게시판관리로 바뀌었다', /where: '게시판관리 › 팝업관리'/.test(guide));
t('가이드에 옛 위치가 남아 있지 않다', !/where: '디자인관리 › 팝업관리'/.test(guide));
t('게시판관리 항목에서도 팝업을 안내한다', /팝업관리도 여기에/.test(guide),
    '게시판관리를 보고 있는 사람이 팝업이 여기 있다는 걸 알아야 한다');
t('프레임5·6 항목의 팝업 설명도 위치를 알려준다',
    /메뉴는 디자인관리가 아니라 「게시판관리」 아래에 있습니다/.test(guide));
t('가이드가 가리키는 주소는 그대로다', /route: '\/manager\/designs\/popup'/.test(guide));

// guideContent.js 는 PDF 생성기가 통째로 평가한다 — import 가 하나라도 있으면 그때 터진다.
t('가이드 파일에 import 가 없다', !/^\s*import\s/m.test(guide),
    'scripts/guide-pdf/extract.mjs 가 이 파일을 data:text/javascript 로 실행한다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
