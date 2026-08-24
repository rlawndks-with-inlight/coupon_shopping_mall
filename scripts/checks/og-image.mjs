import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 카카오톡·SNS 미리보기(og:image · og:url).
//
// [가맹점이 겪은 일]
// "미리보기 그림·문구를 바꿨는데 카카오톡에 반영이 안 된다."
// 저장도 출력도 정상이었다. 원인은 **카카오의 URL 단위 캐시**다.
// 한 번 긁어간 주소는 그 내용을 계속 보여준다.
//
// ⚠ 이 저장소에 '500KB 를 넘으면 카카오가 아예 안 가져간다'고 적혀 있었다. **사실이 아니다.**
//   2,608KB 짜리 그대로도 카카오가 가져가 그림·글 모두 띄웠다(2026-08-24 확인).
//   그 문장을 되살리지 말 것 — 되살리면 다음 사람이 또 용량을 범인으로 지목한다.
//
// [우리가 할 수 있는 것과 없는 것]
//   못 한다 — 캐시를 대신 지워 주는 것. 카카오는 REST API 를 주지 않는다
//            (데브톡에 물어본 사람이 있는데 답이 없다). 사람이 로그인해서 도구에 넣어야 한다.
//   한다   — ① 규격·용량을 시스템이 맞춘다(2,608KB → 62KB, 800x400)
//            ② og:url 을 정식 주소 하나로 못 박아 캐시가 주소마다 흩어지지 않게 한다
//            ③ 설정 화면에서 도구까지 한 번에 데려간다(주소는 클립보드에 넣어 준다)

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// data.js 는 별칭 import(src/components/settings)가 있어 Node 가 통째로는 못 불러온다.
// 세 함수는 순수 문자열 조작이라 소스에서 떼어 그대로 돌릴 수 있다.
// 떼어 쓰는 이점이 하나 더 있다 — 검사가 '실제 소스'를 읽으므로 값이 바뀌면 바로 드러난다.
const data소스 = 읽기('src/data/data.js');
// 선언 하나를 빈 줄까지 잘라 온다. 중괄호를 세는 것보다 덜 깨진다
// (한 줄짜리 상수와 블록형 함수가 섞여 있어 ';' 나 '};' 로 자르면 둘 중 하나가 어긋난다).
const 떼기 = (이름) => {
    const i = data소스.indexOf(이름);
    if (i < 0) throw new Error('못 찾음: ' + 이름);
    const 빈줄 = ['\r\n\r\n', '\n\n'].map((x) => data소스.indexOf(x, i)).filter((n) => n > 0);
    return data소스.slice(i, 빈줄.length ? Math.min(...빈줄) : data소스.length)
        .replace(/export const /g, 'const ');
};
const { ogDeliveryUrl, logoDeliveryUrl, canonicalUrl } = new Function(
    // CLOUDINARY_DELIVERY 와 LOGO_TRANSFORM 은 빈 줄 없이 붙어 있어 한 번에 딸려 온다.
    // 따로 떼면 LOGO_TRANSFORM 이 두 번 선언돼 터진다.
    떼기('const CLOUDINARY_DELIVERY = ') + '\n'
    + 떼기('const OG_TRANSFORM = ') + '\n'
    + 떼기('export const logoDeliveryUrl') + '\n'
    + 떼기('export const canonicalUrl') + '\n'
    + 떼기('export const ogDeliveryUrl') + '\n'
    + 'return { ogDeliveryUrl, logoDeliveryUrl, canonicalUrl };'
)();

// ── 미리보기 이미지 변환 ──────────────────────────────────────────────────
const 원본 = 'https://res.cloudinary.com/dkbh8wdxa/image/upload/v1787529944/abc.png';
const 나온것 = ogDeliveryUrl(원본);
t('클라우디너리 주소에 변환이 붙는다', 나온것.includes('/upload/c_fill,g_auto,w_800,h_400,f_jpg,q_auto:good/'));
t('원본 파일 이름은 그대로 남는다', 나온것.endsWith('/v1787529944/abc.png'));
// f_auto 는 브라우저에 webp 를 내준다. 카카오 수집기가 그걸 못 가져가면 미리보기가 통째로 빈다.
t('형식을 jpg 로 못 박는다', /f_jpg/.test(나온것) && !/f_auto/.test(나온것),
    'f_auto 로 바꾸면 카카오에 webp 가 갈 수 있다');
t('카카오 권장 크기 800x400 로 맞춘다', /w_800,h_400/.test(나온것));
t('이미 변환된 주소는 그대로 둔다', ogDeliveryUrl(나온것) === 나온것);
t('다른 도메인 주소는 손대지 않는다',
    ogDeliveryUrl('https://example.com/a.png') === 'https://example.com/a.png');
t('빈 값이어도 죽지 않는다', ogDeliveryUrl(undefined) === '' && ogDeliveryUrl(null) === '');
t('/upload/ 가 없는 주소는 그대로',
    ogDeliveryUrl('https://res.cloudinary.com/x/y.png') === 'https://res.cloudinary.com/x/y.png');

