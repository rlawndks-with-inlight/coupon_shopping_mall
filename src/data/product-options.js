// 상품 옵션 — 선택옵션 / 추가상품 / 조합형 / 재고 공용 판정.
//
// 상품상세 6개 프레임과 장바구니·주문서가 전부 이 파일을 쓴다.
// 프레임마다 따로 판정하면 '프레임5 에서만 품절인데 살 수 있는' 종류의 어긋남이 생긴다.
//
// 용어는 백엔드(utils.js/product-options.js)와 같은 뜻으로 맞췄다:
//   선택옵션 group_type=0  골라야 산다. 그룹마다 1개.
//   추가상품 group_type=1  안 골라도 산다. 여러 개 고를 수 있다.
//   조합형   option_mode=1 옵션 조합마다 가격·재고가 따로.

export const 선택옵션 = 0;
export const 추가상품 = 1;

export const isAddon = (group) => Number(group?.group_type) === 추가상품;

// 골라야 사는 그룹만. 추가상품은 필수 검사에서 빠진다.
//
// ⚠ 이 구분이 이 개편의 핵심이다. 예전엔 모든 그룹이 필수였고 추가상품 개념이 없어서,
//   '한복 +10,000 / 스냅 +300,000' 을 각각 선택지 1개짜리 그룹으로 만든 가맹점의 상품은
//   355,000원을 붙이지 않으면 아예 살 수 없었다.
export const requiredGroups = (product) =>
    (Array.isArray(product?.groups) ? product.groups : []).filter((g) => !isAddon(g));

export const addonGroups = (product) =>
    (Array.isArray(product?.groups) ? product.groups : []).filter(isAddon);

export const isComboMode = (product) => Number(product?.option_mode) === 1;

// 조합 키 — 고른 옵션 id 를 **오름차순 정렬해** 하이픈으로 잇는다.
// 백엔드 comboKey 와 규칙이 같아야 한다. 어긋나면 화면 가격과 청구 가격이 달라진다.
export const comboKey = (optionIds = []) =>
    [...new Set((optionIds ?? []).map((v) => Number(v) || 0).filter(Boolean))]
        .sort((a, b) => a - b)
        .join('-');

// 고른 것 중 '선택옵션'에 속한 옵션 id 만. 조합은 추가상품을 포함하지 않는다.
export const pickedRequiredOptionIds = (product, selected) => {
    const 필수 = requiredGroups(product);
    const ids = [];
    for (const g of (selected?.groups ?? [])) {
        const 원본 = 필수.find((r) => isSameGroup(r, g));
        if (!원본) continue;
        for (const o of (g?.options ?? [])) {
            const id = Number(o?.id) || 0;
            if (id) ids.push(id);
        }
    }
    return ids;
};

// 그룹 동일 판정. 옵션그룹은 id, 특성은 이름으로 본다(특성은 id 가 없다).
export const isSameGroup = (a, b) => {
    if (a?.id !== undefined && a?.id !== null && b?.id !== undefined && b?.id !== null) {
        return String(a.id) === String(b.id);
    }
    return (a?.character_name ?? a?.group_name) === (b?.character_name ?? b?.group_name);
};

// 고른 조합에 해당하는 행. 없으면 null(등록 안 된 조합).
export const findCombination = (product, selected) => {
    if (!isComboMode(product)) return null;
    const list = Array.isArray(product?.combinations) ? product.combinations : [];
    if (!list.length) return null;
    const key = comboKey(pickedRequiredOptionIds(product, selected));
    if (!key) return null;
    return list.find((c) => c?.combo_key === key && c?.is_delete != 1) ?? null;
};

