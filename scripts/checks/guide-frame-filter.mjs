import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 가이드가 '내 프레임 이야기만' 보여주는지 본다.
//
// 계열(1·2 / 3·4 / 5·6)로 항목을 가르는 것까지는 되어 있었다. 그런데 계열 안에서는 여전히
// 프레임1 가맹점이 「프레임2 미리보기는 이렇게」를 같이 읽어야 했다. 어느 줄이 내 이야기인지
// 매번 골라 읽어야 하는 안내는 안 읽힌다 — 그래서 칸(field) 단위로 프레임까지 좁혔다.
//
// 여기서 지키는 것:
//   · frameNoOf 의 대응표가 frameList.js(진짜 카탈로그)와 어긋나지 않는가
//   · 프레임을 알면 다른 프레임의 칸이 안 보이는가
//   · 프레임을 모르는 화면(신청 전 /manual, PDF)에서는 전부 보이는가 — 거기선 비교표다
//   · 화면 배선(관리자 가이드는 frameNo 를 넘기고, 랜딩은 안 넘긴다)
//
// guideContent.js 는 import 를 쓸 수 없어(PDF 추출기가 통째로 평가한다) 대응표를 옮겨 적었다.
// 옮겨 적은 것은 언젠가 어긋나므로 첫 번째 검사가 그것을 잡는다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
const 모듈 = async (p) => import('data:text/javascript;base64,' + Buffer.from(읽기(p)).toString('base64'));

const guide = await 모듈('src/components/manager/guideContent.js');
const { frameNoOf, guideFieldsOf, guideTitleOf, GUIDE_SECTIONS } = guide;
const { FRAMES } = await 모듈('src/components/main-site/frameList.js');

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const eq = (name, got, want) => t(name + ' = ' + JSON.stringify(want), JSON.stringify(got) === JSON.stringify(want), '실제: ' + JSON.stringify(got));

// ── 1. 대응표가 카탈로그와 같은가 ────────────────────────────────────────
// FRAMES 의 key 는 저장값(shop_demo_num/blog_demo_num), no 는 가맹점에게 보이는 번호다.
// no 가 null 인 것은 판매 중단된 틀이라 번호가 없다 → frameNoOf 도 null 이어야 한다.
for (const f of FRAMES) {
    const [계열, 번호] = f.key.split(':');
    const dns = 계열 === 'shop' ? { shop_demo_num: Number(번호) } : { blog_demo_num: Number(번호) };
    eq(`${f.key} 의 프레임 번호`, frameNoOf(dns), f.no ?? null);
}
t('카탈로그에 번호 있는 틀이 6개다', FRAMES.filter((f) => f.no).length === 6);

// 값이 문자열로 오는 자리가 있다(API 가 숫자를 문자열로 준다).
eq('문자열 shop_demo_num', frameNoOf({ shop_demo_num: '2' }), 2);
eq('문자열 blog_demo_num', frameNoOf({ blog_demo_num: '9' }), 6);
// 쇼핑몰·블로그 둘 다 있는 브랜드는 쇼핑몰 기준(frameGroupOf 와 같은 규칙)
eq('shop+blog 겸용', frameNoOf({ shop_demo_num: 1, blog_demo_num: 5 }), 1);
eq('프레임 미지정', frameNoOf({}), null);
eq('dns 없음', frameNoOf(null), null);
// 카탈로그에 없는 값이 들어와도 죽지 않고 null (프레임을 모르는 것으로 취급 → 전부 보여준다)
eq('모르는 값', frameNoOf({ blog_demo_num: 77 }), null);

// ── 2. 프레임을 알면 남의 칸은 안 보인다 ─────────────────────────────────
const 섹션 = (id) => GUIDE_SECTIONS.find((s) => s.id === id);
const 라벨 = (id, group, no) => guideFieldsOf(섹션(id), group, no).map((f) => f.label);

