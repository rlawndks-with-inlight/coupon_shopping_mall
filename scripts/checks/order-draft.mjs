import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 주문서 입력값 보관 + 비회원 회원가입 유도.
//
// [보관 규칙 — 2026-11-09 사장님 결정]
//  주문서는 보관하지 않는다. 예외는 결제창까지 갔다가 실패·취소된 주문 하나 —
//  결과 화면 「다시 결제하기」(?retry=주문번호)로 온 주문서에만 그 주문의 입력값을 채운다.
//  (8/25 '늘 남기기' 로 만들었다가 9/11·11/9 '주문을 마치고 새로 주문하는데 지난 정보가 뜬다' 를 두 번 받았다)
//
// ⚠ 카드정보와 비회원 주문 비밀번호는 어느 경우에도 저장하지 않는다.
//
// [회원가입 유도 — 2026-08-25 제보] 담기·바로구매에서 매번 묻는다(아래 묶음).

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// ── 보관 도구를 실제로 돌린다 ─────────────────────────────────────────────
const draft소스 = 읽기('src/utils/order-draft.js');
// sessionStorage 와 시계를 가짜로 끼워 넣고 실제 함수를 돌린다.
const 만들기 = (지금 = () => 1_000_000) => {
    const 창고 = new Map();
    const mod = new Function('sessionStorage', 'Date',
        draft소스.replace(/export const /g, 'const ')
        + '\nreturn { saveRetryDraft, stampRetryDraft, peekRetryDraft, takeRetryDraft, saveSessionDraft, takeSessionDraft, clearOrderDraft };'
    )({
        getItem: (k) => (창고.has(k) ? 창고.get(k) : null),
        setItem: (k, v) => 창고.set(k, String(v)),
        removeItem: (k) => 창고.delete(k),
    }, { now: () => 지금() });
    return { ...mod, 창고 };
};

const 원본 = {
    brand_id: 130, buyer_name: '홍길동', buyer_phone: '010-1234-5678',
    receiver: '홍길동', addr_phone: '010-1234-5678',
    addr: '경기 부천시 원미구 길주로 64', detail_addr: '101동 202호', zonecode: '14547',
    delivery_memo: '문 앞에 놔주세요', country_code: 'KR', use_point: 0,
    // 아래는 절대 저장되면 안 되는 것들
    password: 'guest1234', card_num: '4111111111111111', card_pw: '12',
    yymm: '12/28', auth_num: '900101', pay_key: 'k', mid: 'm', tid: 't',
    payment_modules: { id: 1 },
    // 매번 새로 만들어야 하는 것들
    ord_num: 'FS20260825ABC', amount: 30000, item_name: '떡갈비', products: [{ id: 1 }],
};
const 주문 = 'FS20261109AAA';

