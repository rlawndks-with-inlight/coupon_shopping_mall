// 관리자 금액 입력칸의 표시/저장 변환.
//
// 왜 필요한가:
//   금액칸이 대부분 <input type="number"> 였다. 브라우저의 number 칸은 쉼표를 못 받는다 —
//   넣으면 값이 통째로 무효가 된다. 그래서 배송비 15000 을 '15000' 으로 읽어야 했고,
//   0 이 몇 개인지 세다가 자리를 틀리면 그대로 저장됐다.
//
//   상품의 판매가·정가는 이미 type="text" + toLocaleString 으로 쉼표를 넣고 있었다.
//   그 방식이 다른 칸에 안 퍼져 있었을 뿐이라, 같은 규칙을 여기 한 곳에 둔다.
//
// 쓰는 법(칸 모양이 TextField 든 OutlinedInput 이든 같다):
//     type='text'
//     inputProps={{ inputMode: 'numeric' }}
//     value={금액표시(어딘가의값)}
//     onChange={e => 저장(금액입력(e))}
//
// onChange 에서 금액값(e.target.value) 이 아니라 금액입력(e) 를 쓰는 이유는
// 금액입력 주석 참고 — 칸 중간을 고칠 때 커서가 끝으로 튀는 것을 막는다.

// 숫자와 맨 앞 빼기표. 쉼표는 세지 않는다.
const 셀것 = /[\d-]/;
const 셀것전부 = /[\d-]/g;

// 담긴 값 → 사람이 읽는 문자열.
export const 금액표시 = (v) => {
    if (v === '' || v === null || v === undefined) return '';
    const n = Number(String(v).replace(/,/g, ''));
    if (!Number.isFinite(n)) return '';
    return n.toLocaleString('ko-KR');
};

// 사람이 친 문자열 → 담을 값.
//
// 비우면 0 이 아니라 빈 문자열로 둔다 — 0 으로 되돌리면 지우는 순간 커서 앞에 0 이 생겨서
// 지울 수가 없다(무료배송으로 만들려고 지웠는데 0 이 계속 따라붙는다).
// 저장할 때 빈 값은 부르는 쪽에서 0 으로 본다.
export const 금액값 = (s) => {
    const 글자 = String(s ?? '');
    // 맨 앞의 빼기만 살린다(포인트 차감처럼 음수를 넣는 칸이 있다).
    const 음수 = 글자.trim().startsWith('-');
    const 숫자 = 글자.replace(/[^\d]/g, '');
    if (숫자 === '') return 음수 ? '-' : '';
    // 앞자리 0 을 떨군다 — '0' 상태에서 5 를 치면 '05' 가 되던 것을 막는다.
    const 값 = String(Number(숫자));
    return 음수 ? '-' + 값 : 값;
};

// 다시 그린 뒤 커서를 놓을 자리.
//
// 세는 것은 '숫자를 몇 개 지나왔나' 뿐이다 — 쉼표는 세지 않는다. 그래야 앞에서 쉼표가
// 하나 생기든 사라지든 커서가 같은 숫자 옆에 남는다.
// 맨 앞 빼기표는 숫자와 같이 센다(음수 칸에서 커서가 '-' 앞으로 밀리지 않게).
//
// DOM 과 떼어 둔다 — 브라우저 없이 돌아가야 검사에서 그대로 돌려볼 수 있다.
export const 커서자리 = (친값, 커서, 보일값) => {
    const 지나온개수 = (String(친값).slice(0, 커서).match(셀것전부) ?? []).length;
    let i = 0, 남은 = 지나온개수;
    while (i < String(보일값).length && 남은 > 0) {
        if (셀것.test(보일값[i])) 남은--;
        i++;
    }
    return i;
};

// 칸에서 친 것을 담을 값으로 바꾸면서, 커서를 제자리에 돌려놓는다.
//
// 왜 필요한가:
//   보이는 값에 쉼표가 끼면 글자 수가 저 혼자 늘고 준다. 12,345 의 3 을 6 으로 고치려고
//   그 자리에 커서를 두고 치면, 다시 그려질 때 브라우저가 커서를 끝으로 보내 버린다.
//   12,645 를 만들려던 사람이 12,3456 을 만들게 된다.
export const 금액입력 = (e) => {
    const 칸 = e?.target;
    const 친값 = String(칸?.value ?? '');
    const 값 = 금액값(친값);
    if (!칸 || typeof requestAnimationFrame !== 'function') return 값;

    const 커서 = 칸.selectionStart ?? 친값.length;
    const 자리 = 커서자리(친값, 커서, 금액표시(값));
    // 화면이 갱신된 다음에 놓아야 한다 — 지금 놓으면 다시 그리면서 끝으로 밀린다.
    requestAnimationFrame(() => {
        // 그새 다른 칸으로 옮겨갔으면 건드리지 않는다.
        if (document.activeElement !== 칸) return;
        try { 칸.setSelectionRange(자리, 자리); } catch { /* 숫자칸이 아니면 무시 */ }
    });
    return 값;
};
