import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync, readdirSync } from 'fs';

// logoSrc() 를 조건부로 부르면 안 된다.
//
// [무엇이 문제였나]
// logoSrc 는 이름이 평범한 함수처럼 생겼지만 안에서 useSettingsContext() 를 쓴다 — 훅이다.
// 그런데 헤더 15개가 <LogoImg src={logoSrc()} /> 를 {loading ? <></> : <>...</>} 분기 안에
// 두고 있었다. 첫 렌더는 loading=true 라 그 가지가 안 그려지므로 훅이 안 불리고,
// 목록을 받아 loading=false 가 된 다음 렌더에서야 불린다.
//   → Header 의 훅 개수가 26 → 27 로 바뀐다.
//   → React: "has detected a change in the order of Hooks called by Header"
// 이건 화면이 통째로 백지가 되는 부류의 문제다. 실제로 프레임1에서 이 경고가 떴다.
//
// [규칙]
// loading 게이트가 있는 화면에서는 logoSrc() 를 컴포넌트 맨 위에서 한 번 부르고
// 그 값(로고주소)을 JSX 에 넘긴다. 게이트가 없는 화면은 매 렌더 불리므로 지금은 안전하지만,
// 게이트가 생기는 순간 같은 함정에 빠지므로 이 검사가 그때 걸어 준다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 뒤지기 = (디렉토리, 담기 = []) => {
    for (const e of readdirSync(FRONT_ROOT + 디렉토리, { withFileTypes: true })) {
        const 경로 = `${디렉토리}/${e.name}`;
        if (e.isDirectory()) 뒤지기(경로, 담기);
        else if (e.name.endsWith('.js')) 담기.push(경로);
    }
    return 담기;
};

// 정의 자리에 훅이라는 경고가 남아 있어야 한다.
const data = readFileSync(FRONT_ROOT + 'src/data/data.js', 'utf8');
t('정의 자리에 훅이라고 적혀 있다', /\*\*훅이다\*\*/.test(data),
    '이름만 보고 평범한 함수로 오해해서 생긴 문제다 — 경고를 지우지 말 것');
t('logoSrc 가 여전히 컨텍스트를 쓴다', /export const logoSrc[\s\S]{0,400}useSettingsContext\(\)/.test(data),
    '컨텍스트를 안 쓰게 바뀌었다면 이 검사 자체를 걷어내도 된다');

// 본 검사: 게이트가 있는 파일에서 JSX 안 호출이 남아 있으면 안 된다.
const 위험 = [];
for (const f of 뒤지기('src')) {
    if (f.includes('data/data.js')) continue;
    const s = readFileSync(FRONT_ROOT + f, 'utf8');
    if (!s.includes('logoSrc()')) continue;
    // 주석은 빼고 본다 — 설명문에 적힌 logoSrc() 까지 잡으면 안 된다.
    const 코드 = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const 게이트 = /loading \?|\{!loading/.test(코드);
    if (!게이트) continue;
    // 주석에만 이름이 적힌 파일은 대상이 아니다(설명문에 logoSrc() 를 예로 든 화면이 있다).
    const 남은 = 코드.split('logoSrc()').length - 1;
    if (남은 === 0) continue;
    // 허용되는 형태는 '맨 위에서 한 번 대입' 뿐이다.
    const 대입 = /const\s+[^\s=]+\s*=\s*logoSrc\(\);/.test(코드);
    if (!대입 || 남은 !== 1) 위험.push(`${f}  (대입=${대입}, 호출=${남은})`);
}
t('조건부 렌더가 있는 화면은 전부 맨 위에서 부른다', 위험.length === 0,
    위험.join('\n        '));

// 프레임1 헤더는 실제로 경고가 났던 자리다 — 콕 집어 못 박는다.
const 프레임1 = readFileSync(FRONT_ROOT + 'src/layouts/shop/shop/demo-1/header.js', 'utf8');
t('프레임1 헤더가 맨 위에서 부른다', /const 로고주소 = logoSrc\(\);/.test(프레임1));
t('프레임1 헤더 JSX 에는 호출이 없다', !/src=\{logoSrc\(\)\}/.test(프레임1));
// 훅은 다른 훅들과 같은 자리에 있어야 한다(조건문 아래로 내려가면 같은 문제가 다시 생긴다).
t('프레임1: 다른 훅들 사이에 있다',
    프레임1.indexOf('const 로고주소 = logoSrc();') < 프레임1.indexOf('useAuthContext()'),
    '훅 묶음에서 떨어지면 나중에 조건문 아래로 밀려나기 쉽다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
