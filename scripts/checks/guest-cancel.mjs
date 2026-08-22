import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';
import { matchesOrderPassword } from 'file:///c:/Users/user/Desktop/project24/shop/coupon_shopping_mall_back-master/utils.js/order-password.js';

// 비회원 주문의 취소요청.
//
// [무엇이 문제였나]
// 취소요청은 로그인 user_id 와 주문의 user_id 를 대조하는 것이 유일한 본인 확인이었다.
// 그런데 비회원 주문은 user_id 를 0 으로 저장한다(pay.controller.js, 의도된 동작).
// 0 은 어떤 로그인 id 와도 맞지 않으므로 비회원 주문의 취소요청은 **언제나** 403 이었다.
// 실제 DB 에서 전체 주문 4,447,668건 중 4,446,566건(99.98%)이 user_id=0 이다.
// 즉 거의 모든 손님이 스스로 취소할 길이 없었고, 그 문의가 전부 가맹점 전화로 갔다.
// (2026-08-21 가맹점이 겪은 「권한없음」의 정체. nginx 로그에서 같은 세션의 200/403 이
//  4초 간격으로 섞여 있던 것이 단서였다 — 세션 만료라면 그렇게 나올 수 없다.)
//
// [지금 규칙]
//   본인 확인 = (회원) 로그인 user_id 일치  또는  (비회원) 주문비밀번호 일치
//   브랜드 스코프는 그보다 먼저 — 비밀번호가 맞아도 다른 몰의 주문은 못 건드린다.

const 읽기B = (p) => readFileSync(BACK_ROOT + p, 'utf8');
const 읽기F = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 판정 함수를 실제로 돌린다 ─────────────────────────────────────────────
// 저장된 값은 해시(h1:...)다. 이 기능 이전 주문은 평문으로 남아 있어 둘 다 통과해야 한다.
t('맞는 비밀번호는 통과 — 평문 저장(레거시)', matchesOrderPassword('1234', '1234') === true);
t('틀린 비밀번호는 막힌다', matchesOrderPassword('1234', '9999') === false);

// 해시 저장분: orderPasswordCandidates 가 해시 후보를 만들어 주므로 그대로 맞아야 한다.
import('file:///c:/Users/user/Desktop/project24/shop/coupon_shopping_mall_back-master/utils.js/order-password.js')
    .then(({ hashOrderPassword }) => {
        const 저장 = hashOrderPassword('a1b2c3');
        t('해시로 저장된 비밀번호도 통과', matchesOrderPassword('a1b2c3', 저장) === true);
        t('해시 저장분에 틀린 값은 막힌다', matchesOrderPassword('a1b2c4', 저장) === false);
        t('저장값이 해시 형식이다', String(저장).startsWith('h1:'));

        // ⚠ 여기가 제일 중요한 자리다.
        // 회원 주문은 password 가 '' 로 저장된다. 빈 값끼리 맞아떨어지게 두면
        // 비밀번호 없이 남의 회원 주문을 취소할 수 있게 된다.
        t('저장값이 비면 무엇을 넣어도 막힌다', matchesOrderPassword('', '') === false,
            '회원 주문(password="")이 빈 입력으로 뚫린다');
        t('저장값이 비면 아무 값이나 넣어도 막힌다', matchesOrderPassword('1234', '') === false);
        t('저장값이 null 이어도 막힌다', matchesOrderPassword('1234', null) === false);
        t('입력이 비면 막힌다', matchesOrderPassword('', '1234') === false);
        t('입력이 undefined 여도 막힌다', matchesOrderPassword(undefined, '1234') === false);
        t('입력이 null 이어도 막힌다', matchesOrderPassword(null, '1234') === false);

        마무리();
    });