// 조합형에서 '지금 고른 것과 함께 팔리는 조합이 있는' 옵션 id 들.
// 조합형이 아니거나 조합이 없으면 null — 이때는 제한하지 않는다.
//
// [왜 앞 그룹만 보나]
// 서로 제약하면 막다른 길이 생긴다. 색상=분홍 · 사이즈=S 를 고른 뒤 파랑/L 로 가고 싶은데
// 파랑/S 도 분홍/L 도 안 판다면, 색상도 사이즈도 못 바꾸고 갇힌다.
// 앞 그룹은 늘 자유롭게 두면 언제든 처음부터 다시 고를 수 있다.
// (네이버·카페24 도 앞 선택이 뒤 선택지를 거르는 순서 방식이다)
//
// 앞 그룹을 아직 안 골랐으면 고른 것만 조건으로 삼는다 — 부분적으로라도 걸러 주는 게 낫다.
export const selectableOptionIds = (product, selected, group) => {
    if (!isComboMode(product)) return null;
    const list = (Array.isArray(product?.combinations) ? product.combinations : [])
        .filter((c) => c?.is_delete != 1);
    if (!list.length) return null;

    const 필수 = requiredGroups(product);
    const 자리 = 필수.findIndex((g) => isSameGroup(g, group));
    if (자리 <= 0) return null;             // 첫 그룹은 늘 자유롭다

    const 앞에서고른것 = [];
    for (const 앞 of 필수.slice(0, 자리)) {
        const 고름 = (selected?.groups ?? []).find((g) => isSameGroup(g, 앞));
        for (const o of (고름?.options ?? [])) {
            const id = Number(o?.id) || 0;
            if (id) 앞에서고른것.push(id);
        }
    }
    if (!앞에서고른것.length) return null;   // 앞을 하나도 안 골랐으면 거를 근거가 없다

    const 가능 = new Set();
    for (const c of list) {
        const ids = String(c?.combo_key ?? '').split('-').map((v) => Number(v) || 0).filter(Boolean);
        if (!ids.length) continue;
        if (!앞에서고른것.every((id) => ids.includes(id))) continue;
        for (const id of ids) 가능.add(id);
    }
    return 가능;
};

// 고른 옵션이 더하는 금액(1개 기준).
//
// 조합형은 선택옵션의 개별 가격 대신 **조합 추가금**을 쓴다. 추가상품은 늘 개별 가격이다.
// 백엔드 recalcOrderAmount 와 같은 규칙이다 — 어긋나면 화면과 청구가 달라진다.
export const optionExtraPrice = (product, selected) => {
    const 필수 = requiredGroups(product);
    let sum = 0;
    const 센것 = new Set();
    for (const g of (selected?.groups ?? [])) {
        const 필수그룹 = 필수.some((r) => isSameGroup(r, g));
        for (const o of (g?.options ?? [])) {
            const id = Number(o?.id) || 0;
            if (id && 센것.has(id)) continue;
            if (id) 센것.add(id);
            if (isComboMode(product) && 필수그룹) continue; // 조합 추가금으로 따로 센다
            sum += Number(o?.option_price) || 0;
        }
    }
    if (isComboMode(product)) sum += Number(findCombination(product, selected)?.add_price) || 0;
    return sum;
};

// ── 재고 ────────────────────────────────────────────────────────────────────
//
// 재고는 NULL 이 '무제한'이다. 0 이 아니다.

const 남은수량 = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

// 옵션 하나를 고를 수 있는지. 품절이면 화면에서 눌리지 않게 한다.
export const isOptionSoldOut = (option) => {
    if (Number(option?.is_soldout) === 1) return true;
    const s = 남은수량(option?.stock_qty);
    return s !== null && s <= 0;
};

// 지금 고른 상태로 최대 몇 개까지 살 수 있는지. null 이면 제한 없음.
//
// 조합형은 조합 재고, 단독형은 고른 옵션 중 가장 적은 재고, 옵션이 없으면 상품 재고를 본다.
export const maxOrderable = (product, selected) => {
    const 후보 = [];
    if (isComboMode(product)) {
        const combo = findCombination(product, selected);
        if (combo) 후보.push(남은수량(combo.stock_qty));
    } else {
        for (const g of (selected?.groups ?? [])) {
            for (const o of (g?.options ?? [])) {
                if (Number(o?.id)) 후보.push(남은수량(o?.stock_qty));
            }
        }
    }
    if (!후보.length) 후보.push(남은수량(product?.stock_qty));
    const 실수 = 후보.filter((v) => v !== null && !isNaN(v));
    if (!실수.length) return null;
    return Math.max(0, Math.min(...실수));
};

