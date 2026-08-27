import { BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// DB 커넥션 풀 크기 (2026-08-27).
//
// [왜 잠그나]
// pm2 가 cluster 모드로 **2 인스턴스**를 띄우고, 인스턴스마다 읽기·쓰기 풀을 따로 둔다.
// 그래서 실제 최대치는 `2 × (읽기 + 쓰기)` 다. 예전 값 100 이면 400 이었고,
// MySQL max_connections 가 500 이라 여유가 100 밖에 없었다 —
// 관리자 도구·배치가 그 100 을 나눠 쓰다 넘기면 'Too many connections' 로 몰 전체가 멈춘다.
//
// 실측(134.7일): 동시 접속 최대기록 105 · 평소 37 · 쿼리 왕복 2.4ms.
// 50 이면 2 × 100 = 200 이라 300 을 남긴다.
//
// 숫자 하나만 되돌리면 조용히 위험해지는 자리라 검사로 못 박는다.

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
const src = readFileSync(BACK_ROOT + 'config/db-pool.js', 'utf8');
const 코드 = 주석제거(src);

t('풀 크기를 한 곳에서 정한다', /const 커넥션상한 = /.test(코드),
    '두 풀에 숫자를 따로 적으면 한쪽만 바뀐다');
t('읽기·쓰기 두 풀이 같은 값을 쓴다',
    (코드.match(/connectionLimit: 커넥션상한,/g) ?? []).length === 2);
t('숫자를 코드에 박지 않는다', !/connectionLimit: \d+/.test(코드));

// 값 자체를 확인한다. 2 인스턴스 × (읽기+쓰기) 가 max_connections(500)의 절반을 넘으면 안 된다.
const m = 코드.match(/DB_POOL_SIZE \?\? '(\d+)'/);
t('기본값이 코드에 적혀 있다', !!m);
if (m) {
    const 값 = Number(m[1]);
    const 최대 = 2 * (값 * 2);   // 인스턴스 2개 × (읽기 + 쓰기)
    t(`기본값 ${값} → 최대 ${최대} 커넥션`, 최대 <= 250,
        'MySQL max_connections 500 의 절반 안에 들어야 다른 클라이언트 몫이 남는다');
    t(`기본값 ${값} 이 실측 최대기록(105)을 감당한다`, 최대 >= 120,
        '너무 줄이면 몰릴 때 큐에서 기다린다');
}
t('환경변수로 바꿀 수 있다', /process\.env\.DB_POOL_SIZE/.test(코드),
    '재배포 없이 조절할 수 있어야 한다');

// 왜 이 값인지가 코드에 남아 있어야 한다 — 다음 사람이 '100 이 넉넉하지' 하고 되돌린다.
t('근거가 주석에 남아 있다', /max_connections/.test(src) && /2 인스턴스/.test(src));
t('mysql2 한계도 적어 두었다', /idleTimeout/.test(src),
    '2.3.3 에는 없다는 사실을 모르면 같은 조사를 다시 한다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