function 마무리() {
    // ── 백엔드 배선 ───────────────────────────────────────────────────────
    const ctrl = 읽기B('controllers/transaction.controller.js');
    const 취소요청 = ctrl.slice(ctrl.indexOf('cancelRequest: async'));
    t('취소요청이 공용 판정을 쓴다', /const 비회원본인 = matchesOrderPassword\(req\.body\?\.password, data\?\.password\)/.test(취소요청));
    t('회원 경로는 그대로 남아 있다', /const 회원본인 = Number\(decode_user\?\.id\) > 0 && data\?\.user_id == decode_user\?\.id/.test(취소요청));
    t('둘 다 아니면 막는다', /if \(!회원본인 && !비회원본인\)/.test(취소요청));

    // 브랜드 스코프가 본인 확인보다 **먼저** 와야 한다.
    // 뒤로 가면 비밀번호만 맞으면 다른 몰의 주문에도 취소요청이 걸린다.
    const i브랜드 = 취소요청.indexOf('data?.brand_id != decode_dns?.id');
    const i본인 = 취소요청.indexOf('const 회원본인');
    t('브랜드 스코프가 본인 확인보다 먼저다', i브랜드 > 0 && i브랜드 < i본인,
        '순서가 바뀌면 비밀번호만 맞으면 남의 몰 주문을 건드린다');

    // 상태 규칙은 그대로 — 결제대기(0)는 여전히 취소요청 대상이 아니다.
    t('결제대기는 여전히 막힌다', /const CANCELABLE_STATUS = \[5, 10\]/.test(취소요청));
    t('결제대기 사유를 따로 알려준다', /아직 결제가 완료되지 않은 주문입니다/.test(취소요청));
    // 비회원인데 비밀번호를 안 보냈으면 '권한없음' 이 아니라 무엇을 해야 하는지 알려준다.
    t('비밀번호를 빠뜨리면 그렇게 알려준다', /주문 비밀번호를 입력해 주세요/.test(취소요청));
    // 흔한 오타: !(a > 0) 을 !a > 0 으로 쓰면 늘 false 가 된다.
    t('부정 괄호가 제대로 걸려 있다', /!\(Number\(decode_user\?\.id\) > 0\)/.test(취소요청),
        '!Number(...) > 0 으로 쓰면 항상 false 라 안내문이 영영 안 나온다');

    // ── 프론트 배선 ───────────────────────────────────────────────────────
    const btn = 읽기F('src/components/elements/shop/OrderCancelButton.js');
    t('취소 버튼이 비밀번호를 받는다', /variant = 'outlined', password \}\) => \{/.test(btn));
    t('취소 버튼이 비밀번호를 실어 보낸다', /\.\.\.\(password \? \{ password \} : \{\}\)/.test(btn));
    // 회원 경로에서는 키 자체가 안 실려야 한다(빈 문자열을 보내면 서버 안내문이 엉킨다).
    t('회원 경로에서는 키를 안 보낸다', !/password: password \|\| ''/.test(btn));

    const 조회 = 읽기F('src/pages/shop/auth/order-check.js');
    t('비회원 조회 화면에 취소 버튼이 있다', /<OrderCancelButton/.test(조회));
    t('방금 조회에 쓴 비밀번호를 그대로 넘긴다', /password=\{form\.password\}/.test(조회));
    t('주문 줄도 함께 넘긴다', /orders=\{selected\?\.orders\}/.test(조회),
        '안 넘기면 부분취소를 못 고르고 전체취소로만 간다');
    t('요청 뒤 다시 조회한다', /onDone=\{onSearch\}/.test(조회));
    // 버튼이 안 나오는 주문(출고 이후 등)에서 빈 여백만 남으면 안 된다.
    t('취소 못 하는 주문엔 자리도 안 만든다', /\{canCancelOrder\(selected\) && \(/.test(조회));
    // 다시 조회하면 목록으로 튕기던 것 — 보던 주문을 그대로 열어 둔다.
    t('보던 주문을 놓치지 않는다', /const 보던것 = prev\?\.ord_num && list\.find/.test(조회));

    console.log(`\n통과 ${pass} / 실패 ${fail}`);
    process.exit(fail ? 1 : 0);
}