// 상품 자체가 팔 수 없는 상태인지(옵션을 고르기 전에도 알 수 있는 것).
// 옵션이 있는 상품은 옵션을 골라야 재고를 알 수 있으므로 여기서는 false 다.
export const isProductSoldOut = (product) => {
    const groups = Array.isArray(product?.groups) ? product.groups : [];
    if (groups.length) return false;
    const s = 남은수량(product?.stock_qty);
    return s !== null && s <= 0;
};

// 얼마 안 남았을 때만 숫자를 돌려준다(무제한이거나 넉넉하면 null).
//
// ⚠ 여기서 '3개 남음' 같은 문장을 만들지 않는다. 그 문자열은 사전에 없어서
//   중국어·일본어 화면에 한국어가 그대로 박힌다. 문장은 화면이 translate 로 만든다.
export const lowStockCount = (qty) => {
    const s = 남은수량(qty);
    if (s === null || isNaN(s) || s <= 0) return null;
    return s <= 5 ? s : null;
};

// ─────────────────────────────────────────────────────────────────────────
// 선택한 옵션을 '줄' 로 쌓는다.
//
// [왜]
// 가맹점 제보(2026-08-24): "따로고르기 — 다른 옵션으로 구매시 추가가 되어야 하는데
// 기존 옵션이 사라짐 / 추가옵션 — 1개만 구매가능, 추가로 살 수 없음".
//
// 확인해 보니 장바구니는 이미 옵션별로 따로 담긴다(로컬에서 재현: 크기=소·색상=소 와
// 크기=중·색상=중 이 두 줄로 들어간다). 사라지는 것은 **상품상세 화면의 드롭다운**이다 —
// 드롭다운은 값이 하나뿐이라 다른 것을 고르면 앞의 것이 바뀐다.
// 사장님이 기대한 것은 한국 쇼핑몰 표준인 '고른 옵션이 아래에 목록으로 쌓이고
// 줄마다 수량을 조절하는' 방식이었다.
//
// [모델]
//   selectProductGroups = { count, groups, lines: [{ key, groups, count }] }
// 줄 하나 = **하나의 구매 단위**(필수 조합 + 그 줄에 붙인 추가상품). 수량은 그 줄 전체에 곱해진다.
// 장바구니 한 줄이 이미 { groups, order_count } 라 모양이 같다 —
// 그래서 금액·재고·조합형 계산을 하나도 바꾸지 않아도 된다. 담을 때 줄마다 부르기만 하면 된다.
//
// ⚠ lines 가 비어 있으면 예전과 똑같이 동작한다(옵션 없는 상품·목록 카드에서 담는 경로).
//   새 구조를 모르는 호출부가 남아 있어도 깨지지 않게 하기 위한 것이다.

// 줄을 식별하는 열쇠. 같은 조합이면 같은 값이어야 한다(순서 무관).
// cartLineSignature 와 같은 규칙으로 만든다 — 화면에서 합쳐진 줄이 장바구니에서
// 다시 갈라지면(또는 그 반대면) 손님이 본 것과 담긴 것이 달라진다.
export const optionLineKey = (groups) =>
    (Array.isArray(groups) ? groups : [])
        .map((g) => `${g?.id ?? g?.character_name ?? g?.group_name ?? ''}:`
            + (g?.options ?? []).map((o) => o?.id ?? o?.value ?? o?.option_name ?? '').sort().join('|'))
        .sort()
        .join(';');

// 골라야 하는 그룹을 **전부** 골랐는가. 줄로 확정할 시점을 정하는 기준이다.
export const isRequiredComplete = (product, groups) => {
    const 필수 = requiredGroups(product);
    if (!필수.length) return false;   // 필수가 없으면 줄로 쌓지 않는다(예전 동작 그대로)
    const 고른것 = Array.isArray(groups) ? groups : [];
    return 필수.every((r) => 고른것.some((g) => isSameGroup(g, r) && (g?.options?.length ?? 0) > 0));
};

export const optionLines = (selected) =>
    Array.isArray(selected?.lines) ? selected.lines : [];

