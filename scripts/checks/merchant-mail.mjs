import { BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 가맹점 신청·승인 안내메일의 수신자.
//
// [제보] "반려 후 승인했더니 대표자에게만 메일이 갔다."
// 코드는 대표자·담당자 둘 다에게 보내고 있었다(배포본도 확인). 그런데 **한 통에 묶어서**
// 보내고 있었고, Resend 는 수신자 목록에 잘못된 주소가 하나라도 있으면 요청 전체를 422 로 거절한다.
// 실제 서버 로그에 그 422 가 남아 있다(2026-08-13 15:41).
//   → 담당자 주소 오타 하나로 대표자까지 한 통도 못 받는다. 그래서 각자에게 따로 보낸다.
//
// 그리고 승인 메일에는 로그가 한 줄도 없었다. 제보가 들어와도 '보냈는지 안 보냈는지'조차
// 확인할 수 없었다는 뜻이다. 이 검사는 그 두 가지를 다시 잃어버리지 않게 못 박는다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

if (!백엔드있음) {
    console.log('  (백엔드 저장소가 없어 건너뜀)');
    console.log('\n통과 0 / 실패 0');
    process.exit(0);
}

const 소스 = readFileSync(BACK_ROOT + 'controllers/merchant_application.controller.js', 'utf8');

// 선언 하나를 빈 줄까지 잘라 온다(og-image.mjs 와 같은 방식).
const 떼기 = (이름) => {
    const i = 소스.indexOf(이름);
    if (i < 0) throw new Error('못 찾음: ' + 이름);
    const 빈줄 = ['\r\n\r\n', '\n\n'].map((x) => 소스.indexOf(x, i)).filter((n) => n > 0);
    return 소스.slice(i, 빈줄.length ? Math.min(...빈줄) : 소스.length);
};

// sendMail 과 logger 를 가짜로 끼워 넣고 실제 함수를 돌린다.
// '어떤 주소로 몇 통 나갔는가'를 눈으로가 아니라 값으로 확인한다.
// maskMail 과 sendToApplicants 는 빈 줄 없이 붙어 있어 한 번에 딸려 온다.
// 따로 떼면 sendToApplicants 가 두 번 선언돼 터진다(og-image.mjs 에서도 같은 함정을 밟았다).
const 만들기 = (보낼때) => new Function('sendMail', 'logger',
    떼기('const maskMail = ') + '\n'
    + 'return { sendToApplicants, maskMail };'
)(보낼때, { info: () => { }, warn: () => { }, error: () => { } });

const 돌리기 = async (받는이들, { 실패주소 = [] } = {}) => {
    const 보낸것 = [];
    const { sendToApplicants } = 만들기(async ({ to }) => {
        const ok = !실패주소.includes(to);
        보낸것.push({ to, ok });
        return ok;
    });
    await sendToApplicants(받는이들, { subject: 's', html: 'h', tag: '테스트' });
    return 보낸것;
};

const 대표 = ['대표자', 'ceo@a.com'];
const 담당 = ['담당자', 'mgr@b.com'];

// ── 핵심: 각자 따로 나가는가 ──────────────────────────────────────────────
{
    const r = await 돌리기([대표, 담당]);
    t('대표자·담당자에게 각각 한 통씩 나간다', r.length === 2);
    t('두 주소가 모두 수신자에 들어간다',
        r.map((x) => x.to).sort().join(',') === 'ceo@a.com,mgr@b.com');
    t('한 통에 묶어 보내지 않는다', r.every((x) => !x.to.includes(',')),
        '묶어 보내면 Resend 가 한 주소만 틀려도 요청 전체를 422 로 거절한다');
}

// ── 이게 제보의 핵심이다 — 한쪽이 튕겨도 다른 쪽은 가야 한다 ────────────────
{
    const r = await 돌리기([대표, 담당], { 실패주소: ['mgr@b.com'] });
    t('담당자 주소가 잘못돼도 대표자에게는 간다',
        r.some((x) => x.to === 'ceo@a.com' && x.ok));
    t('담당자에게 시도는 했다(조용히 건너뛰지 않는다)',
        r.some((x) => x.to === 'mgr@b.com'));
}
{
    const r = await 돌리기([대표, 담당], { 실패주소: ['ceo@a.com'] });
    t('반대로 대표자 주소가 잘못돼도 담당자에게는 간다',
        r.some((x) => x.to === 'mgr@b.com' && x.ok));
}

// ── 중복·빈값 ────────────────────────────────────────────────────────────
{
    const r = await 돌리기([['대표자', 'same@a.com'], ['담당자', 'same@a.com']]);
    t('대표자와 담당자가 같은 주소면 한 통만', r.length === 1);
}
{
    const r = await 돌리기([['대표자', 'Same@A.com'], ['담당자', 'same@a.com']]);
    t('대소문자만 다른 같은 주소도 한 통만', r.length === 1);
    t('발송은 입력된 원본 주소로 한다', r[0].to === 'Same@A.com',
        '로컬파트는 규격상 대소문자를 구분한다 — 소문자로 바꿔 보내면 안 되는 서버가 있다');
}
{
    const r = await 돌리기([['대표자', 'ceo@a.com'], ['담당자', '']]);
    t('담당자 주소가 비어 있으면 대표자에게만', r.length === 1 && r[0].to === 'ceo@a.com');
}
{
    const r = await 돌리기([['대표자', '  ceo@a.com  '], ['담당자', null]]);
    t('앞뒤 공백은 떼고 보낸다', r.length === 1 && r[0].to === 'ceo@a.com');
}
{
    const r = await 돌리기([['대표자', ''], ['담당자', undefined]]);
    t('둘 다 비면 아무것도 안 보내고 죽지도 않는다', r.length === 0);
}

// ── 로그에 주소를 통째로 남기지 않는다 ────────────────────────────────────
{
    const { maskMail } = 만들기(async () => true);
    t('주소를 가려서 로그에 남긴다', maskMail('louis.kim@forspay.com') === 'lo***@forspay.com',
        '로그도 개인정보다 — 통째로 남기면 안 된다');
    t('빈 값도 처리한다', maskMail('') === '(빈값)' && maskMail(null) === '(빈값)');
    t('@ 가 없어도 죽지 않는다', maskMail('broken') === 'br***');
}

// ── 호출부가 실제로 이 함수를 쓰는가 ──────────────────────────────────────
// 함수만 고쳐 놓고 호출부가 예전 방식이면 아무 소용이 없다.
t('접수 메일이 sendToApplicants 를 쓴다', /tag: '가맹점신청-접수'/.test(소스));
t('승인 메일이 sendToApplicants 를 쓴다', /tag: '가맹점신청-승인'/.test(소스));
t('신청자 메일을 콤마로 묶어 보내는 코드가 남아 있지 않다',
    !/\.filter\(Boolean\)\)\]\.join\(','\)/.test(소스),
    "예전 형태: [...new Set([ceo_email, manager_email].filter(Boolean))].join(',')");
t('대표자·담당자 역할이 로그에 구분돼 남는다',
    /\['대표자', app\.ceo_email\], \['담당자', app\.manager_email\]/.test(소스));

// 반려 후 재승인(이미 개설된 건)은 메일을 안 보내는 것이 맞다. 다만 흔적은 남아야 한다.
t('안내메일을 건너뛴 경우에도 로그를 남긴다', /새로 개설된 것이 아니라 안내메일 생략/.test(소스),
    '흔적이 없으면 "메일이 왜 안 왔냐"를 확인할 방법이 없다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
