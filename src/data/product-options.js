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
