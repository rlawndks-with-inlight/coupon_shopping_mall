import { FRONT_ROOT, BACK_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync, readdirSync } from 'fs';

// 비로그인 손님에게 회원가입을 한 번 권하는 창.
//
// 가맹점 의견(2026-08-23): "장바구니·바로구매를 누를 때 비회원으로 그냥 진행되는 것보다
// 회원가입을 한 번 유도하고 진행되는 편이 좋겠다."
//
// [설계] 담기·바로구매 버튼은 화면 20여 곳에 흩어져 있지만 공용 길목 두 개로 모인다.
//   insertCartDataUtil · startBuyNow (둘 다 shop-util.js)
// 창은 ShopLayout 에 한 번만 걸고, 이 두 곳에서 부른다. 프레임이 늘어도 여기만 지키면 된다.
//
// [절대 어기면 안 되는 것]
//   「비회원으로 계속」이 있어야 한다. 예전에 비회원을 로그인으로 튕기던 코드가 있었는데
//   그러면 비회원 구매 자체가 불가능해져서 걷어낸 이력이 있다. 이건 유도지 차단이 아니다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 길목 두 개 ───────────────────────────────────────────────────────────
const util = 읽기('src/utils/shop-util.js');
t('담기가 물어본다', /export const insertCartDataUtil = async \(/.test(util));
t('바로구매가 물어본다', /export const startBuyNow = async \(/.test(util));
t('담기에서 askGuestSignup 을 부른다',
    /insertCartDataUtil = async[\s\S]{0,2000}?if \(!\(await askGuestSignup\(\)\)\) return false;/.test(util));
t('바로구매에서 askGuestSignup 을 부른다',
    /startBuyNow = async[\s\S]{0,900}?if \(!\(await askGuestSignup\(\)\)\) return false;/.test(util));
// 살 수 없는 상품(품절·옵션 미선택)을 눌렀을 때 회원가입 창부터 뜨면 안 된다.
for (const [이름, 함수] of [['담기', 'insertCartDataUtil = async'], ['바로구매', 'startBuyNow = async']]) {
    const 조각 = util.slice(util.indexOf(함수), util.indexOf(함수) + 2000);
    t(`${이름}: 살 수 있는지 먼저 본다`,
        조각.indexOf('assertStock') > 0 && 조각.indexOf('assertStock') < 조각.indexOf('askGuestSignup'),
        '품절 상품을 눌러도 회원가입 창부터 뜬다');
}

// ── 호출부가 전부 await 하는가 ────────────────────────────────────────────
// ⚠ 여기가 이 검사의 핵심이다.
//   await 를 빠뜨리면 Promise 가 참으로 읽혀서, 담기지도 않았는데 '담았습니다' 토스트가
//   뜨고 화면까지 새로고침한다. 실제로 6곳이 await 없이 부르고 있었다.
const 뒤지기 = (디렉토리, 담기 = []) => {
    for (const e of readdirSync(FRONT_ROOT + 디렉토리, { withFileTypes: true })) {
        const 경로 = `${디렉토리}/${e.name}`;
        if (e.isDirectory()) 뒤지기(경로, 담기);
        else if (e.name.endsWith('.js')) 담기.push(경로);
    }
    return 담기;
};
const 전체 = 뒤지기('src');
const 빠진곳 = [];
const 값씀곳 = [];
for (const f of 전체) {
    // 주석은 걷어내고 본다 — 함수 이름이 주석(왜 그렇게 했는지 남긴 이력)에도 나오는데,
    // 그걸 호출로 세면 없는 곳을 지적한다(guest-prompt.js 주석에서 실제로 그랬다).
    const s = 주석제거(읽기(f));
    // 담기: 반환값(true/false)으로 '담았습니다' 토스트와 새로고침을 정한다.
    //   await 가 빠지면 Promise 가 늘 참이라, 담기지 않았는데도 성공으로 보인다.
    //   실제로 6곳이 await 없이 부르고 있었다 — 그래서 이 검사가 있다.
    const 담기정규 = /(await\s+)?insertCartDataUtil\s*\(/g;
    let m;
    while ((m = 담기정규.exec(s)) !== null) {
        if (/export const\s*$/.test(s.slice(Math.max(0, m.index - 30), m.index))) continue;
        if (!m[1]) 빠진곳.push(`${f}  insertCartDataUtil`);
    }
    // 바로구매: 반환값을 쓰는 곳이 지금은 없다. 그래서 await 없이 불러도 동작한다
    //   (창은 뜨고 이동도 된다). 다만 값을 쓰기 시작하면 위와 똑같은 함정이 생기므로
    //   '값을 쓰는데 await 가 없는' 경우만 잡는다.
    const 값정규 = /(=|if\s*\(|!)\s*startBuyNow\s*\(/g;
    while ((m = 값정규.exec(s)) !== null) {
        if (/export const\s*$/.test(s.slice(Math.max(0, m.index - 30), m.index))) continue;
        if (!/await\s*$/.test(s.slice(Math.max(0, m.index), m.index + m[0].length - 'startBuyNow('.length))) {
            값씀곳.push(f);
        }
    }
}
t('담기를 부르는 곳이 전부 await 한다', 빠진곳.length === 0,
    빠진곳.join('\n        ') || '');
t('바로구매 반환값을 await 없이 쓰는 곳이 없다', 값씀곳.length === 0,
    (값씀곳.join('\n        ')) + '\n        async 로 바뀌었으므로 값을 쓰려면 await 가 필요하다');

// ── 창 ───────────────────────────────────────────────────────────────────
const 창 = 읽기('src/components/elements/shop/GuestSignupPrompt.js');
t('회원가입·로그인·비회원으로 계속 세 갈래', /회원가입/.test(창) && /로그인/.test(창) && /비회원으로 계속/.test(창));
t('「비회원으로 계속」이 있다', /translate\('비회원으로 계속'\)/.test(창),
    '이게 빠지면 비회원 구매가 막힌다 — 예전에 그래서 걷어낸 코드가 있다');
// 창을 어떻게 닫든 반드시 응답해야 한다. 안 그러면 담기가 영영 안 끝나 버튼이 먹통이 된다.
t('배경을 눌러 닫아도 응답한다', /onClose=\{비회원으로\}/.test(창));
t('닫히면 반드시 resolve 한다', /const r = 응답\.current;[\s\S]{0,80}if \(r\) r\(계속\);/.test(창));
// 로그인 복원 전에 물으면 로그인한 손님도 새로고침마다 창을 본다.
t('세션 복원 전에는 안 묻는다', /if \(!준비됨 \|\| 지금유저\) \{ resolve\(true\); return; \}/.test(창));
// 등록 시점 값에 갇히면 로그인 뒤에도 계속 뜬다.
t('최신 로그인 상태를 읽는다', /상태\.current = \{ user, isInitialized \};/.test(창));

// ── 매번 묻는다 ──────────────────────────────────────────────────────────
// 처음엔 「비회원으로 계속」을 고르면 sessionStorage 에 적어 두고 그 세션 동안 다시
// 묻지 않았다. 가맹점 요청(2026-08-25)으로 **매번 묻도록** 바꿨다 —
// 한 번 넘기면 그 방문 내내 안 뜨는 것이 약하다는 것이다.
// 그래서 '그만묻기' 같은 상태를 다시 만들지 못하게 막는다.
const 다리 = 읽기('src/utils/guest-prompt.js');
// 주석은 뺀다 — '예전엔 sessionStorage 를 썼다'는 이력은 남아 있어야 한다(다시 만들지 말라는 경고다).
// 주석제거는 _roots.mjs 의 공용 도구를 쓴다. 직접 짜면 CRLF 파일에서 조용히 새므로
// 각자 만들지 말 것(그 함정은 _roots.mjs 주석에 적어 뒀다).
t('그만묻기 상태가 남아 있지 않다', !/그만묻/.test(주석제거(다리)) && !/그만묻/.test(주석제거(창)),
    '가맹점 요청은 매번 묻는 것이다 — 되살리면 요청이 되돌아간다');
t('유도를 끄는 저장소를 쓰지 않는다',
    !/sessionStorage|localStorage/.test(주석제거(다리)) && !/sessionStorage|localStorage/.test(주석제거(창)));
// 주문서에서는 묻지 않는다. 넣었다가 걷어냈다(2026-08-25) — 거기까지 온 손님을 붙잡으면
// 유도가 아니라 이탈이 된다. 담기·바로구매를 거치지 않고 주문서에 닿는 길은 없다.
t('주문서에서는 묻지 않는다', !/askGuestSignup\(/.test(주석제거(읽기('src/views/shop/order/OrderSheet.js'))),
    '이름·배송지를 다 쓰고 비밀번호까지 정한 뒤에 물으면 방해로만 읽힌다');
t('창이 안 걸린 화면에서는 그냥 진행한다', /열기 \? 열기\(\) : Promise\.resolve\(true\)/.test(다리),
    '여기서 막으면 창 없는 화면에서 담기가 통째로 죽는다');

// ── 레이아웃에 한 번만 ───────────────────────────────────────────────────
const 레이아웃 = 읽기('src/layouts/shop/ShopLayout.js');
t('ShopLayout 에 걸려 있다', /<GuestSignupPrompt \/>/.test(레이아웃));
t('한 번만 걸린다', (레이아웃.match(/<GuestSignupPrompt \/>/g) || []).length === 1);

// ── 사전 ─────────────────────────────────────────────────────────────────
for (const lang of ['ko', 'en', 'cn', 'ja', 'es']) {
    const d = 읽기(`src/locales/langs/${lang}.js`);
    t(`${lang} 사전에 창 문구가 있다`,
        d.includes('"비회원으로 계속":') && d.includes('"회원으로 구매하시겠어요?":'));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
