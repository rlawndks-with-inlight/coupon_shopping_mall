import { readFileSync } from 'fs';

// 가입 안내 문구는 칸 밖에 두고, 실제 규칙과 같아야 한다 (2026-08-28).
//
// [무엇이 문제였나]
// ① 규칙이 **placeholder** 로 칸 안에 있었다. placeholder 는 한 글자만 쳐도 사라진다 —
//    비밀번호를 입력하는 순간 '8~20자' 안내가 없어지고, 틀렸을 때 다시 볼 방법이 없다.
//    (칸 밖 helperText 는 입력 중에도 계속 보인다)
// ② 아이디 안내가 **사실과 달랐다**: '영문 소문자, 숫자, 특수문자 가능' 이라 적혀 있었지만
//    실제 검증은 `/^[a-z0-9_]+$/` 라 밑줄(_) 말고는 특수문자를 전부 거부한다.
//    안내대로 넣은 사람이 가입에 실패한다.
//
// [지키는 것] 판매 중인 6개 프레임(shop:1·shop:2 · blog 계열)의 가입 화면에서
//   - 규칙은 helperText 로, 칸 안에는 '무엇을 넣는 칸인지'만
//   - 안내에 적힌 숫자가 function.js 의 SIGNUP_* 상수와 같을 것
// blog 프레임 회원가입은 전부 blog/auth/sign-up/demo-2 로 수렴하지만(pages/shop/auth/sign-up.js),
// 나머지 파일도 같은 모양으로 맞춰 둔다 — 되살릴 때 같은 실수가 되풀이되지 않도록.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 비번규칙 = '8~20자로 입력해 주세요. (아이디와 다르게)';
const 아이디규칙 = '영문 소문자·숫자·밑줄(_) / 4~20자';

const blog = ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5']
    .map((n) => [`blog/${n}`, `src/views/blog/auth/sign-up/${n}.js`]);
const shop = [['shop:1', 'src/views/shop/demo-1/auth/sign-up.js'],
              ['shop:2', 'src/views/shop/demo-2/auth/sign-up.js']];

for (const [이름, p] of [...blog, ...shop]) {
    const s = readFileSync(p, 'utf8').split('\r').join('');
    t(`${이름} — 비밀번호 규칙이 칸 밖(helperText)에 있다`,
        s.includes(`helperText={translate('${비번규칙}')}`),
        '칸 안(placeholder)에 두면 입력하는 순간 사라진다');
    t(`${이름} — 규칙을 placeholder 로 되돌리지 않았다`,
        !s.includes(`placeholder={translate('${비번규칙}')}`));
    t(`${이름} — 아이디 규칙이 칸 밖에 있다`,
        s.includes(`helperText={translate('${아이디규칙}')}`));
    t(`${이름} — 틀린 아이디 안내가 남아 있지 않다`,
        !s.includes('특수문자 가능'),
        '실제 검증은 밑줄(_) 말고 특수문자를 전부 거부한다 — 안내대로 넣으면 가입이 안 된다');
}

// 같은 규칙을 이름·휴대폰 칸에도. 이것들도 '무엇을 쓰는 칸인가'가 아니라 '설명'이라
// 칸 안에 두면 입력하는 순간 사라진다.
for (const [이름, p] of blog) {
    const s = readFileSync(p, 'utf8').split(String.fromCharCode(13)).join('');
    for (const 설명 of ['주문·배송에 사용됩니다', '숫자와 하이픈(-)만 입력']) {
        if (!s.includes(설명)) continue;   // 그 칸이 없는 화면은 넘어간다
        t(`${이름} — '${설명}' 이 칸 밖에 있다`,
            s.includes(`helperText={translate('${설명}')}`)
            && !s.includes(`placeholder={translate('${설명}')}`));
    }
}

// 안내에 적힌 숫자가 실제 검증과 같은지. 문구만 고치고 상수를 안 보면 또 어긋난다.
const fn = readFileSync('src/utils/function.js', 'utf8');
const 상수 = (이름) => Number((fn.match(new RegExp(이름 + ' = (' + String.fromCharCode(92) + 'd+)')) ?? [])[1]);
t(`비밀번호 안내(8~20)가 SIGNUP_PW_MIN/MAX 와 같다`,
    상수('SIGNUP_PW_MIN') === 8 && 상수('SIGNUP_PW_MAX') === 20,
    `실제 ${상수('SIGNUP_PW_MIN')}~${상수('SIGNUP_PW_MAX')} — 문구도 함께 고칠 것`);
t(`아이디 안내(4~20)가 SIGNUP_ID_MIN/MAX 와 같다`,
    상수('SIGNUP_ID_MIN') === 4 && 상수('SIGNUP_ID_MAX') === 20,
    `실제 ${상수('SIGNUP_ID_MIN')}~${상수('SIGNUP_ID_MAX')} — 문구도 함께 고칠 것`);
t('아이디 허용문자가 소문자·숫자·밑줄 그대로다',
    /SIGNUP_ID_RE = \/\^\[a-z0-9_\]\+\$\//.test(fn),
    '규칙을 넓혔으면 안내 문구도 같이 넓혀야 한다');

for (const lang of ['ko', 'en', 'ja', 'cn', 'es']) {
    const dict = readFileSync(`src/locales/langs/${lang}.js`, 'utf8');
    t(`${lang} 사전에 두 안내가 다 있다`,
        dict.includes(`"${비번규칙}"`) && dict.includes(`"${아이디규칙}"`),
        '없으면 그 언어 화면에서 한국어로 뜬다');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
