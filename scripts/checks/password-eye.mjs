import { FRONT_ROOT } from './_roots.mjs';
import { readdirSync, readFileSync, statSync } from 'fs';

// 비밀번호 칸에 '보기' 눈 아이콘이 빠진 곳이 없는지 본다.
//
// 왜 필요한가:
//   비밀번호 칸이 전부 점(●)으로만 보여서 오타를 확인할 방법이 없었다. 회원가입·비밀번호
//   변경처럼 두 번 입력해 맞춰야 하는 자리에서는 '왜 안 맞는지'를 눈으로 볼 수가 없다.
//   화면이 40곳이 넘어(프레임마다 로그인·가입·찾기가 따로다) 하나씩 손대면 반드시 빠뜨린다.
//   공용 칸(PasswordField)을 쓰게 하고, 새로 만든 화면이 그냥 type=password 를 쓰면 잡는다.
//
// 주석 안의 죽은 코드는 세지 않는다 — 이 저장소에는 통째로 주석 처리된 JSX 가 많고,
// 실제로 로그인 화면 3곳·셀러 등록 1곳의 비밀번호 칸이 그런 죽은 코드였다.

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 훑기 = (d, out = []) => {
    for (const f of readdirSync(d)) {
        const p = d + '/' + f;
        if (statSync(p).isDirectory()) 훑기(p, out);
        else if (f.endsWith('.js')) out.push(p);
    }
    return out;
};

// 블록 주석 안인지 — 그 지점 앞의 가장 가까운 '/*' 와 '*/' 를 견준다.
const 주석안 = (src, 위치) => src.lastIndexOf('/*', 위치) > src.lastIndexOf('*/', 위치);

const 파일들 = [
    ...훑기(FRONT_ROOT + 'src/pages'),
    ...훑기(FRONT_ROOT + 'src/views'),
    ...훑기(FRONT_ROOT + 'src/components'),
];
t('화면 파일을 읽었다', 파일들.length > 100);

const 걸린것 = [];
for (const p of 파일들) {
    const src = readFileSync(p, 'utf8');
    // 템플릿에서 딸려온 예시 화면(@dashboard)은 이 제품에서 쓰지 않는다 — 영어 라벨 그대로다.
    if (p.includes('/views/@dashboard/')) continue;
    for (const m of src.matchAll(/type\s*=\s*[{]?['"]password['"][}]?/g)) {
        if (주석안(src, m.index)) continue;
        const 줄 = src.slice(0, m.index).split('\n').length;
        걸린것.push(`${p.replace(FRONT_ROOT, '')}:${줄}`);
    }
}
if (걸린것.length) for (const x of 걸린것) console.log('        ' + x);
t('직접 type=password 를 쓰는 칸이 없다', 걸린것.length === 0);

// 공용 칸이 실제로 쓰이고 있는가(치환만 하고 아무도 안 쓰면 의미가 없다).
const 쓰는파일 = 파일들.filter((p) => readFileSync(p, 'utf8').includes("from 'src/components/elements/PasswordField'"));
t('공용 비밀번호 칸을 쓰는 화면이 40곳 이상', 쓰는파일.length >= 40);

// 눈 아이콘이 실제로 그려지는가.
const 공용 = readFileSync(FRONT_ROOT + 'src/components/elements/PasswordField.js', 'utf8');
t('눌러서 보였다 감췄다 한다', /set보임\(\(v\) => !v\)/.test(공용));
t('보일 때는 text, 아닐 때 password', /type=\{보임 \? 'text' : 'password'\}/.test(공용));
t('두 가지 짜임을 다 지원한다', /const PasswordField/.test(공용) && /PasswordOutlinedInput/.test(공용));
// 넘어온 endAdornment 를 덮어쓰면 원래 있던 단위·버튼이 사라진다.
t('원래 붙어 있던 것을 지우지 않는다',
    /\{InputProps\?\.endAdornment\}/.test(공용) && /\{endAdornment\}/.test(공용));
// 폼 안에서 엔터가 이 버튼에 걸려 저장이 안 되는 사고를 막는다.
t('버튼이 폼을 제출하지 않는다', (공용.match(/type="button"/g) ?? []).length >= 2);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
