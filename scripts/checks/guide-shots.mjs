import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync, readdirSync } from 'fs';

// 관리자 가이드에 '스크린샷 준비중' 자리가 남아 있지 않은지 본다.
//
// [무슨 일이 있었나 — 2026-09-03 시연]
//   21개 항목 중 5개가 '스크린샷 준비중' 회색 자리로 떴다(결제수단·주문취소·회원·랜딩 디자인·개요).
//   그날 오후 서로 다른 네 사람이 가이드를 열어 봤다. 준비 안 된 문서처럼 보인다.
//   그중 셋은 실제 화면이 있는데 사진만 없었고, 둘은 애초에 찍을 화면이 없는 항목이었다
//   (결제수단 = 본사가 설정 / 개요 = 범위 설명).
//
// [규칙]
//   · 화면이 있는 항목  → public/manual/guide 에 사진이 있어야 한다.
//   · 화면이 없는 항목  → noShot: true 로 표시한다. 그러면 자리 자체를 안 그린다.
//   둘 다 아니면 '준비중' 이 뜬다 = 이 검사가 실패한다.
//
// ⚠ 사진에는 개인정보가 들어가면 안 된다. 촬영기(scratchpad/guide-shots.cjs)가 이름·연락처·
//   주소를 가짜값으로 바꾼 뒤 찍는다. 손으로 찍어 넣을 때도 같은 것을 지울 것.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 소스 = readFileSync(FRONT_ROOT + 'src/components/manager/guideContent.js', 'utf8');
const 있는사진 = new Set(readdirSync(FRONT_ROOT + 'public/manual/guide').map((f) => f.replace(/\.png$/, '')));

// 항목 하나를 다음 항목 시작 전까지 잘라 본다(guideContent 는 import 를 못 쓰므로 문자열로 읽는다).
const ids = [...new Set([...소스.matchAll(/^\s+id: '([a-z0-9-]+)'/gm)].map((m) => m[1]))];
t('가이드 항목을 읽었다', ids.length >= 20, `읽은 항목 ${ids.length}개 — 파일 모양이 바뀌었는지 볼 것`);

const 준비중 = [];
for (const id of ids) {
    const i = 소스.indexOf(`id: '${id}'`);
    const j = 소스.indexOf('\n  {', i);
    const 본문 = 소스.slice(i, j < 0 ? 소스.length : j);
    const shots = [...본문.matchAll(/img: '([^']+)'/g)].map((m) => m[1]);
    // GuideBody·PDF 추출기와 같은 규칙: shots 가 없으면 {id}.png 한 장만 본다.
    const 후보 = shots.length ? shots : [id];
    if (후보.some((x) => 있는사진.has(x))) continue;
    if (/noShot: true/.test(본문)) continue;
    준비중.push(id);
}
t('「스크린샷 준비중」 으로 뜨는 항목이 없다', 준비중.length === 0,
    준비중.length ? `사진을 넣거나 noShot: true 를 달 것 → ${준비중.join(', ')}` : '');

// shots 에 적었는데 파일이 없으면 그 자리만 조용히 빈다 — 적은 사람은 넣었다고 믿는다.
const 빠진사진 = [...new Set([...소스.matchAll(/img: '([^']+)'/g)].map((m) => m[1]))].filter((x) => !있는사진.has(x));
t('shots 에 적힌 사진이 전부 있다', 빠진사진.length === 0, 빠진사진.join(', '));

// 렌더러가 noShot 을 실제로 존중하는가.
const body = readFileSync(FRONT_ROOT + 'src/components/manager/GuideBody.js', 'utf8');
t('GuideBody 가 noShot 을 존중한다', /!s\.noShot && <GuideImage/.test(body),
    'noShot 을 달아도 렌더러가 무시하면 준비중 자리가 그대로 뜬다');
t('준비중 자리는 남겨 둔다(사진만 빠졌을 때 표시)', /스크린샷 준비중/.test(body),
    '자리 자체를 없애면 사진을 넣기로 한 항목이 비어도 아무도 모른다');

// 없는 파일을 찔러 보지 않는다 — 가이드 한 번 열 때마다 404 12개가 나던 자리다.
t('사진 후보를 번호로 늘려 찾지 않는다', !/\$\{id\}1/.test(body),
    '여러 장을 붙이려면 shots 목록에 적는다(캡션도 그때 단다)');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
