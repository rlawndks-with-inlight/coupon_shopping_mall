import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
import { existsSync, readFileSync } from 'fs';

// 관리자가 쓰는 도중에 로그아웃되지 않게 하는 장치를 잠근다.
//
// 무슨 일이 있었나:
//   토큰 수명은 180분인데 발급이 로그인 때 한 번뿐이라, '무활동 3시간'이 아니라
//   '로그인 후 3시간'이었다. 계속 일해도 그 시각이 되면 끊겼다.
//   게다가 /api/auth 는 로그인 여부를 알려주는 곳인데 포인트 합계 DB 조회를 같이 하고 있어서,
//   그 조회가 한 번만 삐끗해도 -200 을 돌려줬고 프론트는 그것을 '로그인 안 됨'으로 읽었다
//   (AuthGuard 는 isAuthenticated 가 거짓이면 즉시 로그인 화면을 그린다).
//   → 토큰이 멀쩡한데도 작업 중이던 사람이 튕겨 나갔다. '여기저기 옮겨다니다 갑자기'가 이것이다.
//
// 이 검사는 그 두 가지가 되돌아가지 않는지 본다. 눌러 봐야만 드러나는 종류라 코드로 못 박는다.

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const jwt = readFileSync(FRONT_ROOT + 'src/layouts/manager/auth/JwtContext.js', 'utf8');

// ── 프론트: 물어보지 못한 것을 '로그인 안 됨' 으로 읽지 않는다 ──────────
//
// [증상] 로그인한 지 한 시간도 안 됐는데 갑자기 로그인 화면이 떴다.
// [원인] 백엔드는 실패 코드를 HTTP 500 으로 내려보낸다(util.js 의 response).
//   axios 는 2xx 가 아니면 reject 하므로, DB 가 한 번 삐끗하거나(운영 로그에
//   'packets out of order' 91건 · 'Socket closed' 8건 · ETIMEDOUT 4건) 배포 중 재시작에
//   걸리거나 네트워크가 잠깐 끊기면 catch 로 떨어졌고, 그 catch 가 즉시 로그아웃시켰다.
//   initialize 는 페이지를 새로 열 때마다 돈다 — 관리자에는 window.location 이동이 있어 자주다.
// [수정] 실패하면 몇 번 더 물어본다. 서버가 200 으로 '사용자 없음' 을 말한 경우만 진짜 로그아웃.
t('물어보지 못하면 다시 물어본다', /for \(const 기다림 of \[0, 1000, 3000\]\)/.test(jwt));
t('재시도 중에는 로그아웃시키지 않는다', /마지막오류 = e;/.test(jwt));
t('끝내 못 물어봤을 때만 포기한다', /if \(마지막오류\) throw 마지막오류;/.test(jwt));
t('사용자 없음(200)은 그대로 로그인 화면', /response\?\.data\?\.id > 0/.test(jwt));

// ── 프론트: 주기적으로 살아 있음을 알린다 ────────────────────────────────
t('세션 두드리기가 있다', /setInterval\(두드리기/.test(jwt));
t('탭으로 돌아왔을 때도 이어 준다', /visibilitychange/.test(jwt));
// 두드림이 실패했다고 내쫓으면 원래 사고보다 더 나쁘다.
t('두드림 실패로는 로그아웃시키지 않는다', /axios\.get\('\/api\/auth'\)\.catch\(\(\) => \{ \}\)/.test(jwt));
t('로그인 상태일 때만 두드린다', /if \(!state\.isAuthenticated\) return;/.test(jwt));

if (!existsSync(BACK_ROOT + 'controllers/auth.controller.js')) {
    console.log('  (백엔드 저장소가 없어 서버 쪽 검사는 건너뜀)');
} else {
    const auth = readFileSync(BACK_ROOT + 'controllers/auth.controller.js', 'utf8');
    const 조각 = auth.slice(auth.indexOf('checkSign: async'), auth.indexOf('changeInfo:', auth.indexOf('checkSign: async')));

    // ── 서버: 포인트 조회 실패가 로그아웃이 되면 안 된다 ──────────────────
    // 문자 수로 재면 주석 한 줄만 늘어도 깨진다(실제로 그랬다). '포인트 조회가 자기만의
    // try/catch 안에 있는가'를 본다 — 그 안쪽 catch 가 로그인을 살려 두는 자리다.
    const 포인트조각 = 조각.slice(조각.indexOf('let point = 0;'), 조각.indexOf('return response'));
    t('포인트 조회를 따로 감싼다',
        /try \{/.test(포인트조각) && /SELECT SUM\(point\)/.test(포인트조각) && /\} catch \(e\) \{/.test(포인트조각));
    t('포인트를 못 읽어도 로그인은 유지', /로그인은 유지/.test(조각));
    t('포인트 기본값은 0', /let point = 0;/.test(조각));

    // ── 서버: 반쯤 쓴 토큰은 새로 준다 ───────────────────────────────────
    t('남은 시간을 재서 갱신한다', /남은초 < 90 \* 60/.test(조각));
    t('갱신은 로그인한 사용자에게만', /decode_user\?\.id > 0 && decode_user\?\.exp/.test(조각));
    // exp/iat 를 그대로 다시 서명하면 만료가 안 밀린다 — 반드시 빼고 새로 발급해야 한다.
    t('옛 만료값을 떼고 새로 발급한다', /const \{ exp, iat, iss, \.\.\.payload \} = decode_user;/.test(조각));

    // 토큰 수명 자체는 그대로 둔다(갱신이 붙었으니 늘릴 이유가 없다).
    const util = readFileSync(BACK_ROOT + 'utils.js/util.js', 'utf8');
    t('토큰 수명은 180분', /expiresIn: '180m'/.test(util));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
