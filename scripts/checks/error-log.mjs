import { BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 서버가 예외를 삼키지 않는지 본다.
//
// 무슨 일이 있었나(2026-08-21 18:03 KST):
//   결제 시도가 "서버 에러 발생" 으로 끝났는데 서버 로그에 남은 것은 이것뿐이었다.
//       2026-08-21 09:03:14 [] error: {}
//   JSON.stringify(new Error(...)) 는 '{}' 다 — Error 의 message·stack 은 열거 가능한
//   속성이 아니라 통째로 사라진다. 즉 그 방식은 axios 오류가 아닌 모든 예외를 삼킨다.
//   결제가 왜 실패했는지 아무도 알 수 없었다.
//
// 그래서 errText 로 바꿨다. 최소한 돈이 오가는 두 컨트롤러(pay·transaction)에서는
// 옛 방식이 다시 들어오면 안 된다.

if (!백엔드있음) {
    console.log('  (백엔드 저장소가 없어 건너뜀)');
    console.log('\n통과 0 / 실패 0');
    process.exit(0);
}

const 읽기 = (p) => readFileSync(BACK_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 헬퍼가 실제로 그렇게 동작하는가 ───────────────────────────────────────
const util = 읽기('utils.js/util.js');
const i = util.indexOf('export const errText');
t('errText 가 있다', i > 0);
const 조각 = util.slice(i, util.indexOf('\n};', i) + 3).replace('export const', 'const');
const errText = new Function(조각 + '\nreturn errText;')();

t('Error 의 메시지를 살린다', errText(new Error('테스트 실패')).includes('테스트 실패'),
    "JSON.stringify(Error) 는 '{}' 라 이게 안 되면 원인을 못 찾는다");
t('스택 앞부분도 남긴다', /at /.test(errText(new Error('x'))));
t('PG 응답 본문을 살린다',
    errText({ response: { status: 500, data: { code: 990, message: '시스템 에러입니다.' } } })
        .includes('990') );
t('HTTP 상태를 앞에 붙인다',
    errText({ response: { status: 401, data: {} } }).startsWith('HTTP 401'),
    '401·403 이면 키/계정 문제, 500 이면 상대 장애 — 이 한 글자가 갈림길이다');
t('SQL 오류도 알아본다', errText({ code: 'ER_X', sqlMessage: 'Unknown column' }).includes('Unknown column'));
t('빈 값에도 안 죽는다', typeof errText(null) === 'string');

// ── 돈이 오가는 경로에 옛 방식이 남아 있지 않은가 ─────────────────────────
for (const f of ['controllers/pay.controller.js', 'controllers/transaction.controller.js']) {
    const s = 읽기(f);
    const 이름 = f.split('/').pop();
    t(`${이름} 에 예외를 삼키는 로그가 없다`,
        !/JSON\.stringify\((err|e)\?\.response\?\.data \|\| \1\)/.test(s),
        'Error 객체가 {} 로 찍힌다');
    t(`${이름} 이 errText 를 쓴다`, /logger\.error\(errText\(/.test(s));
    t(`${이름} 이 errText 를 불러온다`, /import \{[^}]*errText[^}]*\} from "\.\.\/utils\.js\/util\.js";/.test(s));
}

// 포스페이 실패는 무엇을 보냈는지까지 남겨야 한다 — 그래야 PG 에 물어볼 수 있다.
const pay = 읽기('controllers/pay.controller.js');
t('포스페이 세션 실패 시 보낸 값을 남긴다', pay.includes('[forspay] 세션 생성 실패'));
t('App key 는 길이만 남긴다',
    /app_key_len=\$\{String\(creds\?\.app_key \?\? ''\)\.length\}/.test(pay) && !/app_key=\$\{creds/.test(pay),
    '키 값이 로그에 남으면 안 된다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
