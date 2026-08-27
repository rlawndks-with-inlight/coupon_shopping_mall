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


// -- mysql2 3.x 업그레이드 (2026-08-27) --------------------------------
//
// [왜 올렸나]
// 2.3.3 에는 idleTimeout·maxIdle 이 아예 없다 — 넘겨도 'Ignoring invalid configuration
// option' 경고만 찍고 무시한다(두 버전을 나란히 돌려 확인). 그래서 놀던 커넥션을 닫을
// 방법이 없었다.
//
// DB 는 AWS 밖 공인 IP(다른 데이터센터)에 있고 백엔드는 EC2 에 있다. 커넥션이 인터넷을
// 건너가므로 중간 NAT·방화벽이 오래 논 TCP 를 말없이 버린다. 풀은 그걸 모르고 죽은 소켓을
// 다시 꺼내 쓰고, 그 자국이 'packets out of order' 와 Aborted_clients(하루 ~41건)다.
//
// [안전한가 — 실측으로 확인한 것]
// 2.3.3 과 3.24.2 에 같은 질의를 돌려 글자 단위로 비교했다:
//   · 값과 자바스크립트 타입 168줄 동일 (int·bigint·tinyint·double·date·time·datetime·text·char)
//   · 쓰기 결과(insertId·affectedRows)와 오류코드 동일
//   · 이스케이프 83건 동일 (주입 문자열·역슬래시·널바이트·멀티바이트 우회 포함)
//   · 실제 API 27개 응답이 본문 해시까지 동일 (1MB 응답 포함)
// 이 코드가 쓰는 mysql2 표면은 `pool.query(sql, params)` 하나뿐이라(402곳) 위험면이 좁다.
// 유일한 차이는 3.x 가 INSERT 결과에도 changedRows 키를 붙이는 것 — 이 코드는 안 읽는다.
const 팩 = JSON.parse(readFileSync(BACK_ROOT + 'package.json', 'utf8'));
const 적힌버전 = 팩.dependencies?.mysql2 ?? '';
t('mysql2 가 3.x 이상이다', /^[\^~]?3\./.test(적힌버전),
    `지금 ${적힌버전 || '(없음)'} — 2.x 로 되돌리면 아래 두 옵션이 조용히 무시된다`);

t('노는 커넥션을 닫는 시간을 정한다', /idleTimeout: 노는시간,/.test(코드),
    '이게 없으면 죽은 소켓을 계속 물고 있다 — 업그레이드한 이유가 사라진다');
t('놀리는 커넥션 수를 정한다', /maxIdle: 놀리는수,/.test(코드));
t('두 풀 모두에 건다',
    (코드.match(/idleTimeout: 노는시간,/g) ?? []).length === 2 &&
    (코드.match(/maxIdle: 놀리는수,/g) ?? []).length === 2,
    '읽기 풀에만 걸면 쓰기 풀 커넥션이 그대로 썩는다');

const 시간 = 코드.match(/DB_IDLE_TIMEOUT \?\? '(\d+)'/);
t('노는시간 기본값이 코드에 적혀 있다', !!시간);
if (시간) {
    const ms = Number(시간[1]);
    t(`노는시간 ${ms / 1000}초가 중간 장비보다 짧다`, ms <= 300000,
        'NAT·방화벽이 보통 5~10분에 버린다 — 그보다 먼저 우리가 닫아야 의미가 있다');
    t(`노는시간 ${ms / 1000}초가 너무 짧지는 않다`, ms >= 30000,
        '새 커넥션 여는 값이 실측 23ms 다. 너무 자주 닫으면 그 값을 계속 문다');
}
t('두 옵션 다 환경변수로 바꿀 수 있다',
    /process\.env\.DB_IDLE_TIMEOUT/.test(코드) && /process\.env\.DB_MAX_IDLE/.test(코드));

// promise 풀에 콜백을 넘기면 영영 안 불린다. 예전에 이 자리가 그랬고, 그래서 DB 접속
// 실패가 로그에 한 줄도 안 남았다. 로그가 조용한 것을 '잘 돌고 있다'로 읽으면 안 된다.
t('뜰 때 DB 확인이 promise 방식이다',
    /getConnection\(\)/.test(코드) && !/getConnection\(\(err/.test(코드),
    'readPool 은 promise 풀이라 콜백은 한 번도 불리지 않는다 — 죽은 코드가 된다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
