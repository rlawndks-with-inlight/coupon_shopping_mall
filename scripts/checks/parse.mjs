import { FRONT_ROOT } from './_roots.mjs';
import { readdirSync, readFileSync, statSync } from 'fs';
import { parse } from '@babel/parser';

// src 아래 모든 .js/.jsx 를 **실제로 파싱**한다. 문법이 깨진 파일을 커밋 전에 잡는다.
//
// 붙잡아 두는 사고:
//   쇼핑몰 프레임 4·9 의 푸터는 절반 가까이가 /* ... */ 로 덮여 있다(139·134행).
//   그 안의 코드를 고치려고 {/* 설명 */} 을 끼워 넣었더니 그 `*/` 가 **바깥 주석을 먼저 닫아**
//   죽어 있던 JSX 80여 줄이 되살아났다 → 쇼핑몰형 프레임 전체가 500.
//
// 왜 다른 검사로는 못 잡았나:
//   · npm test 의 검사들도, jsx-undefined 도 **파싱을 하지 않는다**(정규식으로 글자만 본다)
//   · 그래서 전부 통과했고, 나는 curl 을 안 돌린 채 커밋했다
//   · 화면은 통째로 500 이었다
//
// 주석은 중첩되지 않으므로 '주석 안의 주석' 같은 세는 방식으로는 판정할 수 없다.
// 결과물이 문법적으로 깨진다는 것이 유일하게 확실한 신호다 — 그래서 파서를 쓴다.
//
// next build 로도 잡히지만 몇 분이 걸리고 .next 를 건드린다. 이건 몇 초면 끝나고 아무것도 안 쓴다.

const 훑기 = (d, out = []) => {
    for (const f of readdirSync(d)) {
        const p = d + '/' + f;
        if (statSync(p).isDirectory()) 훑기(p, out);
        else if (/\.jsx?$/.test(f)) out.push(p);
    }
    return out;
};

let pass = 0, fail = 0;
const eq = (name, got, want) => {
    if (JSON.stringify(got) === JSON.stringify(want)) { pass++; }
    else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

const 파싱 = (code) => {
    // 이 저장소가 실제로 쓰는 문법만 켠다(JSX + 클래스 필드 등 흔한 것).
    parse(code, {
        sourceType: 'module',
        errorRecovery: false,
        plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining',
                  'nullishCoalescingOperator', 'dynamicImport', 'topLevelAwait'],
    });
};

const 깨진것 = [];
const 파일들 = 훑기(FRONT_ROOT + 'src');
for (const p of 파일들) {
    try { 파싱(readFileSync(p, 'utf8')); }
    catch (e) {
        const 위치 = e?.loc ? `:${e.loc.line}` : '';
        깨진것.push(`${p.replace(FRONT_ROOT, '')}${위치}  ${String(e.message).split('\n')[0]}`);
    }
}

// 규칙이 실제로 잡는지 양쪽으로 확인한다 — 조용한 검사는 믿을 수 없다.
const 잡히나 = (code) => { try { 파싱(code); return false; } catch { return true; } };
eq('멀쩡한 JSX 는 통과', 잡히나(`const A = () => <div>{x && <B/>}</div>;`), false);
eq('닫는 태그가 없으면 잡는다', 잡히나(`const A = () => <div><B></div>;`), true);
// 실제로 났던 사고 그대로 — 주석 안에 주석을 넣어 바깥 주석이 먼저 닫히는 경우
eq('주석이 조기 종료돼 JSX 가 되살아나면 잡는다',
   잡히나(`const A = () => (<div>{
     /*
       <span>
     {/* 설명 */}
       </span>
     */
   }</div>);`), true);

if (깨진것.length) console.log(깨진것.map((x) => '  ' + x).join('\n'));
eq(`문법이 깨진 파일 없음 (${파일들.length}개 검사)`, 깨진것.length, 0);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
