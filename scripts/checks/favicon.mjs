import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 탭 아이콘(파비콘)이 없을 때 '없는 그림'을 부르지 않는지 본다.
//
// [무슨 일이 있었나 — 2026-09-03·04 시연 로그]
//   브랜드 127개 중 63개가 파비콘 미등록이다(demo·시연 브랜드도 전부).
//   그런데 head 는 값 유무와 상관없이 <link rel='shortcut icon' href={favicon_img}> 를 그렸다.
//   React 는 href={null} 을 **문자열 'null'** 로 렌더하고, 브라우저는 그걸 상대경로로 읽어
//   지금 보고 있는 주소 뒤에 붙여 부른다:
//       /shop/items/null · /shop/auth/login/null · /shop/auth/pay-result/null …
//   페이지를 열 때마다 404 가 두 번씩(슬래시 유무) 났다. 시연 이틀간 200회가 넘는다.
//   화면이 깨지지는 않지만, 서버 로그가 오염되고 탭 아이콘도 빈칸으로 남는다.
//
// [고친 방식]
//   data.js 의 faviconUrl(dns_data) 가 값을 정리해 준다(없으면 빈 문자열, 파비콘 없으면 로고).
//   그리고 **값이 있을 때만** <link> 를 그린다. 둘 다 없으면 기본 그림을 만들지 않는다
//   — 로고 정책(logoSrc 주석)과 같다. 남의 마크를 대신 걸어 주지 않는다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// ── 도우미 자체 ───────────────────────────────────────────────────────────
const data소스 = 읽기('src/data/data.js');
t('data.js 가 faviconUrl 을 내보낸다', /export const faviconUrl/.test(data소스));

// 소스에서 떼어 그대로 돌려 본다(og-image.mjs 와 같은 방식 — 값이 바뀌면 검사가 먼저 안다).
const i = data소스.indexOf('export const faviconUrl');
const 빈줄 = ['\r\n\r\n', '\n\n'].map((x) => data소스.indexOf(x, i)).filter((n) => n > 0);
const faviconUrl = new Function(
    data소스.slice(i, 빈줄.length ? Math.min(...빈줄) : data소스.length).replace('export const', 'const')
    + '\nreturn faviconUrl;')();

t('값이 없으면 빈 문자열', faviconUrl(undefined) === '' && faviconUrl({}) === '');
t("문자열 'null'·'undefined' 도 없는 것으로 본다",
    faviconUrl({ favicon_img: 'null' }) === '' && faviconUrl({ favicon_img: 'undefined' }) === '',
    'DB·JSON 을 거치며 널이 글자로 굳어 오는 자리가 있다');
t('파비콘이 있으면 그걸 쓴다', faviconUrl({ favicon_img: 'https://x/f.png', logo_img: 'https://x/l.png' }) === 'https://x/f.png');
t('파비콘이 없으면 로고로 대신한다', faviconUrl({ logo_img: 'https://x/l.png' }) === 'https://x/l.png');
t('공백만 있는 값도 없는 것으로 본다', faviconUrl({ favicon_img: '   ', logo_img: 'https://x/l.png' }) === 'https://x/l.png');

// ── 내보내는 자리 두 곳 ───────────────────────────────────────────────────
// head 를 그리는 곳이 둘이다(_app.js · components/head). 한 곳만 고치면 그 경로로 들어온
// 손님에게는 예전처럼 'null' 이 나간다.
for (const [이름, 경로] of [['_app.js', 'src/pages/_app.js'], ['head 컴포넌트', 'src/components/head/index.js']]) {
    const src = 읽기(경로);
    t(`${이름} 이 faviconUrl 을 가져온다`, /faviconUrl/.test(src));
    // 값을 그대로 href 에 꽂던 옛 모양이 되살아나지 않게 막는다.
    t(`${이름} 이 favicon_img 를 href 에 바로 넣지 않는다`,
        !/href=\{[^}]*favicon_img/.test(src),
        "href={dns?.favicon_img} 는 값이 없을 때 href='null' 이 되어 /지금경로/null 404 를 만든다");
    t(`${이름} 이 값이 있을 때만 <link> 를 그린다`,
        /\{favicon && \(/.test(src),
        '조건 없이 그리면 href 가 빈 문자열이 되어 지금 페이지를 아이콘으로 다시 부른다');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
