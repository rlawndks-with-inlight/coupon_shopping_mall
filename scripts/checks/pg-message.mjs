import { BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// PG 실패 사유가 손님 화면으로 새지 않게 한다 (2026-08-28).
//
// [무슨 일이 있었나]
// 포스페이가 결제창 주소를 못 만들 때 **자기 서버의 원문 오류**를 돌려준다. 실제로 온 값:
//   {"error":"SQLSTATE[HY000] [1045] Access denied for user 'overseer'@'10.0.41.191'
//             (using password: YES) (SQL: select * from `merchandises` where `user_id`=2 ...)"}
// 그걸 그대로 message 에 담아 내려보내고 있었다. 프론트 utils/api.js 는 서버 message 를
// 그대로 토스트로 띄우므로, **결제하려던 손님 화면에 SQL 문이 떴다.**
// 몰이 고장난 것처럼 보이고, 협력사의 DB 계정명·내부 IP·테이블 구조가 아무에게나 새어 나간다.
//
// [왜 사유를 안 보여줘도 되나]
// 이 자리는 결제창을 **열기도 전**이다. 손님은 카드번호를 아직 넣지 않았으므로
// '한도 초과'처럼 손님이 손쓸 수 있는 사유가 나올 수가 없다. 전부 설정·시스템 문제다.
// ⚠ 헥토·핀트리의 result_msg(승인 거절 사유)는 다르다 — 그때는 손님이 이미 카드번호를 넣었고
//   사유가 손님에게 쓸모 있다. 그 자리는 이 검사가 건드리지 않는다.
//
// [왜 검사로 못 박나] 원문을 그대로 보여주는 편이 디버깅에 편해서 되돌리기 쉬운 자리다.
// 사유는 로그에 남으므로 잃는 것이 없다는 사실이 코드만 봐서는 안 보인다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

if (!백엔드있음) {
    console.log('  건너뜀 — 백엔드 저장소가 없다(서버에는 프론트만 배포된다)');
    console.log('\n통과 0 / 실패 0');
    process.exit(0);
}

const 문구 = '결제를 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.';
const src = readFileSync(BACK_ROOT + 'controllers/pay.controller.js', 'utf8').split('\r').join('');
const 코드 = 주석제거(src);

// ── 1. 문구를 한 곳에서 정한다 ──────────────────────────────────────────
t('손님 문구를 상수로 한 곳에 둔다', /const 결제시작실패문구 = /.test(코드),
    '자리마다 따로 적으면 한 곳만 고치고 끝난다');
t(`문구가 정확히 그 문장이다`, 코드.includes(`'${문구}'`),
    '서버 메시지는 사전에서 글자 그대로 찾는다 — 한 글자만 달라도 번역이 안 된다');
t('문구를 템플릿 리터럴로 만들지 않는다',
    !/const 결제시작실패문구 = `/.test(코드),
    '조립하면 사전 키와 안 맞아 외국어 화면에 한국어가 그대로 나간다');

// ── 2. 결제창 열기 전 실패는 전부 그 문구를 쓴다 ────────────────────────
const 실패응답 = [...코드.matchAll(/결제실패응답\([^;]*?\);/gs)].map((m) => m[0]);
t('결제실패응답 호출을 찾았다', 실패응답.length >= 10, `찾은 수 ${실패응답.length}`);

// 협력사 응답에서 꺼낸 문자열이 손님에게 가는 자리
const 협력사원문 = 실패응답.filter((c) =>
    /session\?\.(message|error)/.test(c)
    || /pl\?\.message/.test(c)
    || /e\?\.response\?\.data\?\.message/.test(c));
t('포스페이·페이레터 응답 원문을 손님에게 보내지 않는다', 협력사원문.length === 0,
    협력사원문.join('\n        ') || '');

t('세션 생성 실패 자리가 그 문구를 쓴다',
    실패응답.filter((c) => /결제시작실패문구/.test(c)).length === 4,
    '포스페이 2자리 + 페이레터 2자리 = 4');

// 승인 단계(헥토·핀트리)의 사유는 그대로 남아 있어야 한다 — 과잉 차단 방지
t('승인 거절 사유는 손님에게 그대로 간다',
    실패응답.filter((c) => /result_msg|resultMsg/.test(c)).length === 4,
    '한도 초과·카드 정지처럼 손님이 손쓸 수 있는 사유까지 가리면 안 된다');

// ── 3. 사유는 로그에 남는다 ────────────────────────────────────────────
t('포스페이 사유를 로그에 남긴다', /launch_page_url 없음/.test(코드));
t('포스페이 세션 오류를 로그에 남긴다', /\[forspay\] 세션 생성 실패/.test(코드));
t('페이레터 사유도 로그에 남긴다', /\[payletter\] 결제요청 URL 없음/.test(코드),
    '이 자리는 원래 로그가 없었다 — 문구만 가리면 사유가 아예 사라진다');

const 로그수 = (코드.match(/logger\.error/g) ?? []).length;
t(`logger.error 가 충분히 있다 (${로그수}곳)`, 로그수 >= 8);

// ── 4. 사전 ────────────────────────────────────────────────────────────
for (const lang of ['ko', 'en', 'ja', 'cn', 'es']) {
    const dict = readFileSync(`src/locales/langs/${lang}.js`, 'utf8');
    t(`${lang} 사전에 문구가 있다`, dict.includes(`"${문구}"`),
        '서버가 보내는 문장이라 사전에 없으면 그 언어에서 한국어로 뜬다');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
