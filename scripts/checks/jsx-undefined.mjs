import { FRONT_ROOT } from './_roots.mjs';
import { readdirSync, readFileSync, statSync } from 'fs';

// JSX 로 쓰는데 가져오지도, 이 파일에서 만들지도 않은 이름을 잡는다.
//
// 붙잡아 두는 사고:
//   브랜드 설정 화면에 <Box> 를 쓰면서 import 목록에 Box 를 안 넣었다.
//   → 'ReferenceError: Box is not defined' 로 화면이 죽었다.
//
// 이게 왜 사람 눈으로 안 잡히나:
//   · next dev 는 컴파일을 통과시킨다(문법은 멀쩡하다)
//   · curl 로 받아 보면 200 이다 — 이 저장소 화면은 대부분 클라이언트에서 그려져서
//     서버 응답에는 껍데기만 담긴다. 그 부분이 실제로 그려질 때가 되어야 터진다
//   · 그래서 '빌드 통과 · 200 · 그런데 화면 백지' 가 된다. 훅 순서 사고와 같은 부류다.
//
// 판정은 보수적으로 한다 — 애매하면 통과시킨다. 검사가 잘못 울면 아무도 안 본다.

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

// 주석·문자열 안의 <Something> 은 세지 않는다(예: 설명 주석에 태그를 적어 둔 자리).
const 주석뺀 = (s) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const 못찾은것 = [];

// 태그 이름 말고 **속성으로 넘기는 이름**도 같은 방식으로 본다.
//
// 붙잡아 두는 사고:
//   프레임6 상품상세가 <ProductAddons onSelect={onSelectOption} /> 를 그리는데
//   그 파일엔 onSelectOption 이 없었다(형제 프레임 9개에는 다 있다).
//   → 'ReferenceError: onSelectOption is not defined'.
//   속성값은 컴포넌트를 부르기 **전에** 계산되므로, 추가상품이 없는 상품이어도 죽는다.
//   태그 이름만 보던 위 규칙으로는 안 걸렸다 — 그 이름은 태그가 아니라 값이었다.
// 이름처럼 생겼지만 선언할 필요가 없는 것들 — 이걸 빼지 않으면 sx={true} 같은 자리가 전부 걸린다.
const 낱말 = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'this']);

export const 속성이름들 = (본문) => {
    const 이름들 = new Set();
    for (const m of 본문.matchAll(/\s[a-zA-Z_$][\w$]*=\{([a-zA-Z_$][\w$]*)\}/g)) {
        if (!낱말.has(m[1])) 이름들.add(m[1]);
    }
    return 이름들;
};

for (const p of 훑기(FRONT_ROOT + 'src')) {
    const 원문 = readFileSync(p, 'utf8');
    const 본문 = 주석뺀(원문);

    // 판정 규칙 — '태그로 쓰인 자리 말고 어디에도 그 이름이 안 나오면' 모르는 이름이다.
    //
    // import 구문을 정규식으로 뜯는 방식을 먼저 써 봤는데 오탐이 8건 났다(멀쩡히
    // 가져온 것을 못 가져왔다고 했다). 검사가 잘못 울면 아무도 안 보게 되므로
    // 놓치더라도 잘못 울지 않는 쪽으로 판정을 낮춘다.
    //
    // 이 규칙으로도 목표는 잡힌다. import 를 빠뜨리면 그 이름은 파일 안에서
    // <Box ...> 와 </Box> 로만 나타나기 때문이다.
    const 태그뺀 = 본문.replace(/<\/?[A-Z][A-Za-z0-9_]*/g, ' ');

    const 본파일 = new Set();
    for (const m of 본문.matchAll(/<([A-Z][A-Za-z0-9_]*)[\s/>]/g)) 본파일.add(m[1]);

    for (const 이름 of 본파일) {
        if (new RegExp(`\\b${이름}\\b`).test(태그뺀)) continue;   // 어딘가에 선언·수입돼 있다
        못찾은것.push(`${p.replace(FRONT_ROOT, '')} → <${이름}>`);
    }

    // 속성값도 같은 보수적 규칙으로 본다 — 값으로 쓰인 자리를 지우고도 그 이름이
    // 파일 어딘가에 남아 있으면(선언·수입·구조분해) 통과시킨다.
    const 값뺀 = 본문.replace(/(\s[a-zA-Z_$][\w$]*=\{)[a-zA-Z_$][\w$]*(\})/g, '$1$2');
    for (const 이름 of 속성이름들(본문)) {
        if (new RegExp(`\\b${이름}\\b`).test(값뺀)) continue;
        못찾은것.push(`${p.replace(FRONT_ROOT, '')} → ={${이름}}`);
    }
}

// 규칙이 실제로 그 사고를 잡는지 양쪽으로 확인한다.
// 검사가 조용하다는 것과 검사가 일한다는 것은 다르다 — 잡는 걸 보여야 믿을 수 있다.
{
    const 걸리는가 = (조각) => {
        const 본문 = 주석뺀(조각);
        const 값뺀 = 본문.replace(/(\s[a-zA-Z_$][\w$]*=\{)[a-zA-Z_$][\w$]*(\})/g, '$1$2');
        return [...속성이름들(본문)].filter((이름) => !new RegExp(`\\b${이름}\\b`).test(값뺀));
    };
    // 프레임6 에서 실제로 났던 모양 — 선언이 없다
    eq('선언 없는 핸들러를 잡는다',
       걸리는가(`const A = () => <ProductAddons onSelect={onSelectOption} />;`), ['onSelectOption']);
    // 선언이 있으면 조용해야 한다
    eq('선언이 있으면 안 운다',
       걸리는가(`const onSelectOption = () => {};\nconst A = () => <ProductAddons onSelect={onSelectOption} />;`), []);
    // 가져온 것도 조용해야 한다
    eq('수입한 이름도 안 운다',
       걸리는가(`import { fmt } from 'x';\nconst A = () => <B render={fmt} />;`), []);
    // 리터럴은 이름이 아니다
    eq('true/false/null 은 세지 않는다',
       걸리는가(`const A = () => <B open={true} hide={false} at={null} />;`), []);
}

// 같은 파일에서 같은 이름이 여러 번 나오면 한 번만 센다
const 정리 = [...new Set(못찾은것)].sort();
if (정리.length) console.log(정리.map((x) => '  ' + x).join('\n'));
eq('JSX 로 쓰는데 가져오지 않은 이름 없음', 정리.length, 0);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
