// 입력칸 글자 수 — 관리자 화면의 짧은 칸들이 같이 쓴다(2026-11-23).
//
// 글자는 DB(VARCHAR)처럼 코드포인트로 센다(이모지 하나 = 1자). JS 의 .length 는 이모지를 2자로 센다.
// maxLength 는 쓰지 않는다 — 붙여 넣은 글이 소리 없이 잘려 버린다. 넘치면 빨갛게 알리고,
// 저장하면 화면(상품 수정)이나 서버가 「칸 이름」과 함께 막는다.
//
// 칸 크기는 DB 와 같아야 한다. 칸을 늘리면 여기 숫자와 서버 검사를 같이 바꿀 것.
export const 칸최대 = {
    상품명: 150,          // products.product_name — 서버 상품값검사
    상품설명: 255,        // products.product_comment — 서버 상품값검사
    옵션이름: 30,         // product_option_groups.group_name — 서버 옵션길이검사
    옵션항목: 50,         // product_options.option_name — 서버 옵션길이검사
    입력항목이름: 60,     // product_order_form_fields.label · order_form_fields.label
    카테고리명: 50,       // product_categories.category_name — 서버 product_category
    특성그룹명: 50,       // product_property_groups.property_group_name — 서버 product_property_group
    특성명: 50,           // product_properties.property_name
    팝업제목: 100,        // popups.popup_title · benefit_notices.popup_title — 서버 popup
};

export const 글자수 = (v) => Array.from(String(v ?? '')).length;

// 짧은 값에 「3/1,000」을 달면 줄마다 높이만 늘어난다 — 길어질 때(최대의 80% 또는 100자)부터 보인다.
// TextField 에 {...글자수표시(값, 최대)} 로 펼쳐 넣는다(error·helperText).
export const 글자수표시 = (v, 최대) => {
    const n = 글자수(v);
    if (n > 최대) return { error: true, helperText: `${n.toLocaleString()} / ${최대.toLocaleString()}자 · ${최대.toLocaleString()}자까지 넣을 수 있습니다` };
    if (n >= Math.min(100, 최대 * 0.8)) return { helperText: `${n.toLocaleString()} / ${최대.toLocaleString()}자` };
    return {};
};
