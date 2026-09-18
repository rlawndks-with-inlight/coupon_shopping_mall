import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync, existsSync } from 'fs';

// 회원 탈퇴 — 진행 중인 주문이 있으면 막는다(2026-09-17 결정, A안).
//
// [왜 이 검사가 있나]
//  탈퇴하면 로그인이 막히는데 **회원 주문은 주문비밀번호가 빈 값**이라
//  비회원 주문조회로도 안 잡힌다. 배송 중에 탈퇴하면 손님이 자기 주문을
//  확인할 길이 아예 사라진다 — 그래서 막는다.
//  (홈앤쇼핑·무신사 등도 '주문/배송/취소/교환/반품 진행중'이면 즉시 탈퇴를 막는다)
//
// [넘지 말아야 할 선]
//  개정 전자상거래법 제21조의2 '취소·탈퇴 등의 방해' 는 가입보다 탈퇴를 어렵게 만드는 것을 막는다.
//  그래서 이 검사는 '막는가' 뿐 아니라 **지나치게 막지 않는가** 도 함께 본다:
//    · 배송완료(25)까지 막으면 마지막 주문 뒤 교환·반품 기간 내내 탈퇴가 안 된다
//    · 90일이 지난 주문까지 막으면, 상태를 안 닫는 가맹점의 몰에서 손님이 영영 못 나간다
//    · 확인 단계를 늘리면(의사를 두 번 이상 되묻기) 그 자체가 위반 예시다

const 읽기 = (p) => readFileSync(p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 화면 ────────────────────────────────────────────────────────────────
const 가드 = 읽기(FRONT_ROOT + 'src/components/elements/shop/ResignGuard.js');
const 탈퇴패널 = 읽기(FRONT_ROOT + 'src/components/elements/shop/ResignPanel.js');
const 정보패널 = 읽기(FRONT_ROOT + 'src/components/elements/shop/AccountEditPanel.js');

t('화면: 탈퇴 전 확인을 서버에 물어본다', 가드.includes("apiManager('auth/resign-check', 'get', {})"));
t('화면: 막혔을 때 어떤 주문인지·어떻게 푸는지 알려 준다',
    가드.includes("translate('진행 중인 주문이 있어 지금은 탈퇴하실 수 없습니다.')")
    && 가드.includes("translate('배송이 끝난 뒤에 다시 시도하시거나, 주문을 취소한 뒤 탈퇴해 주세요.')")
    && 가드.includes("translate('주문내역 보기')"));
t('화면: 적립금은 막지 않고 알리기만 한다',
    가드.includes("translate('탈퇴하시면 남은 적립금 {{n}}이 사라집니다.'"));
// 조회가 실패했다고 손님을 가두면 그것이 '탈퇴 방해'다. 못 물어봤으면 막지 않는다.
t('화면: 조회에 실패하면 막지 않는다(판단은 서버가 한다)',
    /if \(!r\) \{ setState\(\{ loading: false, canResign: true/.test(주석제거(가드)));

for (const [이름, src] of [['탈퇴 화면', 탈퇴패널], ['회원정보 수정 화면', 정보패널]]) {
    t(`${이름}: 탈퇴 전 확인을 쓰고 막히면 버튼이 잠긴다`,
        src.includes('useResignGuard(!!user?.id)')
        && src.includes('<ResignBlockNotice guard={guard} />')
        && src.includes('disabled={!guard.canResign}'));
}

// ── 서버 ────────────────────────────────────────────────────────────────
if (!백엔드있음) {
    console.log('  --  백엔드 저장소가 없어 서버 검사는 건너뜀');
} else {
    const 경로 = BACK_ROOT + 'utils.js/resign-guard.js';
    t('서버: 탈퇴 가드 파일이 있다', existsSync(경로));
    if (existsSync(경로)) {
        const 가드서버 = 읽기(경로);
        const 코드 = 주석제거(가드서버);
        t('서버: 막는 상태는 결제대기~배송중(0·1·5·10·15·20)', 코드.includes('진행중상태 = [0, 1, 5, 10, 15, 20]'));
        // 배송완료(25)를 넣으면 마지막 주문 뒤 교환·반품 기간 내내 탈퇴가 막힌다.
        t('서버: 배송완료(25)는 막지 않는다', !/진행중상태 = \[[^\]]*\b25\b/.test(코드));
        t('서버: 오래된 주문은 막지 않는다(영구 차단 방지)',
            코드.includes('막는기간일 = 90') && 코드.includes('DATE_SUB(NOW(), INTERVAL ${막는기간일} DAY)'));
        t('서버: 취소된 주문은 세지 않는다', 코드.includes('t.is_cancel=0 AND t.is_cancel_trans=0'));
        t('서버: 버려진 결제대기는 세지 않는다(손님 화면과 같은 규칙)', 코드.includes('버려진결제대기'));
        // 조회가 깨졌다고 막아 버리면 손님이 영영 못 나간다.
        t('서버: 조회가 실패하면 막지 않는다', /catch \(e\) \{\s*return \[\];/.test(코드));
        t('서버: 개인정보는 담지 않는다(주문번호·상태만)',
            !/buyer_name|buyer_phone|\baddr\b/.test(코드));
    }

    const auth = 읽기(BACK_ROOT + 'controllers/auth.controller.js');
    const authCode = 주석제거(auth);
    // 화면만 막으면 API 를 직접 불러 빠져나갈 수 있다 — 그러면 그 손님은 자기 주문을 다시 못 본다.
    t('서버: 탈퇴 실행(resign)에서도 같은 검사를 한다',
        authCode.includes('const 막는주문 = await 탈퇴막는주문(')
        && /if \(막는주문\.length > 0\) \{[\s\S]{0,200}return response\(req, res, -100, 막힘안내\(막는주문\)/.test(authCode));
    t('서버: 비밀번호 확인을 통과한 뒤에 막는다(순서)',
        authCode.indexOf('비밀번호가 일치하지 않습니다') < authCode.indexOf('const 막는주문'));
    t('서버: 미리 물어보는 창구(resign-check)가 있다', authCode.includes('resignCheck: async (req, res, next) => {'));

    const route = 주석제거(읽기(BACK_ROOT + 'routes/auth.route.js'));
    t('서버: resign-check 경로가 붙어 있다', route.includes("'/resign-check'") && route.includes('.get(authCtrl.resignCheck)'));
    // .route() 를 이어 붙이면 Route 객체에는 .route 가 없어 기동할 때 죽는다(2026-09-17 밟음).
    t('서버: 라우터 체이닝이 끊겨 있다(.route 를 겹쳐 붙이지 않는다)',
        !/\.get\(authCtrl\.resignCheck\)\s*\.route\(/.test(route));
}

// 확인 단계를 늘리는 것 자체가 위반 예시다. 비밀번호 한 번으로 끝낸다.
t('탈퇴 의사를 두 번 이상 되묻지 않는다',
    !/confirm\(/.test(주석제거(탈퇴패널)) && !/window\.confirm/.test(주석제거(정보패널)));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