eq('프레임1 은 프레임1 미리보기만', 라벨('menu-design-shop', 'shop', 1).filter((l) => l.includes('미리보기는 이렇게')), ['프레임1 미리보기는 이렇게']);
eq('프레임2 는 프레임2 미리보기만', 라벨('menu-design-shop', 'shop', 2).filter((l) => l.includes('미리보기는 이렇게')), ['프레임2 미리보기는 이렇게']);
eq('프레임3 은 프레임3 미리보기만', 라벨('menu-design-column', 'column', 3).filter((l) => l.includes('미리보기는 이렇게')), ['프레임3 미리보기는 이렇게']);
eq('프레임4 는 프레임4 미리보기만', 라벨('menu-design-column', 'column', 4).filter((l) => l.includes('미리보기는 이렇게')), ['프레임4 미리보기는 이렇게']);

// 계열별 칸(카테고리 항목)도 자기 계열만 남는다 — '내 몰에서 카테고리가 어디에 보이나'는 계열마다 다르다.
eq('카테고리: 프레임1·2 몰', 라벨('category', 'shop', 1).filter((l) => l.startsWith('프레임')), ['프레임1·2']);
eq('카테고리: 프레임3·4 몰', 라벨('category', 'column', 3).filter((l) => l.startsWith('프레임')), ['프레임3·4']);
eq('카테고리: 프레임5·6 몰', 라벨('category', 'landing', 5).filter((l) => l.startsWith('프레임')), ['프레임5·6']);

// 디자인관리 항목에서, 보이는 칸이 다른 프레임 번호를 입에 올리면 안 된다.
// (한 줄만 남으면 그 줄이 혼자서도 말이 되어야 한다 — 옆 줄을 가리키는 문장이 남아 있으면 안 읽힌다)
for (const [id, group, 번호들] of [['menu-design-shop', 'shop', [1, 2]], ['menu-design-column', 'column', [3, 4]], ['menu-design-landing', 'landing', [5, 6]]]) {
    for (const no of 번호들) {
        const 글 = guideFieldsOf(섹션(id), group, no).map((f) => f.label + ' ' + f.desc).join(' ');
        const 남 = [1, 2, 3, 4, 5, 6].filter((n) => n !== no && 글.includes('프레임' + n) && !글.includes('프레임' + Math.min(n, no) + '·' + Math.max(n, no)));
        t(`프레임${no} 화면이 남의 프레임을 가리키지 않는다`, 남.length === 0, '언급: 프레임' + 남.join(', 프레임'));
    }
}

// ── 3. 프레임을 모르면 전부 보인다 ───────────────────────────────────────
// 신청 전 랜딩(/manual)과 PDF 는 프레임을 모른다. 거기서 칸을 지우면 '무엇을 고를지' 비교할 수가 없다.
for (const id of ['menu-design-shop', 'menu-design-column', 'category']) {
    eq(`${id}: 프레임 모를 때 전부`, guideFieldsOf(섹션(id), null, null).length, 섹션(id).fields.length);
}

// ── 4. 제목도 좁힌다 ─────────────────────────────────────────────────────
eq('프레임1 제목', guideTitleOf(섹션('menu-design-shop'), 1), '디자인관리 — 프레임1');
eq('프레임4 제목', guideTitleOf(섹션('menu-design-column'), 4), '디자인관리 — 프레임4');
eq('프레임 모를 때 제목', guideTitleOf(섹션('menu-design-shop'), null), '디자인관리 — 프레임1·2');
// 번호 없는 틀(판매 중단)은 계열 제목 그대로 — 없는 번호를 지어내지 않는다
eq('번호 없는 틀 제목', guideTitleOf(섹션('menu-design-shop'), frameNoOf({ shop_demo_num: 4 })), '디자인관리 — 프레임1·2');

// ── 5. 화면 배선 ─────────────────────────────────────────────────────────
const body = 읽기('src/components/manager/GuideBody.js');
t('본문이 칸 거르기를 쓴다', body.includes('guideFieldsOf(s, frameGroup, frameNo)'));
t('본문이 제목 좁히기를 쓴다', body.includes('guideTitleOf(s, frameNo)'));
t('걸러진 칸을 그린다', body.includes('{fields.length > 0 && <FieldTable fields={fields} />}') && !body.includes('fields={s.fields}'));

const page = 읽기('src/pages/manager/guide.js');
t('관리자 가이드가 프레임 번호를 넘긴다', page.includes('frameNoOf(themeDnsData)') && page.includes('frameNo={frameNo}'));
const manual = 읽기('src/pages/manual.js');
t('랜딩은 프레임을 넘기지 않는다(전부 보여야 한다)', !manual.includes('frameNo'));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
