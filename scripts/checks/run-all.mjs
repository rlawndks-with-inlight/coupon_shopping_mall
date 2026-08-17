import { readdirSync, readFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 이 폴더의 검사를 전부 돌린다.  →  npm test
//
// 검사는 '실제로 났던 사고'를 다시 못 나게 붙잡아 두는 것들이다. 한 번 돌리고 버리는
// 스크립트가 아니다 — 기능은 배포된 뒤에도 조용히 되돌아간다.
// (실제로 이 검사들이 임시 폴더에 있던 동안 14개가 정리되어 날아갔고,
//  그동안 그 기능들은 아무 방어선 없이 떠 있었다.)
//
// 백엔드를 함께 보는 검사가 있다. 백엔드 저장소가 형제 폴더에 없으면(서버 등)
// 그 검사만 건너뛴다 — 없다고 실패로 세면 배포 때마다 빨간불이 뜬다.

const 여기 = dirname(fileURLToPath(import.meta.url)) + '/';

const 검사목록 = readdirSync(여기)
    .filter((f) => /\.(mjs|cjs)$/.test(f) && f !== 'run-all.mjs' && !f.startsWith('_'))
    .sort();

let 총통과 = 0;
const 깨진것 = [];
const 건너뛴것 = [];

for (const f of 검사목록) {
    const 원문 = readFileSync(여기 + f, 'utf8');
    if (!백엔드있음 && 원문.includes('BACK_ROOT')) {
        건너뛴것.push(f);
        continue;
    }
    let out;
    try {
        out = execFileSync('node', [여기 + f], { encoding: 'utf8', timeout: 120000 });
    } catch (e) {
        out = (e.stdout || '') + (e.stderr || '');
        깨진것.push(f);
    }
    const m = out.match(/통과 (\d+)/);
    const 통과 = m ? Number(m[1]) : 0;
    총통과 += 통과;
    const 상태 = 깨진것.includes(f) ? 'FAIL' : '  ok';
    console.log(`  ${상태}  ${f.padEnd(28)} ${통과}`);
    if (깨진것.includes(f)) {
        // 실패한 줄만 추려 보여 준다. 전문을 쏟으면 무엇이 깨졌는지 안 보인다.
        for (const 줄 of out.split('\n').filter((l) => /FAIL|Error/.test(l)).slice(0, 8)) {
            console.log('        ' + 줄.trim());
        }
    }
}

console.log(`\n파일 ${검사목록.length - 건너뛴것.length}개 · 통과 ${총통과}건`);
if (건너뛴것.length) {
    console.log(`건너뜀 ${건너뛴것.length}개 — 백엔드 저장소가 없다(${BACK_ROOT})`);
}
if (깨진것.length) console.log(`실패한 파일: ${깨진것.join(', ')}`);
process.exit(깨진것.length ? 1 : 0);
