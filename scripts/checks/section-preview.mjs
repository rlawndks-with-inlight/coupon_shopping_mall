import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync, existsSync, statSync } from 'fs';

// 「단일 상품 강조」 디자인 타입 미리보기 (포스페이 요청서 20260824 · 7번).
//
// [제보] "가맹점에서는 타입만 가지고 정확한 이미지를 알기 어렵습니다.
//        해당 페이지 각 타입별로 이미지화 해서 보여줄 수 있게 요청 드립니다."
//
// 타입 목록이 세 곳에서 필요하다(관리자 고르는 칸 · 캡처 화면 · 캡처 스크립트).
// 세 곳에 각각 적으면 타입을 추가했을 때 어느 하나가 빠져,
// **고를 수는 있는데 미리보기가 없는**(또는 그 반대인) 타입이 생긴다.
// 그래서 src/data/section-preview.js 한 곳에 두고 여기서 못 박는다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

const 소스 = 읽기('src/data/section-preview.js');
const { HERO_TYPES, 견본상품, heroPreviewSrc } =
    await import('data:text/javascript;base64,' + Buffer.from(소스).toString('base64'));

// ── 목록 ─────────────────────────────────────────────────────────────────
t('타입이 8개다', HERO_TYPES.length === 8);
t('번호가 1~8 로 빠짐없다',
    HERO_TYPES.map((x) => x.value).join(',') === '1,2,3,4,5,6,7,8',
    'value 는 DB(main_obj 의 style.hero_type)에 저장된 값이다 — 바꾸면 가맹점 홈 모양이 바뀐다');
t('이름이 모두 있다', HERO_TYPES.every((x) => typeof x.label === 'string' && x.label.length > 2));

// ── 견본 상품 ────────────────────────────────────────────────────────────
t('견본 사진이 자리표시자다', String(견본상품.product_img).startsWith('data:image/svg+xml'),
    '실제 가맹점 사진을 쓰면 그 몰 물건이 남의 관리자 화면에 박힌다');
t('자리표시자가 정사각이다', /width="800" height="800"/.test(decodeURIComponent(견본상품.product_img)),
    '원형·꽉찬배경 크롭에서도 같은 모양으로 보여야 한다 — 2.35:1 배너를 썼더니 타입7 이 흰 원으로 찍혔다');
t('할인가가 있다', 견본상품.product_price > 견본상품.product_sale_price,
    "타입 몇 개가 'ON SALE' 배지와 할인율을 그린다 — 할인이 없으면 그 자리가 빈 채로 찍힌다");

// ── 실제로 만들어진 이미지 ───────────────────────────────────────────────
for (const ty of HERO_TYPES) {
    const rel = heroPreviewSrc(ty.value);           // /section-preview/item-hero-N.png
    const abs = FRONT_ROOT + 'public' + rel;
    const 있음 = existsSync(abs);
    t(`타입${ty.value} 미리보기 이미지가 있다`, 있음,
        '없으면 관리자 화면에 아무것도 안 뜬다 — node scripts/section-preview/capture.cjs');
    if (!있음) continue;
    // 빈 그림(사진이 안 실린 채로 찍힌 것)을 거른다. 실제로 그렇게 찍힌 적이 있다.
    t(`타입${ty.value} 이미지가 비어 있지 않다`, statSync(abs).size > 12 * 1024,
        `${Math.round(statSync(abs).size / 1024)}KB — LazyLoadImage 가 안 실린 채 찍히면 이렇게 작아진다`);
}

