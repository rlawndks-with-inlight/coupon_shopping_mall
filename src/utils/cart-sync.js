import { getProductStatus, isPurchasable } from './function';
import { getLocalStorage } from './local-storage';
import { formatLang } from './format';

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

export const lineKey = (line) => `${toInt(line?.id)}:${toInt(line?.seller_id)}`;

// 조회 1건의 결과. '못 읽었다'와 '살 수 없다'를 반드시 구분한다.
//   ok          : 서버가 상품을 돌려줬다
//   unavailable : 서버가 "그런 상품 없음"이라고 답했다(삭제·비공개 status 5)
//   error       : 타임아웃·5xx·네트워크 장애 등 — 아무 판단도 할 수 없다
const OK = 'ok';
const UNAVAILABLE = 'unavailable';
const ERROR = 'error';

const FETCH_TIMEOUT_MS = 15000;

// apiShop 이 붙여주는 브랜드 식별자. 상품 상세 API 는 brand_id 가 없으면 -400 을 준다.
const getBrandParams = () => {
    try {
        const dns = JSON.parse(getLocalStorage('themeDnsData') || '{}');
        return { brand_id: toInt(dns?.id), root_id: toInt(dns?.root_id) };
    } catch (e) {
        return { brand_id: 0, root_id: 0 };
    }
};

// 상품 1건을 서버에서 읽는다.
//
// 여기서 apiShop('product','get') 을 쓰지 않는 이유가 두 가지 있다.
//
// 1) apiShop 뒤의 get() 은 '없는 상품'과 '통신 실패'를 똑같이 false 로 뭉갠다.
//    그래서 일부 상품 조회가 잠깐 실패(타임아웃·500)했을 뿐인데 그 라인이
//    '판매하지 않는 상품'으로 낙인찍혀 결제가 막혔다. 조회 실패는 차단 사유가 아니다.
//    HTTP 상태와 응답 본문의 result 코드를 직접 보고 셋으로 나눈다.
//    (백엔드 shop.controller 의 item 은 상품이 없을 때도 200 + result 100 + data:false 를 준다)
//
// 2) 백엔드 shop.controller 의 item 은 '로그인 쿠키가 실린 요청'이면
//    product_views 에 조회 이력을 남긴다. 장바구니를 열기만 해도 담긴 상품이 전부
//    '최근 본 상품'이 되던 원인이다. 옵션 추가금액(product_options)을 돌려주는 조회 경로는
//    이 상세 API 뿐이라 다른 엔드포인트로 갈아탈 수 없으므로,
//    쿠키를 빼고(credentials:'omit') 익명으로 물어본다.
//    상세 응답에서 사용자에 따라 달라지는 값은 없다(셀러가는 seller_id 쿼리로 정해진다).
const fetchServerProduct = async (id, seller_id) => {
    if (typeof window === 'undefined' || typeof fetch !== 'function') return { state: ERROR };
    const { brand_id, root_id } = getBrandParams();
    if (!(brand_id > 0)) return { state: ERROR }; // 브랜드를 모르면 판단할 수 없다 — 실패로 본다
    const params = new URLSearchParams();
    params.set('id', String(id));
    params.set('brand_id', String(brand_id));
    if (root_id > 0) params.set('root_id', String(root_id));
    if (toInt(seller_id) > 0) params.set('seller_id', String(toInt(seller_id)));

    const controller = (typeof AbortController === 'function') ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : null;
    try {
        const res = await fetch(`/api/shop/product/${id}?${params.toString()}`, {
            method: 'GET',
            credentials: 'omit', // 조회 이력(product_views)을 남기지 않기 위해 로그인 쿠키를 보내지 않는다
            cache: 'no-store',   // 여기서 받는 값이 곧 결제금액의 입력값이다 — 브라우저 캐시를 타면 안 된다
            headers: { Accept: 'application/json' },
            signal: controller?.signal,
        });
        if (!res.ok) return { state: ERROR };            // 5xx·429 등 — 실패지 품절이 아니다
        const body = await res.json();
        if (!(toNum(body?.result) > 0)) return { state: ERROR }; // 서버 에러 응답
        const data = body?.data;
        if (data && toInt(data?.id) > 0) return { state: OK, product: data };
        return { state: UNAVAILABLE };                   // 삭제됐거나 비공개(status 5)로 내려갔다
    } catch (e) {
        return { state: ERROR };                         // 타임아웃·네트워크 장애
    } finally {
        if (timer) clearTimeout(timer);
    }
};

