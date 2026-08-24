import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 카카오톡·SNS 미리보기 이미지(og:image).
//
// [무엇이 문제였나]
// 가맹점이 올린 원본이 규격도 용량도 손대지 않은 채 그대로 og:image 로 나갔다.
// mbc01 은 1923x818 · 2,608KB 였다. 미리보기 한 장에 2.6MB 를 태울 이유가 없고,
// 카카오 권장 규격(2:1 · 800x400)과도 안 맞아 어디서 잘릴지 가맹점이 알 수 없었다.
//
// ⚠ 이 저장소에 '500KB 를 넘으면 카카오가 아예 안 가져간다'고 적혀 있었다. **사실이 아니다.**
//   2,608KB 짜리 그대로도 카카오가 가져가 미리보기에 띄웠다(2026-08-24, ?v=2 로 확인).
//   '바꿔도 반영이 안 되던' 진짜 원인은 카카오의 URL 단위 캐시였다.
//   이 변환은 버그 수정이 아니라 규격·용량을 바로잡는 것이다.
//   이 구분을 지우지 말 것 — 지우면 다음 사람이 또 용량을 범인으로 지목한다.
//
// [지금]
// 로고와 같은 방식으로 클라우디너리 변환을 건다. 실측 2,608KB → 62KB, 800x400.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// data.js 는 별칭 import(src/components/settings)가 있어 Node 가 통째로는 못 불러온다.
// 두 함수는 순수 문자열 조작이라 소스에서 떼어 그대로 돌릴 수 있다.
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
const { ogDeliveryUrl, logoDeliveryUrl } = new Function(
    // CLOUDINARY_DELIVERY 와 LOGO_TRANSFORM 은 빈 줄 없이 붙어 있어 한 번에 딸려 온다.
    // 따로 떼면 LOGO_TRANSFORM 이 두 번 선언돼 터진다.
    떼기('const CLOUDINARY_DELIVERY = ') + '\n'
    + 떼기('const OG_TRANSFORM = ') + '\n'
    + 떼기('export const logoDeliveryUrl') + '\n'
    + 떼기('export const ogDeliveryUrl') + '\n'
    + 'return { ogDeliveryUrl, logoDeliveryUrl };'
)();

// ── 변환 함수를 실제로 돌린다 ─────────────────────────────────────────────
const 원본 = 'https://res.cloudinary.com/dkbh8wdxa/image/upload/v1787529944/abc.png';
const 나온것 = ogDeliveryUrl(원본);
t('클라우디너리 주소에 변환이 붙는다', 나온것.includes('/upload/c_fill,g_auto,w_800,h_400,f_jpg,q_auto:good/'));
t('원본 파일 이름은 그대로 남는다', 나온것.endsWith('/v1787529944/abc.png'));
// f_auto 는 브라우저에 webp 를 내준다. 카카오 수집기가 그걸 못 가져가면 미리보기가 통째로 빈다.
t('형식을 jpg 로 못 박는다', /f_jpg/.test(나온것) && !/f_auto/.test(나온것),
    'f_auto 로 바꾸면 카카오에 webp 가 갈 수 있다');
t('카카오 권장 크기 800x400 로 맞춘다', /w_800,h_400/.test(나온것));

// 두 번 붙으면 주소가 깨진다.
t('이미 변환된 주소는 그대로 둔다', ogDeliveryUrl(나온것) === 나온것);
// 밖에서 온 주소에는 변환을 붙일 수 없다.
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

// ── 내보내는 자리 두 곳이 모두 거치는가 ───────────────────────────────────
// 한 곳이라도 빠지면 그 경로로 들어온 손님에게는 예전처럼 원본이 나간다.
const app = 읽기('src/pages/_app.js');
t('_app.js 가 변환을 거친다', /content=\{ogDeliveryUrl\(head_data\?\.og_img \|\| headData\?\.og_img\)\}/.test(app));
t('_app.js 가 함수를 가져온다', /import \{ ogDeliveryUrl \} from 'src\/data\/data'/.test(app));

const head = 읽기('src/components/head/index.js');
t('head 컴포넌트가 변환을 거친다', /content=\{ogDeliveryUrl\(dns_data\?\.og_img\)\}/.test(head));
t('head 컴포넌트가 함수를 가져온다', /import \{ ogDeliveryUrl \} from "src\/data\/data"/.test(head));

// og:image 태그에 og_img 가 '벗은 채로' 들어가 있으면 안 된다.
for (const [이름, s] of [['_app.js', app], ['head/index.js', head]]) {
    const 태그 = (s.match(/<meta property=['"]og:image['"][^>]*>/) || [''])[0];
    t(`${이름} 의 og:image 가 변환을 거친다`, 태그.includes('ogDeliveryUrl('),
        태그 || '(태그를 못 찾음)');
}

// ── 설정 화면 안내 ────────────────────────────────────────────────────────
const 설정 = 읽기('src/pages/manager/settings/default/[brand_id].js');
// 이제 시스템이 줄이므로 '용량 줄여 다시 올리라'고 시킬 이유가 없다.
t('용량 줄이라는 경고가 사라졌다', !/용량을 줄여 다시 올려 주세요/.test(설정),
    '이제 시스템이 줄인다 — 가맹점에게 시킬 일이 아니다');
// 진짜 원인(카카오 캐시)을 알려야 한다. 모르면 '저장이 안 됐나' 하고 같은 일을 반복한다.
t('카카오 캐시를 안내한다', /카카오톡이 주소마다 예전 내용을 기억/.test(설정));
// 개발자 사이트의 캐시 초기화는 '어떤 계정이어야 하는지' 확인되지 않았다.
// 확인 전에는 계정이 필요 없는 방법(?v=2)을 먼저 준다.
t('계정 없이 되는 방법을 먼저 준다', /\?v=2/.test(설정));
// 비율은 여전히 가맹점 몫이라 그 안내는 남아 있어야 한다.
t('비율 안내는 남아 있다', /가로 : 세로 = 2 : 1/.test(설정));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