// ── 배선 ─────────────────────────────────────────────────────────────────
const setting = 주석제거(읽기('src/views/manager/main_obj/setting.js'));
t('관리자 고르는 칸이 공용 목록을 쓴다', /HERO_TYPES\.map\(/.test(setting),
    '여기 목록을 따로 적으면 타입을 추가했을 때 한쪽만 늘어난다');
t('타입 이름을 하드코딩하지 않는다', !/매거진 커버 스토리/.test(setting));
t('고른 타입의 미리보기를 보여준다', /<HeroTypePreview value=/.test(setting));
t('이미지가 없으면 아무것도 안 그린다', /onError=\{\(\) => set있음\(false\)\}/.test(setting),
    '깨진 이미지 아이콘이 뜨면 가맹점은 자기가 잘못한 줄 안다');
t('타입을 바꾸면 다시 시도한다', /useEffect\(\(\) => \{ set있음\(true\) \}, \[value\]\)/.test(setting),
    '안 하면 한 번 없던 타입을 본 뒤로 있는 타입까지 영영 안 보인다');

const page = 주석제거(읽기('src/pages/manager/designs/preview-capture.js'));
t('캡처 화면도 공용 목록을 쓴다', /HERO_TYPES/.test(page) && /견본상품/.test(page));
t('캡처 화면이 타입 하나만 그릴 수 있다', /router\.query\?\.type/.test(page),
    '여덟 개를 한 화면에 쌓으면 아래쪽 사진이 안 실린 채로 찍힌다(실제로 그랬다)');
t('캡처 표식이 있다', /data-capture=/.test(page));

// 캡처 화면은 좌측 메뉴에 없어야 한다 — 가맹점이 볼 화면이 아니다.
const nav = 주석제거(읽기('src/layouts/manager/nav/config-navigation.js'));
t('캡처 화면은 메뉴에 없다', !/preview-capture/.test(nav));

const script = 읽기('scripts/section-preview/capture.cjs');
t('스크립트가 타입마다 새로 연다', /preview-capture\?type=\$\{n\}/.test(script));
t('사진이 다 실릴 때까지 기다린다', /naturalWidth === 0/.test(script));
t('운영 계정을 파일에 적지 않는다', !/PREVIEW_PW\s*=\s*['"][^'"]+['"]/.test(script),
    '이 파일은 저장소에 남는다 — 계정은 환경변수로 받는다');

// ── 「그 밖의 섹션」 접기 (요청서 8번) ────────────────────────────────────
//
// [제보] "해당 타입별로 추가할 수 있는 섹션만 있으면 될듯 합니다.
//        나머지는 안보이는게 가맹점들의 혼란은 없앨 수 있을 듯 합니다."
//
// **없애지 않고 접었다.** DB를 확인하니 그 섹션들을 실제로 쓰는 몰이 8곳 있다
// (동영상·상품후기·셀러·특성그룹 등, 그중 SHOPGO 하위 2곳). 없애면 그 몰들은
// 자기가 쓰던 섹션을 다시 만들 수 없다. 특성그룹 섹션은 가맹점 상품 데이터에서
// 파생돼 추천 목록에 넣을 수조차 없다.
// frame-sections.js 도 "못 쓰는 섹션 목록이 아니다 — 막지 않고 권하기만 한다" 로 못 박아 두었다.
t('그 밖의 섹션을 접었다 폈다 한다', /set그밖열림\(v => !v\)/.test(setting));
t('기본은 접힘', /const \[그밖열림, set그밖열림\] = useState\(false\)/.test(setting));
t('쓰는 중이면 처음부터 펼친다',
    /const 쓰는중 = 나머지\.some\(x => hasTypeCount\(contentList, x\.type\) > 0\)/.test(setting),
    '접힌 채로 두면 자기가 쓰던 섹션이 사라진 줄 안다');
t('그 밖의 섹션을 목록에서 없애지 않았다',
    /\.\.\.\(펼침 \? 나머지\.map\(줄\) : \[\]\)/.test(setting) && /const 나머지 = 전체\.filter/.test(setting),
    '없애면 지금 그 섹션을 쓰는 8곳이 다시 만들 수 없다');
t('몇 개가 숨어 있는지 보여준다', /그 밖의 섹션 \(\{나머지\.length\}\)/.test(setting),
    '개수를 모르면 눌러 볼 이유가 없다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