// 지금 고르는 중인 조합을 줄로 확정한다.
//
// 완성됐는지는 **부르는 쪽이 이미 판정한 뒤**다(shop-util 의 selectItemOptionUtil).
// 여기서 상품을 다시 받지 않는 이유 — 이 함수는 상품을 모르는 자리에서도 불린다.
//
// 같은 조합이 이미 있으면 새 줄을 만들지 않고 수량을 더한다.
// 줄이 둘로 갈리면 손님은 왜 갈렸는지 알 수 없고, 장바구니에서는 어차피 합쳐진다.
export const closeOptionLine = (selected, groups_) => {
    const groups = (groups_ ?? selected?.groups ?? []).filter((g) => (g?.options?.length ?? 0) > 0);
    if (!groups.length) return selected;
    const key = optionLineKey(groups);
    const lines = [...optionLines(selected)];
    const i = lines.findIndex((l) => l.key === key);
    const 더할수량 = Math.max(1, Number(selected?.count) || 1);
    if (i >= 0) lines[i] = { ...lines[i], count: (Number(lines[i].count) || 1) + 더할수량 };
    else lines.push({ key, groups, count: 더할수량 });
    // 넘겨받은 조합(직전 것)을 쌓는 경우에는 지금 선택을 건드리지 않는다 —
    // 드롭다운에 떠 있는 것은 '지금 고른 조합' 이고 그건 담을 때 함께 들어간다.
    if (groups_) return { ...selected, lines };
    // 지금 선택을 확정하는 경우에는 비운다(다음 조합을 처음부터 고를 수 있게).
    return { ...selected, groups: [], count: 1, lines };
};

export const removeOptionLine = (selected, key) => ({
    ...selected,
    lines: optionLines(selected).filter((l) => l.key !== key),
});

// 줄 수량 바꾸기. 0 이하로 내리면 줄을 지운다(− 를 계속 누르면 빠지는 것이 자연스럽다).
export const setOptionLineCount = (selected, key, count) => {
    const n = Math.floor(Number(count) || 0);
    if (n <= 0) return removeOptionLine(selected, key);
    return {
        ...selected,
        lines: optionLines(selected).map((l) => (l.key === key ? { ...l, count: n } : l)),
    };
};

// 담기·바로구매가 실제로 만들 '구매 단위' 목록.
//
// 쌓아 둔 줄들 + **지금 드롭다운에 떠 있는 조합**.
// 지금 것을 빼면 안 된다 — 손님이 마지막으로 고른 조합이 바로 그것인데,
// 그것만 쏙 빠지고 앞의 것들만 담기면 '방금 고른 게 사라졌다' 가 된다.
//
// 지금 것이 덜 골라진 상태인지(필수를 다 안 골랐는지)는 여기서 판정하지 않는다 —
// 이 함수는 상품을 모른다. 그 검사는 assertOptionsSelected 가 담기 직전에 한다.
export const purchaseUnits = (selected) => {
    const 단위 = optionLines(selected).map((l) => ({
        key: l.key, groups: l.groups ?? [], count: Math.max(1, Number(l.count) || 1),
        쌓인줄: true,   // 화면에서 수량·삭제를 어느 통로로 보낼지 가른다
    }));
    // 완성된 조합은 곧바로 줄로 옮겨지므로(ProductAddons), 여기 남아 있는 것은
    // '고르다 만 것' 이거나 필수가 아예 없는 상품이다.
    // 줄이 하나라도 있으면 고르다 만 것은 담지 않는다 — assertOptionsSelected 가 먼저 막는다.
    const 지금 = 단위.length ? [] : (selected?.groups ?? []).filter((g) => (g?.options?.length ?? 0) > 0);
    if (지금.length) {
        const key = optionLineKey(지금);
        const i = 단위.findIndex((u) => u.key === key);
        const n = Math.max(1, Number(selected?.count) || 1);
        // 이미 같은 조합이 줄로 있으면 수량만 더한다(장바구니에서 어차피 합쳐진다).
        if (i >= 0) 단위[i] = { ...단위[i], count: 단위[i].count + n };
        else 단위.push({ key, groups: 지금, count: n, 쌓인줄: false });
    }
    // 옵션이 아예 없는 상품(줄도 없고 고른 것도 없다)은 예전처럼 한 단위다.
    if (!단위.length) return [{ groups: [], count: Math.max(1, Number(selected?.count) || 1) }];
    return 단위;
};
