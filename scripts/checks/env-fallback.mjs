import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { execSync } from 'child_process';
import { readFileSync, statSync } from 'fs';

// 비밀이 코드에 굳어 있지 않은가 (2026-08-27).
//
// [사연]
// 비밀을 찾을 때 흔히 `password: '...'` 꼴만 본다. 그런데 이 저장소에서 실제로 나온 것은
// 그게 아니라 **기본값** 이었다:
//     const encryptionKey = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
//     const iv           = process.env.IV || '1234567890123456';
// process.env 가 들어 있어서 '환경변수를 쓰는 정상 코드'로 보이고, 실제로 손으로 훑을 때도
// 사람 눈은 앞부분만 읽고 넘어간다. 하지만 .env 에 그 이름이 없으면 **조용히 1234… 로 암호화**한다.
// 실제로 ENCRYPTION_KEY·IV 는 로컬에도 서버에도 없었다(그 파일이 죽은 코드라 터지지 않았을 뿐이다).
//
// 그래서 두 가지를 함께 본다:
//   (1) 값이 그대로 박힌 자리
//   (2) 민감한 이름의 환경변수에 기본값이 달린 자리  ← 사람이 놓치는 쪽
//
// git 이 추적하는 파일만 본다 — 그게 저장소를 볼 수 있는 사람에게 실제로 노출되는 것이다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 민감한이름 = /KEY|SECRET|PASS|TOKEN|_IV$|^IV$|SALT|CRED|PRIVATE|SIGN/i;
const 박힌값 = [
    ['비밀번호', /\b(password|passwd|pwd)\s*[:=]\s*['"`]([^'"`]{3,})['"`]/gi],
    ['시크릿', /\b(secret|client_secret|jwt_secret)\s*[:=]\s*['"`]([^'"`]{6,})['"`]/gi],
    ['접속문자열', /\b(mysql|postgres|mongodb|redis|amqp):\/\/[^\s'"`]*:[^\s'"`@]+@/gi],
    ['AWS키', /\b(AKIA[0-9A-Z]{16})\b/g],
    ['개인키', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
    ['API키', /\b(api_?key|access_?key|secret_?key|auth_?key)\s*[:=]\s*['"`]([^'"`]{8,})['"`]/gi],
];

// 이미 공개된 값이라 비밀이 아닌 것들.
// 헥토(세틀뱅크)·핀트리 연동문서에 그대로 적혀 있는 **테스트베드 전용** 값이다.
// 붙는 주소도 tbgw / tbnpg (tb = test bed) 라 실제 돈이 오가지 않는다.
// 여기에 적어 두지 않으면 검사가 매번 빨간불이 되고, 그러면 사람이 검사를 꺼 버린다 —
// 그게 진짜 비밀이 새는 경로다. 다만 **실제 상용 키를 여기 추가하지 말 것.**
const 공개된테스트값 = new Set([
    'pgSettle30y739r82jtd709yOfZ2yK5K',   // 헥토/핀트리 테스트 MID
    'ST1009281328226982205',              // 헥토 테스트 API 키
]);
// 진짜 값이 아닌 것 — 자리표시자·타입이름·시험용
const 봐줌 = (v) => !v || v.length < 3 || 공개된테스트값.has(v)
    || /^(process\.env|undefined|null|true|false|string|number|password|pw|pwd|text|\$\{|<|xxx|test|sample|example|your|change_?me|\.\.\.|●|\*|비밀번호|비번)/i.test(v);

const 훑기 = (뿌리, 이름) => {
    let 목록;
    try {
        목록 = execSync('git ls-files', { cwd: 뿌리, maxBuffer: 1 << 28 }).toString()
            .split('\n').filter((f) => f && /\.(js|jsx|ts|tsx|mjs|cjs)$/i.test(f));
    } catch { t(`${이름} 파일 목록을 읽었다`, false, 'git ls-files 실패'); return; }

    const 걸린것 = [];
    for (const f of 목록) {
        // 검사 스크립트 자신은 뺀다 — 여기엔 예시로 적은 낱말이 잔뜩 있다.
        if (/scripts[\/]checks[\/]/.test(f)) continue;
        let 소스;
        try { if (statSync(뿌리 + '/' + f).size > 3_000_000) continue; 소스 = readFileSync(뿌리 + '/' + f, 'utf8'); }
        catch { continue; }
        // ⚠ \r 을 먼저 지운다 — 이 저장소는 CRLF 라 지우지 않으면 주석이 안 걸러진다.
        const 코드 = 소스.replace(/\r/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

        for (const [종류, re] of 박힌값) {
            re.lastIndex = 0;
            for (const m of 코드.matchAll(re)) {
                const 값 = m[2] ?? m[0];
                if (/process\.env/.test(m[0]) || 봐줌(값)) continue;
                걸린것.push(`${f}:${코드.slice(0, m.index).split('\n').length} [${종류}] ${m[0].slice(0, 70)}`);
            }
        }
        // 여기가 핵심 — 민감한 이름의 환경변수에 달린 기본값
        for (const m of 코드.matchAll(/process\.env\.([A-Z0-9_]+)\s*(?:\|\||\?\?)\s*['"`]([^'"`]+)['"`]/g)) {
            if (!민감한이름.test(m[1])) continue;
            걸린것.push(`${f}:${코드.slice(0, m.index).split('\n').length} [기본값] ${m[1]} 없으면 → '${m[2].slice(0, 30)}'`);
        }
    }
    t(`${이름}: 코드에 굳은 비밀이 없다 (${목록.length}개 검사)`, 걸린것.length === 0,
        걸린것.length ? 걸린것.slice(0, 6).join('\n        ')
            + '\n        값은 .env 로 옮기고, 기본값 없이 process.env 로만 읽을 것' : '');
};

훑기(FRONT_ROOT.replace(/\/$/, ''), '프론트');
if (백엔드있음) 훑기(BACK_ROOT.replace(/\/$/, ''), '백엔드');
else console.log('  건너뜀 — 백엔드 저장소가 없다');

// 개인정보 암호화는 키가 없으면 **평문을 그대로 저장한다**(의도된 롤아웃 안전장치).
// 그러면 .env 에서 한 줄이 사라져도 아무 증상이 없다. 뜰 때 소리를 내는지 확인한다.
if (백엔드있음) {
    const idx = readFileSync(BACK_ROOT + 'index.js', 'utf8').replace(/\r/g, '');
    t('뜰 때 개인정보 암호화 키를 확인한다', /DB_ENCRYPTION_KEY/.test(idx) && /개인정보키확인\(\)/.test(idx),
        'crypto-util 은 키가 없으면 평문을 그대로 돌려준다 — 경고가 없으면 아무도 모른다');
    const cu = readFileSync(BACK_ROOT + 'utils.js/crypto-util.js', 'utf8').replace(/\r/g, '');
    t('개인정보 키에는 기본값이 없다', !/DB_ENCRYPTION_KEY\s*(\|\||\?\?)\s*['"`][^'"`]+['"`]/.test(cu),
        '기본값을 주면 키가 없는 것을 영영 모른다');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
