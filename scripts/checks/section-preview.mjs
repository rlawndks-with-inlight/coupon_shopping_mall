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
const { HERO_TYPES, 견본상품, heroPreviewSrc, SECTION_SAMPLES, sectionPreviewSrc } =
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

// ── 섹션 종류별 미리보기 (요청서 8번의 나머지) ───────────────────────────
//
// [제보] "가맹점에서는 섹션 가지고 정확한 이미지를 알기 어렵습니다.
//        해당 페이지 각 색션별로 이미지화 해서 보여줄 수 있게 요청 드립니다."
const 섹션정의 = 읽기('src/utils/format.js');
for (const s of SECTION_SAMPLES) {
    // 견본의 type 이 실제 섹션 목록에 있어야 한다.
    // 어긋나면 '고를 수는 있는데 미리보기가 없는' 섹션이 생긴다.
    t(`섹션 '${s.type}' 이 실제 목록에 있다`, 섹션정의.includes(`type: '${s.type}'`));
    if (s.skip) {
        // 일부러 안 만든 것. 이유가 코드에 남아 있어야 다음 사람이 '왜 없지' 로 헤매지 않는다.
        t(`섹션 '${s.type}' 은 왜 뺐는지 적어 두었다`, /33,554,432px|캡처 자체를 거절/.test(소스));
        continue;
    }
    const abs = FRONT_ROOT + 'public' + sectionPreviewSrc(s.type);
    const 있음 = existsSync(abs);
    t(`섹션 '${s.type}' 미리보기 이미지가 있다`, 있음,
        'node scripts/section-preview/capture.cjs 로 만든다');
    // 얇은 띠 섹션(텍스트배너 26px)도 있어서 크기 기준은 낮게 잡는다 —
    // 여기서 보려는 것은 '아예 안 만들어진 것' 이다.
    if (있음) t(`섹션 '${s.type}' 이미지가 0바이트가 아니다`, statSync(abs).size > 1024);
}
t('견본 목록이 섹션 목록보다 적지 않다', SECTION_SAMPLES.length >= 9,
    '섹션이 늘면 견본도 함께 늘려야 한다 — 안 그러면 그 섹션만 미리보기가 없다');
t('고른 섹션의 미리보기를 보여준다', /<SectionPreview type=\{sectionType\}/.test(setting));

const script = 읽기('scripts/section-preview/capture.cjs');
t('스크립트가 skip 섹션을 건너뛴다', /skip: true/.test(script));
t('한 장 실패해도 나머지는 계속 찍는다', /캡처 실패/.test(script),
    '처음엔 여기서 통째로 멈춰 뒤의 것이 아예 안 만들어졌다');
t('스크립트가 타입마다 새로 연다', /preview-capture\?\$\{항목\.q\}/.test(script));
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

// ── 「홈 문구」 위치 안내 (요청서 10번) ──────────────────────────────────
//
// [제보] "정확히 어디 문구 인지 이미지로 보여주면 좋을 듯 합니다."
//
// 좌표를 손으로 적어 두지 않는다. 문구 자리에 그 칸의 이름(① 에디션 표기 …)을 넣고
// 홈을 그대로 찍는다 — 사진 속 글자가 곧 라벨이라, 디자인이 바뀌어 자리가 옮겨져도
// 다시 찍기만 하면 맞는다.
const { HOME_TEXT_SCHEMA } = await import(
    'data:text/javascript;base64,' + Buffer.from(읽기('src/data/home-texts.js')).toString('base64'));
const { 홈문구표시값, homeTextPreviewSrc } = await import(
    'data:text/javascript;base64,' + Buffer.from(소스).toString('base64'));

