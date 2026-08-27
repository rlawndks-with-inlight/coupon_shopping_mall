import { BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 저장 실패가 기록에 남는가 (2026-08-28).
//
// [사연]
// insertQuery 는 실패해도 오류를 삼키고 false 를 돌려준다. 호출부는 대개 그 값을 안 본다
// (저장 호출 125곳 중 확인하는 곳 3곳). 그래서 저장이 실패해도 화면엔 '저장되었습니다' 가 뜬다.
//
// 그런데 그보다 먼저인 문제가 있었다: **실패했다는 사실이 아무 데도 안 남았다.**
// console.log 로 찍혀 pm2 출력 로그로만 갔고, 그 로그는 회전본이 없어 지워진다.
// 그래서 5주치 에러 로그에 저장 실패가 0건이었지만 그건 '안 난다' 가 아니라 '기록이 없다' 였다.
// 원인을 고치려면 먼저 보여야 한다 — logger.error 로 바꿔 logs/error/ 에 30일 남긴다.
//
// ⚠ 값은 절대 찍지 않는다. insertQuery 에는 회원 이름·전화·주소가 들어온다.
//   DB 는 암호화해 두고 로그로 흘리면 암호화한 의미가 없다.

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

const src = readFileSync(BACK_ROOT + 'utils.js/query-util.js', 'utf8').replace(/\r/g, '');
const 코드 = 주석제거(src);

t('logger 를 가져온다', /import logger from '\.\/winston\/index\.js'/.test(코드));
t('저장 실패를 영구 로그에 남긴다', /logger\.error\(`\[insertQuery\]/.test(코드),
    'console.log 는 pm2 출력으로만 가고 회전본이 없어 지워진다 — 실패가 났는지조차 알 수 없다');
t('실패 로그에 테이블과 오류코드가 들어간다',
    /\[insertQuery\] \$\{table\}/.test(코드) && /err\?\.code/.test(코드) && /sqlMessage/.test(코드),
    '무엇이 왜 실패했는지 없으면 로그가 있어도 못 고친다');
t('빈 객체로 부른 것도 남긴다', (코드.match(/logger\.error\(`\[insertQuery\]/g) ?? []).length >= 2,
    '값이 하나도 없으면 오류 없이 아무것도 저장되지 않는다 — 그게 제일 찾기 어렵다');

// 여기가 제일 중요하다 — 로그로 개인정보가 새면 안 된다.
const 로그줄 = 코드.split('\n').filter((l) => /logger\.(error|warn|info)\(/.test(l) && /insertQuery/.test(l));
t('로그에 값을 찍지 않는다',
    로그줄.length > 0 && 로그줄.every((l) => !/\$\{JSON\.stringify\(obj/.test(l) && !/\$\{obj\}/.test(l) && !/values/.test(l)),
    'insertQuery 에는 이름·전화·주소가 들어온다. 컬럼 이름까지만 남길 것');
t('컬럼 이름만 남긴다', /Object\.keys\(obj/.test(코드));

// 왜 그렇게 했는지가 남아 있어야 한다 — 다음 사람이 console.log 로 되돌린다.
t('근거가 주석에 남아 있다', /회전본/.test(src) && /개인정보|이름·전화|암호화/.test(src));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