{
    const { saveRetryDraft, stampRetryDraft, peekRetryDraft, takeRetryDraft } = 만들기();
    saveRetryDraft(원본, { addrMode: 'KR', directMode: true, sameAsBuyer: false, selectedAddrId: 7 }, true);
    t('주문번호가 달리기 전에는 「다시 결제하기」가 없다', peekRetryDraft(주문) === null && takeRetryDraft(주문) === null);
    stampRetryDraft(주문);
    t('주문번호가 달리면 그 주문에 「다시 결제하기」가 있다', peekRetryDraft(주문)?.buynow === true);
    t('다른 주문번호로는 못 꺼낸다', peekRetryDraft('FS20261109BBB') === null && takeRetryDraft('FS20261109BBB') === null,
        '다른 주문의 결과 화면·주소로 지난 손님 정보가 뜨면 안 된다');
    const 다시 = takeRetryDraft(주문);
    t('되살린 것이 있다', !!다시 && !!다시.payData);
    for (const k of ['buyer_name', 'buyer_phone', 'receiver', 'addr_phone', 'addr', 'detail_addr', 'zonecode', 'delivery_memo']) {
        t(`${k} 가 되살아난다`, 다시.payData[k] === 원본[k]);
    }
    for (const k of ['password', 'card_num', 'card_pw', 'yymm', 'auth_num', 'pay_key', 'mid', 'tid', 'payment_modules']) {
        t(`${k} 는 저장되지 않는다`, 다시.payData[k] === undefined,
            k === 'password' ? '비회원 주문 비밀번호다 — 편의보다 앞선다' : '결제 민감정보다');
    }
    for (const k of ['ord_num', 'amount', 'item_name', 'products']) {
        t(`${k} 는 되살리지 않는다`, 다시.payData[k] === undefined,
            k === 'ord_num' ? '지난 주문번호로 결제가 시도된다' : '금액·상품은 서버 값으로 다시 계산한다');
    }
    t('화면 상태(배송지 모드·고른 배송지)도 함께 되살린다',
        다시.화면상태.addrMode === 'KR' && 다시.화면상태.directMode === true && 다시.화면상태.sameAsBuyer === false && 다시.화면상태.selectedAddrId === 7);
    t('꺼내도 지우지 않는다(다시 결제하기 주문서 새로고침)', takeRetryDraft(주문) !== null);
}
// 주문번호는 방금 담은 '대기' 에만 단다
{
    let 시각 = 1_000_000;
    const { saveRetryDraft, stampRetryDraft, peekRetryDraft } = 만들기(() => 시각);
    saveRetryDraft(원본, {}, false);
    시각 += 3 * 60 * 1000;
    stampRetryDraft(주문);
    t('오래된 대기에는 주문번호를 달지 않는다', peekRetryDraft(주문) === null,
        '주문서 밖(바로구매 창 등)에서 낸 결제가 지난 입력값을 집어 가면 안 된다');
}
{
    const { saveRetryDraft, stampRetryDraft, peekRetryDraft } = 만들기();
    saveRetryDraft(원본, {}, false);
    stampRetryDraft(주문);
    stampRetryDraft('FS20261109BBB');
    t('이미 주문번호가 달렸으면 바꾸지 않는다', peekRetryDraft(주문) !== null && peekRetryDraft('FS20261109BBB') === null);
}
// 저장된 문자열 자체에도 남으면 안 된다(객체만 걸러내고 저장은 통째로 하는 실수 방지)
{
    const { saveRetryDraft, 창고 } = 만들기();
    saveRetryDraft(원본, {}, false);
    const 날것 = 창고.get('orderRetry') ?? '';
    t('저장된 문자열에 비밀번호가 없다', !!날것 && !날것.includes('guest1234'));
    t('저장된 문자열에 카드번호가 없다', !!날것 && !날것.includes('4111111111111111'));
}
// 지우기 — 예전 '늘 남기기' 자리(orderDraft)도 함께
{
    const { saveRetryDraft, stampRetryDraft, takeRetryDraft, clearOrderDraft, 창고 } = 만들기();
    창고.set('orderDraft', JSON.stringify({ payData: { buyer_name: '예전' } }));
    saveRetryDraft(원본, {}, false);
    stampRetryDraft(주문);
    clearOrderDraft();
    t('지우면 되살릴 것이 없다', takeRetryDraft(주문) === null);
    t('예전 보관 자리도 지운다', !창고.has('orderDraft'), '예전 초안이 남은 손님 탭에 지난 정보가 남는다');
}
// 망가진 값
{
    const { peekRetryDraft, takeRetryDraft, 창고 } = 만들기();
    창고.set('orderRetry', '{망가진');
    t('깨진 값이면 없는 셈 친다', peekRetryDraft(주문) === null && takeRetryDraft(주문) === null);
    창고.set('orderRetry', JSON.stringify({ ord_num: 주문 }));
    t('payData 가 없으면 없는 셈 친다', takeRetryDraft(주문) === null);
}
{
    const { saveRetryDraft, takeRetryDraft } = 만들기();
    saveRetryDraft(undefined, undefined, undefined);
    t('빈 값을 넣어도 죽지 않는다', takeRetryDraft('') === null);
}

