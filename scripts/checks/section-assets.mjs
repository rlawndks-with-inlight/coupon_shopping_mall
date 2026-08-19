import { FRONT_ROOT } from './_roots.mjs';
import { readdirSync, readFileSync, statSync } from 'fs';

// 고객 화면 섹션에 '테스트 자산' 이 박혀 있는지 본다.
//
// 왜 필요한가:
//   게시판 섹션이 모든 가맹점에게 같은 스톡 사진을 배경으로 깔고 있었다
//   (검은 바탕에 주황색 물음표, 경로는 /images/test/notice-banner.jpg).
//   2024년 1월에 들어온 뒤 아무도 안 봤다 — 가맹점마다 다른 화면이라 본사에서는
//   눈에 안 띄고, 정작 그 섹션에는 배경 이미지 업로드 칸이 이미 있었다.
//   박아 둔 자산은 가맹점이 바꿀 수 없으므로 '기본값' 이 아니라 '고장' 에 가깝다.
//
// 섹션 파일만 본다. 관리자 화면이나 소개 페이지의 예시 이미지는 대상이 아니다.

const 훑기 = (d, out = []) => {
    for (const f of readdirSync(d)) {
        const p = d + '/' + f;
        if (statSync(p).isDirectory()) 훑기(p, out);
        else if (f.endsWith('.js')) out.push(p);
    }
    return out;
};

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// 주석 안은 안 센다 — 걷어낸 자리를 근거로 남겨 두는 것까지 잡으면 지우게 된다.
const 주석뺀 = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const 파일들 = 훑기(FRONT_ROOT + 'src/views/section');
t('섹션 파일을 읽었다', 파일들.length > 10);

const 걸린것 = [];
for (const p of 파일들) {
    const src = 주석뺀(readFileSync(p, 'utf8'));
    for (const m of src.matchAll(/['"`](\/images\/test\/[^'"`]+)['"`]/g)) {
        걸린것.push(p.replace(FRONT_ROOT, '') + '  →  ' + m[1]);
    }
}
if (걸린것.length) for (const x of 걸린것) console.log('        ' + x);
t('섹션에 테스트 자산이 박혀 있지 않다', 걸린것.length === 0);

// 게시판은 배경을 안 올린 동안에도 글자가 읽혀야 한다 — 글자·테두리가 전부 흰색이라
// 배경을 비우기만 하면 흰 바닥에 흰 글씨가 된다.
for (const d of ['shop', 'blog']) {
    const post = readFileSync(FRONT_ROOT + `src/views/section/${d}/HomePost.js`, 'utf8');
    t(`${d} 게시판에 어두운 기본 바닥이 있다`, /background-color: #2b2b2b;/.test(post));
    t(`${d} 게시판은 올린 배경이 있으면 그것을 쓴다`, /column\?\.src \? `url\(\$\{column\?\.src\}\)`/.test(post));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
