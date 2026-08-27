import { BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync, readdirSync } from 'fs';

// config/ 가 git 에 추적되는가 · 거기에 비밀이 박혀 있지 않은가 (2026-08-27).
//
// [사연]
// 예전에는 .gitignore 에 `/config` 한 줄이 있어 config 폴더 **전체**가 제외됐다.
// 그래서 config/db-pool.js 를 고쳐 커밋해도 서버에는 영영 가지 않았다 —
// 커넥션 풀 상한을 낮춘 변경이 커밋만 되고 배포되지 않은 채 넘어갔고, scp 로 따로 올려야 했다.
// 코드에는 흔적이 남지 않아 '왜 서버만 다르지' 를 다시 조사하게 되는 자리다.
//
// config/ 에 든 것은 설정이 아니라 **코드**다. 값은 전부 process.env 에서 읽는다.
// 진짜 설정인 .env 는 config/ 밖에 있고 계속 무시된다.
//
// ⚠ 다만 제외를 걷어낸 대가가 있다: 이제 **누군가 config/ 에 비밀을 적으면 그대로 커밋된다.**
//   실제로 예전 config/grandparis-db.js 에 DB 비밀번호가 박혀 있었고(지웠다),
//   그 값은 지금도 옛 커밋에서 꺼낼 수 있다. 같은 일이 반복되지 않게 여기서 막는다.

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

const 무시목록 = readFileSync(BACK_ROOT + '.gitignore', 'utf8').replace(/\r/g, '');
const 살아있는줄 = 무시목록.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

t('.gitignore 가 config 를 통째로 막지 않는다',
    !살아있는줄.some((l) => /^\/?config\/?$/.test(l)),
    'config/ 를 막으면 db-pool.js 를 고쳐도 배포되지 않는다 — 서버에 직접 올려야 한다');

t('.env 는 계속 막는다', 살아있는줄.some((l) => l === '.env'),
    '진짜 비밀은 .env 에 있다. 이건 절대 추적하면 안 된다');

// config/ 안의 파일이 값을 코드에 박고 있지 않은지 본다.
const 파일들 = readdirSync(BACK_ROOT + 'config').filter((f) => f.endsWith('.js'));
t('config/ 에 파일이 있다', 파일들.length > 0);

// 비밀처럼 생긴 것: key/password/secret/token 이 process.env 가 아닌 값으로 채워진 자리.
const 수상한자리 = /(password|passwd|secret|api_?key|token|access_?key|private_?key)\s*[:=]\s*['"][^'"]{4,}['"]/gi;
for (const f of 파일들) {
    const 소스 = readFileSync(BACK_ROOT + 'config/' + f, 'utf8').replace(/\r/g, '');
    // 주석은 뺀다 — 왜 그렇게 했는지 설명하는 글에도 같은 단어가 나온다.
    const 코드 = 소스.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    const 걸린것 = (코드.match(수상한자리) ?? []).filter((m) => !/process\.env/.test(m));
    t(`config/${f} 에 박힌 비밀이 없다`, 걸린것.length === 0,
        걸린것.length ? `걸린 자리: ${걸린것.join(' | ').slice(0, 160)}\n        값은 .env 로 옮기고 process.env 로 읽을 것` : '');
}

// 호스트 주소가 박히는 것도 같은 문제다 — 어느 DB 를 보는지가 코드에 굳는다.
for (const f of 파일들) {
    const 소스 = readFileSync(BACK_ROOT + 'config/' + f, 'utf8').replace(/\r/g, '');
    const 코드 = 소스.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    // host: 'xxx' 형태. redis 처럼 localhost 만 보는 것은 봐준다.
    const 박힌호스트 = (코드.match(/host\s*:\s*['"][^'"]+['"]/gi) ?? [])
        .filter((m) => !/process\.env|127\.0\.0\.1|localhost/.test(m));
    t(`config/${f} 에 박힌 DB 주소가 없다`, 박힌호스트.length === 0,
        박힌호스트.length ? `걸린 자리: ${박힌호스트.join(' | ').slice(0, 160)}` : '');
}

// 죽은 파일이 되살아나지 않게. 이 둘은 아무도 import 하지 않았고 비밀이 박혀 있었다.
for (const 죽은것 of ['db.js', 'grandparis-db.js']) {
    t(`config/${죽은것} 이 없다`, !파일들.includes(죽은것),
        '아무도 import 하지 않던 파일이다. grandparis-db.js 에는 DB 비밀번호가 박혀 있었다');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
