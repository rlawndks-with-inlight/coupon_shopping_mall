import { BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 쓰기 API 는 '누가·어느 브랜드에' 쓰는지를 요청 본문에서 받지 않는다.
//
// [왜 이 검사가 있나]
// 이 코드베이스에는 body 를 그대로 믿다가 생긴 사고가 여러 번 있었다.
// brand_id 는 그래서 resolveWriteBrandId(로그인 정보로 다시 정함)로 통일됐다 —
// 예전엔 인증 없이 아무 브랜드에 전화번호를 넣어 '가입 제한 브랜드' 의 화이트리스트를 우회할 수 있었다.
//
// 그런데 **누가 등록했는지를 남기는 registrar 만 본문 값을 그대로 저장하고 있었다**(2026-09-03 발견).
//   · 등록 기록을 남의 id 로 남길 수 있었다 — 기록을 남기는 칸이 기록을 못 믿게 된다.
//   · 숫자가 아닌 값이 오면 DB 가 거절해 500 이 났다(점검 스크립트가 문자열을 넣어 실제로 터졌다).
// 로그인한 사람은 바로 위에서 이미 확인하므로 그 id 를 쓰면 둘 다 사라진다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

if (!백엔드있음) {
    console.log('  건너뜀 — 백엔드 저장소가 없다');
} else {
    const 읽기 = (p) => readFileSync(BACK_ROOT + p, 'utf8').split(String.fromCharCode(13)).join('');
    const 파일 = 'controllers/phone_registration.controller.js';
    const s = 주석제거(읽기(파일));
    const 만들기 = s.slice(s.indexOf('create: async'), s.indexOf('update: async'));

    t('가입허용 전화번호 등록은 운영자만', /Number\(decode_user\?\.level\) < 10/.test(만들기),
        '예전엔 인증 없이 아무 브랜드에 번호를 넣을 수 있었다');
    t('브랜드를 본문에서 받지 않는다', /brand_id = resolveWriteBrandId\(decode_user, brand_id, decode_dns\)/.test(만들기),
        "본문을 믿으면 '가입 제한 브랜드' 화이트리스트를 우회할 수 있다");
    // ⚠ 여기가 이 검사의 핵심이다.
    t('등록자를 본문에서 받지 않는다',
        /const registrar = Number\(decode_user\?\.id\)/.test(만들기),
        '본문 값을 그대로 쓰면 남의 id 로 기록을 남길 수 있고, 숫자가 아니면 500 이 난다');
    t('본문 구조분해에 registrar 가 없다',
        !/let \{[\s\S]{0,120}registrar[\s\S]{0,40}\} = req\.body;/.test(만들기),
        '꺼내 두면 언젠가 다시 저장 쪽으로 흘러간다');
    t('저장하는 값에 registrar 가 들어간다', /brand_id, seller_id, phone_number, registrar/.test(만들기),
        '누가 등록했는지는 남겨야 한다 — 빼는 게 아니라 출처를 바꾼 것이다');
    // 숫자로 굳혀야 DB 가 거절할 일이 없다.
    t('숫자로 굳힌다', /Number\(decode_user\?\.id\) \|\| 0/.test(만들기),
        'registrar 는 int 칸이다');

    // 수정 쪽은 registrar 를 건드리지 않는다 — 등록자는 등록 시점의 사실이라 나중에 바뀌면 안 된다.
    const 고치기 = s.slice(s.indexOf('update: async'), s.indexOf('remove: async'));
    t('수정에서는 등록자를 바꾸지 않는다', !/registrar/.test(고치기),
        '등록자는 등록 시점의 기록이다');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
