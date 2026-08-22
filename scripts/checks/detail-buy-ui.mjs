import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 상품상세에서 '담기'와 팝업 크기.
//
// 가맹점 피드백(2026-08-21):
//   · 프레임3·4 상세에 장바구니 담기 버튼이 없다 → 실은 「구매하기」를 눌러야 열리는 서랍 안에만
//     있었다. 살지 말지 고르는 자리에 담기가 없으면 손님은 그 몰에 담기가 없다고 읽는다.
//   · 홈 팝업이 손바닥만 하게 뜬다 → 폭을 내용에 맡겨 둬서 글만 몇 줄인 팝업이 그렇게 됐다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 담기 버튼 ─────────────────────────────────────────────────────────────
for (const n of [1, 2, 3]) {
    const f = `src/views/blog/product/id/demo-${n}.js`;
    const s = 읽기(f);
    const 이름 = `blog demo-${n}`;
    t(`${이름} 상세에 장바구니 버튼이 보인다`, s.includes("{translate('장바구니')}\n") || /\{translate\('장바구니'\)\}/.test(s));
    t(`${이름} 담기가 구매하기 옆에 있다`, s.includes("requiredGroups(item).length > 0 ? setCartOpen(true) : handleAddCart()"));
    // 옵션이 걸린 상품을 옵션 없이 담으면 안 된다 — 그때는 고를 자리(서랍)를 열어야 한다.
    t(`${이름} 옵션 상품은 서랍을 연다`, s.includes('requiredGroups(item).length > 0 ? setCartOpen(true)'));
    // 품절 상품의 버튼은 죽어 있어야 한다.
    t(`${이름} 품절이면 담기도 막힌다`, /disabled=\{!purchasable\} style=\{\{ width: '38%' \}\}/.test(s));
}

