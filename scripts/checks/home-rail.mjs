import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync, readdirSync } from 'fs';

// 메인화면 상품줄(레일)을 손가락으로 밀 수 있는가.
//
// 제보(2026-08-31, 모바일): "상품 슬라이드가 드래그가 안 된다" — 메인디자인관리로 만든 상품줄.
// 포스몰(brand 99, 프레임2)에서 실측해 원인을 잡았다.
//
//   레일은 overflow-x:auto 라 원래 손가락으로 밀린다. 그런데 **프레임2 카드만**
//   사진칸에 react-slick 을 하나 더 갖고 있고, slick-carousel 기본 CSS 가
//   모든 .slick-slider 에 `touch-action: pan-y` 를 박는다.
//   pan-y = '세로 말고는 브라우저가 손대지 마라'. 그래서 사진 위에서 가로로 밀면
//   레일이 꿈쩍도 안 했다 — 사진 위 scrollLeft 0 / 글자 위 222 로 갈렸다.
//   사진이 카드의 대부분이라 사실상 못 미는 상태였다.
//
// 두 군데를 같이 풀어야 한다. 하나만 풀면 이렇게 된다:
//   · CSS 만 풀면  → 레일도 밀리고 카드 사진도 같이 넘어간다(한 손짓에 두 가지가 움직인다)
//   · 설정만 끄면  → pan-y 가 그대로라 레일은 여전히 안 밀린다

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 레일 자체 ────────────────────────────────────────────────────────────
const common = 읽기('src/components/elements/shop/common.js');
t('레일은 가로로 넘치면 밀린다', /overflow-x:\s*auto/.test(common));
t('레일 안에서는 slick 의 pan-y 를 푼다',
    /\.slick-slider,\s*\.slick-list\s*\{\s*touch-action:\s*auto;?\s*\}/.test(common),
    'pan-y 가 남아 있으면 카드 사진 위에서 레일이 안 밀린다');
// 레일 자체에 touch-action 을 걸면 그 순간 다시 못 민다.
t('레일에 touch-action 을 걸지 않았다',
    !/RailTrack[\s\S]{0,400}?touch-action:\s*(none|pan-y)/.test(common));

// ── 카드 안 슬라이더(프레임2 전용) ────────────────────────────────────────
const card2 = 읽기('src/components/elements/shop/demo-2.js');
// 설정 덩어리만 떼어 본다 — 정규식에 이어 붙이면 템플릿 문자열이 \s 를 삼켜 조용히 통과한다.
const 사진설정 = card2.slice(card2.indexOf('item_img_setting'), card2.indexOf('item_img_setting') + 1800);
for (const [키, 설명] of [['swipe', '손가락'], ['draggable', '마우스'], ['touchMove', '터치이동']]) {
    t(`프레임2 카드 사진: ${설명} 동작을 레일에 양보한다`,
        사진설정.replace(/ +/g, ' ').includes(키 + ': false'),
        '카드가 손가락을 가져가면 한 손짓에 레일과 카드가 같이 움직인다');
}
// autoplay 는 살아 있어야 한다 — 안 그러면 사진이 아예 안 바뀐다.
t('프레임2 카드 사진은 그래도 저절로 돌아간다', /autoplay:\s*true/.test(사진설정));

// ── 카드 안에 슬라이더를 새로 넣는 프레임이 생기면 알려 준다 ───────────────
// 레일에는 어떤 프레임의 카드도 들어간다. 새 카드가 슬라이더를 품으면 같은 함정에 빠진다.
// (CSS 는 RailCard 가 덮어 주지만, 설정을 안 끄면 한 손짓에 둘이 같이 움직인다)
const 카드폴더 = 'src/components/elements/shop';
const 슬라이더품은카드 = readdirSync(FRONT_ROOT + 카드폴더)
    .filter((f) => /^demo-\d+\.js$/.test(f))
    .filter((f) => /<Slider/.test(주석제거(읽기(`${카드폴더}/${f}`))));
t('카드에 슬라이더를 품은 프레임은 demo-2 뿐이다',
    슬라이더품은카드.length === 1 && 슬라이더품은카드[0] === 'demo-2.js',
    `지금: ${슬라이더품은카드.join(', ') || '없음'}\n        새로 생겼다면 그 카드도 swipe/draggable/touchMove 를 꺼야 한다`);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
