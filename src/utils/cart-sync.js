import { apiShop } from './api';
import { getProductStatus, isPurchasable } from './function';

// 장바구니를 서버의 현재 상품 정보로 다시 채운다.
//
// 왜 필요한가:
//   장바구니는 '담을 때의 상품 스냅샷'을 localStorage(themeCartData)에 통째로 저장한다.
//   그 뒤 관리자가 판매가·배송비·옵션 추가금액을 바꾸면 스냅샷은 낡은 값 그대로 남는다.
//   결제 직전 백엔드(pay.controller 의 recalcOrderAmount)는 값을 전부 DB 에서 다시 읽어
//   프론트가 보낸 amount 와 1원이라도 다르면 거절한다
//   ("결제금액이 변경되었습니다. 주문서를 새로고침한 뒤 다시 시도해 주세요.").
//   그런데 새로고침을 해도 다시 같은 localStorage 를 읽으므로 낡은 값이 그대로 복원된다
//   — 안내대로 해도 영원히 풀리지 않는다. 그래서 '갱신'을 실제로 해주는 곳이 필요하다.
//
// 백엔드가 금액을 어디서 읽는지에 맞춰 같은 항목만 덮어쓴다:
//   products.product_sale_price / products.delivery_fee / product_options.option_price
// 수량(order_count)과 '어떤 옵션을 골랐는지'는 고객이 정한 값이라 건드리지 않는다.
// 결제 금액 계산 자체(calcOrderTotals·makePayData)는 손대지 않는다 — 입력값만 최신화한다.

const toInt = (v) => {
    const n = parseInt(v);
    return Number.isInteger(n) ? n : 0;
};
const toNum = (v) => Number(v) || 0;

// 상품 1건을 서버에서 읽는다. 실패하면 undefined.
// apiShop 은 '없는 상품'과 '통신 실패' 둘 다 false 를 돌려주므로 여기서 구분하지 않는다.
// (구분은 호출부에서 '한 건이라도 성공했는가'로 판단한다)
const fetchServerProduct = async (id, seller_id) => {
    try {
        const params = { id };
        if (toInt(seller_id) > 0) params.seller_id = toInt(seller_id);
        const data = await apiShop('product', 'get', params);
        return (data && toInt(data?.id) > 0) ? data : undefined;
    } catch (e) {
        return undefined;
    }
};

export const syncCartWithServer = async (products = []) => {
    const list = Array.isArray(products) ? products : [];
    const result = {
        items: list,        // 갱신된 라인(순서·길이 유지)
        priceChanged: false, // 금액에 영향을 주는 값이 하나라도 바뀌었는지
        unavailable: [],     // 구매할 수 없는 라인 [{ id, name, label }]
        failed: false,       // 서버를 한 건도 못 읽음 — 아무 판단도 하지 않는다
    };
    if (list.length == 0) return result;

    // 같은 상품이 여러 줄에 있을 수 있으므로 상품 단위로 한 번씩만 조회한다.
    // 셀러가 붙은 줄은 셀러가격이 적용되도록 seller_id 를 같이 보낸다.
    const keys = [];
    for (const line of list) {
        const id = toInt(line?.id);
        if (id <= 0) continue;
        const seller_id = toInt(line?.seller_id);
        const key = `${id}:${seller_id}`;
        if (!keys.some((k) => k.key == key)) keys.push({ key, id, seller_id });
    }
    if (keys.length == 0) return result;

    const fetched = new Map();
    const responses = await Promise.all(keys.map((k) => fetchServerProduct(k.id, k.seller_id)));
    for (let i = 0; i < keys.length; i++) {
        if (responses[i]) fetched.set(keys[i].key, responses[i]);
    }

    // 한 건도 못 읽었으면 네트워크 장애로 보고 라인을 전혀 손대지 않는다(fail-open).
    // 여기서 '전부 품절'처럼 처리하면 멀쩡한 주문까지 막힌다.
    if (fetched.size == 0) {
        result.failed = true;
        return result;
    }

    const items = list.map((line) => {
        const id = toInt(line?.id);
        const key = `${id}:${toInt(line?.seller_id)}`;
        const server = fetched.get(key);

        // 다른 상품은 읽혔는데 이 상품만 못 읽었다 = 삭제됐거나 비공개(status 5)로 내려갔다.
        // (shop/product/:id 는 삭제·비공개 상품에 데이터를 주지 않는다)
        if (!server) {
            result.unavailable.push({
                id,
                name: line?.product_name || `상품 ${id}`,
                label: '판매하지 않는',
            });
            return line;
        }

        const next = { ...line };

        // 금액 관련 값만 서버 값으로 맞춘다.
        for (const k of ['product_sale_price', 'product_price', 'delivery_fee']) {
            const sv = toNum(server?.[k]);
            if (toNum(line?.[k]) != sv) result.priceChanged = true;
            next[k] = sv;
        }
        next.status = server?.status;
        next.product_name = server?.product_name ?? line?.product_name;
        next.product_img = server?.product_img ?? line?.product_img;

        // 선택한 옵션의 추가금액도 서버 값으로 맞춘다.
        // 백엔드는 클라이언트가 보낸 option_price 를 무시하고 product_options 에서 직접 읽는다.
        const serverOptionPrice = new Map();
        for (const g of (server?.groups ?? [])) {
            for (const o of (g?.options ?? [])) {
                const oid = toInt(o?.id);
                if (oid > 0) serverOptionPrice.set(oid, toNum(o?.option_price));
            }
        }
        next.groups = (line?.groups ?? []).map((group) => ({
            ...group,
            options: (group?.options ?? []).map((option) => {
                const oid = toInt(option?.id);
                // 문자열 옵션({value:'블랙'})은 id 도 가격도 없다. 삭제된 옵션도 서버 목록에 없으므로
                // 둘 다 담을 때 값을 그대로 둔다(0 으로 밀면 오히려 금액이 어긋난다).
                if (oid <= 0 || !serverOptionPrice.has(oid)) return option;
                const sp = serverOptionPrice.get(oid);
                if (toNum(option?.option_price) != sp) result.priceChanged = true;
                return { ...option, option_price: sp };
            }),
        }));

        if (!isPurchasable(server?.status)) {
            result.unavailable.push({
                id,
                name: next.product_name || `상품 ${id}`,
                label: getProductStatus(server?.status)?.text || '판매하지 않는',
            });
        }
        return next;
    });

    result.items = items;
    return result;
};

// 구매 불가 라인을 사람이 읽는 한 줄로 만든다.
// 예전엔 결제 직전에 "구매할 수 없는 상품이 포함되어 있습니다."만 떠서
// 여러 건을 담은 고객은 어느 상품이 문제인지 알 수 없었다.
export const makeUnavailableMessage = (unavailable = []) => {
    const list = Array.isArray(unavailable) ? unavailable : [];
    if (list.length == 0) return '';
    const head = list.slice(0, 3).map((v) => `${v?.name}(${v?.label})`).join(', ');
    const rest = list.length > 3 ? ` 외 ${list.length - 3}건` : '';
    return `${head}${rest} 은(는) 지금 구매할 수 없습니다. 장바구니에서 빼주세요.`;
};