const 데모번호들 = Object.keys(HOME_TEXT_SCHEMA).map(Number);
t('홈 문구를 지원하는 데모가 있다', 데모번호들.length >= 6);
for (const n of 데모번호들) {
    const abs = FRONT_ROOT + 'public' + homeTextPreviewSrc(n);
    t(`데모${n} 홈문구 안내 그림이 있다`, existsSync(abs),
        'node scripts/section-preview/capture.cjs 로 만든다');
}
{
    // 표시값이 칸 순서대로 번호를 붙여야 편집 화면의 라벨과 맞는다.
    const 값 = 홈문구표시값(HOME_TEXT_SCHEMA[4].fields);
    t('표시값에 번호가 붙는다', String(값.edition).startsWith('①'));
    t('표시값이 칸 이름을 담는다', String(값.edition).includes('에디션 표기'));
    t('모든 칸에 값이 있다', HOME_TEXT_SCHEMA[4].fields.every((f) => !!값[f.key]),
        '빈 값이면 데모가 자기 기본값을 써서 그 자리가 어느 칸인지 안 드러난다');
}
const 홈문구화면 = 주석제거(읽기('src/pages/manager/designs/home-texts.js'));
t('편집 화면이 안내 그림을 보여준다', /<HomeTextGuide demoNum=\{demoNum\}/.test(홈문구화면));
t('편집 화면 라벨에도 같은 번호를 붙인다', /\['①','②'/.test(홈문구화면),
    '그림의 번호와 칸의 번호가 다르면 안내가 안 된다');
t('그림이 없으면 아무것도 안 그린다', /onError=\{\(\) => set있음\(false\)\}/.test(홈문구화면));

// ── 홈 문구 안내 그림이 실제로 '안내' 를 하는가 ──────────────────────────
//
// 그림 한 장에 번호가 하나라도 빠지면 그 칸은 안내가 안 된다. 두 번 놓쳤던 자리다.
//
// [하나] 처음엔 홈을 위에서부터 1400px 만 잘라 찍었다. 그런데 첫 화면(히어로)이
//   뷰포트 높이를 통째로 먹어서 번호들은 그 아래 깔린다 —
//   **여섯 장 중 다섯 장에 번호가 한 개도 없었다**(데모5·6·7·8·9 전멸, 데모4 는 7개 중 2개).
//   그림은 멀쩡해 보이는데 정작 쓸모가 없었다. 그래서 번호가 든 구간만 잘라 낸다.
// [둘] 찍는 몰의 상호와 상품이 그대로 박혔다. mbc01 에서 찍었더니 다른 몰 관리자 화면에
//   'MBC01' 과 그 몰 상품(떡갈비)이 떴다 — 자기 안내인지부터 의심하게 된다.
t('홈문구 캡처가 번호 구간만 잘라 낸다', /번호구간/.test(script),
    '홈을 위에서부터 자르면 히어로가 화면을 다 먹어 번호가 한 개도 안 나온다');
t('홈문구는 1400 으로 자르지 않는다', /번호구간 \? \d{4} : 1400/.test(script),
    '섹션과 같은 한도를 쓰면 번호가 잘려 안내가 안 된다');
const 캡처화면 = 주석제거(읽기('src/pages/manager/designs/preview-capture.js'));
t('찍는 몰의 상호를 지운다', /name: '브랜드명'/.test(캡처화면),
    "안 지우면 남의 몰 상호가 다른 가맹점 관리자 화면에 박힌다");
t('찍는 몰의 상품을 견본으로 바꾼다', /products: 견본상품들\(/.test(캡처화면));
t('대표상품 지정도 비운다', /featured_product_ids: \[\]/.test(캡처화면),
    '비우지 않으면 useFeaturedProduct 가 그 몰 상품을 API 로 다시 불러온다');

// 캡처 화면이 전역 설정을 건드리지 않아야 한다.
t('캡처 화면이 전역 설정을 안 건드린다', !/onChangeDnsData/.test(page),
    'onChangeDnsData 는 localStorage 까지 바꿔서, 사람이 이 화면을 열면 그 몰 설정이 오염된다');
t('지역 Provider 로 문구만 갈아끼운다', /SettingsContext\.Provider/.test(page));

// ── 카테고리탭 섹션의 폭 터짐 (미리보기를 못 만들던 원인) ────────────────
//
// 상품 자리를 <Row>(맨 display:flex)로 감싸면 안의 react-slick 이 '내용만큼' 넓어지는
// 칸에 놓인다. 슬라이더는 제 칸 폭을 재서 트랙에 px 로 박고, 그 트랙이 다시 칸을 넓힌다 —
// 잴 때마다 두 배가 되어 33,554,404px(2^25)까지 갔고 상품 격자가 통째로 비어 나왔다.
// 되돌아가기 쉬운 자리라(둘러싼 <Row> 하나 차이) 검사로 못 박아 둔다.
const 카테고리탭 = 주석제거(읽기('src/views/section/blog/HomeItemsWithCategories.js'));
t('카테고리탭 섹션의 상품 자리가 flex 칸이 아니다',
    !/<Row>\s*\{column\?\.list/.test(카테고리탭),
    '<Row> 로 감싸면 슬라이더 폭이 2^25 로 튄다');
t('카테고리탭 섹션의 상품 자리 폭이 100% 로 못박혀 있다',
    /width: '100%' \}\}>\s*\{column\?\.list/.test(카테고리탭),
    '잴 값이 고정되어야 슬라이더의 폭 되먹임이 끊긴다');
t('왜 그랬는지 적어 두었다', /33,554,404px|2\^25/.test(읽기('src/views/section/blog/HomeItemsWithCategories.js')));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