// ── 팝업 ─────────────────────────────────────────────────────────────────
// 다른 쇼핑몰들이 쓰는 모양으로 바꿨다(어두운 배경 + 가운데 카드 + 아래 버튼 두 개).
// 예전에는 왼쪽 위에 내용 크기만큼 붙어서, 글만 몇 줄인 팝업이 손바닥만 하게 뜨고
// 헤더까지 가렸다. 되돌아가기 쉬운 자리라 모양의 뼈대를 못 박는다.
const popup = 읽기('src/components/elements/shop/StorefrontPopups.js');
t('어두운 배경 위에 띄운다', /background:rgba\(0,0,0,0\.55\);/.test(popup));
t('가운데 정렬', /align-items:center;/.test(popup) && /justify-content:center;/.test(popup));
t('카드에 최소 크기가 있다', /width:420px;/.test(popup) && /max-width:min\(420px, 92vw\);/.test(popup));
t('좁은 화면·긴 내용에서도 넘치지 않는다', /max-height:86vh;/.test(popup) && /overflow-y:auto;/.test(popup));
t('팝업 안 이미지가 카드를 뚫지 않는다', /img\{max-width:100%;height:auto;display:block;margin:0 auto;\}/.test(popup));
// 닫는 길이 여러 개여야 한다 — 예전엔 모서리의 작은 X 하나뿐이었다.
t('배경을 눌러 닫는다', /<Dim onClick=\{\(\) => setPopups\(\[\]\)\}>/.test(popup));
t('카드 안 클릭은 새어 나가지 않는다', /onClick=\{\(e\) => e\.stopPropagation\(\)\}/.test(popup));
t('ESC 로도 닫는다', /e\.key === 'Escape'/.test(popup));
t('오늘 하루 보지않기 · 닫기 두 버튼', /오늘 하루 보지않기/.test(popup) && /translate\('닫기'\)/.test(popup));
// 사전 키는 원문 그대로여야 한다. 띄어쓰기를 바꾸면 그 자리만 번역이 빠진다.
t('사전에 있는 키를 쓴다', !/오늘 하루 보지 않기'\)/.test(popup));
// ESC 는 훅이다 — early return 아래로 내려가면 훅 순서가 깨져 화면이 백지가 된다.
t('훅이 early return 위에 있다',
    popup.indexOf("e.key === 'Escape'") < popup.indexOf('if (!(popups?.length > 0)'));
// 예전에 고친 것들 — 같이 잠가 둔다(헤더 뒤로 숨어 못 닫던 문제, 다크모드 흰 글자 문제).
t('팝업이 헤더보다 위에 있다', /z-index:1300;/.test(popup));
t('팝업 글자색을 고정한다', /color:#212121;/.test(popup));

// 빈 팝업은 그리지 않는다 — 저장만 하고 내용을 안 넣은 팝업이 빈 흰 상자로 떠 있었다(mbc01).
// 두 함수를 떼어 실제로 돌린다. 쓰임이 다르다 —
//   팝업본문있음: 본문 칸을 그릴지(제목만 있고 내용이 비면 흰 여백만 남는다)
//   팝업내용있음: 팝업 자체를 그릴지(둘 다 없으면 빈 상자가 뜬다)
// 선언 하나는 빈 줄로 끝난다 — 중괄호 세기보다 이 편이 덜 깨진다.
// (한 줄짜리 화살표 함수와 블록형이 섞여 있어서 ';' 나 '};' 로 자르면 둘 중 하나가 어긋난다)
const 떼기 = (이름) => {
    const i = popup.indexOf('export const ' + 이름 + ' =');
    if (i < 0) return '';
    const 빈줄 = ['\r\n\r\n', '\n\n'].map((s) => popup.indexOf(s, i)).filter((n) => n > 0);
    const 끝 = 빈줄.length ? Math.min(...빈줄) : popup.length;
    return popup.slice(i, 끝).replace('export const', 'const') + '\n';
};
const 본문있음 = new Function(떼기('팝업본문있음') + 'return 팝업본문있음;')();
const 있음 = new Function(떼기('팝업본문있음') + 떼기('팝업내용있음') + 'return 팝업내용있음;')();
t('제목만 있으면 본문 칸은 안 그린다', 본문있음({ popup_content: '', popup_title: '공지' }) === false);
t('본문이 있으면 본문 칸을 그린다', 본문있음({ popup_content: '<p>세일</p>' }) === true);
t('빈 내용은 안 그린다', 있음({ popup_content: '<p><br></p>' }) === false);
t('공백만 있어도 안 그린다', 있음({ popup_content: '<p>&nbsp;</p>' }) === false);
t('글이 있으면 그린다', 있음({ popup_content: '<p>여름 세일</p>' }) === true);
t('이미지만 있어도 그린다', 있음({ popup_content: '<p><img src="a.png"></p>' }) === true);
t('제목만 있어도 그린다', 있음({ popup_content: '', popup_title: '공지' }) === true);
t('아무것도 없으면 안 그린다', 있음({}) === false);
// 제목은 관리자에서 받아 두고 화면에 안 쓰던 값이다 — 이제 카드 머리에 보여준다.
t('제목을 화면에 쓴다', /item\?\.popup_title\}<\/span>/.test(popup));

// 「닫기」와 「오늘 하루 보지않기」는 하는 일이 달라야 한다.
// 예전엔 둘 다 사실상 같았다 — 헤더에 사는 컴포넌트라 화면을 옮겨도 닫힌 상태가 남아서,
// 로고를 눌러 홈으로 돌아와도 팝업이 안 뜨고 새로고침해야만 떴다(2026-08-22 확인).
t('홈에 들어올 때마다 되살린다', /const 홈진입 = 홈 && !지난번\.current\.홈;/.test(popup));
t('홈 안에서 닫은 것은 닫힌 채로 둔다', /if \(홈 && \(홈진입 \|\| 목록바뀜\)\) setPopups\(목록\);/.test(popup),
    '조건 없이 되살리면 닫아도 계속 다시 뜬다');
// 목록이 늦게 도착하는 경우(설정 API)에도 한 번은 채워야 한다.
t('목록이 나중에 와도 채운다', /목록 !== 지난번\.current\.목록/.test(popup));
// '오늘 하루' 는 그날 내내 유지된다 — 이건 저장된 목록으로 거른다.
t('오늘 하루 보지않기는 그대로 유지된다', /!hiddenToday\.includes\(item\?\.id\)/.test(popup));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