// 로고 변환과 섞이면 안 된다 — 목적이 정반대다.
//   로고 : e_trim + c_fit  → 비율 유지, 통째로 들어간다(브랜드 마크라 잘리면 안 된다)
//   og   : c_fill          → 2:1 로 잘린다(그 용도로 만드는 그림이다)
t('로고 변환과 값이 다르다', logoDeliveryUrl(원본) !== ogDeliveryUrl(원본));
t('로고는 c_fill 로 자르지 않는다', !/c_fill/.test(logoDeliveryUrl(원본)));

// ── og:url (이 몰의 정식 주소) ───────────────────────────────────────────
// 수집기는 og:url 을 그 문서의 대표 주소로 본다. 값이 실제 열리는 주소와 다르면
// 같은 페이지가 여러 주소로 흩어져 미리보기 캐시도 따로 잡힌다.
// 아래 두 형태가 실제로 소스에 있었다 — 다시 못 만들게 막는다.
t('슬래시 두 개가 빠지지 않는다', canonicalUrl('mbc01.shopgo.co.kr') === 'https://mbc01.shopgo.co.kr/',
    "예전 components/head 는 'https:' + dns 라 https:mbc01... 을 내보냈다");
t('빈 값이면 빈 문자열', canonicalUrl('') === '' && canonicalUrl(undefined) === '',
    "예전 _app.js 는 ('https://' + dns) || 폴백 이라 dns 가 없으면 https://undefined 를 내보냈다");
t('끝에 슬래시를 붙인다', canonicalUrl('a.com').endsWith('/'),
    'next.config.js 의 trailingSlash: true 와 맞춘다 — 실제로 열리는 주소가 그것이다');
t('이미 https:// 가 붙어 있어도 두 번 안 붙는다', canonicalUrl('https://a.com') === 'https://a.com/');
t('끝 슬래시가 여러 개여도 하나로', canonicalUrl('a.com///') === 'https://a.com/');

// ── 내보내는 자리 두 곳이 모두 거치는가 ───────────────────────────────────
// 한 곳이라도 빠지면 그 경로로 들어온 손님에게는 예전처럼 원본이 나간다.
const app = 읽기('src/pages/_app.js');
const head = 읽기('src/components/head/index.js');
t('_app.js 가 함수를 가져온다', /import \{ ogDeliveryUrl, canonicalUrl \} from 'src\/data\/data'/.test(app));
t('head 컴포넌트가 함수를 가져온다', /import \{ ogDeliveryUrl, canonicalUrl \} from "src\/data\/data";/.test(head));
t('_app.js og:image 가 변환을 거친다', /og:image' content=\{ogDeliveryUrl\(/.test(app));
t('head og:image 가 변환을 거친다', /og:image" content=\{ogDeliveryUrl\(/.test(head));
t('_app.js og:url 이 정식 주소를 쓴다', /og:url' content=\{canonicalUrl\(/.test(app));
t('head og:url 이 정식 주소를 쓴다', /og:url" content=\{canonicalUrl\(/.test(head));

// ── 설정 화면 안내 ────────────────────────────────────────────────────────
const 설정 = 읽기('src/pages/manager/settings/default/[brand_id].js');
// 주석(왜 그렇게 했는지 남긴 이력)은 빼고, 가맹점 눈에 보이는 글만 본다.
const 설정_본문 = 설정.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

// 이제 시스템이 줄이므로 '용량 줄여 다시 올리라'고 시킬 이유가 없다.
t('용량 줄이라는 경고가 사라졌다', !/용량을 줄여 다시 올려 주세요/.test(설정_본문));
// 진짜 원인을 알려야 한다. 모르면 '저장이 안 됐나' 하고 같은 일을 반복한다.
t('카카오 캐시가 원인임을 알린다', /카카오톡이 주소마다 예전 내용을 기억/.test(설정_본문));
// 카카오는 REST API 를 안 준다 — 대신 사람이 눌러야 하는 일을 최대한 줄인다.
t('캐시 지우는 도구로 데려간다', /developers\.kakao\.com\/tool\/clear\/og/.test(설정));
t('주소를 클립보드에 넣어 준다', /navigator\.clipboard\.writeText/.test(설정),
    '붙여넣기까지 손으로 하게 두면 주소를 잘못 넣는다');
// 캐시를 지워도 이미 보낸 대화방에는 옛 카드가 남는다(카카오 공식 안내).
t('새 대화방에서 확인하라고 알린다', /새 대화방에서 하세요/.test(설정_본문));
// '주소 뒤에 ?v=2 를 붙여라'는 편법은 걷어냈다. 물음표를 빠뜨린 /v=2 는 404 인데
// 미리보기만 멀쩡해 보여서 손님만 오류 페이지로 간다.
t('주소에 덧붙이는 편법을 안내하지 않는다', !/\?v=2/.test(설정_본문),
    '되살리려면 /v=2 오타로 404 가 되는 위험까지 함께 처리할 것');
// 비율은 여전히 가맹점 몫이라 그 안내는 남아 있어야 한다.
t('비율 안내는 남아 있다', /가로 : 세로 = 2 : 1/.test(설정_본문));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