export const syncCartWithServer = async (products = []) => {
    const list = Array.isArray(products) ? products : [];
    const result = {
        items: list,         // 갱신된 라인(순서·길이 유지)
        priceChanged: false, // 금액에 영향을 주는 값이 하나라도 바뀌었는지
        unavailable: [],     // 구매할 수 없는 라인 [{ id, seller_id, name, label }]
        failed: false,       // 아무것도 확인하지 못했다 — 호출부는 아무 판단도 하지 않는다
        uncheckedCount: 0,   // 조회에 실패해 판단을 보류한 라인 수(차단 사유가 아니다)
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

    const states = new Map();
    const responses = await Promise.all(keys.map((k) => fetchServerProduct(k.id, k.seller_id)));
    let answered = 0;
    for (let i = 0; i < keys.length; i++) {
        const state = responses[i]?.state ?? ERROR;
        states.set(keys[i].key, responses[i] ?? { state: ERROR });
        if (state != ERROR) answered++;
    }

    // 한 건도 확인하지 못했으면 네트워크 장애로 보고 라인을 전혀 손대지 않는다(fail-open).
    // 여기서 '전부 품절'처럼 처리하면 멀쩡한 주문까지 막힌다.
    if (answered == 0) {
        result.failed = true;
        result.uncheckedCount = keys.length;
        return result;
    }

    const items = list.map((line) => {
        const id = toInt(line?.id);
        const key = `${id}:${toInt(line?.seller_id)}`;
        const state = states.get(key)?.state ?? ERROR;
        const server = states.get(key)?.product;

        // 조회 자체가 실패한 라인은 판단을 보류한다. 값도 그대로 두고 차단도 하지 않는다.
        // (일시적 타임아웃·500 을 '판매하지 않는 상품'으로 낙인찍으면 결제가 부당하게 막힌다)
        if (state == ERROR) {
            result.uncheckedCount++;
            return line;
        }

        // 서버가 "없는 상품"이라고 분명히 답했다 = 삭제됐거나 비공개(status 5)로 내려갔다.
        if (state == UNAVAILABLE || !server) {
            result.unavailable.push({
                id,
                seller_id: toInt(line?.seller_id),
                name: formatLang(line, 'product_name') || `상품 ${id}`,
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
                seller_id: toInt(line?.seller_id),
                name: formatLang(next, 'product_name') || `상품 ${id}`,
                label: getProductStatus(server?.status)?.text || '판매하지 않는',
            });
        }
        return next;
    });

    result.items = items;
    return result;
};

// 지금 장바구니(주문서)에 남아 있는 라인만 남긴다.
//
// 안내를 보고 문제 상품을 지웠는데도 결제가 계속 막히던 원인이 여기 있었다.
// 구매불가 목록은 동기화할 때 한 번 만들어진 뒤 그대로 남았고, 라인을 지워도
// 다시 계산되지 않아 '지웠는데 안 풀리는' 막다른 길이 됐다.
// 화면에 남은 상품과 대조해서 판정하면, 지우는 순간 자동으로 풀린다.
export const filterUnavailableByProducts = (unavailable = [], products = []) => {
    const list = Array.isArray(unavailable) ? unavailable : [];
    const lines = Array.isArray(products) ? products : [];
    if (list.length == 0 || lines.length == 0) return [];
    return list.filter((u) => lines.some((line) => lineKey(line) == `${toInt(u?.id)}:${toInt(u?.seller_id)}`));
};

// 구매 불가 라인을 사람이 읽는 한 줄로 만든다.
// 예전엔 결제 직전에 "구매할 수 없는 상품이 포함되어 있습니다."만 떠서
// 여러 건을 담은 고객은 어느 상품이 문제인지 알 수 없었다.
export const makeUnavailableMessage = (unavailable = []) => {
    const list = Array.isArray(unavailable) ? unavailable : [];
    if (list.length == 0) return '';
    const head = list.slice(0, 3).map((v) => `${v?.name}(${v?.label})`).join(', ');
    const rest = list.length > 3 ? ` 외 ${list.length - 3}건` : '';
    return `${head}${rest} 은(는) 지금 구매할 수 없습니다. 목록에서 빼주시면 나머지 상품으로 결제할 수 있습니다.`;
};
