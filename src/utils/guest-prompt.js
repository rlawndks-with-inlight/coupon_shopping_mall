// 로그인하지 않은 손님에게 회원가입을 '한 번' 권한다.
//
// 담기·바로구매 버튼은 화면 20여 곳에 흩어져 있지만, 실제로는 공용 길목 두 개로 모인다
// (shop-util.js 의 insertCartDataUtil · startBuyNow). 그 두 곳에서 이 함수를 부르고,
// 실제 창은 레이아웃에 한 번만 걸린 GuestSignupPrompt 가 띄운다.
// 그래서 프레임이 늘어도 여기만 지키면 된다.
//
// ⚠ 막는 장치가 아니다.
//   예전에 비회원을 로그인 화면으로 튕기는 코드가 있었는데, 그러면 비회원 구매 자체가
//   불가능해져서 걷어낸 이력이 있다(헤더 주석에 남아 있다). 그래서 창에는 반드시
//   「비회원으로 계속」이 있고, 한 번 그걸 고르면 그 세션 동안 다시 묻지 않는다.

// 창을 여는 함수. GuestSignupPrompt 가 마운트되면서 꽂아 넣는다.
let 열기 = null;

export const setGuestPromptOpener = (fn) => { 열기 = fn; };

/**
 * @returns {Promise<boolean>} true = 하던 일을 계속한다 / false = 멈춘다(회원가입·로그인으로 떠났다)
 *
 * 창이 아직 안 걸렸으면(레이아웃 밖에서 부른 경우) 그냥 진행시킨다.
 * 여기서 막으면 창이 없는 화면에서는 담기가 통째로 죽는다.
 */
export const askGuestSignup = () => (열기 ? 열기() : Promise.resolve(true));

// '비회원으로 계속' 을 고른 사실은 sessionStorage 에 둔다.
//
// 컴포넌트 상태로 두면 안 된다 — 담기 성공 뒤 window.location.reload() 를 하는 화면이
// 여럿이라, 새로고침마다 기억이 지워져 담을 때마다 창이 뜬다.
// 탭을 닫으면 사라지므로 다음 방문에는 다시 한 번 권할 수 있다.
const 열쇠 = 'guestSignupPromptDismissed';

export const 그만묻기설정 = () => {
    try { sessionStorage.setItem(열쇠, '1'); } catch (e) { /* 사생활 보호 모드 등 — 못 저장해도 동작은 같다 */ }
};

export const 그만묻나 = () => {
    try { return sessionStorage.getItem(열쇠) === '1'; } catch (e) { return false; }
};
