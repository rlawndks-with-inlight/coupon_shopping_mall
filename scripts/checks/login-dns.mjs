import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
import { existsSync, readFileSync } from 'fs';

// '아이디·비밀번호가 맞는데 로그인이 안 되고, 새로고침하면 되는' 현상을 막는 장치.
//
// 무슨 일이었나:
//   signIn 은 회원을 brand_id 로 찾는데, 그 brand_id 를 dns 쿠키에서 꺼낸다.
//   그런데 dns 쿠키도 3시간짜리다(토큰 180분 · 쿠키 maxAge 3시간) — 로그인 토큰과 같이 죽는다.
//   창을 오래 열어 둔 뒤 다시 로그인하면 checkDns 가 false 를 주고 brand_id 가 undefined 가 되어
//   어떤 회원과도 안 맞았고, 화면에는 '가입되지 않은 회원입니다'(= 아이디/비번 오류)가 떴다.
//   새로고침하면 되던 이유는 그때 도메인 정보를 다시 받아 오며 dns 쿠키가 새로 구워져서다.
//   자격증명과는 아무 상관이 없었다 — 그래서 재현도 설명도 어려웠다.
//
// 이 검사가 지키는 것: 프론트가 호스트를 함께 보내고, 서버가 쿠키 없이도 브랜드를 찾는 것.

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const jwt = readFileSync(FRONT_ROOT + 'src/layouts/manager/auth/JwtContext.js', 'utf8');
const 로그인 = jwt.slice(jwt.indexOf('/api/auth/sign-in'), jwt.indexOf('} catch (error)', jwt.indexOf('/api/auth/sign-in')));
t('로그인 요청에 호스트를 함께 보낸다', /dns:.*window\.location\.host\.split\(':'\)\[0\]/.test(로그인));
t('서버 렌더에서도 안 죽는다', /typeof window !== 'undefined'/.test(로그인));

if (!existsSync(BACK_ROOT + 'controllers/auth.controller.js')) {
    console.log('  (백엔드 저장소가 없어 서버 쪽 검사는 건너뜀)');
} else {
    const auth = readFileSync(BACK_ROOT + 'controllers/auth.controller.js', 'utf8');
    const 조각 = auth.slice(auth.indexOf('signIn: async'), auth.indexOf('signUp', auth.indexOf('signIn: async')));

    t('쿠키가 없으면 호스트로 브랜드를 다시 찾는다', /if \(!decode_dns\?\.id\)/.test(조각));
    t('몸통의 dns 를 먼저 본다', /dns \|\| req\.headers\?\.host/.test(조각));
    t('브랜드 조회는 dns·admin_dns 둘 다 본다', /WHERE \(dns=\? OR admin_dns=\?\) AND is_delete=0/.test(조각));
    // setting_obj 는 토큰에서 꺼내면 객체, DB 에서 꺼내면 문자열이다. 안 맞추면
    // is_use_seller 판정이 조용히 어긋나 셀러몰 로그인 갈래가 바뀐다.
    t('setting_obj 모양을 맞춘다', /typeof brand\.setting_obj === 'string'/.test(조각));
    // 2026-09-03 토큰 종류 분리: dns 쿠키는 makeDnsToken(kind:'dns') 으로 굽는다 — 사용자 토큰과 바꿔 쓰지 못하게.
    t('다음 요청을 위해 쿠키를 다시 굽는다', /res\.cookie\("dns", makeDnsToken\(brand\)/.test(조각));
    // decode_dns 를 const 로 두면 되살릴 수가 없다(이 버그의 원래 모양).
    t('decode_dns 를 다시 담을 수 있다', /let decode_dns = checkDns\(req\.cookies\.dns\);/.test(조각));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