// ── 주문서·결과 화면·결제 시작이 실제로 쓰는가 ─────────────────────────────
const sheet = 읽기('src/views/shop/order/OrderSheet.js');
const 결과 = 읽기('src/views/shop/order/PayResultView.js');
const 결제 = 읽기('src/utils/shop-util.js');
t('주문서가 늘 남기던 저장을 하지 않는다', !/saveOrderDraft|loadOrderDraft/.test(주석제거(sheet)),
    '9/11·11/9 — 주문을 마치고 새로 주문하는데 지난 손님 정보가 떴다');
t('주문서: 새로고침(같은 주소)·결제창에서 뒤로 가기일 때만 쓰던 값을 꺼낸다',
    /if \(항목 && 항목\.name === window\.location\.href\) 온길 = 항목\.type;/.test(sheet)
    && /let 초안 = \(온길 === 'reload' \|\| 온길 === 'back_forward'\) \? takeSessionDraft\(지금주소\) : null;/.test(sheet),
    '탐색 기록은 문서를 처음 연 주소의 것이다 — 다른 화면을 새로고침한 뒤 메뉴로 와도 reload 로 읽힌다');
t('주문서: 그 밖에는 ?retry= 로 왔을 때만 채운다', /if \(!초안 && 다시결제\) 초안 = takeRetryDraft\(다시결제\);/.test(sheet));
t('주문서: 다른 길로 열면 남은 값을 지운다', /if \(!초안\) \{\s*clearOrderDraft\(\);\s*\} else \{/.test(sheet));
t('주문서: 새로고침용 저장은 복원이 끝난 뒤에 시작한다', /const \[보관준비, set보관준비\] = useState\(false\);/.test(sheet)
    && /if \(!보관준비\) return;\s*saveSessionDraft\(/.test(sheet), 'ref 로 두면 같은 커밋에서 빈 값이 덮어쓴다');
t('주문서: 회원은 직접 쓴 값이 있을 때만 묻는다(회원정보·주문자와 동일·주소록 선택은 안 셈)',
    sheet.includes("직접씀('buyer_name', user?.id ? (user?.name || user?.nickname) : '')")
    && sheet.includes("(!sameAsBuyer && (직접씀('receiver', 고른주소?.receiver)")
    && sheet.includes('.some((k) => 직접씀(k, 고른주소?.[k]))'));
t('주문서: 나갈 때 가맹점 문구로 묻는다', /translate\('기존 정보가 사라집니다\. 정말 다른 화면으로 넘어가시겠습니까\?'\)/.test(sheet)
    && /router\.events\.on\('routeChangeStart', 이동시작\)/.test(sheet) && /router\.beforePopState\(/.test(sheet));
t('주문서: 결제 결과·주문 완료로 가는 길은 묻지 않는다', /\/\\\/shop\\\/auth\\\/\(pay-result\|order-complete\)\$\//.test(sheet));
t('주문서: 탭 닫기(beforeunload)로는 묻지 않는다', !/beforeunload/.test(주석제거(sheet)),
    '브라우저 기본 창은 새로고침에도 떠서 「새로고침은 그대로」와 부딪힌다');
t('주문서: 떠날 때 확인 장치를 풀어 둔다', /router\.events\.off\('routeChangeStart', 이동시작\)/.test(sheet) && /router\.beforePopState\(\(\) => true\)/.test(sheet),
    '안 풀면 다른 화면에서도 뒤로 가기가 막힌다');
t('결제창으로 가기 전에 담는다', /saveRetryDraft\(payData, \{ addrMode, directMode, sameAsBuyer, selectedAddrId \}, isBuyNow\(\)\);\s*try \{\s*let result = false;/.test(sheet));
t('주문이 안 만들어지면 담은 것을 지운다', /if \(!result\) \{\s*\/\/[^\n]*\n\s*clearOrderDraft\(\);/.test(sheet));
t('주문 접수·결제 완료 시 지운다', (sheet.match(/clearOrderDraft\(\);/g) ?? []).length >= 3,
    '무통장·상품권(finishPendingOrder)과 수기카드, 주문서 열 때 — 모두 필요하다');
t('약관 동의는 되살리지 않는다', !/setAgree1\(.*초안|초안.*agree/.test(sheet),
    '동의는 그때마다 사람이 직접 눌러야 한다');
t('포스페이·페이레터가 주문을 만든 뒤 주문번호를 단다', (결제.match(/stampRetryDraft\(ord_num\);/g) ?? []).length === 2
    && /if \(res\?\.id > 0\) \{\s*stampRetryDraft\(ord_num\);/.test(결제));
t('결과 화면: 결제 확인 중에는 「다시 결제하기」를 찾지 않는다',
    /const 결제안됨 = router\.isReady && !isTestBrand && !isSuccess && !확인중;/.test(결과)
    && /set다시결제\(결제안됨 \? peekRetryDraft\(String\(q\.ord_num \|\| ''\)\) : null\);/.test(결과));
t('결과 화면: 결제창 닫기·취소는 그 주문서로 바로 돌아간다', /const 바로돌아감 = !!다시결제 && isCanceled && !확인불명;/.test(결과)
    && /if \(!바로돌아감\) return;\s*toast\(translate\('결제가 취소되었습니다\.'\)\);\s*주문서로\(true\);/.test(결과));
t('결과 화면: 「다시 결제하기」는 그 주문번호로 주문서를 연다',
    /const url = `\/shop\/auth\/order\?\$\{다시결제\?\.buynow \? 'buynow=1&' : ''\}retry=\$\{ord\}`;/.test(결과));
t('결과 화면: 확인 지연에서 누르면 서버에 한 번 더 묻는다', /if \(!확인불명\) \{ 주문서로\(\); return; \}[\s\S]{0,200}apiManager\('pays\/forspay\/confirm'/.test(결과)
    && /if \(r\?\.settled\) \{\s*set확인상태\('confirmed'\);/.test(결과), '결제됐는데 다시 결제하면 이중 결제다');
t('결과 화면: 그래도 모르면 확인 창을 거쳐야 주문서로 간다', /set지연확인창\(true\);/.test(결과)
    && /onClick=\{\(\) => \{ set지연확인창\(false\); 주문서로\(\); \}\}/.test(결과));
t('결과 화면: 입력값이 있으면 「쇼핑 계속하기」 대신 「다시 결제하기」', /\{바로돌아감 \? null : 다시결제 \? \([\s\S]{0,900}translate\('다시 결제하기'\)/.test(결과));
for (const l of ['ko', 'en', 'ja', 'cn', 'es']) {
    const 사전 = 읽기(`src/locales/langs/${l}.js`);
    t(`나가기·확인 지연 문구 번역이 있다(${l})`, ['기존 정보가 사라집니다. 정말 다른 화면으로 넘어가시겠습니까?', '결제가 확인되었습니다.', '결제 여부를 먼저 확인해 주세요', '확인했습니다, 다시 결제하기']
        .every((k) => 사전.includes(`"${k}": "`)));
}
// 새로고침용 보관을 실제로 돌린다
{
    const { saveSessionDraft, takeSessionDraft, clearOrderDraft } = 만들기();
    saveSessionDraft(원본, { addrMode: 'KR' }, '/shop/auth/order/?buynow=1');
    t('새로고침: 같은 주소면 꺼낸다', takeSessionDraft('/shop/auth/order/?buynow=1')?.payData?.buyer_name === '홍길동');
    t('새로고침: 다른 주문서(장바구니↔바로구매)면 꺼내지 않는다', takeSessionDraft('/shop/auth/order/') === null);
    t('새로고침: 비밀번호·카드는 남기지 않는다', takeSessionDraft('/shop/auth/order/?buynow=1')?.payData?.password === undefined
        && takeSessionDraft('/shop/auth/order/?buynow=1')?.payData?.card_num === undefined);
    clearOrderDraft();
    t('새로고침: 지우면 꺼낼 것이 없다', takeSessionDraft('/shop/auth/order/?buynow=1') === null);
}
for (const l of ['ko', 'en', 'ja', 'cn', 'es']) {
    t(`「다시 결제하기」 번역이 있다(${l})`, /"다시 결제하기": "[^"]+"/.test(읽기(`src/locales/langs/${l}.js`)));
}

// ── 회원가입 유도 ────────────────────────────────────────────────────────
const prompt = 읽기('src/components/elements/shop/GuestSignupPrompt.js');
const util = 읽기('src/utils/guest-prompt.js');
const shop = 읽기('src/utils/shop-util.js');

// 주문서에서는 권하지 않는다. 넣었다가 걷어냈다(2026-08-25) —
// 이름·연락처·배송지를 다 쓰고 비회원 주문 비밀번호까지 정한 뒤에 물으면 방해로만 읽힌다.
// 유도는 그 앞 단계(담기·바로구매)에서 이미 한다. 그 둘을 거치지 않고 주문서에 닿는 길은 없다.
t('주문서에서는 유도하지 않는다', !/askGuestSignup\(/.test(주석제거(sheet)),
    '주문서까지 온 손님을 붙잡으면 유도가 아니라 이탈이 된다');
t('장바구니 담기에서 유도한다', /if \(!\(await askGuestSignup\(\)\)\) return false;/.test(shop));
t('담기·바로구매 두 길목 모두에 있다', (shop.match(/await askGuestSignup\(\)/g) ?? []).length === 2);

// '한 번만 묻기'가 되살아나지 않게 못 박는다.
t('그만묻기 상태가 남아 있지 않다', !/그만묻/.test(prompt) && !/그만묻기설정|그만묻나/.test(util),
    '가맹점 요청은 매번 묻는 것이다 — 되살리면 요청이 되돌아간다');
// 주석은 빼고 본다 — '예전엔 sessionStorage 를 썼다'는 이력이 주석에 남아 있고,
// 그 이력은 남아 있어야 한다(다시 만들지 말라는 경고다).
// 주석제거는 _roots.mjs 의 공용 도구다 — 직접 짜면 CRLF 파일에서 조용히 샌다.
t('sessionStorage 로 유도를 끄지 않는다',
    !/sessionStorage/.test(주석제거(prompt)) && !/sessionStorage/.test(주석제거(util)));
t('유도 창은 로그인 상태를 확인한 뒤에만 뜬다', /if \(!준비됨 \|\| 지금유저\) \{ resolve\(true\); return; \}/.test(prompt),
    '세션 복원 전에는 로그인한 손님에게도 창이 뜬다');

// 「비회원으로 계속」은 절대 빠지면 안 된다 — 없으면 비회원 구매가 막힌다.
t('「비회원으로 계속」 버튼이 있다', /비회원으로 계속/.test(prompt));
t('어떻게 닫혀도 반드시 응답한다', /onClose=\{바깥닫기\}/.test(prompt),
    '응답을 안 하면 담기가 영영 안 끝난다');
// 바깥 닫기는 '계속' 이 아니다 — 제보(2026-08-31, 모바일): 창 밖을 눌렀더니 주문서로 넘어갔다.
// 예전엔 onClose 가 비회원으로() 였다. 자세한 사연은 guest-prompt.mjs 에 있다.
t('바깥을 눌러 닫으면 진행하지 않는다', /const 바깥닫기 = \(\) => \{ 닫기\(false\); \};/.test(prompt),
    'onClose 를 비회원으로() 에 다시 묶으면 창만 닫으려던 손님이 주문서로 넘어간다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
